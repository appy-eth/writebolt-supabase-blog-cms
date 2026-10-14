import type { APIRoute } from 'astro';
import { getSiteSettings, getPublishedArticles } from '../lib/data';
import { absoluteUrl, xmlEscape } from '../lib/utils';

export const GET: APIRoute = async () => {
  const settings = await getSiteSettings();
  const home = absoluteUrl('/');
  const { articles } = await getPublishedArticles({ limit: 50 });

  const items = articles
    .map((article) => {
      const link = absoluteUrl(`/${article.slug}`);
      return `    <item>
      <title><![CDATA[${article.headline}]]></title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <pubDate>${new Date(article.published_at || article.created_at).toUTCString()}</pubDate>
      ${article.categories ? `<category>${xmlEscape(article.categories.name)}</category>` : ''}
      ${article.authors ? `<dc:creator><![CDATA[${article.authors.name}]]></dc:creator>` : ''}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(settings.site_name)}</title>
    <description>${xmlEscape(settings.site_description)}</description>
    <link>${xmlEscape(home)}</link>
    <atom:link href="${xmlEscape(absoluteUrl('/rss.xml'))}" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
