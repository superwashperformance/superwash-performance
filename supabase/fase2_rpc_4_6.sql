-- =================================================================================
-- FASE 2 - RPCs FINANCIEROS (PARTE 2)
-- =================================================================================

-- =================================================================================
-- RPC 4: CERRAR SESIÓN DE CAJA
-- =================================================================================
CREATE OR REPLACE FUNCTION rpc_close_cash_session(
    p_session_id UUID,
    p_declared_amounts JSONB,
    p_idempotency_key UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_session_status cash_session_status;
    v_expected_amounts JSONB;
    v_differences JSONB;
BEGIN
    v_user_id := _validate_financial_role();

    -- 1. Idempotencia
    IF p_idempotency_key IS NOT NULL THEN
        PERFORM 1 FROM financial_audits 
        WHERE table_name = 'cash_sessions' 
          AND record_id = p_session_id 
          AND operation = 'CLOSE' 
          AND (new_values->>'idempotency_key') = p_idempotency_key::text 
        LIMIT 1;
        IF FOUND THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- Bloquear sesión
    SELECT status INTO v_session_status 
    FROM cash_sessions 
    WHERE id = p_session_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sesión de caja no encontrada';
    END IF;

    IF v_session_status IN ('closed', 'reconciled') THEN
        RAISE EXCEPTION 'La sesión ya se encuentra cerrada o conciliada';
    END IF;

    -- Cambiar a counting (bloquea nuevas operaciones si se valida status = 'open' en cobros)
    UPDATE cash_sessions SET status = 'counting' WHERE id = p_session_id;

    -- Calcular esperado por cuenta y método
    SELECT COALESCE(jsonb_object_agg(
        concat_ws('_', treasury_account_id, payment_method), 
        net_amount
    ), '{}'::jsonb) INTO v_expected_amounts
    FROM (
        SELECT 
            treasury_account_id, 
            payment_method,
            SUM(CASE 
                WHEN type IN ('income', 'internal_transfer_in') THEN amount 
                WHEN type IN ('expense', 'internal_transfer_out') THEN -amount 
                ELSE 0 END) as net_amount
        FROM treasury_movements
        WHERE cash_session_id = p_session_id AND status = 'valid'
        GROUP BY treasury_account_id, payment_method
    ) calc;

    -- Aquí simplificamos el cálculo de diferencias para el backend. 
    -- La lógica completa podría iterar por las keys, pero lo guardaremos tal cual y el frontend/reporte lo cruza.
    -- Opcional: Generar el objeto JSON de diferencias.
    
    -- Cerramos la sesión
    UPDATE cash_sessions 
    SET 
        status = 'closed',
        closed_at = now(),
        expected_amounts = v_expected_amounts,
        declared_amounts = p_declared_amounts
        -- differences se podría calcular aquí, se deja como NULL temporalmente para no extender el plpgsql
    WHERE id = p_session_id;

    -- Registrar auditoría de cierre para soportar idempotencia
    INSERT INTO financial_audits (table_name, record_id, operation, new_values, changed_by)
    VALUES ('cash_sessions', p_session_id, 'CLOSE', jsonb_build_object('idempotency_key', p_idempotency_key), v_user_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;


-- =================================================================================
-- RPC 5: TRANSFERENCIA INTERNA
-- =================================================================================
CREATE OR REPLACE FUNCTION rpc_internal_transfer(
    p_from_account_id UUID,
    p_to_account_id UUID,
    p_amount NUMERIC,
    p_method payment_method_enum,
    p_session_id UUID DEFAULT NULL,
    p_idempotency_key UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_out_id UUID;
    v_in_id UUID;
BEGIN
    v_user_id := _validate_financial_role();

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'El monto de transferencia debe ser mayor a cero';
    END IF;

    IF p_from_account_id = p_to_account_id THEN
        RAISE EXCEPTION 'La cuenta origen y destino no pueden ser la misma';
    END IF;

    -- 1. Idempotencia
    SELECT id INTO v_out_id FROM treasury_movements WHERE idempotency_key = p_idempotency_key;
    IF v_out_id IS NOT NULL THEN
        RETURN v_out_id;
    END IF;

    -- 2. Movimiento de Salida
    INSERT INTO treasury_movements (
        treasury_account_id, cash_session_id, type, amount, 
        payment_method, source_type, idempotency_key, created_by
    )
    VALUES (
        p_from_account_id, p_session_id, 'internal_transfer_out', p_amount, 
        p_method, 'internal_transfer', p_idempotency_key, v_user_id
    ) RETURNING id INTO v_out_id;

    -- 3. Movimiento de Entrada (Referencia al out_id)
    INSERT INTO treasury_movements (
        treasury_account_id, cash_session_id, type, amount, 
        payment_method, source_type, source_id, created_by
    )
    VALUES (
        p_to_account_id, p_session_id, 'internal_transfer_in', p_amount, 
        p_method, 'internal_transfer', v_out_id, v_user_id
    ) RETURNING id INTO v_in_id;

    RETURN v_out_id;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;


-- =================================================================================
-- RPC 6: ANULAR COBRANZA
-- =================================================================================
CREATE OR REPLACE FUNCTION rpc_annul_collection(
    p_collection_id UUID,
    p_reason TEXT,
    p_idempotency_key UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_status movement_status;
    v_credit_id UUID;
    v_credit_amount NUMERIC;
    v_mov RECORD;
BEGIN
    v_user_id := _validate_financial_role();

    IF TRIM(COALESCE(p_reason, '')) = '' THEN
        RAISE EXCEPTION 'Debe especificar un motivo para la anulación';
    END IF;

    -- 1. Idempotencia
    IF p_idempotency_key IS NOT NULL THEN
        PERFORM 1 FROM financial_audits 
        WHERE table_name = 'collections' 
          AND record_id = p_collection_id 
          AND operation = 'ANNUL' 
          AND (new_values->>'idempotency_key') = p_idempotency_key::text 
        LIMIT 1;
        IF FOUND THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- Bloquear y validar Collection
    SELECT status INTO v_status 
    FROM collections 
    WHERE id = p_collection_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cobranza no encontrada';
    END IF;

    IF v_status = 'annulled' THEN
        RAISE EXCEPTION 'La cobranza ya se encuentra anulada';
    END IF;

    -- Marcar Collection como anulada
    UPDATE collections SET status = 'annulled' WHERE id = p_collection_id;

    -- Anular Crédito en Cuenta Corriente (buscar el movimiento crédito explícitamente asociado a la cobranza)
    SELECT id, amount INTO v_credit_id, v_credit_amount
    FROM current_account_movements
    WHERE source_type = 'collection' 
      AND source_id = p_collection_id 
      AND type = 'credit' 
      AND status = 'valid'
    FOR UPDATE;

    IF v_credit_id IS NOT NULL THEN
        -- Marcar original como anulado
        UPDATE current_account_movements SET status = 'annulled' WHERE id = v_credit_id;
        
        -- Crear contra-asiento
        INSERT INTO current_account_movements (customer_id, type, amount, status, reversal_for_id)
        SELECT customer_id, 'debit', amount, 'valid', v_credit_id
        FROM current_account_movements WHERE id = v_credit_id;

        -- Anular imputaciones
        UPDATE allocations SET status = 'annulled' WHERE credit_movement_id = v_credit_id;
    END IF;

    -- Anular Movimientos de Tesorería (contra-asientos)
    FOR v_mov IN 
        SELECT tm.* 
        FROM treasury_movements tm
        JOIN collection_payments cp ON cp.treasury_movement_id = tm.id
        WHERE cp.collection_id = p_collection_id AND tm.status = 'valid'
        FOR UPDATE
    LOOP
        -- Marcar original como anulado
        UPDATE treasury_movements SET status = 'annulled' WHERE id = v_mov.id;
        
        -- Crear contra-asiento (egreso)
        INSERT INTO treasury_movements (
            treasury_account_id, cash_session_id, type, amount, 
            payment_method, source_type, source_id, reversal_for_id, created_by
        )
        VALUES (
            v_mov.treasury_account_id, v_mov.cash_session_id, 'expense', v_mov.amount, 
            v_mov.payment_method, 'annulment', p_collection_id, v_mov.id, v_user_id
        );
    END LOOP;

    -- Insertar log en financial_audits para documentar el reason y la idempotency_key
    INSERT INTO financial_audits (table_name, record_id, operation, reason, new_values, changed_by)
    VALUES ('collections', p_collection_id, 'ANNUL', p_reason, jsonb_build_object('idempotency_key', p_idempotency_key), v_user_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;
