import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// We need an active session to test authenticated upload, which we don't have.
// We can test if we can get a public URL for a fake file.
async function testStorage() {
  const { data } = supabase.storage.from('ods-photos').getPublicUrl('test.jpg');
  console.log('Public URL:', data.publicUrl);
}

testStorage();
