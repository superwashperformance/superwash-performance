import { createClient } from '@supabase/supabase-js';

// Fallback credentials for local development mode
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-superwash.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key-superwash-performance';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
