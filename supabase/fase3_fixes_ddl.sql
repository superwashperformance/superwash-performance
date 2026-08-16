-- 1. ALTER commercial_documents
ALTER TABLE commercial_documents ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;
ALTER TABLE commercial_documents ADD COLUMN IF NOT EXISTS annulled_amount NUMERIC DEFAULT 0;

-- Drop if exists and recreate check
ALTER TABLE commercial_documents DROP CONSTRAINT IF EXISTS chk_balance;
ALTER TABLE commercial_documents ADD CONSTRAINT chk_balance CHECK (total_amount - paid_amount - annulled_amount >= 0);

-- 2. ALTER collections
ALTER TABLE collections ADD COLUMN IF NOT EXISTS commercial_document_id UUID REFERENCES commercial_documents(id);

-- 3. rpc_process_collection_receipt
CREATE OR REPLACE FUNCTION rpc_process_collection_receipt(
    p_document_id UUID,
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
    v_receipt_number TEXT;
    v_treasury_mov_id UUID;
    v_customer_id UUID;
    v_rows_affected INT;
BEGIN
    v_user_id := _validate_financial_role();

    -- Idempotencia
    SELECT id INTO v_collection_id FROM collections WHERE idempotency_key = p_idempotency_key;
    IF v_collection_id IS NOT NULL THEN
        RETURN v_collection_id;
    END IF;

    -- Validar documento y obtener customer_id
    SELECT customer_id INTO v_customer_id FROM commercial_documents WHERE id = p_document_id;
    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Documento CC002 no encontrado';
    END IF;

    -- Sesion activa
    SELECT id INTO v_session_id FROM cash_sessions WHERE opened_by = v_user_id AND status = 'open';
    IF v_session_id IS NULL THEN
        RAISE EXCEPTION 'No se encontro una sesion de caja abierta para el usuario';
    END IF;

    -- Validar sumatoria pagos = p_total
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
        v_sum_payments := v_sum_payments + (v_payment->>'amount')::NUMERIC;
    END LOOP;
    IF v_sum_payments != p_total THEN
        RAISE EXCEPTION 'La suma de los pagos (%) no coincide con el total (%)', v_sum_payments, p_total;
    END IF;

    -- Actualizar saldo de forma atomica
    UPDATE commercial_documents 
    SET paid_amount = paid_amount + p_total 
    WHERE id = p_document_id AND (total_amount - paid_amount - annulled_amount) >= p_total;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    IF v_rows_affected = 0 THEN
        RAISE EXCEPTION 'El monto a cobrar (%) excede el saldo disponible del documento', p_total;
    END IF;

    -- Generar Numero
    v_receipt_number := 'REC004-' || LPAD(nextval('seq_receipt')::TEXT, 3, '0');

    -- Crear Collection (REC004) vinculado al CC002
    INSERT INTO collections (customer_id, total_amount, receipt_number, idempotency_key, created_by, commercial_document_id)
    VALUES (v_customer_id, p_total, v_receipt_number, p_idempotency_key, v_user_id, p_document_id)
    RETURNING id INTO v_collection_id;

    -- Crear Saldo a Favor (Credito) (para CC general, aunque ahora hay track por CC002)
    INSERT INTO current_account_movements (customer_id, type, amount, source_type, source_id, document_id)
    VALUES (v_customer_id, 'credit', p_total, 'collection', v_collection_id, p_document_id);

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


-- 4. rpc_create_credit_note
CREATE OR REPLACE FUNCTION rpc_create_credit_note(
    p_original_doc_id UUID,
    p_amount NUMERIC,
    p_refunds JSONB,
    p_idempotency_key UUID
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
    v_nc_id UUID;
    v_doc_number TEXT;
    v_orig_doc RECORD;
    v_rows_affected INT;
    v_refund JSONB;
    v_sum_refunds NUMERIC := 0;
    v_pm TEXT;
    v_pm_amount NUMERIC;
    v_pm_available NUMERIC;
    v_orig_income NUMERIC;
    v_prior_refunds NUMERIC;
    v_pm_enum payment_method_enum;
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

    -- Actualizar annulled_amount atomicamente
    UPDATE commercial_documents 
    SET annulled_amount = annulled_amount + p_amount 
    WHERE id = p_original_doc_id AND (total_amount - paid_amount - annulled_amount) >= p_amount;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    IF v_rows_affected = 0 THEN
        RAISE EXCEPTION 'El monto a anular (%) excede el saldo anulable del documento original', p_amount;
    END IF;

    -- Generar Numero
    v_doc_number := 'NC003-' || LPAD(nextval('seq_credit_note')::TEXT, 3, '0');

    -- Crear Documento (NC003)
    INSERT INTO commercial_documents (order_id, customer_id, document_type, total_amount, payment_condition, document_number, original_document_id, idempotency_key)
    VALUES (v_orig_doc.order_id, v_orig_doc.customer_id, 'credit_note_internal', p_amount, v_orig_doc.payment_condition, v_doc_number, p_original_doc_id, p_idempotency_key)
    RETURNING id INTO v_nc_id;

    -- Aplicar reglas dependiendo de la condicion
    IF v_orig_doc.payment_condition = 'CONTADO' THEN
        SELECT id INTO v_session_id FROM cash_sessions WHERE opened_by = v_user_id AND status = 'open';
        IF v_session_id IS NULL THEN
            RAISE EXCEPTION 'Se requiere sesion de caja abierta para emitir NC de contado';
        END IF;

        -- Validar refunds
        FOR v_refund IN SELECT * FROM jsonb_array_elements(p_refunds) LOOP
            v_pm := v_refund->>'method';
            v_pm_amount := (v_refund->>'amount')::NUMERIC;
            v_sum_refunds := v_sum_refunds + v_pm_amount;
            v_pm_enum := v_pm::payment_method_enum;

            -- Calcular ingresos originales para este metodo (desde B001)
            SELECT COALESCE(SUM(amount), 0) INTO v_orig_income 
            FROM treasury_movements 
            WHERE source_type = 'commercial_document' 
              AND source_id = p_original_doc_id 
              AND type = 'income' 
              AND payment_method = v_pm_enum;
            
            -- Calcular reembolsos previos para este metodo
            -- Todos los NC003 que tienen original_document_id = p_original_doc_id
            SELECT COALESCE(SUM(tm.amount), 0) INTO v_prior_refunds
            FROM treasury_movements tm
            JOIN commercial_documents nc ON nc.id = tm.source_id
            WHERE tm.source_type = 'commercial_document'
              AND tm.type = 'expense'
              AND tm.payment_method = v_pm_enum
              AND nc.original_document_id = p_original_doc_id
              AND nc.id != v_nc_id; 

            v_pm_available := v_orig_income - v_prior_refunds;

            IF v_pm_amount > v_pm_available THEN
                RAISE EXCEPTION 'Reembolso para % (%) excede el saldo original disponible (%)', v_pm, v_pm_amount, v_pm_available;
            END IF;

            -- Registrar el egreso
            INSERT INTO treasury_movements (
                treasury_account_id, cash_session_id, type, amount, 
                payment_method, source_type, source_id, created_by
            )
            VALUES (
                (v_refund->>'account_id')::UUID, 
                v_session_id, 
                'expense', 
                v_pm_amount,
                v_pm_enum,
                'commercial_document',
                v_nc_id,
                v_user_id
            );
        END LOOP;
        
        IF v_sum_refunds != p_amount THEN
            RAISE EXCEPTION 'La suma de los reembolsos (%) no coincide con el total de la NC (%)', v_sum_refunds, p_amount;
        END IF;

    ELSIF v_orig_doc.payment_condition = 'CUENTA_CORRIENTE' THEN
        INSERT INTO current_account_movements (customer_id, document_id, type, amount, source_type, source_id)
        VALUES (v_orig_doc.customer_id, v_nc_id, 'credit', p_amount, 'commercial_document', v_nc_id);
    END IF;

    RETURN v_nc_id;
END;
$$ LANGUAGE plpgsql SET search_path = public SECURITY DEFINER;
