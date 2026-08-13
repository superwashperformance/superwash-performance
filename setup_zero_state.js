import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dzxgspbjhbfboakycbff.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eGdzcGJqaGJmYm9ha3ljYmZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTA3NzY2NSwiZXhwIjoyMTAwNjUzNjY1fQ.6Scfm23KJz84SxILn7OnzRejGIg_lXyu1CyiJ_dVXgU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function setupZeroState() {
  console.log('Checking existing accounts...');
  const { data: existing } = await supabase.from('treasury_accounts').select('id');
  
  if (!existing || existing.length === 0) {
    console.log('Creating initial treasury accounts...');
    const accounts = [
      { name: 'Caja Fuerte Principal', type: 'cash', currency: 'USD' },
      { name: 'Caja Chica', type: 'cash', currency: 'USD' },
      { name: 'Zelle (Correo Principal)', type: 'digital_wallet', currency: 'USD' },
      { name: 'Banesco Panama', type: 'bank_account', currency: 'USD' },
      { name: 'Banesco Pago Movil', type: 'bank_account', currency: 'VES' },
    ];
    const { error } = await supabase.from('treasury_accounts').insert(accounts);
    if (error) {
      console.error('Error creating accounts:', error);
    } else {
      console.log('Accounts created successfully.');
    }
  } else {
    console.log(`Accounts already exist (${existing.length}). Skipping creation.`);
  }

  // Double check everything else is zero
  const tables = ['cash_sessions', 'treasury_movements', 'collections', 'current_account_movements', 'allocations'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`[${table}] count:`, error ? error.message : count);
  }
}

setupZeroState();
