import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getArticleBySlug,
  getRelatedArticles,
  getBlogSettings,
} from "@/lib/supabase/queries";
import { generateArticleMetadata } from "@/components/seo/meta-tags";
import { JsonLd, articleJsonLd } from "@/components/seo/json-ld";
import { ReadingProgressBar } from "@/components/blog/reading-progress-bar";
import { ArticleHeader } from "@/components/blog/article-header";
import { ArticleContent } from "@/components/blog/article-content";
import { ArticleFooter } from "@/components/blog/article-footer";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { RelatedArticles } from "@/components/blog/related-articles";
import { AuthorCard } from "@/components/author/author-card";
import { CTAInline } from "@/components/callouts/cta-inline";
import { CTASidebar } from "@/components/callouts/cta-sidebar";
import { NewsletterSignup } from "@/components/callouts/newsletter-signup";

interface ArticlePageProps {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Article Not Found" };

  const settings = await getBlogSettings();
  return generateArticleMetadata(article, settings);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const settings = await getBlogSettings();
  const relatedArticles = settings.show_related_articles
    ? await getRelatedArticles(article, 3)
    : [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      <JsonLd data={articleJsonLd(article, settings, siteUrl)} />
      <ReadingProgressBar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-12">
          {/* Main article */}
          <div className="min-w-0 max-w-3xl flex-1">
            <ArticleHeader
              article={article}
              showReadingTime={settings.show_reading_time}
            />

            <ArticleContent
              html={article.content_html}
              markdown={article.content_markdown}
              settings={settings}
            />

            {/* Global inline CTA after article body */}
            {settings.inline_cta_enabled &&
              settings.inline_cta_title &&
              settings.inline_cta_button_text &&
              settings.inline_cta_button_url && (
                <CTAInline
                  title={settings.inline_cta_title}
                  description={settings.inline_cta_description ?? undefined}
                  buttonText={settings.inline_cta_button_text}
                  buttonUrl={settings.inline_cta_button_url}
                />
              )}

            <ArticleFooter article={article} />

            {/* Newsletter signup in article footer */}
            {settings.newsletter_enabled &&
              settings.newsletter_form_action && (
                <div className="mt-8">
                  <NewsletterSignup
                    formAction={settings.newsletter_form_action}
                    successMessage={settings.newsletter_success_message}
                    variant="card"
                  />
                </div>
              )}

            {/* Author card */}
            {settings.show_author_card && article.author && (
              <div className="mt-12">
                <AuthorCard author={article.author} />
              </div>
            )}

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <RelatedArticles articles={relatedArticles} />
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden w-[300px] shrink-0 lg:block">
            <div className="sticky top-8 space-y-6">
              {/* Table of contents */}
              {settings.show_table_of_contents && <TableOfContents />}

              {/* Sidebar CTA */}
              {settings.sidebar_cta_enabled &&
                settings.sidebar_cta_title && (
                  <CTASidebar
                    title={settings.sidebar_cta_title}
                    description={
                      settings.sidebar_cta_description ?? undefined
                    }
                    buttonText={
                      settings.sidebar_cta_button_text ?? undefined
                    }
                    buttonUrl={
                      settings.sidebar_cta_button_url ?? undefined
                    }
                    imageUrl={
                      settings.sidebar_cta_image_url ?? undefined
                    }
                  />
                )}

              {/* Newsletter in sidebar */}
              {settings.newsletter_enabled &&
                settings.newsletter_form_action && (
                  <NewsletterSignup
                    formAction={settings.newsletter_form_action}
                    title="Stay updated"
                    description="Get new articles in your inbox."
                    successMessage={settings.newsletter_success_message}
                    variant="card"
                  />
                )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
