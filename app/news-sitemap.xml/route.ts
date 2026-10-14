import { getBlogSettings, getRecentNewsArticles } from "@/lib/supabase/queries";

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export async function GET() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const language = (process.env.NEWS_LANGUAGE || "en").trim() || "en";
  const settings = await getBlogSettings();
  const articles = await getRecentNewsArticles();

  const urls = articles
    .map((article) => {
      const published = isoDate(article.published_at);
      if (!published || !article.slug || !article.headline) return "";
      const loc = `${siteUrl}/blog/${article.slug}`;
      return `  <url>
    <loc>${xmlEscape(loc)}</loc>
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
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
