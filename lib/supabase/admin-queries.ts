import { createServiceRoleClient } from "./service";
import type { Article, BlogSettings, Category, NavItem } from "@/types";

function db() {
  return createServiceRoleClient();
}

// ── Articles ───────────────────────────────────────────────

export async function getAllArticles(
  statusFilter?: string
): Promise<Article[]> {
  const supabase = db();
  let q = supabase.from("articles").select("*, author:authors(*)");

  if (statusFilter && statusFilter !== "all") {
    q = q.eq("status", statusFilter);
  }

  if (statusFilter === "scheduled") {
    q = q.order("scheduled_date", { ascending: true, nullsFirst: false });
  } else {
    q = q.order("updated_at", { ascending: false });
  }

  const { data } = await q;
  return (data ?? []) as Article[];
}

export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = db();
  const { data } = await supabase
    .from("articles")
    .select("*, author:authors(*)")
    .eq("id", id)
    .single();

  return (data as Article) ?? null;
}

export async function createArticle(
  article: Partial<Article>
): Promise<Article | null> {
  const supabase = db();
  const { data, error } = await supabase
    .from("articles")
    .insert(article)
    .select("*, author:authors(*)")
    .single();

  if (error) {
    console.error("Error creating article:", error);
    return null;
  }
  return data as Article;
}

export async function updateArticle(
  id: string,
  updates: Partial<Article>
): Promise<Article | null> {
  const supabase = db();
  // Strip the joined author field and the fts generated column — neither can be written directly
  const safeUpdates = { ...updates } as Record<string, unknown>;
  delete safeUpdates.author;
  delete safeUpdates.fts;
  const { data, error } = await supabase
    .from("articles")
    .update(safeUpdates)
    .eq("id", id)
    .select("*, author:authors(*)")
    .single();

  if (error) {
    console.error("Error updating article:", error);
    return null;
  }
  return data as Article;
}

export async function deleteArticle(id: string): Promise<boolean> {
  const supabase = db();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  return !error;
}

// ── Categories ─────────────────────────────────────────────

export async function createCategory(
  category: Partial<Category>
): Promise<Category | null> {
  const supabase = db();
  const { data, error } = await supabase
    .from("categories")
    .insert(category)
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return null;
  }
  return data as Category;
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<Category | null> {
  const supabase = db();
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    return null;
  }
  return data as Category;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = db();
  const cat = await supabase
    .from("categories")
    .select("slug")
    .eq("id", id)
    .single();
  if (cat.data) {
    await supabase
      .from("articles")
      .update({ category: null })
      .eq("category", cat.data.slug);
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  return !error;
}

export async function reorderCategories(
  orderedIds: string[]
): Promise<boolean> {
  const supabase = db();
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("categories")
      .update({ display_order: index })
      .eq("id", id)
  );
  const results = await Promise.all(updates);
  return results.every((r) => !r.error);
}

// ── Blog Settings ──────────────────────────────────────────

export async function updateBlogSettings(
  updates: Partial<BlogSettings>
): Promise<BlogSettings | null> {
  const supabase = db();
  const { data: existing } = await supabase
    .from("blog_settings")
    .select("id")
    .single();

  if (!existing) return null;

  const { data, error } = await supabase
    .from("blog_settings")
    .update(updates)
    .eq("id", existing.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating blog settings:", error);
    return null;
  }
  return data as BlogSettings;
}

// ── Nav Items ──────────────────────────────────────────────

export async function getAllNavItems(): Promise<NavItem[]> {
  const supabase = db();
  const { data } = await supabase
    .from("nav_items")
    .select("*")
    .order("display_order");

  return (data ?? []) as NavItem[];
}

export async function createNavItem(
  item: Partial<NavItem>
): Promise<NavItem | null> {
  const supabase = db();
  const { data, error } = await supabase
    .from("nav_items")
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error("Error creating nav item:", error);
    return null;
  }
  return data as NavItem;
}

export async function updateNavItem(
  id: string,
  updates: Partial<NavItem>
): Promise<NavItem | null> {
  const supabase = db();
  const { data, error } = await supabase
    .from("nav_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating nav item:", error);
    return null;
  }
  return data as NavItem;
}

export async function deleteNavItem(id: string): Promise<boolean> {
  const supabase = db();
  const { error } = await supabase.from("nav_items").delete().eq("id", id);
  return !error;
}

export async function reorderNavItems(
  orderedIds: string[]
): Promise<boolean> {
  const supabase = db();
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("nav_items")
      .update({ display_order: index })
      .eq("id", id)
  );
  const results = await Promise.all(updates);
  return results.every((r) => !r.error);
}
