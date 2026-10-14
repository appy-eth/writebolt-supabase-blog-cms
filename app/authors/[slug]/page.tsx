import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAuthorBySlug,
  getAuthorArticles,
  getBlogSettings,
} from "@/lib/supabase/queries";
import { JsonLd, authorJsonLd } from "@/components/seo/json-ld";
import { AuthorProfile } from "@/components/author/author-profile";
import { AuthorArticlesList } from "@/components/author/author-articles-list";

interface AuthorPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const author = await getAuthorBySlug(params.slug);
  if (!author) return { title: "Author Not Found" };

  const settings = await getBlogSettings();
  return {
    title: `${author.name} — ${settings.site_name}`,
    description: author.bio || `Articles by ${author.name}`,
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const author = await getAuthorBySlug(params.slug);
  if (!author) notFound();

  const articles = await getAuthorArticles(author.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      <JsonLd data={authorJsonLd(author, siteUrl)} />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <AuthorProfile author={author} />

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#111827]">
            Articles by {author.name}
          </h2>
          <div className="mt-6">
            <AuthorArticlesList articles={articles} />
          </div>
        </div>
      </div>
    </>
  );
}
