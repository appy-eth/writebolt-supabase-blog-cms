import {
  getBlogSettings,
  getPublishedArticles,
} from "@/lib/supabase/queries";

export async function GET() {
  const settings = await getBlogSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { articles } = await getPublishedArticles({ limit: 50 });

  const items = articles
    .map(
      (article) => `    <item>
      <title><![CDATA[${article.headline}]]></title>
      <link>${siteUrl}/blog/${article.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${article.slug}</guid>
      <description><![CDATA[${article.excerpt || ""}]]></description>
      <pubDate>${new Date(article.published_at || article.created_at).toUTCString()}</pubDate>
      ${article.categories ? `<category>${article.categories.name}</category>` : ""}
      ${article.author ? `<dc:creator><![CDATA[${article.author.name}]]></dc:creator>` : ""}
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${settings.site_name}</title>
    <description>${settings.site_description}</description>
    <link>${siteUrl}/blog</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
