/** Pure URL helpers. No Astro imports, so Node can test them. */

export function normalizeBase(raw) {
  const value = String(raw || '').trim();
  if (!value || value === '/') return '';
  const withSlash = value.startsWith('/') ? value : `/${value}`;
  return withSlash.replace(/\/$/, '');
}

export function isLocalUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(String(value || ''));
}

/**
 * Prefix a blog path with the mount point.
 * Paths that already start with the mount are left as they are.
 */
export function applyBase(base, path = '/') {
  const mount = normalizeBase(base);
  const raw = String(path || '/');
  const queryIndex = raw.indexOf('?');
  const pathname = queryIndex === -1 ? raw : raw.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : raw.slice(queryIndex);
  let normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (mount && normalized !== mount && !normalized.startsWith(`${mount}/`)) {
    normalized = normalized === '/' ? mount : `${mount}${normalized}`;
  }
  return `${normalized}${query}`;
}
