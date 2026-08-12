import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

// Create a Supabase client with the service role key to bypass RLS and use Admin API
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const qaUsers = [
  { email: 'admin@superwash.com', pass: 'admin123', name: 'Gustavo Cisneros (CEO)', role: 'admin' },
  { email: 'gerente@superwash.com', pass: 'gerente123', name: 'Carlos Mendoza (Director)', role: 'manager' },
  { email: 'cajero@superwash.com', pass: 'cajero123', name: 'Valeria Rivas (Ventas & Cobros)', role: 'cashier' }
];

async function main() {
  console.log('Starting QA users creation...');
  
  for (const user of qaUsers) {
    console.log(`\nProcessing user: ${user.email} (Role: ${user.role})`);
    
    try {
      // 1. Create user in auth.users
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.pass,
        email_confirm: true,
        user_metadata: {
          full_name: user.name
        }
      });

      if (authError) {
        console.error(`❌ Error creating user in auth.users:`, authError.message);
        continue;
      }

      const userId = authData.user.id;
      console.log(`✅ Created in auth.users with ID: ${userId}`);

      // 2. Insert or update the profile
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          full_name: user.name,
          role: user.role,
          avatar_url: user.name.substring(0, 2).toUpperCase()
        })
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Error creating profile:`, profileError.message);
        continue;
      }

      console.log(`✅ Profile verified. ID: ${profileData.id}, Role: ${profileData.role}`);
      
    } catch (e: any) {
      console.error(`Unexpected error processing ${user.email}:`, e.message);
    }
  }
  
  console.log('\nUser creation process completed.');
}

main();
