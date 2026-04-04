import { compileMdx } from "@/lib/mdx/compile";

interface ArticleContentProps {
  html?: string | null;
  markdown?: string | null;
}

export async function ArticleContent({
  html,
  markdown,
}: ArticleContentProps) {
  const source = markdown || "";

  if (source) {
    try {
      const { content } = await compileMdx(source);

      return (
        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-[#2563EB] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-[#2563EB] dark:prose-invert dark:prose-headings:text-gray-100 dark:prose-p:text-gray-300 dark:prose-li:text-gray-300 dark:prose-strong:text-gray-100 dark:prose-blockquote:text-gray-300">
          {content}
        </div>
      );
    } catch {
      // Fallback to basic HTML if MDX compilation fails
    }
  }

  const fallbackHtml = html || convertMarkdownToBasicHtml(source);

  return (
    <article
      className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-[#2563EB] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-[#2563EB] dark:prose-invert dark:prose-headings:text-gray-100 dark:prose-p:text-gray-300 dark:prose-li:text-gray-300 dark:prose-strong:text-gray-100 dark:prose-blockquote:text-gray-300"
      dangerouslySetInnerHTML={{ __html: fallbackHtml }}
    />
  );
}

function convertMarkdownToBasicHtml(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img alt="$1" src="$2" />')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>");

  html = html.replace(
    /(<li>.*?<\/li>\n?)+/g,
    (match) => `<ul>${match}</ul>`
  );

  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (
        !trimmed ||
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<img") ||
        trimmed.startsWith("<blockquote")
      ) {
        return trimmed;
      }
      return `<p>${trimmed}</p>`;
    })
    .join("\n");

  return html;
}
