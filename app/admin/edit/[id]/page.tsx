"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Article } from "@/types";
import { ArticleEditor } from "@/components/admin/article-editor";
import { FrontmatterEditor } from "@/components/admin/frontmatter-editor";
import { AIAssistToolbar } from "@/components/admin/ai-assist-toolbar";
import { AIImageGenerator } from "@/components/admin/ai-image-generator";
import { WriteboltGenerateBtn } from "@/components/admin/writebolt-generate-btn";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [imageGenOpen, setImageGenOpen] = useState(false);
  const [headlineSuggestions, setHeadlineSuggestions] = useState<string[]>([]);
  const [article, setArticle] = useState<Partial<Article>>({});

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/articles/${id}`);
      if (res.ok) {
        setArticle(await res.json());
      } else {
        alert("Article not found");
        router.push("/admin");
      }
      setLoading(false);
    }
    load();

    fetch("/api/admin/ai-settings")
      .then((r) => r.json())
      .then((data) => setHasApiKey(data.has_openai_key))
      .catch(() => {});
  }, [id, router]);

  function handleUpdate(updates: Partial<Article>) {
    setArticle((prev) => ({ ...prev, ...updates }));
  }

  async function handleSave() {
    if (!article.headline || !article.slug) {
      alert("Headline and slug are required.");
      return;
    }

    setSaving(true);
    try {
      const { id: _id, author, created_at, ...updates } = article as Article;
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updated = await res.json();
        setArticle(updated);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save article");
      }
    } catch {
      alert("Failed to save article");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#2563EB]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Back
          </button>
          {article.status === "published" && (
            <a
              href={`/blog/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              View
            </a>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Editor column */}
        <div className="space-y-4">
          {/* AI toolbar */}
          <AIAssistToolbar
            headline={article.headline ?? ""}
            content={article.content_markdown ?? ""}
            selectedText={selectedText}
            onContentUpdate={(content) =>
              handleUpdate({ content_markdown: content })
            }
            onExcerptGenerated={(excerpt) => handleUpdate({ excerpt })}
            onHeadlinesGenerated={setHeadlineSuggestions}
            hasApiKey={hasApiKey}
          />

          {/* Headline suggestions */}
          {headlineSuggestions.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Headline Suggestions
                </span>
                <button
                  type="button"
                  onClick={() => setHeadlineSuggestions([])}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Dismiss
                </button>
              </div>
              <ul className="space-y-1">
                {headlineSuggestions.map((h, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdate({ headline: h });
                        setHeadlineSuggestions([]);
                      }}
                      className="w-full text-left rounded px-2 py-1.5 text-sm text-gray-800 hover:bg-blue-100 transition-colors"
                    >
                      {h}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ArticleEditor
            content={article.content_markdown ?? ""}
            onChange={(content) =>
              handleUpdate({ content_markdown: content })
            }
            onSelectionChange={setSelectedText}
          />

          {/* AI image generate button */}
          {hasApiKey && (
            <button
              type="button"
              onClick={() => setImageGenOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              Generate AI Image
            </button>
          )}
        </div>

        {/* Sidebar: Frontmatter + Writebolt CTA */}
        <div className="space-y-6">
          <FrontmatterEditor
            article={article}
            onChange={handleUpdate}
          />
          <WriteboltGenerateBtn headline={article.headline ?? ""} />
        </div>
      </div>

      {/* AI image modal */}
      <AIImageGenerator
        open={imageGenOpen}
        onClose={() => setImageGenOpen(false)}
        onImageGenerated={(url, altText) => {
          const md = `\n![${altText}](${url})\n`;
          handleUpdate({
            content_markdown: (article.content_markdown ?? "") + md,
          });
        }}
        mode="inline"
      />
    </div>
  );
}
