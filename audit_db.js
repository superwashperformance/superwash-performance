import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dzxgspbjhbfboakycbff.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eGdzcGJqaGJmYm9ha3ljYmZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTA3NzY2NSwiZXhwIjoyMTAwNjUzNjY1fQ.6Scfm23KJz84SxILn7OnzRejGIg_lXyu1CyiJ_dVXgU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function runAudit() {
  const log = (msg) => console.log(msg);

  log('--- CHECKING TABLES ---');
  const tablesToCheck = ['cash_sessions', 'treasury_accounts', 'treasury_movements', 'collections', 'current_account_movements', 'cash_transactions', 'allocations'];
  
  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && error.code === 'PGRST205') {
      log(`[TABLE] ${table}: NOT FOUND (🔴)`);
    } else if (error) {
       log(`[TABLE] ${table}: ERROR - ${error.message} (🟡)`);
    } else {
      log(`[TABLE] ${table}: EXISTS (🟢)`);
    }
  }

  log('\n--- CHECKING RPCs ---');
  const rpcsToCheck = ['rpc_open_cash_session', 'rpc_process_collection', 'rpc_allocate_funds', 'rpc_close_cash_session', 'rpc_internal_transfer', 'rpc_annul_collection'];
  
  for (const rpc of rpcsToCheck) {
    // A trick to see if an RPC exists is to call it with invalid arguments or check the error code. 
    // Or we can just call it with no args and see if we get a 404 (does not exist) vs 400 (bad request/invalid args)
    const { error } = await supabase.rpc(rpc, {});
    if (error && error.code === 'PGRST202') {
      log(`[RPC] ${rpc}: NOT FOUND (🔴)`);
    } else if (error) {
      log(`[RPC] ${rpc}: EXISTS (returns ${error.code} - ${error.message}) (🟢/🟡)`);
    } else {
      log(`[RPC] ${rpc}: EXISTS (returns success) (🟢)`);
    }
  }

}

runAudit();
