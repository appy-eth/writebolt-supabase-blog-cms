import type { Author } from "@/types";

interface AuthorCardProps {
  author: Author;
  compact?: boolean;
}

export function AuthorCard({ author, compact = false }: AuthorCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      {author.avatar_url ? (
        <img
          src={author.avatar_url}
          alt=""
          className={`rounded-full object-cover ${compact ? "h-12 w-12" : "h-16 w-16"}`}
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-full bg-[#2563EB] text-white font-bold ${
            compact ? "h-12 w-12 text-lg" : "h-16 w-16 text-xl"
          }`}
          aria-hidden="true"
        >
          {author.name.charAt(0)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <a
          href={`/authors/${author.slug}`}
          className="font-bold text-gray-900 hover:text-[#2563EB] transition-colors dark:text-gray-100"
        >
          {author.name}
        </a>
        {author.bio && (
          <p
            className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${compact ? "line-clamp-2" : "line-clamp-3"}`}
          >
            {author.bio}
          </p>
        )}

        {!compact && (
          <div className="mt-3 flex items-center gap-3">
            {author.twitter_handle && (
              <a
                href={`https://twitter.com/${author.twitter_handle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-[#2563EB] dark:text-gray-400"
                aria-label={`${author.name} on Twitter`}
              >
                Twitter
              </a>
            )}
            {author.linkedin_url && (
              <a
                href={author.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-[#2563EB] dark:text-gray-400"
                aria-label={`${author.name} on LinkedIn`}
              >
                LinkedIn
              </a>
            )}
            {author.github_url && (
              <a
                href={author.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-[#2563EB] dark:text-gray-400"
                aria-label={`${author.name} on GitHub`}
              >
                GitHub
              </a>
            )}
            {author.website_url && (
              <a
                href={author.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-[#2563EB] dark:text-gray-400"
                aria-label={`${author.name}'s website`}
              >
                Website
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
