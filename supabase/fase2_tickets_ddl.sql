-- FASE 2: TICKETS, SECUENCIAS Y NUEVOS RPC FINANCIEROS

-- 1. SECUENCIAS
CREATE SEQUENCE IF NOT EXISTS seq_ticket_contado START WITH 1;
CREATE SEQUENCE IF NOT EXISTS seq_ticket_credito START WITH 1;
CREATE SEQUENCE IF NOT EXISTS seq_receipt START WITH 1;
CREATE SEQUENCE IF NOT EXISTS seq_credit_note START WITH 1;

-- 2. COLUMNAS DE TRAZABILIDAD
ALTER TABLE commercial_documents ADD COLUMN IF NOT EXISTS document_number TEXT UNIQUE;
ALTER TABLE commercial_documents ADD COLUMN IF NOT EXISTS payment_condition TEXT; -- 'CONTADO' or 'CUENTA_CORRIENTE'
ALTER TABLE collections ADD COLUMN IF NOT EXISTS receipt_number TEXT UNIQUE;
ALTER TABLE commercial_documents ADD COLUMN IF NOT EXISTS original_document_id UUID REFERENCES commercial_documents(id);

-- 3. NUEVOS RPC PARA OPERACIONES FINANCIERAS EXACTAS

-- A. VENTA DE CONTADO (B001)
-- Genera Ticket B001, registra el ingreso directo a Caja (Treasury Movement) y NO toca Cuenta Corriente.
CREATE OR REPLACE FUNCTION rpc_process_contado_sale(
    p_customer_id UUID,
    p_total NUMERIC,
    p_payments JSONB,
    p_idempotency_key UUID,
    p_order_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
    v_doc_id UUID;
    v_payment JSONB;
    v_sum_payments NUMERIC := 0;
    v_treasury_mov_id UUID;
    v_doc_number TEXT;
BEGIN
    v_user_id := _validate_financial_role();

    -- Idempotencia
    SELECT id INTO v_doc_id FROM commercial_documents WHERE idempotency_key = p_idempotency_key;
    IF v_doc_id IS NOT NULL THEN
        RETURN v_doc_id;
    END IF;

    -- Sesión activa
    SELECT id INTO v_session_id FROM cash_sessions WHERE opened_by = v_user_id AND status = 'open';
    IF v_session_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró una sesión de caja abierta para el usuario';
    END IF;

    -- Validar pagos
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
        v_sum_payments := v_sum_payments + (v_payment->>'amount')::NUMERIC;
    END LOOP;
    IF v_sum_payments != p_total THEN
        RAISE EXCEPTION 'La suma de los pagos (%) no coincide con el total (%)', v_sum_payments, p_total;
    END IF;

    -- Generar Número
    v_doc_number := 'B001-' || LPAD(nextval('seq_ticket_contado')::TEXT, 3, '0');

    -- Crear Documento (B001)
    INSERT INTO commercial_documents (order_id, customer_id, document_type, total_amount, payment_condition, document_number, idempotency_key)
    VALUES (p_order_id, p_customer_id, 'invoice_internal', p_total, 'CONTADO', v_doc_number, p_idempotency_key)
    RETURNING id INTO v_doc_id;

    -- Registrar Pagos Directos a Caja
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
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
            'commercial_document',
            v_doc_id,
            v_user_id
        ) RETURNING id INTO v_treasury_mov_id;
    END LOOP;

    RETURN v_doc_id;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;


