"use client";

import { useEffect, useState } from "react";
import type { Article, Category } from "@/types";
import { ImageUpload } from "./image-upload";

interface FrontmatterEditorProps {
  article: Partial<Article>;
  onChange: (updates: Partial<Article>) => void;
}

export function FrontmatterEditor({
  article,
  onChange,
}: FrontmatterEditorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  function handleAddTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/,/g, "");
      if (tag && !(article.tags ?? []).includes(tag)) {
        onChange({ tags: [...(article.tags ?? []), tag] });
      }
      setTagInput("");
    }
  }

  function handleRemoveTag(tag: string) {
    onChange({ tags: (article.tags ?? []).filter((t) => t !== tag) });
  }

  function handleSlugGenerate() {
    if (article.headline) {
      const slug = article.headline
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      onChange({ slug });
    }
  }

  return (
    <div className="space-y-6">
      {/* Headline */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Headline *
        </label>
        <input
          type="text"
          value={article.headline ?? ""}
          onChange={(e) => onChange({ headline: e.target.value })}
          placeholder="Enter article headline"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Slug *
        </label>
        <div className="mt-1 flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-sm text-gray-400">
              /blog/
            </span>
            <input
              type="text"
              value={article.slug ?? ""}
              onChange={(e) => onChange({ slug: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 py-2.5 pl-14 pr-3 text-sm shadow-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSlugGenerate}
            className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Excerpt
        </label>
        <textarea
          value={article.excerpt ?? ""}
          onChange={(e) => onChange({ excerpt: e.target.value })}
          placeholder="Brief summary for previews and SEO"
          rows={2}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          value={article.category_id ?? ""}
          onChange={(e) =>
            onChange({ category_id: e.target.value || null })
          }
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tags
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]">
          {(article.tags ?? []).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={
              (article.tags ?? []).length === 0
                ? "Type tag and press Enter"
                : ""
            }
            className="min-w-[120px] flex-1 border-0 py-0.5 text-sm outline-none placeholder-gray-400"
          />
        </div>
      </div>

      {/* Featured Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Featured Image
        </label>
        <ImageUpload
          value={article.featured_image ?? ""}
          onChange={(url) => onChange({ featured_image: url || null })}
        />
        {article.featured_image && (
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-500">
              Alt text
            </label>
            <input
              type="text"
              value={article.featured_image_alt ?? ""}
              onChange={(e) =>
                onChange({ featured_image_alt: e.target.value || null })
              }
              placeholder="Describe the image"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
            />
          </div>
        )}
      </div>

      {/* Status (publish/split button controls this) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <p className="mt-1 text-sm capitalize text-gray-700">
          {article.status ?? "draft"}
          {article.status === "scheduled" && article.scheduled_for ? (
            <span className="ml-2 font-normal text-gray-500">
              — {new Date(article.scheduled_for).toLocaleString()}
            </span>
          ) : null}
          {article.status === "published" && article.published_at ? (
            <span className="ml-2 font-normal text-gray-500">
              — published{" "}
              {new Date(article.published_at).toLocaleString()}
            </span>
          ) : null}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Use the publish button (Save as Draft / Publish Now / Schedule) at the
          top of the page.
        </p>
      </div>

      {/* SEO fields */}
      <details className="rounded-lg border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">
          SEO Settings
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500">
              SEO Title
            </label>
            <input
              type="text"
              value={article.seo_title ?? ""}
              onChange={(e) =>
                onChange({ seo_title: e.target.value || null })
              }
              placeholder="Defaults to headline"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">
              SEO Description
            </label>
            <textarea
              value={article.seo_description ?? ""}
              onChange={(e) =>
                onChange({ seo_description: e.target.value || null })
              }
              placeholder="Defaults to excerpt"
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none resize-none"
            />
          </div>
        </div>
      </details>
    </div>
  );
}
