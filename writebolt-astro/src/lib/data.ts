import { supabase, supabaseAdmin } from './supabase';
import { DEFAULT_SETTINGS, type Article, type Author, type Category, type NavItem, type SiteSettings } from './types';
import { normalizeJoin } from './utils';

const ARTICLE_LIST =
  'id, headline, slug, excerpt, featured_image, featured_image_alt, published_at, category_id, author_id, tags, reading_time_minutes, categories(id, name, slug), authors(id, name, slug, avatar_url, bio)';

function mapArticle(row: Record<string, unknown>): Article {
  return {
    ...(row as unknown as Article),
    tags: (row.tags as string[]) || [],
    categories: normalizeJoin(row.categories as Article['categories'] | Article['categories'][]),
    authors: normalizeJoin(row.authors as Article['authors'] | Article['authors'][]),
  };
}

// ─── Public queries ───

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data } = await supabase.from('site_settings').select('*').limit(1).single();
  return { ...DEFAULT_SETTINGS, ...(data || {}) };
}

export async function getNavCategories(): Promise<Pick<Category, 'id' | 'name' | 'slug'>[]> {
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('show_in_nav', true)
    .order('sort_order', { ascending: true });
  return data || [];
}

export async function getNavItems(): Promise<NavItem[]> {
  const { data } = await supabase
    .from('nav_items')
    .select('*')
    .eq('is_visible', true)
    .order('display_order', { ascending: true });
  return (data || []) as NavItem[];
}

export async function getPublishedArticles(options?: {
  limit?: number;
  offset?: number;
  categoryId?: string;
  tag?: string;
  search?: string;
}): Promise<{ articles: Article[]; total: number }> {
  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;

  let query = supabase
    .from('articles')
    .select(ARTICLE_LIST, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (options?.categoryId) query = query.eq('category_id', options.categoryId);
  if (options?.tag) query = query.contains('tags', [options.tag]);
  if (options?.search) query = query.textSearch('fts', options.search);

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], total: 0 };
  }
  return {
    articles: (data || []).map((row) => mapArticle(row as Record<string, unknown>)),
    total: count ?? 0,
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data } = await supabase
    .from('articles')
    .select(
      '*, categories(id, name, slug), authors(id, name, slug, bio, avatar_url, website_url, twitter_handle, linkedin_url, github_url, role)'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (!data) return null;
  return mapArticle(data as Record<string, unknown>);
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select(ARTICLE_LIST)
    .eq('status', 'published')
    .neq('id', article.id)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (article.category_id) query = query.eq('category_id', article.category_id);

  const { data } = await query;
  if (data && data.length > 0) {
    return data.map((row) => mapArticle(row as Record<string, unknown>));
  }

  const { data: fallback } = await supabase
    .from('articles')
    .select(ARTICLE_LIST)
    .eq('status', 'published')
    .neq('id', article.id)
    .order('published_at', { ascending: false })
    .limit(limit);

  return (fallback || []).map((row) => mapArticle(row as Record<string, unknown>));
}

export async function getPopularArticles(limit = 5): Promise<Article[]> {
  const { data } = await supabase
    .from('articles')
    .select(ARTICLE_LIST)
    .eq('status', 'published')
    .order('reading_time_minutes', { ascending: false, nullsFirst: false })
    .order('published_at', { ascending: false })
    .limit(limit);
  return (data || []).map((row) => mapArticle(row as Record<string, unknown>));
}

export async function getAuthors(): Promise<Author[]> {
  const { data } = await supabase
    .from('authors')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return (data || []) as Author[];
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const { data } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return (data as Author) ?? null;
}

export async function getAuthorArticles(authorId: string, limit = 20): Promise<Article[]> {
  const { data } = await supabase
    .from('articles')
    .select(ARTICLE_LIST)
    .eq('author_id', authorId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);
  return (data || []).map((row) => mapArticle(row as Record<string, unknown>));
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await supabase.from('categories').select('*').order('sort_order');
  return (data || []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data } = await supabase.from('categories').select('*').eq('slug', slug).single();
  return (data as Category) ?? null;
}

