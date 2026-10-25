import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseServiceKey, supabaseUrl } from './env';

const url = supabaseUrl();
const anonKey = supabaseAnonKey();
const serviceKey = supabaseServiceKey();

if (!url || !anonKey) {
  throw new Error(
    'Writebolt needs this site\'s Supabase URL and anon key (SUPABASE_URL or PUBLIC_SUPABASE_URL, and the matching anon key).'
  );
}
if (!serviceKey) {
  throw new Error(
    'Writebolt needs SUPABASE_SERVICE_ROLE_KEY in this site\'s environment. The anon key can read published posts. Admin and setup need the service role key.'
  );
}

/** Public client — respects RLS (read-only for published content) */
export const supabase = createClient(url, anonKey);

/** Admin client — bypasses RLS (for admin API routes only) */
export const supabaseAdmin = createClient(url, serviceKey);
