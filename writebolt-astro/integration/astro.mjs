/**
 * Mount Writebolt Blog inside an existing Astro site.
 *
 * The blog becomes routes on the site's own dev server and deployment.
 * There is no second Vite process, no proxy, and no second host.
 *
 *   import { writebolt } from './writebolt-astro/integration/astro.mjs';
 *
 *   integrations: [
 *     writebolt({ layout: './src/layouts/Layout.astro' }),
 *   ],
 *
 * The layout must render `<slot />` where the page body goes.
 * `<slot name="head" />` is optional and receives the blog's RSS and JSON-LD tags.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = resolve(here, '../src/pages');
const favicon = resolve(here, '../public/favicon.svg');

const ROUTES = [
  ['/', 'index.astro'],
  ['/[slug]', '[slug].astro'],
  ['/category/[slug]', 'category/[slug].astro'],
  ['/tag/[tag]', 'tag/[tag].astro'],
  ['/authors', 'authors/index.astro'],
  ['/authors/[slug]', 'authors/[slug].astro'],
  ['/rss.xml', 'rss.xml.ts'],
  ['/sitemap.xml', 'sitemap.xml.ts'],
  ['/news-sitemap.xml', 'news-sitemap.xml.ts'],
  ['/admin', 'admin/index.astro'],
  ['/admin/login', 'admin/login.astro'],
  ['/admin/new', 'admin/new.astro'],
  ['/admin/edit/[id]', 'admin/edit/[id].astro'],
  ['/admin/categories', 'admin/categories.astro'],
  ['/admin/authors', 'admin/authors.astro'],
  ['/admin/media', 'admin/media.astro'],
  ['/admin/nav', 'admin/nav.astro'],
  ['/admin/settings', 'admin/settings.astro'],
  ['/admin/settings/ai', 'admin/settings/ai.astro'],
  ['/admin/ideas', 'admin/ideas.astro'],
  ['/admin/link-pro', 'admin/link-pro.astro'],
  ['/api/auth/logout', 'api/auth/logout.ts'],
  ['/api/upload', 'api/upload.ts'],
  ['/api/og', 'api/og.ts'],
  ['/api/newsletter/subscribe', 'api/newsletter/subscribe.ts'],
  ['/api/admin/media', 'api/admin/media.ts'],
  ['/api/admin/ai-settings', 'api/admin/ai-settings.ts'],
  ['/api/ai/generate-draft', 'api/ai/generate-draft.ts'],
  ['/api/ai/suggest-headline', 'api/ai/suggest-headline.ts'],
  ['/api/ai/generate-image', 'api/ai/generate-image.ts'],
  ['/api/ai/generate-excerpt', 'api/ai/generate-excerpt.ts'],
  ['/api/ai/rewrite', 'api/ai/rewrite.ts'],
  ['/api/ai/expand', 'api/ai/expand.ts'],
  ['/api/writebolt/redirect', 'api/writebolt/redirect.ts'],
];

function projectRoot(config) {
  const root = config.root;
  if (!root) return process.cwd();
  if (typeof root === 'string') return root.startsWith('file:') ? fileURLToPath(root) : root;
  return fileURLToPath(root);
}

function normalizeBase(raw) {
  const value = String(raw || '').trim();
  if (!value || value === '/') return '';
  const withSlash = value.startsWith('/') ? value : `/${value}`;
  return withSlash.replace(/\/$/, '');
}

function joinBase(base, route) {
  if (!base) return route;
  if (route === '/') return base;
  return `${base}${route}`;
}

function virtualPlugin({ base, site, layoutAbs }) {
  const layoutId = '\0writebolt-layout';
  const configId = '\0writebolt-config';
  return {
    name: 'writebolt-virtual',
    resolveId(id) {
      if (id === 'virtual:writebolt/config') return configId;
      if (id === 'virtual:writebolt/layout') return layoutId;
    },
    load(id) {
      if (id === configId) {
        return `export const base = ${JSON.stringify(base)};
export const site = ${JSON.stringify(site)};
export const mounted = ${base ? 'true' : 'false'};
`;
      }
      if (id === layoutId) {
        if (!layoutAbs) return 'export default null;\n';
        return `export { default } from ${JSON.stringify(layoutAbs)};\n`;
      }
    },
    configureServer(server) {
      if (!base || !existsSync(favicon)) return;
      const faviconUrl = `${base}/favicon.svg`;
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0];
        if (path !== faviconUrl) return next();
        res.setHeader('content-type', 'image/svg+xml');
        res.end(readFileSync(favicon));
      });
    },
  };
}

function patchRobots(file, origin, base) {
  if (!origin || !existsSync(file)) return;
  const news = `${origin}${base}/news-sitemap.xml`;
  let text = readFileSync(file, 'utf8');
  if (text.includes(news)) return;
  const lines = ['', '# Google News (Writebolt blog)', 'User-agent: Googlebot-News', `Allow: ${base}/`];
  if (!text.includes('User-agent: Googlebot-News')) text = `${text.replace(/\s*$/, '')}\n${lines.join('\n')}\n`;
  if (!text.includes(`${origin}${base}/sitemap.xml`)) {
    text = `${text.replace(/\s*$/, '')}\nSitemap: ${origin}${base}/sitemap.xml\nSitemap: ${news}\n`;
  } else if (!text.includes(news)) {
    text = `${text.replace(/\s*$/, '')}\nSitemap: ${news}\n`;
  }
  writeFileSync(file, text);
}

export function writebolt(options = {}) {
  const standalone = options.standalone === true;
  const base = standalone ? '' : normalizeBase(options.base ?? '/blog');
  let site = '';
  let layoutAbs = null;

  return {
    name: 'writebolt-blog',
    hooks: {
      'astro:config:setup': ({ config, updateConfig, injectRoute, logger }) => {
        const root = projectRoot(config);
        site = String(config.site || '').replace(/\/$/, '');

        if (!standalone && options.layout !== false) {
          const requested = options.layout || 'src/layouts/Layout.astro';
          const candidate = resolve(root, requested);
          if (existsSync(candidate)) {
            layoutAbs = candidate;
            logger.info(`Writebolt is part of this site at ${base}, using ${relative(root, candidate)}.`);
          } else if (options.layout) {
            logger.warn(`Writebolt layout not found: ${requested}`);
          } else {
            logger.warn(
              'Writebolt could not find src/layouts/Layout.astro. Pass layout: "./src/layouts/YourLayout.astro" so the blog uses this site\'s header and footer.'
            );
          }
        }

        if (!standalone) {
          const clash = ['src/pages/blog.astro', 'src/pages/blog'].find((entry) => existsSync(join(root, entry)));
          if (clash) {
            logger.warn(`Remove ${clash}. Writebolt serves ${base} itself, and that file would override it.`);
          }
          if (!config.adapter) {
            logger.warn('Writebolt pages render on each request. Add the adapter this site already deploys with.');
          }
          for (const [route, file] of ROUTES) {
            injectRoute({
              pattern: joinBase(base, route),
              entrypoint: join(pagesDir, file),
              prerender: false,
            });
          }
        }

        updateConfig({
          vite: {
            plugins: [virtualPlugin({ base, site, layoutAbs })],
          },
        });
      },
      'astro:build:done': ({ dir }) => {
        if (!base) return;
        const clientDir = fileURLToPath(dir);
        if (existsSync(favicon)) {
          const dest = join(clientDir, base.slice(1), 'favicon.svg');
          mkdirSync(dirname(dest), { recursive: true });
          cpSync(favicon, dest);
        }
        patchRobots(join(clientDir, 'robots.txt'), site, base);
      },
    },
  };
}
