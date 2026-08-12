-- =================================================================================
-- FASE 2 - RPCs FINANCIEROS (PARTE 1)
-- =================================================================================

-- Funciones de validación previas
CREATE OR REPLACE FUNCTION _validate_financial_role()
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_role user_role;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
    IF v_role NOT IN ('admin', 'owner', 'manager', 'cashier') THEN
        RAISE EXCEPTION 'El rol % no tiene permisos financieros', v_role;
    END IF;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;


-- =================================================================================
-- RPC 1: ABRIR SESIÓN DE CAJA
-- =================================================================================
CREATE OR REPLACE FUNCTION rpc_open_cash_session(p_idempotency_key UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_existing_session_id UUID;
    v_new_session_id UUID;
BEGIN
    v_user_id := _validate_financial_role();

    -- Control de Idempotencia (revisar si ya se procesó esta petición)
    -- Para apertura de caja, simplemente devolvemos la caja abierta actual si la hay,
    -- pero si queremos ser estrictos con el idempotency_key, buscamos en un log de peticiones.
    -- Como la instrucción pide verificar que no exista otra, lo validaremos directamente:

    -- 1. Idempotencia por key
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id INTO v_existing_session_id FROM cash_sessions WHERE idempotency_key = p_idempotency_key;
        IF v_existing_session_id IS NOT NULL THEN
            RETURN v_existing_session_id;
        END IF;
    END IF;

    SELECT id INTO v_existing_session_id 
    FROM cash_sessions 
    WHERE opened_by = v_user_id AND status IN ('open', 'counting')
    FOR UPDATE; -- Bloqueo concurrente

    IF v_existing_session_id IS NOT NULL THEN
        RAISE EXCEPTION 'Ya existe una sesión abierta o en conteo (ID: %) para el usuario actual', v_existing_session_id;
    END IF;

    INSERT INTO cash_sessions (opened_by, status, idempotency_key)
    VALUES (v_user_id, 'open', p_idempotency_key)
    RETURNING id INTO v_new_session_id;

    RETURN v_new_session_id;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;


-- =================================================================================
-- RPC 2: PROCESAR COBRANZA
-- =================================================================================
-- p_payments format: [{"account_id": "uuid", "amount": 100, "method": "cash"}]
CREATE OR REPLACE FUNCTION rpc_process_collection(
    p_customer_id UUID,
    p_total NUMERIC,
    p_payments JSONB,
    p_idempotency_key UUID
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
    v_collection_id UUID;
    v_payment JSONB;
    v_sum_payments NUMERIC := 0;
    v_credit_id UUID;
    v_treasury_mov_id UUID;
BEGIN
    v_user_id := _validate_financial_role();

    -- 1. Idempotencia
    SELECT id INTO v_collection_id FROM collections WHERE idempotency_key = p_idempotency_key;
    IF v_collection_id IS NOT NULL THEN
        RETURN v_collection_id;
    END IF;

    -- 2. Validar totales
    IF p_total <= 0 THEN
        RAISE EXCEPTION 'El total debe ser mayor a cero';
    END IF;

    -- 3. Obtener sesión abierta del usuario
    SELECT id INTO v_session_id 
    FROM cash_sessions 
    WHERE opened_by = v_user_id AND status = 'open';

    IF v_session_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró una sesión de caja abierta para el usuario';
    END IF;

    -- 4. Validar suma de pagos
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
    LOOP
        v_sum_payments := v_sum_payments + (v_payment->>'amount')::NUMERIC;
    END LOOP;

    IF v_sum_payments != p_total THEN
        RAISE EXCEPTION 'La suma de los pagos (%) no coincide con el total de la cobranza (%)', v_sum_payments, p_total;
    END IF;

    -- 5. Crear Collection
    INSERT INTO collections (customer_id, total_amount, idempotency_key, created_by)
    VALUES (p_customer_id, p_total, p_idempotency_key, v_user_id)
    RETURNING id INTO v_collection_id;

    -- 6. Crear Cuenta Corriente (Crédito)
    INSERT INTO current_account_movements (customer_id, type, amount, source_type, source_id)
    VALUES (p_customer_id, 'credit', p_total, 'collection', v_collection_id)
    RETURNING id INTO v_credit_id;

    -- 7. Crear Movimientos de Tesorería y Detalle de Cobranza
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
    LOOP
        -- Generar movimiento de ingreso
        INSERT INTO treasury_movements (
            treasury_account_id, cash_session_id, type, amount, 
            payment_method, source_type, source_id, created_by
        )
        VALUES (
            (v_payment->>'account_id')::UUID, 
            v_session_id, 
            'income', 
            (v_payment->>'amount')::NUMERIC,
            (v_payment->>'method')::payment_method_enum,
            'collection',
            v_collection_id,
            v_user_id
        ) RETURNING id INTO v_treasury_mov_id;

        -- Generar detalle de payment
        INSERT INTO collection_payments (collection_id, treasury_movement_id, amount, payment_method)
        VALUES (
            v_collection_id, 
            v_treasury_mov_id, 
            (v_payment->>'amount')::NUMERIC, 
            (v_payment->>'method')::payment_method_enum
        );
    END LOOP;

    RETURN v_collection_id;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;


-- =================================================================================
-- RPC 3: IMPUTAR FONDOS (ALLOCATIONS)
-- =================================================================================
-- p_allocations format: [{"debit_id": "uuid", "amount": 100}]
CREATE OR REPLACE FUNCTION rpc_allocate_funds(
    p_credit_id UUID,
    p_allocations JSONB,
    p_idempotency_key UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_credit_amount NUMERIC;
    v_already_allocated_credit NUMERIC;
    v_available_credit NUMERIC;
    
    v_alloc JSONB;
    v_debit_id UUID;
    v_debit_amount NUMERIC;
    v_already_allocated_debit NUMERIC;
    v_available_debit NUMERIC;
    v_alloc_amount NUMERIC;
    
    v_total_requested_alloc NUMERIC := 0;
BEGIN
    v_user_id := _validate_financial_role();

    -- 1. Idempotencia
    IF p_idempotency_key IS NOT NULL THEN
        PERFORM 1 FROM allocations WHERE idempotency_key = p_idempotency_key LIMIT 1;
        IF FOUND THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- Bloqueo concurrente del crédito
    SELECT amount INTO v_credit_amount 
    FROM current_account_movements 
    WHERE id = p_credit_id AND type = 'credit' AND status = 'valid'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Crédito no encontrado o no es válido';
    END IF;

    -- Calcular crédito disponible
    SELECT COALESCE(SUM(amount), 0) INTO v_already_allocated_credit 
    FROM allocations 
    WHERE credit_movement_id = p_credit_id AND status = 'valid';

    v_available_credit := v_credit_amount - v_already_allocated_credit;

    -- Iterar por cada imputación solicitada
    FOR v_alloc IN SELECT * FROM jsonb_array_elements(p_allocations)
    LOOP
        v_debit_id := (v_alloc->>'debit_id')::UUID;
        v_alloc_amount := (v_alloc->>'amount')::NUMERIC;
        v_total_requested_alloc := v_total_requested_alloc + v_alloc_amount;

        IF v_alloc_amount <= 0 THEN
            RAISE EXCEPTION 'El monto a imputar debe ser mayor a cero';
        END IF;

        -- Bloqueo concurrente del débito
        SELECT amount INTO v_debit_amount 
        FROM current_account_movements 
        WHERE id = v_debit_id AND type = 'debit' AND status = 'valid'
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Débito % no encontrado o no es válido', v_debit_id;
        END IF;

        -- Calcular débito disponible
        SELECT COALESCE(SUM(amount), 0) INTO v_already_allocated_debit 
        FROM allocations 
        WHERE debit_movement_id = v_debit_id AND status = 'valid';

        v_available_debit := v_debit_amount - v_already_allocated_debit;

        IF v_alloc_amount > v_available_debit THEN
            RAISE EXCEPTION 'Intento de sobreimputar débito. Disponible: %, Solicitado: %', v_available_debit, v_alloc_amount;
        END IF;

        -- Insertar allocation
        INSERT INTO allocations (credit_movement_id, debit_movement_id, amount, idempotency_key)
        VALUES (p_credit_id, v_debit_id, v_alloc_amount, p_idempotency_key);
    END LOOP;

    -- Validar que la suma total imputada no exceda el crédito disponible
    IF v_total_requested_alloc > v_available_credit THEN
        RAISE EXCEPTION 'Intento de sobreimputar crédito. Disponible: %, Solicitado: %', v_available_credit, v_total_requested_alloc;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;
