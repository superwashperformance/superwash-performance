const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function checkAuth() {
  const emails = ['admin@superwash.com', 'gerente@superwash.com', 'cajero@superwash.com'];
  for (const email of emails) {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error(error);
      return;
    }
    const user = users.users.find(u => u.email === email);
    console.log(email, user ? `EXISTE (UUID: ${user.id})` : 'NO EXISTE');
  }
}
checkAuth();
