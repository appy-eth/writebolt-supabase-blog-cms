import { blogBasePath, siteUrl } from './utils';

export interface HostChrome {
  /** Stylesheets and font links from the host <head>, with root-relative URLs made absolute. */
  headHtml: string;
  headerHtml: string;
  footerHtml: string;
  /** Concrete font stacks and colors copied off the host, so the blog matches even when the host inlines utilities. */
  vars: {
    display: string | null;
    body: string | null;
    background: string | null;
    foreground: string | null;
  };
  /** Set when the host header is fixed or sticky and would cover the title. */
  headerOffset: string | null;
}

const TTL_MS = 60_000;
const cache = new Map<string, { at: number; chrome: HostChrome | null }>();
const inflight = new Map<string, Promise<HostChrome | null>>();

function cleanOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function configuredHostOrigin(): string | undefined {
  const fromVite =
    typeof import.meta !== 'undefined' ? import.meta.env?.HOST_ORIGIN || import.meta.env?.HOST_SITE_URL : undefined;
  return fromVite || process.env.HOST_ORIGIN || process.env.HOST_SITE_URL;
}

/** Site the blog is mounted on. Never the blog server itself. */
export function hostOriginFromRequest(request: Request): string | null {
  const self = cleanOrigin(request.url);
  const header = request.headers.get('x-writebolt-host');
  const candidates = [header, configuredHostOrigin(), siteUrl()];
  for (const candidate of candidates) {
    const origin = cleanOrigin(candidate);
    if (origin && origin !== self) return origin;
  }
  return null;
}

function findElements(html: string, tag: string): string[] {
  const out: string[] = [];
  const lower = html.toLowerCase();
  const openToken = `<${tag}`;
  const closeToken = `</${tag}`;
  let from = 0;
  while (from < html.length) {
    const start = lower.indexOf(openToken, from);
    if (start < 0) break;
    const boundary = html[start + openToken.length];
    if (boundary && !/[\s>/]/.test(boundary)) {
      from = start + openToken.length;
      continue;
    }
    let depth = 0;
    let i = start;
    let foundEnd = -1;
    while (i < html.length) {
      const nextOpen = lower.indexOf(openToken, i);
      const nextClose = lower.indexOf(closeToken, i);
      if (nextClose < 0) break;
      const openOk =
        nextOpen >= 0 &&
        nextOpen < nextClose &&
        /[\s>/]/.test(html[nextOpen + openToken.length] || '>');
      if (openOk) {
        depth += 1;
        i = nextOpen + openToken.length;
        continue;
      }
      depth -= 1;
      i = nextClose + closeToken.length;
      if (html[i] === '>') i += 1;
      if (depth === 0) {
        foundEnd = i;
        break;
      }
    }
    if (foundEnd < 0) break;
    out.push(html.slice(start, foundEnd));
    from = foundEnd;
  }
  return out;
}

