
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://dzxgspbjhbfboakycbff.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eGdzcGJqaGJmYm9ha3ljYmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzc2NjUsImV4cCI6MjEwMDY1MzY2NX0.xp6zYHlNDAtZIVyLSI3h_YES5E5z8OMO5nxp3_wRSc0');
async function test() {
  const { data, error } = await supabase.from('service_orders').select('*, customers ( full_name, phone ), vehicles ( plate, brand, model, year, color ), ods_photos ( id, photo_url, category, caption, created_at ), ods_services ( id, service_name, category, unit_price, quantity, total_price )').limit(1);
  console.log('Error without checklist/damage:', error);
}
test();
