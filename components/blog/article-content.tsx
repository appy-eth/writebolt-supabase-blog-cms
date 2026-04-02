import { compileMdx } from "@/lib/mdx/compile";
import { CTAInline } from "@/components/callouts/cta-inline";
import type { BlogSettings } from "@/types";

interface ArticleContentProps {
  html?: string | null;
  markdown?: string | null;
  settings?: BlogSettings | null;
}

export async function ArticleContent({
  html,
  markdown,
  settings,
}: ArticleContentProps) {
  const source = markdown || "";
  const hasMdxCTA = source.includes("<CTAInline");

  const shouldInsertGlobalCTA =
    settings?.inline_cta_enabled &&
    settings?.inline_cta_title &&
    settings?.inline_cta_button_text &&
    settings?.inline_cta_button_url &&
    !hasMdxCTA;

  let processedSource = source;

  if (shouldInsertGlobalCTA) {
    processedSource = insertCTAAfterThirdH2(source);
  }

  if (processedSource) {
    try {
      const { content } = await compileMdx(processedSource);

      return (
        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-[#2563EB] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-[#2563EB] dark:prose-invert dark:prose-headings:text-gray-100 dark:prose-p:text-gray-300 dark:prose-li:text-gray-300 dark:prose-strong:text-gray-100 dark:prose-blockquote:text-gray-300">
          {content}

          {shouldInsertGlobalCTA && (
            <GlobalInlineCTA settings={settings!} />
          )}
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

function GlobalInlineCTA({ settings }: { settings: BlogSettings }) {
  return null;
}

function insertCTAAfterThirdH2(md: string): string {
  let count = 0;
  const lines = md.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    if (/^## /.test(line)) {
      count++;
      if (count === 4) {
        result.push("");
        result.push("---");
        result.push("");
      }
    }
    result.push(line);
  }

  return result.join("\n");
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
