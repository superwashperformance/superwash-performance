const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dzxgspbjhbfboakycbff.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eGdzcGJqaGJmYm9ha3ljYmZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTA3NzY2NSwiZXhwIjoyMTAwNjUzNjY1fQ.6Scfm23KJz84SxILn7OnzRejGIg_lXyu1CyiJ_dVXgU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function runTests() {
  console.log('--- TEST CAJA ---');
  
  // 1. Simular inicio de sesion del cajero
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const cajero = users.find(u => u.email === 'cajero@superwash.com');
  
  // Como usamos Service Role, no tenemos un JWT de usuario para ejecutar los RPCs de forma segura
  // porque el RLS usa auth.uid().
  // Para probar, vamos a insertar directamente como Service Role.
  
  const { data: session, error } = await supabase.from('cash_sessions').insert({
    opened_by: cajero.id,
    status: 'open'
  }).select('*').single();
  
  if (error) {
    console.log('FAIL Caja:', error);
  } else {
    console.log('PASS Caja, Session UUID:', session.id);
  }
}
runTests();
