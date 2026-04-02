interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = generatePageNumbers(currentPage, totalPages);

  function getHref(page: number) {
    if (page === 1) return basePath;
    const separator = basePath.includes("?") ? "&" : "?";
    return `${basePath}${separator}page=${page}`;
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Pagination">
      <a
        href={currentPage > 1 ? getHref(currentPage - 1) : "#"}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          currentPage === 1
            ? "pointer-events-none text-gray-300 dark:text-gray-600"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        }`}
        aria-disabled={currentPage === 1}
      >
        Previous
      </a>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 dark:text-gray-500" aria-hidden="true">
            ...
          </span>
        ) : (
          <a
            key={page}
            href={getHref(page as number)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentPage === page
                ? "bg-[#2563EB] text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            }`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </a>
        )
      )}

      <a
        href={currentPage < totalPages ? getHref(currentPage + 1) : "#"}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          currentPage === totalPages
            ? "pointer-events-none text-gray-300 dark:text-gray-600"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        }`}
        aria-disabled={currentPage === totalPages}
      >
        Next
      </a>
    </nav>
  );
}

function generatePageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}
