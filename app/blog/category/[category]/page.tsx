import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getBlogSettings,
  getPublishedArticles,
  getCategories,
} from "@/lib/supabase/queries";
import { ArticleCard } from "@/components/blog/article-card";
import { CategoryFilter } from "@/components/blog/category-filter";
import { Pagination } from "@/components/blog/pagination";
import { Sidebar } from "@/components/layout/sidebar";

interface CategoryPageProps {
  params: { category: string };
  searchParams: { page?: string };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const settings = await getBlogSettings();
  const categoryName = decodeURIComponent(params.category);
  return {
    title: `${categoryName} — ${settings.blog_name}`,
    description: `Articles in the ${categoryName} category`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const settings = await getBlogSettings();
  const categories = await getCategories();
  const categorySlug = decodeURIComponent(params.category);
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const { articles, total } = await getPublishedArticles({
    category: categorySlug,
    limit: settings.posts_per_page,
    offset: (page - 1) * settings.posts_per_page,
  });

  const totalPages = Math.ceil(total / settings.posts_per_page);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {settings.show_blog_title && (
          <h1 className="font-serif text-4xl font-bold text-[#111827]">
            {settings.blog_name}
          </h1>
        )}
      </div>

      <div className="mt-6">
        <CategoryFilter
          categories={categories}
          activeCategory={categorySlug}
        />
      </div>

      <div className="mt-8 flex flex-col gap-10 lg:flex-row">
        <div className="flex-1 min-w-0">
          <p className="mb-6 text-sm font-medium text-[#6B7280]">
            Showing articles in <span className="text-[#111827]">{category.name}</span>
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {articles.length === 0 && (
            <p className="mt-8 text-center text-[#6B7280]">
              No articles in this category yet.
            </p>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/blog/category/${categorySlug}`}
          />
        </div>

        <Sidebar settings={settings} />
      </div>
    </div>
  );
}
