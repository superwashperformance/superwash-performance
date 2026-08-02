import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzxgspbjhbfboakycbff.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eGdzcGJqaGJmYm9ha3ljYmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzc2NjUsImV4cCI6MjEwMDY1MzY2NX0.xp6zYHlNDAtZIVyLSI3h_YES5E5z8OMO5nxp3_wRSc0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function wipeData() {
  console.log('Wiping service_orders...');
  const { data, error } = await supabase
    .from('service_orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
    
  if (error) {
    console.error('Error wiping service_orders:', error);
  } else {
    console.log('Wiped service_orders successfully.');
  }
}

wipeData();
