import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getBlogSettings,
  getPublishedArticles,
  getFeaturedCategoryArticles,
  getCategories,
} from "@/lib/supabase/queries";
import { generateBlogMetadata } from "@/components/seo/meta-tags";
import { JsonLd, blogJsonLd } from "@/components/seo/json-ld";
import { CategoryFilter } from "@/components/blog/category-filter";
import { SearchBar } from "@/components/blog/search-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { Pagination } from "@/components/blog/pagination";
import { ArticleCard } from "@/components/blog/article-card";
import {
  isEmbeddedBlogLayout,
  shouldShowPageBlogTitle,
} from "@/lib/blog-display";

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
  const categories = await getCategories();
  const embedded = isEmbeddedBlogLayout(settings);

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const searchQuery = searchParams.q;

  const { articles: latestArticles, total } = await getPublishedArticles({
    limit: settings.posts_per_page,
    offset: (page - 1) * settings.posts_per_page,
    search: searchQuery,
  });

  const featuredCategoryArticles = await getFeaturedCategoryArticles();

  const totalPages = Math.ceil(total / settings.posts_per_page);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isSearching = !!searchQuery;
  const showPageTitle = shouldShowPageBlogTitle(settings);

  return (
    <>
      <JsonLd data={blogJsonLd(settings, siteUrl)} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showPageTitle && (
          <h1 className="mb-6 font-serif text-4xl font-bold text-gray-900 dark:text-gray-100">
            {settings.blog_page_heading?.trim() || settings.site_name}
          </h1>
        )}

        {embedded && !isSearching && (
          <div className="mb-6">
            <CategoryFilter categories={categories} />
          </div>
        )}

        <div
          className={`flex justify-end mb-8`}
        >
          <div className="w-full sm:w-64">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="min-w-0 flex-1">
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
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {latestArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {!isSearching && latestArticles.length === 0 && (
              <div className="mt-12 text-center">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  No articles published yet.
                </p>
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  Visit{" "}
                  <a href="/admin/new" className="text-[#2563EB] hover:underline">
                    /admin/new
                  </a>{" "}
                  to write your first article.
                </p>
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath={
                searchQuery
                  ? `/blog?q=${encodeURIComponent(searchQuery)}`
                  : "/blog"
              }
            />

            {!isSearching &&
              settings.show_featured_categories &&
              featuredCategoryArticles.map(({ category, articles }) => (
                <section key={category.id} className="mt-16">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {category.name}
                    </h2>
                    <a
                      href={`/blog/category/${category.slug}`}
                      className="text-sm font-medium text-[#2563EB] hover:underline"
                    >
                      View all →
                    </a>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              ))}
          </div>

          <Sidebar settings={settings} />
        </div>
      </div>
    </>
  );
}
