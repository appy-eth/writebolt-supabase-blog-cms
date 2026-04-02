interface TagCloudProps {
  tags: string[];
  activeTag?: string;
}

export function TagCloud({ tags, activeTag }: TagCloudProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Tags">
      {tags.map((tag) => (
        <a
          key={tag}
          href={`/blog/tag/${tag}`}
          role="listitem"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeTag === tag
              ? "bg-[#2563EB] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          }`}
        >
          #{tag}
        </a>
      ))}
    </div>
  );
}
