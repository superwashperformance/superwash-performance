const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runQA() {
  console.log("=== INICIANDO QA FINAL ===");

  const users = [
    { email: 'admin@superwash.com', pass: 'Admin123!' },
    { email: 'gerente@superwash.com', pass: 'Gerente123!' },
    { email: 'cajero@superwash.com', pass: 'Cajero123!' }
  ];

  let allAuthPassed = true;

  // 1 & 2. AUTH REAL & PERSISTENCIA
  console.log("\n--- 1. AUTH REAL & 2. PERSISTENCIA ---");
  for (const u of users) {
    console.log(`\nProbando login para: ${u.email}`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: u.email,
      password: u.pass
    });

    if (authError) {
      console.error(`❌ Falló login para ${u.email}:`, authError.message);
      allAuthPassed = false;
      continue;
    }

    if (authData.session && authData.user) {
      console.log(`✅ Login exitoso. Session creada. UID: ${authData.user.id}`);
      
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();
        
      if (profError) {
         console.error(`❌ Falló obtención de perfil:`, profError.message);
         allAuthPassed = false;
      } else {
         console.log(`✅ Perfil obtenido correctamente. Role: ${profile.role}`);
      }
      
      // Logout
      await supabase.auth.signOut();
      console.log(`✅ Logout exitoso.`);
    } else {
      console.error(`❌ Login falló silenciosamente para ${u.email}`);
      allAuthPassed = false;
    }
  }

  // Re-login as admin for data checks
  await supabase.auth.signInWithPassword({ email: users[0].email, password: users[0].pass });

  // 4. CAJA
  console.log("\n--- 4. CAJA ---");
  const { data: activeSession, error: sessionError } = await supabase
    .from('cash_sessions')
    .select('*')
    .is('closed_at', null)
    .maybeSingle();
    
  if (sessionError) {
    console.error(`❌ Falló obtención de caja:`, sessionError.message);
  } else {
    console.log(`✅ Consulta de caja exitosa. Cajas abiertas: ${activeSession ? 1 : 0}`);
  }

  // 5. TESORERÍA
  console.log("\n--- 5. TESORERÍA ---");
  const { data: accounts, error: accountsError } = await supabase
    .from('treasury_accounts')
    .select('*');
    
  if (accountsError) {
    console.error(`❌ Falló obtención de tesorería:`, accountsError.message);
  } else {
    console.log(`✅ Consulta de cuentas de tesorería exitosa. Cuentas: ${accounts ? accounts.length : 0}`);
  }

  // 6. ODS
  console.log("\n--- 6. ODS ---");
  const { data: ods, error: odsError } = await supabase
    .from('ods')
    .select('*')
    .limit(1);
    
  if (odsError) {
    console.error(`❌ Falló obtención de ODS:`, odsError.message);
  } else {
    console.log(`✅ Consulta de ODS exitosa. Encontradas: ${ods ? ods.length : 0}`);
  }

  // 7 & 8. STORAGE e IMAGENES
  console.log("\n--- 7 & 8. IMÁGENES Y STORAGE ---");
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
     console.error(`❌ Falló listado de buckets:`, bucketsError.message);
  } else {
     const odsPhotosBucket = buckets.find(b => b.name === 'ods-photos');
     if (odsPhotosBucket) {
        console.log(`✅ Bucket ods-photos EXISTE.`);
     } else {
        console.error(`❌ Bucket ods-photos NO EXISTE.`);
     }
  }

  // 9. CLIENTES
  console.log("\n--- 9. CLIENTES ---");
  const { data: clients, error: clientsError } = await supabase
    .from('customers')
    .select('*')
    .limit(1);
    
  if (clientsError) {
    console.error(`❌ Falló obtención de clientes:`, clientsError.message);
  } else {
    console.log(`✅ Consulta de clientes exitosa.`);
  }

  // 10. VEHÍCULOS
  console.log("\n--- 10. VEHÍCULOS ---");
  const { data: vehicles, error: vehiclesError } = await supabase
    .from('vehicles')
    .select('*')
    .limit(1);
    
  if (vehiclesError) {
    console.error(`❌ Falló obtención de vehículos:`, vehiclesError.message);
  } else {
    console.log(`✅ Consulta de vehículos exitosa.`);
  }

  console.log("\n=== QA FINALIZADO ===");
}

runQA();
