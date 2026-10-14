import type { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <a
      href={`/blog/${article.slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-md hover:scale-[1.01] dark:border-gray-800 dark:bg-gray-900"
    >
      {/* Image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={article.featured_image_alt || article.headline}
            className="h-full w-full object-cover rounded-t-xl"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
            <svg
              className="h-12 w-12 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
              />
            </svg>
          </div>
        )}

        {article.categories && (
          <span className="absolute left-3 top-3 rounded-full bg-[#22C55E] px-3.5 py-1.5 text-xs font-bold text-white">
            {article.categories.name}
          </span>
        )}
      </div>

      {/* Text area */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base font-bold leading-snug text-gray-900 line-clamp-2 sm:text-lg dark:text-gray-100">
          {article.headline}
        </h3>
        <p className="mt-2 text-[13px] font-medium text-gray-500 dark:text-gray-400">
          {article.author?.name && (
            <>
              {article.author.name}
              {formattedDate && <span className="mx-1.5">|</span>}
            </>
          )}
          {formattedDate}
        </p>
      </div>
    </a>
  );
}