function stripActiveContent(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

function absolutize(html: string, origin: string): string {
  const base = origin.replace(/\/$/, '');
  return html
    .replace(/(\s(?:src|href|poster)=["'])\/(?!\/)/gi, `$1${base}/`)
    .replace(/(\ssrcset=["'])([^"']+)/gi, (_all, attr: string, value: string) => {
      const rewritten = value.replace(/(^|,\s*)\/(?!\/)/g, `$1${base}/`);
      return `${attr}${rewritten}`;
    })
    .replace(/url\(\s*(['"]?)\/(?!\/)/gi, `url($1${base}/`);
}

function isOverlayHeader(header: string): boolean {
  const open = header.slice(0, header.indexOf('>') + 1);
  if (/bg-(?:white|black)\/\d+|bg-transparent/.test(open)) return true;
  const top = header.slice(0, 2500);
  return /text-white/.test(top) && !/\bbg-white\b(?!\/)/.test(open);
}

function headerOffset(header: string): string | null {
  const open = header.slice(0, 800);
  if (!/\bfixed\b|\bsticky\b/.test(open) && !/\bfixed\b|\bsticky\b/.test(header.slice(0, 1500))) {
    return null;
  }
  const sample = header.slice(0, 1500);
  if (/\bh-24\b/.test(sample)) return '6rem';
  if (/\bh-20\b/.test(sample)) return '5rem';
  if (/\bh-16\b/.test(sample)) return '4rem';
  if (/\bh-14\b/.test(sample)) return '3.5rem';
  return '4.5rem';
}

function firstInnerPath(header: string, basePath: string): string | null {
  for (const match of header.matchAll(/href=["']([^"'#?]+)/gi)) {
    const href = match[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    if (href === '/' || href === basePath || href.startsWith(`${basePath}/`)) continue;
    return href;
  }
  return null;
}

function cssValue(css: string, pattern: RegExp): string | null {
  const match = css.match(pattern);
  return match?.[1]?.trim() || null;
}

function resolveCssValue(css: string, value: string | null): string | null {
  if (!value) return null;
  const varMatch = value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)\s*$/);
  if (!varMatch) return value;
  const resolved = cssValue(css, new RegExp(`${varMatch[1]}\\s*:\\s*([^;}{]+)`));
  return resolved || varMatch[2]?.trim() || null;
}

function cssSafe(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (!cleaned || /[{}<>]/.test(cleaned)) return null;
  return cleaned;
}

function readFonts(css: string): HostChrome['vars'] {
  const display = cssSafe(
    resolveCssValue(css, cssValue(css, /--font-display\s*:\s*([^;}{]+)/)) ||
      cssValue(css, /\.font-display\s*\{[^}]*font-family\s*:\s*([^;}{]+)/)
  );
  const bodyRule = css.match(/body\s*\{([^}]*)\}/);
  const bodyDecl = bodyRule?.[1] || '';
  const body = cssSafe(resolveCssValue(css, cssValue(bodyDecl, /font-family\s*:\s*([^;}{]+)/)));
  const background = cssSafe(
    resolveCssValue(css, cssValue(bodyDecl, /background(?:-color)?\s*:\s*([^;}{]+)/))
  );
  const foreground = cssSafe(
    resolveCssValue(css, cssValue(bodyDecl, /(?:^|[;\s])color\s*:\s*([^;}{]+)/))
  );
  return { display, body, background, foreground };
}

function headAssets(html: string): string {
  const headEnd = html.toLowerCase().indexOf('</head>');
  const head = headEnd >= 0 ? html.slice(0, headEnd) : html.slice(0, 150_000);
  const parts: string[] = [];
  for (const match of head.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (/rel=["'][^"']*(?:stylesheet|preconnect|preload)[^"']*["']/i.test(tag) || /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(tag)) {
      if (/rel=["']preload["']/i.test(tag) && !/as=["'](?:style|font)["']/i.test(tag)) continue;
      parts.push(tag);
    }
  }
  for (const match of head.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)) {
    if (match[0].length > 1_500_000) continue;
    parts.push(match[0]);
  }
  return parts.join('\n');
}

function looksLikeWritebolt(html: string): boolean {
  return /data-wb-title=|class="[^"]*\bwb-blog\b/.test(html);
}

async function fetchPage(origin: string, path: string): Promise<string | null> {
  const url = new URL(path || '/', origin);
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'text/html',
        'x-writebolt-chrome': '1',
        'user-agent': 'WriteboltBlog/1.0',
      },
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    });
    if (!response.ok) return null;
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function buildChrome(origin: string): Promise<HostChrome | null> {
  const home = await fetchPage(origin, '/');
  if (!home || looksLikeWritebolt(home)) return null;

  let headers = findElements(home, 'header').filter((el) => el.length > 80);
  let header = headers[0] || '';
  const footers = findElements(home, 'footer').filter((el) => el.length > 80);
  const footer = footers[footers.length - 1] || '';
  if (!header && !footer) return null;

  const basePath = blogBasePath();
  if (header && isOverlayHeader(header)) {
    const inner = firstInnerPath(header, basePath);
    if (inner) {
      const page = await fetchPage(origin, inner);
      const innerHeader = page ? findElements(page, 'header').find((el) => el.length > 80) : null;
      if (innerHeader && !isOverlayHeader(innerHeader)) header = innerHeader;
    }
  }

  const css = headAssets(home);
  return {
    headHtml: absolutize(css, origin),
    headerHtml: absolutize(stripActiveContent(header), origin),
    footerHtml: absolutize(stripActiveContent(footer), origin),
    vars: readFonts(css),
    headerOffset: header ? headerOffset(header) : null,
  };
}

/**
 * Header, footer, and type from the site this blog is added to.
 * No-op unless BLOG_BASE_PATH is set (add-on install).
 */
export async function loadHostChrome(request: Request): Promise<HostChrome | null> {
  if (!blogBasePath()) return null;
  if (request.headers.get('x-writebolt-chrome') === '1') return null;

  const origin = hostOriginFromRequest(request);
  if (!origin) return null;

  const hit = cache.get(origin);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.chrome;

  let pending = inflight.get(origin);
  if (!pending) {
    pending = buildChrome(origin)
      .catch(() => null)
      .finally(() => inflight.delete(origin));
    inflight.set(origin, pending);
  }
  const chrome = await pending;
  cache.set(origin, { at: Date.now(), chrome });
  return chrome;
}
