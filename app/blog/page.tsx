import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getBlogSettings,
  getPublishedArticles,
  getPopularArticles,
  getCategories,
  hasCategories as checkHasCategories,
} from "@/lib/supabase/queries";
import { generateBlogMetadata } from "@/components/seo/meta-tags";
import { JsonLd, blogJsonLd } from "@/components/seo/json-ld";
import { ViewTabs } from "@/components/blog/view-tabs";
import { CategoryFilter } from "@/components/blog/category-filter";
import { SearchBar } from "@/components/blog/search-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { Pagination } from "@/components/blog/pagination";
import { ArticleCard } from "@/components/blog/article-card";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBlogSettings();
  return generateBlogMetadata(settings);
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const settings = await getBlogSettings();
  const categoriesExist = await checkHasCategories();
  const categories = categoriesExist ? await getCategories() : [];

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const searchQuery = searchParams.q;

  const { articles: latestArticles, total } = await getPublishedArticles({
    limit: settings.posts_per_page,
    offset: (page - 1) * settings.posts_per_page,
    search: searchQuery,
  });

  const popularArticles = await getPopularArticles(
    settings.posts_per_page
  );

  const totalPages = Math.ceil(total / settings.posts_per_page);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isSearching = !!searchQuery;

  return (
    <>
      <JsonLd data={blogJsonLd(settings, siteUrl)} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Blog title + tabs row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {settings.show_blog_title && (
            <h1 className="font-serif text-4xl font-bold text-[#111827]">
              {settings.blog_name}
            </h1>
          )}
        </div>

        {/* Category filter + search */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {categoriesExist && <CategoryFilter categories={categories} />}
          <div className="w-full sm:w-64">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>
        </div>

        {/* Main content + sidebar */}
        <div className="mt-8 flex flex-col gap-10 lg:flex-row">
          {/* Main area */}
          <div className="flex-1 min-w-0">
            {isSearching ? (
              <>
                <p className="mb-6 text-sm text-[#6B7280]">
                  {total} result{total !== 1 ? "s" : ""} for &ldquo;
                  {searchQuery}&rdquo;
                </p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {latestArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
                {latestArticles.length === 0 && (
                  <p className="mt-8 text-center text-[#6B7280]">
                    No articles found matching your search.
                  </p>
                )}
              </>
            ) : (
              <ViewTabs
                latestArticles={latestArticles}
                popularArticles={popularArticles}
              />
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath={searchQuery ? `/blog?q=${encodeURIComponent(searchQuery)}` : "/blog"}
            />
          </div>

          {/* Sidebar */}
          <Sidebar settings={settings} />
        </div>
      </div>
    </>
  );
}
