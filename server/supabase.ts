/// <reference types="node" />
import 'dotenv/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseSecretKey);
}

if (!isSupabaseConfigured()) {
  console.warn(
    '[Supabase Configuration Warning] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in environment.'
  );
}

// Fallback dummy URL during build/dry-run if env vars are temporarily absent
const activeUrl = supabaseUrl || 'https://placeholder-project.supabase.co';
const activeKey = supabaseSecretKey || 'placeholder-key';

export const supabase: SupabaseClient = createClient(activeUrl, activeKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
