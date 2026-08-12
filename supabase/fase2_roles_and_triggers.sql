-- =================================================================================
-- FASE 2 - ROLES Y TRIGGERS DE AUDITORÍA
-- =================================================================================

-- 1. AGREGAR ROLES FINANCIEROS (Si no existen)
-- Se ejecutan fuera de bloques transaccionales.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cashier';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';

-- =================================================================================
-- 2. FUNCIÓN DE AUDITORÍA (TRIGGER FUNCTION)
-- =================================================================================
CREATE OR REPLACE FUNCTION audit_financial_operations()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Obtener el ID del usuario desde auth.uid() de Supabase
    v_user_id := auth.uid();

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO financial_audits(table_name, record_id, operation, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), v_user_id);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO financial_audits(table_name, record_id, operation, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), v_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO financial_audits(table_name, record_id, operation, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), v_user_id);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================================
-- 3. ASIGNAR TRIGGERS DE AUDITORÍA A TABLAS CRÍTICAS
-- =================================================================================

DROP TRIGGER IF EXISTS trg_audit_cash_sessions ON cash_sessions;
CREATE TRIGGER trg_audit_cash_sessions
    AFTER INSERT OR UPDATE OR DELETE ON cash_sessions
    FOR EACH ROW EXECUTE FUNCTION audit_financial_operations();

DROP TRIGGER IF EXISTS trg_audit_treasury_movements ON treasury_movements;
CREATE TRIGGER trg_audit_treasury_movements
    AFTER INSERT OR UPDATE OR DELETE ON treasury_movements
    FOR EACH ROW EXECUTE FUNCTION audit_financial_operations();

DROP TRIGGER IF EXISTS trg_audit_commercial_docs ON commercial_documents;
CREATE TRIGGER trg_audit_commercial_docs
    AFTER INSERT OR UPDATE OR DELETE ON commercial_documents
    FOR EACH ROW EXECUTE FUNCTION audit_financial_operations();

DROP TRIGGER IF EXISTS trg_audit_current_acc_movs ON current_account_movements;
CREATE TRIGGER trg_audit_current_acc_movs
    AFTER INSERT OR UPDATE OR DELETE ON current_account_movements
    FOR EACH ROW EXECUTE FUNCTION audit_financial_operations();

DROP TRIGGER IF EXISTS trg_audit_collections ON collections;
CREATE TRIGGER trg_audit_collections
    AFTER INSERT OR UPDATE OR DELETE ON collections
    FOR EACH ROW EXECUTE FUNCTION audit_financial_operations();

DROP TRIGGER IF EXISTS trg_audit_allocations ON allocations;
CREATE TRIGGER trg_audit_allocations
    AFTER INSERT OR UPDATE OR DELETE ON allocations
    FOR EACH ROW EXECUTE FUNCTION audit_financial_operations();
