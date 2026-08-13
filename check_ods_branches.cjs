const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
async function run() { 
  const { data, error, count } = await supabase.from('service_orders').select('id, order_number', { count: 'exact' }).is('branch_id', null); 
  if (error) { console.error(error); return; } 
  console.log('ODS sin branch_id encontradas:', count); 
  if (count > 0) { console.log('Primeras:', data.slice(0, 5)); } 
} 
run();
