import type { APIRoute } from 'astro';
import {
  getAllPublishedSlugs,
  getCategories,
  getAllTags,
  hasTaggedArticles,
  getAuthors,
} from '../lib/data';
import { absoluteUrl, xmlEscape } from '../lib/utils';

function urlEntry(
  path: string,
  lastmod: string,
  changefreq: string,
  priority: string
): string {
  return `  <url>
    <loc>${xmlEscape(absoluteUrl(path))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: APIRoute = async () => {
  const now = new Date().toISOString();
  const urls: string[] = [];

  urls.push(urlEntry('/', now, 'daily', '1.0'));
  urls.push(urlEntry('/authors', now, 'weekly', '0.5'));

  const slugs = await getAllPublishedSlugs();
  for (const slug of slugs) {
    urls.push(urlEntry(`/${slug}`, now, 'weekly', '0.8'));
  }

  const categories = await getCategories();
  for (const cat of categories) {
    urls.push(urlEntry(`/category/${cat.slug}`, now, 'weekly', '0.6'));
  }

  if (await hasTaggedArticles()) {
    const tags = await getAllTags();
    for (const tag of tags) {
      urls.push(urlEntry(`/tag/${encodeURIComponent(tag)}`, now, 'weekly', '0.5'));
    }
  }

  const authors = await getAuthors();
  for (const author of authors) {
    urls.push(urlEntry(`/authors/${author.slug}`, now, 'monthly', '0.5'));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
