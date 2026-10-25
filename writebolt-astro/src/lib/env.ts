function read(name: string): string {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : '';
}

function first(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (value && value.trim()) return value.trim();
  }
  return '';
}

/** Host Astro sites usually store the project URL under a PUBLIC_ name. */
export function supabaseUrl(): string {
  return first(
    read('SUPABASE_URL'),
    read('PUBLIC_SUPABASE_URL'),
    read('NEXT_PUBLIC_SUPABASE_URL'),
    read('VITE_SUPABASE_URL'),
    import.meta.env.SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

export function supabaseAnonKey(): string {
  return first(
    read('SUPABASE_ANON_KEY'),
    read('PUBLIC_SUPABASE_ANON_KEY'),
    read('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    read('VITE_SUPABASE_ANON_KEY'),
    import.meta.env.SUPABASE_ANON_KEY,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function supabaseServiceKey(): string {
  return first(
    read('SUPABASE_SERVICE_ROLE_KEY'),
    read('SUPABASE_SERVICE_KEY'),
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function adminUsername(): string {
  return first(read('WRITEBOLT_ADMIN_USERNAME'), read('ADMIN_USERNAME'), import.meta.env.ADMIN_USERNAME) || 'admin';
}

export function adminPassword(): string {
  return first(read('WRITEBOLT_ADMIN_PASSWORD'), read('ADMIN_PASSWORD'), import.meta.env.ADMIN_PASSWORD) || 'changeme';
}
