-- Fase 3: Ramas / Sedes y Corrección de Eliminación de ODS

-- 1. Actualización de tabla branches
ALTER TABLE branches ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Proteger branches con RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados en branches" ON branches;
CREATE POLICY "Permitir lectura a usuarios autenticados en branches" ON branches FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir gestión a admins en branches" ON branches;
CREATE POLICY "Permitir gestión a admins en branches" ON branches FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'owner')
  )
);

-- 2. Corrección de la política de DELETE para service_orders
-- Solo admin y owner pueden eliminar
DROP POLICY IF EXISTS "Permitir eliminar ODS a admins" ON service_orders;
CREATE POLICY "Permitir eliminar ODS a admins" ON service_orders FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'owner')
  )
);
