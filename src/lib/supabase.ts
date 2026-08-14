import { createClient } from '@supabase/supabase-js';

// Strict environment variable resolution without hardcoded sensitive fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Support both the new PUBLISHABLE_KEY name and the legacy ANON_KEY name for seamless Vercel deployments
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('⚠️ SECURITY WARNING: Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in environment configuration.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-publishable-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
