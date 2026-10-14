export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(date: string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function siteUrl(): string {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.SITE_URL) ||
    process.env.SITE_URL ||
    'http://localhost:4321'
  ).replace(/\/$/, '');
}

/**
 * Public URL prefix.
 * Empty for a standalone site (articles at /{slug}).
 * `/blog` when this app is mounted on an existing website.
 */
export function blogBasePath(): string {
  const raw = String(
    (typeof import.meta !== 'undefined' && import.meta.env?.BLOG_BASE_PATH) ||
      process.env.BLOG_BASE_PATH ||
      ''
  ).trim();
  if (!raw || raw === '/') return '';
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withSlash.replace(/\/$/, '');
}

/** Root-relative public path, including `/blog` for add-on installs. */
export function publicPath(path = '/'): string {
  const base = blogBasePath();
  const [pathname, query] = path.split('?');
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const prefixed = !base
    ? normalized
    : normalized === '/'
      ? base
      : `${base}${normalized}`;
  return query ? `${prefixed}?${query}` : prefixed;
}

/** Absolute public URL for CRM links, sitemaps, RSS, and structured data. */
export function absoluteUrl(path = '/'): string {
  return `${siteUrl()}${publicPath(path)}`;
}

export function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function absoluteAssetUrl(
  value: string | null | undefined,
  origin = siteUrl()
): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  try {
    return new URL(value, `${origin}/`).href;
  } catch {
    return undefined;
  }
}

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function pageHref(basePath: string, page: number): string {
  if (page <= 1) return basePath || '/';
  const separator = basePath.includes('?') ? '&' : '?';
  return `${basePath}${separator}page=${page}`;
}

export function generatePageNumbers(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export function normalizeJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}
