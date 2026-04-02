export function highlightSearchTerm(
  text: string,
  term: string
): string {
  if (!term) return text;
  const regex = new RegExp(`(${escapeRegex(term)})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatSearchQuery(query: string): string {
  return query
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .join(" & ");
}
