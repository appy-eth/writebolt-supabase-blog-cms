import { supabase, supabaseAdmin } from './supabase';

// ─── Public queries (RLS enforced) ───

export async function getSiteSettings() {
  const { data } = await supabase.from('site_settings').select('*').single();
  return data || { site_name: 'My Blog', site_description: '', logo_url: '' };
}

export async function getNavCategories() {
  const { data } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('show_in_nav', true)
    .order('sort_order', { ascending: true });
  return data || [];
}

export async function getPublishedArticles(limit = 20, offset = 0) {
  const { data, count } = await supabase
    .from('articles')
    .select('id, headline, slug, excerpt, featured_image, published_at, category_id, author_id, categories(name, slug), authors(name, avatar_url)', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return { articles: data || [], total: count || 0 };
}

export async function getArticleBySlug(slug: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, categories(name, slug), authors(name, slug, bio, avatar_url)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return data;
}

export async function getArticlesByCategory(categorySlug: string) {
  const { data: cat } = await supabase.from('categories').select('id, name, slug').eq('slug', categorySlug).single();
  if (!cat) return { category: null, articles: [] };

  const { data: articles } = await supabase
    .from('articles')
    .select('id, headline, slug, excerpt, featured_image, published_at, authors(name, avatar_url)')
    .eq('status', 'published')
    .eq('category_id', cat.id)
    .order('published_at', { ascending: false });
  return { category: cat, articles: articles || [] };
}

// ─── Admin queries (service role, bypasses RLS) ───

export async function adminGetAllArticles() {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('id, headline, slug, status, published_at, scheduled_for, updated_at, categories(name), authors(name)')
    .order('updated_at', { ascending: false });
  return data || [];
}

export async function adminGetArticle(id: string) {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

export async function adminGetCategories() {
  const { data } = await supabaseAdmin.from('categories').select('*').order('sort_order');
  return data || [];
}

export async function adminGetAuthors() {
  const { data } = await supabaseAdmin.from('authors').select('*').order('name');
  return data || [];
}

export async function adminGetSettings() {
  const { data } = await supabaseAdmin.from('site_settings').select('*').single();
  return data;
}
