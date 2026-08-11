
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dzxgspbjhbfboakycbff.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eGdzcGJqaGJmYm9ha3ljYmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzc2NjUsImV4cCI6MjEwMDY1MzY2NX0.xp6zYHlNDAtZIVyLSI3h_YES5E5z8OMO5nxp3_wRSc0');
async function test() {
  const { data, error } = await supabase.from('order_photos').select('id').limit(1);
  console.log('order_photos error:', error);
  const { data: data2, error: error2 } = await supabase.from('ods_photos').select('id').limit(1);
  console.log('ods_photos error:', error2);
}
test();
