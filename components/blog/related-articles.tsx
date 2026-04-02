import type { Article } from "@/types";
import { ArticleCard } from "./article-card";

interface RelatedArticlesProps {
  articles: Article[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-16 border-t border-gray-200 pt-12 dark:border-gray-800" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-2xl font-bold text-gray-900 dark:text-gray-100">Related Articles</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
