const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../scratch/superwash-performance/.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function run() {
  const { error } = await supabase.rpc('execute_sql', {
    query_text: `CREATE POLICY "Permitir eliminar ODS a gerentes y admins" ON service_orders FOR DELETE USING ( auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')) );`
  });
  console.log('RLS Error:', error);
}
run();
