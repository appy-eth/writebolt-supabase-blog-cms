import type { Article } from "@/types";

interface ArticleFooterProps {
  article: Article;
}

export function ArticleFooter({ article }: ArticleFooterProps) {
  const hasTags = article.tags && article.tags.length > 0;

  if (!hasTags && !article.category) return null;

  return (
    <footer className="mt-12 border-t border-gray-200 pt-6 dark:border-gray-800">
      {article.category && (
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Filed under:{" "}
          </span>
          <a
            href={`/blog/category/${article.category}`}
            className="text-sm font-medium text-[#2563EB] hover:underline"
          >
            {article.category}
          </a>
        </div>
      )}

      {hasTags && (
        <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Article tags">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Tags:
          </span>
          {article.tags.map((tag) => (
            <a
              key={tag}
              href={`/blog/tag/${tag}`}
              role="listitem"
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              #{tag}
            </a>
          ))}
        </div>
      )}
    </footer>
  );
}
