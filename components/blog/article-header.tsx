import type { Article } from "@/types";
import { formatReadingTime } from "@/lib/utils/reading-time";

interface ArticleHeaderProps {
  article: Article;
  showReadingTime?: boolean;
}

export function ArticleHeader({
  article,
  showReadingTime = true,
}: ArticleHeaderProps) {
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <header className="mb-8">
      {article.categories && (
        <span className="mb-3 inline-block rounded-full bg-[#22C55E] px-3.5 py-1.5 text-xs font-bold text-white">
          {article.categories.name}
        </span>
      )}

      <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-gray-100">
        {article.headline}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        {article.author && (
          <a
            href={`/authors/${article.author.slug}`}
            className="flex items-center gap-2 hover:text-gray-900 transition-colors dark:hover:text-gray-100"
          >
            {article.author.avatar_url && (
              <img
                src={article.author.avatar_url}
                alt={article.author.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <span className="font-medium">{article.author.name}</span>
          </a>
        )}

        {formattedDate && (
          <>
            <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">|</span>
            <time dateTime={article.published_at!}>{formattedDate}</time>
          </>
        )}

        {showReadingTime && article.reading_time_minutes && (
          <>
            <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">|</span>
            <span>{formatReadingTime(article.reading_time_minutes)}</span>
          </>
        )}
      </div>

      {article.featured_image && (
        <div className="mt-8 overflow-hidden rounded-xl">
          <img
            src={article.featured_image}
            alt={article.featured_image_alt || article.headline}
            className="w-full object-cover"
          />
        </div>
      )}
    </header>
  );
}
