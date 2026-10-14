import type { Article, Author, SiteSettings } from './types';
import { absoluteAssetUrl, absoluteUrl, isoDate, siteUrl } from './utils';

export function formatTitle(title: string, settings: SiteSettings): string {
  return (settings.site_title_template || '{title} | {site_name}')
    .replace('{title}', title)
    .replace('{site_name}', settings.site_name)
    .replace('{blog_name}', settings.site_name);
}

export function articleJsonLd(
  article: Article,
  settings: SiteSettings,
  url = siteUrl()
) {
  const author = article.authors;
  const pageUrl = absoluteUrl(`/${article.slug}`);
  const datePublished = isoDate(article.published_at || article.created_at);
  const dateModified = isoDate(article.updated_at) || datePublished;
  const image = absoluteAssetUrl(
    article.featured_image || settings.default_og_image,
    url
  );
  const logo = absoluteAssetUrl(settings.logo_url, url);
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.headline,
    description: article.excerpt || undefined,
    image: image ? [image] : undefined,
    datePublished,
    dateModified,
    author: author
      ? {
          '@type': 'Person',
          name: author.name,
          url: absoluteUrl(`/authors/${author.slug}`),
        }
      : {
          '@type': 'Organization',
          name: settings.site_name,
          url,
        },
    publisher: {
      '@type': 'Organization',
      name: settings.site_name,
      url,
      logo: logo ? { '@type': 'ImageObject', url: logo } : undefined,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    wordCount: article.word_count || undefined,
  };
}

export function blogJsonLd(settings: SiteSettings, url = siteUrl()) {
  const logo = absoluteAssetUrl(settings.logo_url, url);
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: settings.site_name,
    description: settings.site_description,
    url: absoluteUrl('/'),
    publisher: {
      '@type': 'Organization',
      name: settings.site_name,
      logo: logo ? { '@type': 'ImageObject', url: logo } : undefined,
    },
  };
}

export function authorJsonLd(author: Author, url = siteUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: absoluteUrl(`/authors/${author.slug}`),
    image: absoluteAssetUrl(author.avatar_url, url),
    description: author.bio,
    sameAs: [
      author.twitter_handle
        ? `https://twitter.com/${author.twitter_handle.replace('@', '')}`
        : null,
      author.linkedin_url,
      author.github_url,
      author.website_url,
    ].filter(Boolean),
  };
}

export function hasBrandedHeader(settings: SiteSettings): boolean {
  return (
    (settings.layout_mode === 'standalone' ||
      settings.layout_mode === 'custom') &&
    settings.show_header
  );
}

export function shouldShowPageBlogTitle(settings: SiteSettings): boolean {
  return settings.show_blog_title && !hasBrandedHeader(settings);
}

export function isEmbeddedLayout(settings: SiteSettings): boolean {
  return settings.layout_mode === 'embedded';
}

/** Magazine-style category blocks under the main listing. Off by default to avoid repeating the same posts. */
export function shouldShowFeaturedCategories(settings: SiteSettings): boolean {
  return settings.show_featured_categories === true;
}

export function blogPageHeading(settings: SiteSettings): string {
  const custom = settings.blog_page_heading?.trim();
  return custom || settings.site_name;
}
