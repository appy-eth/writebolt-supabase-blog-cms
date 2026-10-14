import type { Article, Author, BlogSettings } from "@/types";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function absoluteAsset(
  value: string | null | undefined,
  siteUrl: string
): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  try {
    return new URL(value, `${siteUrl}/`).href;
  } catch {
    return undefined;
  }
}

export function articleJsonLd(
  article: Article,
  settings: BlogSettings,
  siteUrl: string
) {
  const datePublished = isoDate(article.published_at || article.created_at);
  const dateModified = isoDate(article.updated_at) || datePublished;
  const image = absoluteAsset(
    article.featured_image || settings.default_og_image,
    siteUrl
  );
  const logo = absoluteAsset(settings.logo_url, siteUrl);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.headline,
    description: article.excerpt || undefined,
    image: image ? [image] : undefined,
    datePublished,
    dateModified,
    author: article.author
      ? {
          "@type": "Person",
          name: article.author.name,
          url: `${siteUrl}/authors/${article.author.slug}`,
        }
      : {
          "@type": "Organization",
          name: settings.blog_name,
          url: siteUrl,
        },
    publisher: {
      "@type": "Organization",
      name: settings.blog_name,
      url: siteUrl,
      logo: logo ? { "@type": "ImageObject", url: logo } : undefined,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${article.slug}`,
    },
    wordCount: article.word_count || undefined,
  };
}

export function blogJsonLd(settings: BlogSettings, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: settings.blog_name,
    description: settings.blog_description,
    url: `${siteUrl}/blog`,
    publisher: {
      "@type": "Organization",
      name: settings.blog_name,
      logo: settings.logo_url
        ? { "@type": "ImageObject", url: settings.logo_url }
        : undefined,
    },
  };
}

export function authorJsonLd(author: Author, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `${siteUrl}/authors/${author.slug}`,
    image: author.avatar_url,
    description: author.bio,
    sameAs: [
      author.twitter_handle
        ? `https://twitter.com/${author.twitter_handle.replace("@", "")}`
        : null,
      author.linkedin_url,
      author.github_url,
      author.website_url,
    ].filter(Boolean),
  };
}
