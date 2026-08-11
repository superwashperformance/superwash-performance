
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dzxgspbjhbfboakycbff.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eGdzcGJqaGJmYm9ha3ljYmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzc2NjUsImV4cCI6MjEwMDY1MzY2NX0.xp6zYHlNDAtZIVyLSI3h_YES5E5z8OMO5nxp3_wRSc0');
async function test() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'ods_checklist' });
  console.log('Error:', error);
  // fallback if rpc not there
  const { error: e2 } = await supabase.from('ods_checklist').select('notarealcol');
  console.log('E2:', e2);
}
test();
