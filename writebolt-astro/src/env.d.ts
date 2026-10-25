/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly BLOG_BASE_PATH?: string;
  readonly SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly NEXT_PUBLIC_SUPABASE_URL?: string;
  readonly SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
  readonly ADMIN_USERNAME?: string;
  readonly ADMIN_PASSWORD?: string;
}

declare module 'virtual:writebolt/config' {
  export const base: string;
  export const site: string;
  export const mounted: boolean;
}

declare module 'virtual:writebolt/layout' {
  const Layout: ((props: Record<string, unknown>) => unknown) | null;
  export default Layout;
}
