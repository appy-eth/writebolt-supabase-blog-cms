/**
 * Mount Writebolt Blog at /blog on an existing site.
 *
 * The blog app reads the x-writebolt-host header and copies that site's
 * header, footer, styles, and fonts onto every public blog page.
 *
 *   WRITEBOLT_ORIGIN=http://127.0.0.1:4322
 *
 * Astro (astro.config.mjs), in the host project:
 *
 *   import { writeboltDevProxyPlugin } from './proxy-blog.mjs';
 *   export default defineConfig({
 *     vite: { plugins: [writeboltDevProxyPlugin()] },
 *   });
 *
 * Production Astro middleware should call proxyBlog() for /blog requests.
 * Copy this file into the host project next to astro.config.mjs.
 */
import http from 'node:http';
import https from 'node:https';

export function writeboltOrigin() {
  return (process.env.WRITEBOLT_ORIGIN || 'http://127.0.0.1:4322').replace(/\/$/, '');
}

export function isBlogPath(pathname) {
  return pathname === '/blog' || pathname.startsWith('/blog/');
}

export function stripBlogPrefix(pathname) {
  const stripped = pathname.replace(/^\/blog(?=\/|$)/, '');
  return stripped || '/';
}

/** Root-relative URLs in the blog response must come back through /blog. */
export function prefixRootPaths(text) {
  return text
    .replace(/(["'])\/(?!\/|blog(?=$|["'/?#]))/g, '$1/blog/')
    .replace(/url\(\s*\/(?!\/|blog\/)/g, 'url(/blog/');
}

export function rewriteLocationHeader(location, origin) {
  if (!location) return location;
  try {
    const url = new URL(location, origin);
    const upstream = new URL(origin);
    if (url.origin !== upstream.origin) return location;
    const path = url.pathname === '/' ? '/blog' : `/blog${url.pathname}`;
    return `${path}${url.search}${url.hash}`;
  } catch {
    if (location.startsWith('/') && !location.startsWith('/blog')) return `/blog${location}`;
    return location;
  }
}

function siteOriginFromHeaders(headers) {
  const forwardedHost = headers['x-forwarded-host'] || headers.host || 'localhost';
  const host = String(forwardedHost).split(',')[0].trim();
  const proto = String(headers['x-forwarded-proto'] || 'http').split(',')[0].trim();
  return `${proto}://${host}`;
}

/**
 * Dev server hook. Forwards /blog to Writebolt and names the host site
 * so the blog can render that site's header, footer, and fonts.
 */
export function writeboltDevProxyPlugin() {
  const origin = writeboltOrigin();
  const originUrl = new URL(origin);
  const transport = originUrl.protocol === 'https:' ? https : http;

  return {
    name: 'writebolt-blog-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url || '/';
        const queryIndex = raw.indexOf('?');
        const pathname = queryIndex === -1 ? raw : raw.slice(0, queryIndex);
        if (!isBlogPath(pathname)) return next();

        const search = queryIndex === -1 ? '' : raw.slice(queryIndex);
        const headers = {
          ...req.headers,
          host: originUrl.host,
          'x-writebolt-host': siteOriginFromHeaders(req.headers),
        };
        delete headers['accept-encoding'];

        const proxyReq = transport.request(
          {
            protocol: originUrl.protocol,
            hostname: originUrl.hostname,
            port: originUrl.port,
            method: req.method,
            path: `${stripBlogPrefix(pathname)}${search}`,
            headers,
          },
          (proxyRes) => {
            const chunks = [];
            proxyRes.on('data', (chunk) => chunks.push(chunk));
            proxyRes.on('end', () => {
              const type = String(proxyRes.headers['content-type'] || '');
              let body = Buffer.concat(chunks);
              const rewrite = /text\/html|text\/css|javascript|json|text\/xml|application\/xml|text\/plain/.test(type);
              if (rewrite && req.method !== 'HEAD') {
                body = Buffer.from(prefixRootPaths(body.toString('utf8')));
              }

              const out = { ...proxyRes.headers };
              delete out['content-encoding'];
              delete out['transfer-encoding'];
              out['content-length'] = Buffer.byteLength(body);
              if (out.location) {
                const location = Array.isArray(out.location) ? out.location[0] : out.location;
                out.location = rewriteLocationHeader(location, origin);
              }
              if (out['set-cookie']) {
                const cookies = Array.isArray(out['set-cookie']) ? out['set-cookie'] : [out['set-cookie']];
                out['set-cookie'] = cookies.map((cookie) => cookie.replace(/Path=\/(?=$|;)/i, 'Path=/blog'));
              }
              res.writeHead(proxyRes.statusCode || 502, out);
              res.end(body);
            });
          }
        );

        proxyReq.on('error', () => {
          if (res.headersSent) return;
          res.statusCode = 502;
          res.setHeader('content-type', 'text/plain; charset=utf-8');
          res.end('The blog is not reachable. Start it with npm run dev inside writebolt-astro/.');
        });
        req.pipe(proxyReq);
      });
    },
  };
}
