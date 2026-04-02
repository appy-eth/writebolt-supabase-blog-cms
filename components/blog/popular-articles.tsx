import { getPopularArticles } from "@/lib/supabase/queries";
import { formatReadingTime } from "@/lib/utils/reading-time";

export async function PopularArticles() {
  const articles = await getPopularArticles(5);

  if (articles.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">
        Popular Articles
      </h3>
      <div className="mt-4 space-y-0 divide-y divide-gray-200 dark:divide-gray-800">
        {articles.map((article, index) => (
          <a
            key={article.id}
            href={`/blog/${article.slug}`}
            className="group flex gap-3 py-4 first:pt-0"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-xs font-bold text-white" aria-hidden="true">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold leading-snug text-gray-900 line-clamp-2 group-hover:text-[#2563EB] transition-colors dark:text-gray-100">
                {article.headline}
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatReadingTime(article.reading_time_minutes)}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
