-- =================================================================================
-- FASE 2 - SEGURIDAD (RLS)
-- =================================================================================

-- 1. ACTIVAR RLS
ALTER TABLE treasury_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_account_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_audits ENABLE ROW LEVEL SECURITY;

-- 2. FUNCIÓN DE UTILIDAD PARA VERIFICAR ROLES FINANCIEROS
CREATE OR REPLACE FUNCTION is_financial_role()
RETURNS BOOLEAN AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
    RETURN v_role IN ('admin', 'owner', 'manager', 'cashier');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. POLÍTICAS DE LECTURA (SELECT)
-- Solo lectura para roles financieros.
-- IMPORTANTE: No se otorgan permisos de INSERT/UPDATE/DELETE directos a las tablas transaccionales.

-- treasury_accounts
DROP POLICY IF EXISTS "financial_roles_select_treasury_accounts" ON treasury_accounts;
CREATE POLICY "financial_roles_select_treasury_accounts" ON treasury_accounts
    FOR SELECT USING (is_financial_role());

-- cash_sessions
DROP POLICY IF EXISTS "financial_roles_select_cash_sessions" ON cash_sessions;
CREATE POLICY "financial_roles_select_cash_sessions" ON cash_sessions
    FOR SELECT USING (is_financial_role());

-- treasury_movements
DROP POLICY IF EXISTS "financial_roles_select_treasury_movements" ON treasury_movements;
CREATE POLICY "financial_roles_select_treasury_movements" ON treasury_movements
    FOR SELECT USING (is_financial_role());

-- commercial_documents
DROP POLICY IF EXISTS "financial_roles_select_commercial_documents" ON commercial_documents;
CREATE POLICY "financial_roles_select_commercial_documents" ON commercial_documents
    FOR SELECT USING (is_financial_role());

-- current_account_movements
DROP POLICY IF EXISTS "financial_roles_select_current_account_movements" ON current_account_movements;
CREATE POLICY "financial_roles_select_current_account_movements" ON current_account_movements
    FOR SELECT USING (is_financial_role());

-- collections
DROP POLICY IF EXISTS "financial_roles_select_collections" ON collections;
CREATE POLICY "financial_roles_select_collections" ON collections
    FOR SELECT USING (is_financial_role());

-- collection_payments
DROP POLICY IF EXISTS "financial_roles_select_collection_payments" ON collection_payments;
CREATE POLICY "financial_roles_select_collection_payments" ON collection_payments
    FOR SELECT USING (is_financial_role());

-- allocations
DROP POLICY IF EXISTS "financial_roles_select_allocations" ON allocations;
CREATE POLICY "financial_roles_select_allocations" ON allocations
    FOR SELECT USING (is_financial_role());

-- financial_audits (Solo lectura para Admin y Owner)
DROP POLICY IF EXISTS "admin_owner_select_audits" ON financial_audits;
CREATE POLICY "admin_owner_select_audits" ON financial_audits
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'owner')
    );
