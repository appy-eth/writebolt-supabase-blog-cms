import { createClient } from "./server";
import type { Article, Author, BlogSettings, Category } from "@/types";

export async function getBlogSettings(): Promise<BlogSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_settings")
    .select("*")
    .single();

  if (error || !data) {
    return {
      id: "",
      blog_name: "My Blog",
      blog_description:
        "A short tagline for your site. Used in the header, default meta description, and social previews.",
      logo_url: null,
      favicon_url: null,
      layout_mode: "standalone",
      show_header: true,
      show_footer: true,
      show_blog_title: true,
      default_author_id: null,
      posts_per_page: 10,
      show_reading_time: true,
      show_table_of_contents: true,
      show_related_articles: true,
      show_author_card: true,
      inline_cta_enabled: false,
      inline_cta_heading: null,
      inline_cta_subheading: null,
      inline_cta_email_placeholder: "Enter your email",
      inline_cta_button_text: null,
      inline_cta_success_redirect_url: null,
      inline_cta_list_id: null,
      sidebar_cta_enabled: false,
      sidebar_cta_title: null,
      sidebar_cta_description: null,
      sidebar_cta_button_text: null,
      sidebar_cta_button_url: null,
      sidebar_cta_image_url: null,
      newsletter_enabled: false,
      newsletter_provider: null,
      newsletter_list_id: null,
      newsletter_success_message: "Thanks for subscribing!",
      newsletter_success_redirect_url: null,
      newsletter_embed_url: null,
      site_title_template: "{title} | {blog_name}",
      default_og_image: null,
      google_analytics_id: null,
      social_twitter: null,
      social_linkedin: null,
      social_github: null,
      social_youtube: null,
      social_website: null,
      image_storage_provider: "local",
      supabase_storage_bucket: "blog-images",
      scheduled_publishing_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data as BlogSettings;
}

export async function getPublishedArticles(options?: {
  limit?: number;
  offset?: number;
  category?: string;
  tag?: string;
  search?: string;
}): Promise<{ articles: Article[]; total: number }> {
  const supabase = createClient();
  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;

  // Only published articles (excludes draft + archived)
  let query = supabase
    .from("articles")
    .select("*, author:authors(*)", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  if (options?.tag) {
    query = query.contains("tags", [options.tag]);
  }

  if (options?.search) {
    query = query.textSearch("fts", options.search);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching articles:", error);
    return { articles: [], total: 0 };
  }

  return { articles: (data ?? []) as Article[], total: count ?? 0 };
}

export async function getArticleBySlug(
  slug: string
): Promise<Article | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, author:authors(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return data as Article;
}

export async function getRelatedArticles(
  article: Article,
  limit = 3
): Promise<Article[]> {
  const supabase = createClient();

  let query = supabase
    .from("articles")
    .select("*, author:authors(*)")
    .eq("status", "published")
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (article.category) {
    query = query.eq("category", article.category);
  }

  const { data } = await query;

  if (data && data.length > 0) return data as Article[];

  // Fallback: latest articles if no category match
  const { data: fallback } = await supabase
    .from("articles")
    .select("*, author:authors(*)")
    .eq("status", "published")
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (fallback ?? []) as Article[];
}

export async function getPopularArticles(limit = 5): Promise<Article[]> {
  const supabase = createClient();
  // MVP: use reading_time_minutes as proxy for depth, fall back to most recent
  const { data } = await supabase
    .from("articles")
    .select("*, author:authors(*)")
    .eq("status", "published")
    .order("reading_time_minutes", { ascending: false, nullsFirst: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as Article[];
}

export async function getAuthors(): Promise<Author[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("authors")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (data ?? []) as Author[];
}

export async function getAuthorBySlug(
  slug: string
): Promise<Author | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("authors")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  return (data as Author) ?? null;
}

export async function getAuthorArticles(
  authorId: string,
  limit = 20
): Promise<Article[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("articles")
    .select("*, author:authors(*)")
    .eq("author_id", authorId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as Article[];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  return (data ?? []) as Category[];
}

export async function hasCategories(): Promise<boolean> {
  const supabase = createClient();
  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true });

  return (count ?? 0) > 0;
}

export async function hasTaggedArticles(): Promise<boolean> {
  const supabase = createClient();
  const { count } = await supabase
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .not("tags", "eq", "{}");

  return (count ?? 0) > 0;
}

export async function getFeaturedCategoryArticles(): Promise<
  { category: Category; articles: Article[] }[]
> {
  const supabase = createClient();
  const { data: cats } = await supabase
    .from("categories")
    .select("*")
    .eq("home_page_featured", true)
    .order("display_order");

  if (!cats || cats.length === 0) return [];

  const results = await Promise.all(
    (cats as Category[]).map(async (cat) => {
      const { data: articles } = await supabase
        .from("articles")
        .select("*, author:authors(*)")
        .eq("status", "published")
        .eq("category", cat.slug)
        .order("published_at", { ascending: false })
        .limit(3);
      return { category: cat, articles: (articles ?? []) as Article[] };
    })
  );

  return results.filter((r) => r.articles.length > 0);
}

export async function getAllTags(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("articles")
    .select("tags")
    .eq("status", "published")
    .not("tags", "eq", "{}");

  if (!data) return [];

  const tagSet = new Set<string>();
  data.forEach((row) => {
    (row.tags as string[]).forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published");

  return (data ?? []).map((row) => row.slug);
}

/** Articles from the last 48 hours, for the Google News sitemap (max 1,000). */
export async function getRecentNewsArticles(): Promise<
  Pick<Article, "headline" | "slug" | "published_at">[]
> {
  const supabase = createClient();
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("articles")
    .select("headline, slug, published_at")
    .eq("status", "published")
    .gte("published_at", since)
    .order("published_at", { ascending: false })
    .limit(1000);

  return (data ?? []) as Pick<Article, "headline" | "slug" | "published_at">[];
}
