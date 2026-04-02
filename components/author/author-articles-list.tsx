import type { Article } from "@/types";
import { ArticleCard } from "@/components/blog/article-card";

interface AuthorArticlesListProps {
  articles: Article[];
}

export function AuthorArticlesList({ articles }: AuthorArticlesListProps) {
  if (articles.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No published articles yet.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
