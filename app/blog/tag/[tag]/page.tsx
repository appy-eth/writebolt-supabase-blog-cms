import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getBlogSettings,
  getPublishedArticles,
  hasTaggedArticles,
} from "@/lib/supabase/queries";
import { ArticleCard } from "@/components/blog/article-card";
import { Pagination } from "@/components/blog/pagination";
import { Sidebar } from "@/components/layout/sidebar";
import { shouldShowPageBlogTitle } from "@/lib/blog-display";

interface TagPageProps {
  params: { tag: string };
  searchParams: { page?: string };
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const settings = await getBlogSettings();
  const tag = decodeURIComponent(params.tag);
  return {
    title: `#${tag} — ${settings.blog_name}`,
    description: `Articles tagged with ${tag}`,
  };
}

export default async function TagPage({
  params,
  searchParams,
}: TagPageProps) {
  const hasTags = await hasTaggedArticles();
  if (!hasTags) notFound();

  const settings = await getBlogSettings();
  const tag = decodeURIComponent(params.tag);
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const { articles, total } = await getPublishedArticles({
    tag,
    limit: settings.posts_per_page,
    offset: (page - 1) * settings.posts_per_page,
  });

  if (total === 0) notFound();

  const totalPages = Math.ceil(total / settings.posts_per_page);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {shouldShowPageBlogTitle(settings) && (
        <h1 className="mb-8 font-serif text-4xl font-bold text-[#111827] dark:text-gray-100">
          {settings.blog_name}
        </h1>
      )}

      <div className="mt-8 flex flex-col gap-10 lg:flex-row">
        <div className="flex-1 min-w-0">
          <p className="mb-6 text-sm font-medium text-[#6B7280]">
            Articles tagged with{" "}
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[#111827]">
              #{tag}
            </span>
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/blog/tag/${encodeURIComponent(tag)}`}
          />
        </div>

        <Sidebar settings={settings} />
      </div>
    </div>
  );
}
