-- FASE B: Creación de Bucket de Storage y Políticas RLS

-- 1. Insertar el bucket (si no existe) asegurando que sea público para lectura
INSERT INTO storage.buckets (id, name, public)
VALUES ('ods-photos', 'ods-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Asegurar que RLS esté habilitado en storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Crear política para permitir SELECT (lectura) a todos, ya que el bucket es público
-- Esto permite que getPublicUrl() funcione correctamente en el Frontend sin tokens firmados.
DROP POLICY IF EXISTS "Public Access to ODS Photos" ON storage.objects;
CREATE POLICY "Public Access to ODS Photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ods-photos');

-- 4. Crear política para permitir INSERT solo a usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload photos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'ods-photos');

-- 5. Crear política para permitir DELETE solo a usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;
CREATE POLICY "Authenticated users can delete photos" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'ods-photos');
