
-- =================================================================================
-- SCRIPT DE LIMPIEZA Y RECREACION
-- IMPORTANTE: ESTO BORRARA LAS ORDENES DE PRUEBA EXISTENTES Y RECREARA EL ESQUEMA
-- =================================================================================

-- 1. Eliminar tablas antiguas y actuales
DROP TABLE IF EXISTS cash_transactions CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS ods_services CASCADE;
DROP TABLE IF EXISTS ods_photos CASCADE;
DROP TABLE IF EXISTS ods_checklist CASCADE;
DROP TABLE IF EXISTS ods_damage_markers CASCADE;
DROP TABLE IF EXISTS order_services CASCADE;
DROP TABLE IF EXISTS order_photos CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS damage_markers CASCADE;
DROP TABLE IF EXISTS service_orders CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Eliminar tipos enumerados antiguos
DROP TYPE IF EXISTS payment_method_enum CASCADE;
DROP TYPE IF EXISTS inventory_type CASCADE;
DROP TYPE IF EXISTS item_condition CASCADE;
DROP TYPE IF EXISTS ods_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =============================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS POSTGRESQL / SUPABASE
-- PROYECTO: SUPER WASH PERFORMANCE
-- =============================================================================

-- 1. TIPOS ENUMERADOS (ENUMS)
CREATE TYPE user_role AS ENUM (
  'admin', 'owner', 'sales', 'polisher', 
  'dismantler', 'painter', 'prep_tech', 'ppf_installer', 'free_reception'
);

CREATE TYPE ods_status AS ENUM (
  'received', 'diagnosis', 'quote_sent', 'quote_approved', 
  'in_progress', 'waiting_parts', 'quality_control', 'completed', 'delivered'
);

CREATE TYPE item_condition AS ENUM (
  'ok', 'damaged', 'missing', 'observation'
);

CREATE TYPE inventory_type AS ENUM (
  'detailing', 'paint'
);

CREATE TYPE payment_method_enum AS ENUM (
  'efectivo', 'zelle', 'pago_movil', 'tarjeta', 'transferencia'
);

-- 2. TABLA DE PERFILES DE USUARIO
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'sales',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA DE SEDES
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABLA DE CLIENTES
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  document_id TEXT NOT NULL UNIQUE, -- Cédula / RIF / DNI
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABLA DE VEHÍCULOS
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plate TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  color TEXT NOT NULL,
  vin TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABLA PRINCIPAL DE ÓRDENES DE SERVICIO (ODS CORE)
CREATE SEQUENCE ods_number_seq START WITH 1001;

CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT ('ODS-' || nextval('ods_number_seq')::TEXT),
  customer_id UUID NOT NULL REFERENCES customers(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  branch_id UUID REFERENCES branches(id),
  agent_id UUID REFERENCES profiles(id),
  status ods_status NOT NULL DEFAULT 'received',
  entry_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  estimated_delivery TIMESTAMPTZ,
  observations TEXT,
  belongings_list TEXT[],
  client_signature_url TEXT,
  subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TABLA DE CHECKLIST (20 PUNTOS OBLIGATORIOS)
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  label TEXT NOT NULL,
  condition item_condition NOT NULL DEFAULT 'ok',
  notes TEXT
);

-- 8. TABLA DE DAÑOS EN CARROCERÍA (MARCADORES 360°)
CREATE TABLE damage_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  x_pos NUMERIC(5, 2) NOT NULL,
  y_pos NUMERIC(5, 2) NOT NULL,
  view_name TEXT NOT NULL, -- 'front', 'rear', 'left', 'right', 'top'
  damage_type TEXT NOT NULL, -- 'scratch', 'dent', 'paint_chip', 'crack', 'other'
  severity TEXT NOT NULL DEFAULT 'low',
  description TEXT NOT NULL
);

-- 9. TABLA DE FOTOGRAFÍAS DE EVIDENCIA ODS
CREATE TABLE order_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  category TEXT NOT NULL, -- 'general', 'damage', 'belonging', 'progress', 'final'
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. TABLA DE SERVICIOS INCLUIDOS EN LA ODS
CREATE TABLE order_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total_price NUMERIC(10, 2) NOT NULL
);

-- 11. TABLA DE INVENTARIO DUAL (DETAILING VS PINTURA)
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category inventory_type NOT NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
  min_stock NUMERIC(10, 2) NOT NULL DEFAULT 5,
  unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit_of_measure TEXT NOT NULL, -- 'ml', 'litros', 'unidades', 'gramos', 'kits'
  responsible_person TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. TABLA DE TRANSACCIONES DE CAJA Y COBROS
CREATE TABLE cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES service_orders(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'payment',
  payment_method payment_method_enum NOT NULL DEFAULT 'zelle',
  reference_number TEXT,
  notes TEXT,
  received_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. POLÍTICAS DE SEGURIDAD ROW-LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública/autenticada
CREATE POLICY "Permitir lectura a usuarios autenticados" ON service_orders FOR SELECT USING (true);
CREATE POLICY "Permitir creación a usuarios autenticados" ON service_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización a usuarios autenticados" ON service_orders FOR UPDATE USING (true);

CREATE POLICY "Permitir acceso a inventario" ON inventory_items FOR ALL USING (true);
CREATE POLICY "Permitir acceso a caja" ON cash_transactions FOR ALL USING (true);

CREATE POLICY "Permitir acceso a checklist_items" ON checklist_items FOR ALL USING (true);
CREATE POLICY "Permitir acceso a damage_markers" ON damage_markers FOR ALL USING (true);
CREATE POLICY "Permitir acceso a order_photos" ON order_photos FOR ALL USING (true);
CREATE POLICY "Permitir acceso a order_services" ON order_services FOR ALL USING (true);
CREATE POLICY "Permitir acceso a profiles" ON profiles FOR ALL USING (true);

