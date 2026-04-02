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

export function articleJsonLd(
  article: Article,
  settings: BlogSettings,
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.headline,
    description: article.excerpt,
    image: article.featured_image || settings.default_og_image,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: article.author
      ? {
          "@type": "Person",
          name: article.author.name,
          url: `${siteUrl}/authors/${article.author.slug}`,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: settings.blog_name,
      logo: settings.logo_url
        ? { "@type": "ImageObject", url: settings.logo_url }
        : undefined,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${article.slug}`,
    },
    wordCount: article.word_count,
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
