import {
  getAllPublishedSlugs,
  getCategories,
  hasCategories,
  getAllTags,
  hasTaggedArticles,
  getAuthors,
} from "@/lib/supabase/queries";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date().toISOString();

  const urls: string[] = [];

  // Static pages
  urls.push(url(siteUrl, "/", now, "daily", "1.0"));
  urls.push(url(siteUrl, "/blog", now, "daily", "0.9"));
  urls.push(url(siteUrl, "/authors", now, "weekly", "0.5"));

  // Article pages
  const slugs = await getAllPublishedSlugs();
  for (const slug of slugs) {
    urls.push(url(siteUrl, `/blog/${slug}`, now, "weekly", "0.8"));
  }

  // Category pages (only if categories exist)
  const hasCats = await hasCategories();
  if (hasCats) {
    const categories = await getCategories();
    for (const cat of categories) {
      urls.push(
        url(siteUrl, `/blog/category/${cat.slug}`, now, "weekly", "0.6")
      );
    }
  }

  // Tag pages (only if tagged articles exist)
  const hasTags = await hasTaggedArticles();
  if (hasTags) {
    const tags = await getAllTags();
    for (const tag of tags) {
      urls.push(
        url(
          siteUrl,
          `/blog/tag/${encodeURIComponent(tag)}`,
          now,
          "weekly",
          "0.5"
        )
      );
    }
  }

  // Author pages
  const authors = await getAuthors();
  for (const author of authors) {
    urls.push(
      url(siteUrl, `/authors/${author.slug}`, now, "monthly", "0.5")
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function url(
  base: string,
  path: string,
  lastmod: string,
  changefreq: string,
  priority: string
): string {
  return `  <url>
    <loc>${base}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}
