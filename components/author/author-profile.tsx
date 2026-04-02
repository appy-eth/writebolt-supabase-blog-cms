import type { Author } from "@/types";

interface AuthorProfileProps {
  author: Author;
}

export function AuthorProfile({ author }: AuthorProfileProps) {
  return (
    <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6">
      {author.avatar_url ? (
        <img
          src={author.avatar_url}
          alt=""
          className="h-24 w-24 rounded-full object-cover sm:h-32 sm:w-32"
        />
      ) : (
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-[#2563EB] text-3xl font-bold text-white sm:h-32 sm:w-32"
          aria-hidden="true"
        >
          {author.name.charAt(0)}
        </div>
      )}

      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {author.name}
        </h1>
        <p className="mt-1 text-sm font-medium text-[#2563EB] capitalize">
          {author.role}
        </p>

        {author.bio && (
          <p className="mt-3 text-gray-500 leading-relaxed dark:text-gray-400">
            {author.bio}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
          {author.twitter_handle && (
            <a
              href={`https://twitter.com/${author.twitter_handle.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-500 hover:text-[#2563EB] transition-colors dark:text-gray-400"
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
              className="text-sm font-medium text-gray-500 hover:text-[#2563EB] transition-colors dark:text-gray-400"
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
              className="text-sm font-medium text-gray-500 hover:text-[#2563EB] transition-colors dark:text-gray-400"
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
              className="text-sm font-medium text-gray-500 hover:text-[#2563EB] transition-colors dark:text-gray-400"
              aria-label={`${author.name}'s website`}
            >
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
