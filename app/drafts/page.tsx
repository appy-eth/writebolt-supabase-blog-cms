import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Scheduled drafts (development)",
  robots: { index: false, follow: false },
};

type DraftPreview = {
  file: string;
  title: string;
  publishDate: string;
  slug?: string;
  draft?: boolean;
};

function loadDrafts(): DraftPreview[] {
  const dir = path.join(process.cwd(), "content/drafts");
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => /\.mdx?$/i.test(f));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data } = matter(raw);
    const d = data as Record<string, unknown>;
    const title =
      (typeof d.title === "string" && d.title) ||
      (typeof d.headline === "string" && d.headline) ||
      file;
    const publishDate =
      typeof d.publishDate === "string" ? d.publishDate : "—";
    const slug = typeof d.slug === "string" ? d.slug : undefined;
    const draft = d.draft === true;
    return { file, title, publishDate, slug, draft };
  });
}

export default function DraftsPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const drafts = loadDrafts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-gray-900 dark:text-gray-100">
      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
        Development only — this page is not available in production builds.
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Scheduled drafts
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Files in{" "}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">
          content/drafts
        </code>{" "}
        with a <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">publishDate</code>{" "}
        appear here for preview. Production visitors never see this route.
      </p>

      {drafts.length === 0 ? (
        <p className="mt-8 text-gray-500 dark:text-gray-500">
          No markdown files in{" "}
          <code className="text-sm">content/drafts</code> yet.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-gray-200 dark:divide-gray-700">
          {drafts.map((d) => (
            <li key={d.file} className="py-4">
              <p className="font-medium">{d.title}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                File: {d.file}
                {d.slug ? ` · slug: ${d.slug}` : null}
              </p>
              <p className="mt-1 text-sm">
                <span className="text-gray-500">publishDate:</span>{" "}
                {d.publishDate}
                {d.draft ? (
                  <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    draft: true
                  </span>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
