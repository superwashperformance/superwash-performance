import { createClient } from '@supabase/supabase-js';

// Strict environment variable resolution without hardcoded sensitive fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ SECURITY WARNING: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment configuration.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
