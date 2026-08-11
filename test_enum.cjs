
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dzxgspbjhbfboakycbff.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eGdzcGJqaGJmYm9ha3ljYmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzc2NjUsImV4cCI6MjEwMDY1MzY2NX0.xp6zYHlNDAtZIVyLSI3h_YES5E5z8OMO5nxp3_wRSc0');
async function test() {
  const { data, error } = await supabase.from('order_photos').insert([{
    order_id: '311cf285-597d-418b-9fac-a628a0012a83', // existing order
    photo_url: 'test.jpg',
    category: 'belonging'
  }]);
  console.log('Error:', error);
}
test();
