import type { APIRoute } from 'astro';
import { getRecentNewsArticles, getSiteSettings } from '../lib/data';
import { absoluteUrl, isoDate, xmlEscape } from '../lib/utils';

export const GET: APIRoute = async () => {
  const settings = await getSiteSettings();
  const language = String(
    (typeof import.meta !== 'undefined' && import.meta.env?.NEWS_LANGUAGE) ||
      process.env.NEWS_LANGUAGE ||
      'en'
  ).trim() || 'en';
  const articles = await getRecentNewsArticles();

  const urls = articles
    .map((article) => {
      const published = isoDate(article.published_at);
      if (!published || !article.slug || !article.headline) return '';
      return `  <url>
    <loc>${xmlEscape(absoluteUrl(`/${article.slug}`))}</loc>
    <news:news>
      <news:publication>
        <news:name>${xmlEscape(settings.site_name)}</news:name>
        <news:language>${xmlEscape(language)}</news:language>
      </news:publication>
      <news:publication_date>${published}</news:publication_date>
      <news:title>${xmlEscape(article.headline)}</news:title>
    </news:news>
  </url>`;
    })
    .filter(Boolean);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, s-maxage=900',
    },
  });
};