export async function getFeaturedCategoryArticles(): Promise<
  { category: Category; articles: Article[] }[]
> {
  const { data: cats } = await supabase
    .from('categories')
    .select('*')
    .eq('home_page_featured', true)
    .order('sort_order');

  if (!cats || cats.length === 0) return [];

  const results = await Promise.all(
    (cats as Category[]).map(async (cat) => {
      const { articles } = await getPublishedArticles({ categoryId: cat.id, limit: 3 });
      return { category: cat, articles };
    })
  );

  return results.filter((r) => r.articles.length > 0);
}

export async function getAllTags(): Promise<string[]> {
  const { data } = await supabase
    .from('articles')
    .select('tags')
    .eq('status', 'published')
    .not('tags', 'eq', '{}');

  if (!data) return [];
  const tagSet = new Set<string>();
  data.forEach((row) => {
    ((row.tags as string[]) || []).forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export async function hasTaggedArticles(): Promise<boolean> {
  const { count } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .not('tags', 'eq', '{}');
  return (count ?? 0) > 0;
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const { data } = await supabase.from('articles').select('slug').eq('status', 'published');
  return (data ?? []).map((row) => row.slug);
}

/** Articles from the last 48 hours, for the Google News sitemap (max 1,000). */
export async function getRecentNewsArticles(): Promise<
  Pick<Article, 'headline' | 'slug' | 'published_at'>[]
> {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('articles')
    .select('headline, slug, published_at')
    .eq('status', 'published')
    .gte('published_at', since)
    .order('published_at', { ascending: false })
    .limit(1000);
  return (data || []) as Pick<Article, 'headline' | 'slug' | 'published_at'>[];
}

export async function getArticlesByCategory(categorySlug: string) {
  const cat = await getCategoryBySlug(categorySlug);
  if (!cat) return { category: null, articles: [] as Article[], total: 0 };
  const { articles, total } = await getPublishedArticles({ categoryId: cat.id, limit: 100 });
  return { category: cat, articles, total };
}

// ─── Admin queries ───

export async function adminGetAllArticles(statusFilter?: string): Promise<Article[]> {
  let q = supabaseAdmin
    .from('articles')
    .select(
      'id, headline, slug, status, published_at, scheduled_for, updated_at, category_id, tags, categories(name), authors(name)'
    );

  if (statusFilter && statusFilter !== 'all') q = q.eq('status', statusFilter);

  if (statusFilter === 'scheduled') {
    q = q.order('scheduled_for', { ascending: true, nullsFirst: false });
  } else {
    q = q.order('updated_at', { ascending: false });
  }

  const { data } = await q;
  return (data || []).map((row) => mapArticle(row as Record<string, unknown>));
}

export async function adminGetArticle(id: string): Promise<Article | null> {
  const { data } = await supabaseAdmin.from('articles').select('*').eq('id', id).single();
  if (!data) return null;
  return { ...(data as Article), tags: (data.tags as string[]) || [] };
}

export async function adminGetCategories(): Promise<Category[]> {
  const { data } = await supabaseAdmin.from('categories').select('*').order('sort_order');
  return (data || []) as Category[];
}

export async function adminGetAuthors(): Promise<Author[]> {
  const { data } = await supabaseAdmin.from('authors').select('*').order('name');
  return (data || []) as Author[];
}

export async function adminGetSettings(): Promise<SiteSettings> {
  const { data } = await supabaseAdmin.from('site_settings').select('*').limit(1).single();
  return { ...DEFAULT_SETTINGS, ...(data || {}) };
}

export async function adminGetNavItems(): Promise<NavItem[]> {
  const { data } = await supabaseAdmin.from('nav_items').select('*').order('display_order');
  return (data || []) as NavItem[];
}

export async function adminHasOpenAIKey(): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('ai_settings')
    .select('openai_api_key_encrypted')
    .limit(1)
    .single();
  return !!data?.openai_api_key_encrypted;
}