-- B. VENTA A CUENTA CORRIENTE (CC002)
-- Genera Ticket CC002, registra la deuda (Débito) en Cuenta Corriente y NO toca Caja.
CREATE OR REPLACE FUNCTION rpc_process_credit_sale(
    p_customer_id UUID,
    p_total NUMERIC,
    p_idempotency_key UUID,
    p_order_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_doc_id UUID;
    v_doc_number TEXT;
BEGIN
    v_user_id := _validate_financial_role();

    -- Idempotencia
    SELECT id INTO v_doc_id FROM commercial_documents WHERE idempotency_key = p_idempotency_key;
    IF v_doc_id IS NOT NULL THEN
        RETURN v_doc_id;
    END IF;

    -- Generar Número
    v_doc_number := 'CC002-' || LPAD(nextval('seq_ticket_credito')::TEXT, 3, '0');

    -- Crear Documento (CC002)
    INSERT INTO commercial_documents (order_id, customer_id, document_type, total_amount, payment_condition, document_number, idempotency_key)
    VALUES (p_order_id, p_customer_id, 'invoice_internal', p_total, 'CUENTA_CORRIENTE', v_doc_number, p_idempotency_key)
    RETURNING id INTO v_doc_id;

    -- Registrar Deuda en Cuenta Corriente
    INSERT INTO current_account_movements (customer_id, document_id, type, amount, source_type, source_id)
    VALUES (p_customer_id, v_doc_id, 'debit', p_total, 'commercial_document', v_doc_id);

    RETURN v_doc_id;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;


-- C. RECIBO DE COBRANZA (REC004)
-- Genera REC004 y registra ingreso
CREATE OR REPLACE FUNCTION rpc_process_collection_receipt(
    p_customer_id UUID,
    p_total NUMERIC,
    p_payments JSONB,
    p_idempotency_key UUID,
    p_order_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
    v_collection_id UUID;
    v_payment JSONB;
    v_sum_payments NUMERIC := 0;
    v_receipt_number TEXT;
    v_treasury_mov_id UUID;
BEGIN
    v_user_id := _validate_financial_role();

    -- Idempotencia
    SELECT id INTO v_collection_id FROM collections WHERE idempotency_key = p_idempotency_key;
    IF v_collection_id IS NOT NULL THEN
        RETURN v_collection_id;
    END IF;

    -- Sesión activa
    SELECT id INTO v_session_id FROM cash_sessions WHERE opened_by = v_user_id AND status = 'open';
    IF v_session_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró una sesión de caja abierta para el usuario';
    END IF;

    -- Validar pagos
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
        v_sum_payments := v_sum_payments + (v_payment->>'amount')::NUMERIC;
    END LOOP;
    IF v_sum_payments != p_total THEN
        RAISE EXCEPTION 'La suma de los pagos (%) no coincide con el total (%)', v_sum_payments, p_total;
    END IF;

    -- Generar Número
    v_receipt_number := 'REC004-' || LPAD(nextval('seq_receipt')::TEXT, 3, '0');

    -- Crear Collection (REC004)
    INSERT INTO collections (customer_id, total_amount, receipt_number, idempotency_key, created_by)
    VALUES (p_customer_id, p_total, v_receipt_number, p_idempotency_key, v_user_id)
    RETURNING id INTO v_collection_id;

    -- Crear Saldo a Favor (Crédito)
    INSERT INTO current_account_movements (customer_id, type, amount, source_type, source_id)
    VALUES (p_customer_id, 'credit', p_total, 'collection', v_collection_id);

    -- Registrar Ingreso a Caja
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
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

        INSERT INTO collection_payments (collection_id, treasury_movement_id, amount, payment_method)
        VALUES (v_collection_id, v_treasury_mov_id, (v_payment->>'amount')::NUMERIC, (v_payment->>'method')::payment_method_enum);
    END LOOP;

    RETURN v_collection_id;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;


-- D. NOTA DE CRÉDITO (NC003)
CREATE OR REPLACE FUNCTION rpc_create_credit_note(
    p_original_doc_id UUID,
    p_amount NUMERIC,
    p_idempotency_key UUID,
    p_order_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
    v_nc_id UUID;
    v_doc_number TEXT;
    v_orig_doc RECORD;
BEGIN
    v_user_id := _validate_financial_role();

    -- Obtener documento original
    SELECT * INTO v_orig_doc FROM commercial_documents WHERE id = p_original_doc_id;
    IF v_orig_doc.id IS NULL THEN
        RAISE EXCEPTION 'Documento original no encontrado';
    END IF;

    -- Idempotencia
    SELECT id INTO v_nc_id FROM commercial_documents WHERE idempotency_key = p_idempotency_key;
    IF v_nc_id IS NOT NULL THEN
        RETURN v_nc_id;
    END IF;

    -- Generar Número
    v_doc_number := 'NC003-' || LPAD(nextval('seq_credit_note')::TEXT, 3, '0');

    -- Crear Documento (NC003)
    INSERT INTO commercial_documents (order_id, customer_id, document_type, total_amount, payment_condition, document_number, original_document_id, idempotency_key)
    VALUES (v_orig_doc.order_id, v_orig_doc.customer_id, 'credit_note_internal', p_amount, v_orig_doc.payment_condition, v_doc_number, p_original_doc_id, p_idempotency_key)
    RETURNING id INTO v_nc_id;

    -- Aplicar reglas
    IF v_orig_doc.payment_condition = 'CONTADO' THEN
        SELECT id INTO v_session_id FROM cash_sessions WHERE opened_by = v_user_id AND status = 'open';
        IF v_session_id IS NULL THEN
            RAISE EXCEPTION 'Se requiere sesión de caja abierta para emitir NC de contado';
        END IF;

        INSERT INTO treasury_movements (
            treasury_account_id, cash_session_id, type, amount, 
            payment_method, source_type, source_id, created_by
        )
        VALUES (
            (SELECT id FROM treasury_accounts WHERE type = 'cash' LIMIT 1), 
            v_session_id, 
            'expense', 
            p_amount,
            'cash',
            'commercial_document',
            v_nc_id,
            v_user_id
        );
    ELSIF v_orig_doc.payment_condition = 'CUENTA_CORRIENTE' THEN
        INSERT INTO current_account_movements (customer_id, document_id, type, amount, source_type, source_id)
        VALUES (v_orig_doc.customer_id, v_nc_id, 'credit', p_amount, 'commercial_document', v_nc_id);
    END IF;

    RETURN v_nc_id;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;
