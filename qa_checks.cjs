const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dzxgspbjhbfboakycbff.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eGdzcGJqaGJmYm9ha3ljYmZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTA3NzY2NSwiZXhwIjoyMTAwNjUzNjY1fQ.6Scfm23KJz84SxILn7OnzRejGIg_lXyu1CyiJ_dVXgU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function qaAuth() {
  console.log('--- QA AUTH ---');
  const emails = ['admin@superwash.com', 'gerente@superwash.com', 'cajero@superwash.com'];
  
  for (const email of emails) {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      console.log(`PASS: User ${email} exists, UID: ${user.id}, Role: ${profile?.role}`);
    } else {
      console.log(`FAIL: User ${email} NOT FOUND in Auth`);
    }
  }

  // Check for mock auth mentions
  const { execSync } = require('child_process');
  try {
    const grepRes = execSync('grep -r "sw_current_user" src/').toString();
    console.log('FAIL: sw_current_user found in source:\n', grepRes);
  } catch (e) {
    console.log('PASS: sw_current_user NOT found');
  }
}

async function qaDb() {
  console.log('\n--- QA DB ---');
  const tables = ['cash_sessions', 'treasury_accounts', 'treasury_movements', 'current_account_movements', 'collections', 'allocations', 'cash_transactions'];
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`FAIL: Table ${t} error: ${error.message}`);
    } else {
      console.log(`PASS: Table ${t} exists. Count: ${count}`);
    }
  }
  
  const { data: accs } = await supabase.from('treasury_accounts').select('name, type');
  console.log('Accounts:', accs);
}

async function run() {
  await qaAuth();
  await qaDb();
}
run();
