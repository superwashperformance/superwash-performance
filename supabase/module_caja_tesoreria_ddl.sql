-- =================================================================================
-- MÓDULO CAJA Y TESORERÍA - FASE 1 DDL
-- SUPER WASH PERFORMANCE
-- =================================================================================

-- 1. CREACIÓN DE ENUMS SEGURA (IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'treasury_account_type') THEN
        CREATE TYPE treasury_account_type AS ENUM ('cash', 'bank_account', 'digital_wallet', 'other');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cash_session_status') THEN
        CREATE TYPE cash_session_status AS ENUM ('open', 'counting', 'closed', 'reconciled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'treasury_movement_type') THEN
        CREATE TYPE treasury_movement_type AS ENUM ('income', 'expense', 'internal_transfer_out', 'internal_transfer_in');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_status') THEN
        CREATE TYPE movement_status AS ENUM ('valid', 'annulled');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commercial_document_type') THEN
        CREATE TYPE commercial_document_type AS ENUM ('invoice_internal', 'credit_note_internal', 'debit_note_internal');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commercial_document_status') THEN
        CREATE TYPE commercial_document_status AS ENUM ('issued', 'annulled');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'current_account_movement_type') THEN
        CREATE TYPE current_account_movement_type AS ENUM ('debit', 'credit');
    END IF;
END$$;

-- 2. TABLAS FINANCIERAS (IF NOT EXISTS para evitar sobrescribir)

-- 2.1 CUENTAS DE TESORERÍA
CREATE TABLE IF NOT EXISTS treasury_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type treasury_account_type NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 SESIONES DE CAJA
CREATE TABLE IF NOT EXISTS cash_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opened_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ,
    status cash_session_status NOT NULL DEFAULT 'open',
    expected_amounts JSONB,
    declared_amounts JSONB,
    differences JSONB,
    idempotency_key UUID UNIQUE
);

-- 2.3 MOVIMIENTOS DE TESORERÍA
CREATE TABLE IF NOT EXISTS treasury_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treasury_account_id UUID NOT NULL REFERENCES treasury_accounts(id) ON DELETE RESTRICT,
    cash_session_id UUID NULL REFERENCES cash_sessions(id) ON DELETE RESTRICT,
    type treasury_movement_type NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method payment_method_enum,
    reference TEXT,
    source_type TEXT NOT NULL, -- Ej: 'collection', 'internal_transfer', 'refund'
    source_id UUID NULL,
    status movement_status NOT NULL DEFAULT 'valid',
    reversal_for_id UUID NULL REFERENCES treasury_movements(id) ON DELETE RESTRICT,
    idempotency_key UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT
);

-- 2.4 DOCUMENTOS COMERCIALES
CREATE TABLE IF NOT EXISTS commercial_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NULL REFERENCES service_orders(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    document_type commercial_document_type NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount > 0),
    status commercial_document_status NOT NULL DEFAULT 'issued',
    fiscal_data JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 MAYOR DE CUENTA CORRIENTE
CREATE TABLE IF NOT EXISTS current_account_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    document_id UUID NULL REFERENCES commercial_documents(id) ON DELETE RESTRICT,
    type current_account_movement_type NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    source_type TEXT NOT NULL, -- Ej: 'collection', 'commercial_document', 'annulment'
    source_id UUID NULL,
    status movement_status NOT NULL DEFAULT 'valid',
    reversal_for_id UUID NULL REFERENCES current_account_movements(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 COBRANZAS (RECIBOS)
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount > 0),
    status movement_status NOT NULL DEFAULT 'valid',
    idempotency_key UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT
);

-- 2.7 DESGLOSE DE COBRANZA
CREATE TABLE IF NOT EXISTS collection_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE RESTRICT,
    treasury_movement_id UUID NOT NULL REFERENCES treasury_movements(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method payment_method_enum NOT NULL
);

-- 2.8 IMPUTACIONES (ALLOCATIONS)
CREATE TABLE IF NOT EXISTS allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_movement_id UUID NOT NULL REFERENCES current_account_movements(id) ON DELETE RESTRICT,
    debit_movement_id UUID NOT NULL REFERENCES current_account_movements(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    status movement_status NOT NULL DEFAULT 'valid',
    idempotency_key UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.9 AUDITORÍA FINANCIERA
CREATE TABLE IF NOT EXISTS financial_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reason TEXT
);


-- 3. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_treasury_movements_date ON treasury_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_treasury_movements_account ON treasury_movements(treasury_account_id);
CREATE INDEX IF NOT EXISTS idx_treasury_movements_session ON treasury_movements(cash_session_id);
CREATE INDEX IF NOT EXISTS idx_current_account_customer ON current_account_movements(customer_id);
CREATE INDEX IF NOT EXISTS idx_current_account_date ON current_account_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_allocations_debit ON allocations(debit_movement_id);
CREATE INDEX IF NOT EXISTS idx_allocations_credit ON allocations(credit_movement_id);
CREATE INDEX IF NOT EXISTS idx_collections_idempotency ON collections(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_treasury_movements_idempotency ON treasury_movements(idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_source ON current_account_movements(source_type, source_id, type) WHERE status = 'valid' AND source_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_open_session_per_user ON cash_sessions(opened_by) WHERE status IN ('open', 'counting');
CREATE UNIQUE INDEX IF NOT EXISTS idx_allocations_idempotency ON allocations(idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cash_sessions_idempotency ON cash_sessions(idempotency_key);

-- =================================================================================
-- FIN DEL SCRIPT DDL
-- =================================================================================
