import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Public client — respects RLS (read-only for published content) */
export const supabase = createClient(url, anonKey);

/** Admin client — bypasses RLS (for admin API routes only) */
export const supabaseAdmin = createClient(url, serviceKey);
