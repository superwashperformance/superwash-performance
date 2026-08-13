const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SECRET_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runStorageFix() {
  console.log("=== CREATING BUCKET ===");
  const bucketName = 'ods-photos';
  
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const bucketExists = buckets?.find(b => b.name === bucketName);
  
  if (!bucketExists) {
    console.log(`Bucket ${bucketName} not found. Creating...`);
    const { error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      fileSizeLimit: 5242880
    });
    if (error) {
      console.error('Failed to create bucket:', error.message);
      return;
    }
    console.log(`Bucket ${bucketName} created successfully.`);
  } else {
    console.log(`Bucket ${bucketName} already exists.`);
    
    // Just ensure it's public
    if (!bucketExists.public) {
       console.log(`Bucket is not public, updating it...`);
       await supabaseAdmin.storage.updateBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
          fileSizeLimit: 5242880
       });
    }
  }
  
  console.log("=== TESTING UPLOAD AS AUTHENTICATED USER ===");
  // Log in as one of the updated users
  const { error: authError } = await supabaseAnon.auth.signInWithPassword({
    email: 'admin@superwash.com',
    password: 'SuperWashQA2026!'
  });
  
  if (authError) {
    console.error('Failed to log in for upload test:', authError.message);
    return;
  }
  
  console.log('Logged in successfully. Attempting to upload...');
  const testFileName = `test_${Date.now()}.png`;
  // Minimal PNG base64
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
  const byteCharacters = atob(base64Png);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });
  
  const { data: uploadData, error: uploadError } = await supabaseAnon.storage
    .from(bucketName)
    .upload(testFileName, blob, { contentType: 'image/png' });
    
  if (uploadError) {
    console.error('Upload failed:', uploadError.message);
    return;
  }
  
  console.log(`Upload successful: ${uploadData.path}`);
  
  const { data: publicUrlData } = supabaseAnon.storage.from(bucketName).getPublicUrl(uploadData.path);
  console.log(`Public URL: ${publicUrlData.publicUrl}`);
  
  // Cleanup
  await supabaseAnon.storage.from(bucketName).remove([uploadData.path]);
  console.log('Test file deleted.');
  
  await supabaseAnon.auth.signOut();
}

runStorageFix();
