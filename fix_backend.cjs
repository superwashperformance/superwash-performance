const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function fixBackend() {
  console.log("=== INICIANDO CORRECCIÓN SUPABASE ===");

  const emails = ['admin@superwash.com', 'gerente@superwash.com', 'cajero@superwash.com'];
  const newPassword = 'SuperWashQA2026!'; // QA Password

  console.log("\n--- CORRECCIÓN 1: AUTH ---");
  for (const email of emails) {
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error(`❌ Error listando usuarios:`, listError.message);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    if (user) {
      console.log(`✅ ${email} EXISTE (UUID: ${user.id}). Actualizando contraseña...`);
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      );
      if (updateError) {
        console.error(`❌ Error actualizando contraseña para ${email}:`, updateError.message);
      } else {
        console.log(`✅ Contraseña actualizada para ${email}.`);
      }
    } else {
      console.log(`⚠️ ${email} NO EXISTE. Esto no debería ocurrir según logs previos.`);
    }
  }

  console.log("\n--- PRUEBA REAL AUTH ---");
  const supabaseAnon = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  for (const email of emails) {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: email,
      password: newPassword
    });
    if (error) {
      console.error(`❌ LOGIN FAIL para ${email}:`, error.message);
    } else {
      console.log(`✅ LOGIN PASS para ${email}.`);
      await supabaseAnon.auth.signOut();
    }
  }

  console.log("\n--- CORRECCIÓN 2: STORAGE ---");
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error(`❌ Error listando buckets:`, bucketsError.message);
    return;
  }

  const bucketName = 'ods-photos';
  let bucket = buckets.find(b => b.name === bucketName);

  if (!bucket) {
    console.log(`⚠️ Bucket ${bucketName} no existe. Creándolo...`);
    const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: false, // Wait, shouldn't it be true for easy access? We can set it to false and use signed URLs or RLS. The prompt said "Configurar ods-photos de acuerdo con el funcionamiento actual de la aplicación... NO cambiar todo Storage a público innecesariamente."
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (createError) {
      console.error(`❌ Error creando bucket ${bucketName}:`, createError.message);
      return;
    }
    console.log(`✅ Bucket ${bucketName} creado exitosamente.`);
  } else {
    console.log(`✅ Bucket ${bucketName} ya existe.`);
  }

  // Ahora creamos policies en PostgreSQL vía RPC/SQL si es posible, o podemos intentar hacerlo si es que se pueden ejecutar sentencias SQL.
  // Pero el Service Role bypasses RLS anyway. 
  // Let's create policies if needed. I can run an SQL script.
}

fixBackend();
