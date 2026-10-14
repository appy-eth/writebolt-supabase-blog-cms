import type { Metadata } from "next";
import type { Article, BlogSettings } from "@/types";

export function generateArticleMetadata(
  article: Article,
  settings: BlogSettings
): Metadata {
  const title = article.seo_title || article.headline;
  const description = article.seo_description || article.excerpt || "";
  const formattedTitle = settings.site_title_template
    .replace("{title}", title)
    .replace("{site_name}", settings.site_name)
    .replace("{blog_name}", settings.site_name);

  return {
    title: formattedTitle,
    description,
    openGraph: {
      title: formattedTitle,
      description,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      authors: article.author ? [article.author.name] : undefined,
      images: article.featured_image
        ? [{ url: article.featured_image, alt: article.featured_image_alt || title }]
        : settings.default_og_image
          ? [{ url: settings.default_og_image }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: formattedTitle,
      description,
      images: article.featured_image ? [article.featured_image] : undefined,
    },
  };
}

export function generateBlogMetadata(settings: BlogSettings): Metadata {
  return {
    title: settings.site_name,
    description: settings.site_description,
    openGraph: {
      title: settings.site_name,
      description: settings.site_description,
      type: "website",
      images: settings.default_og_image
        ? [{ url: settings.default_og_image }]
        : undefined,
    },
  };
}
