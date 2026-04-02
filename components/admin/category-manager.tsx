"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/types";

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "" });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const res = await fetch("/api/admin/categories");
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleAdd() {
    if (!newCat.name) return;
    const slug = newCat.slug || generateSlug(newCat.name);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCat.name,
        slug,
        description: newCat.description || null,
        display_order: categories.length,
      }),
    });
    if (res.ok) {
      setNewCat({ name: "", slug: "", description: "" });
      setShowAdd(false);
      fetchCategories();
    }
  }

  async function handleUpdate(id: string, updates: Partial<Category>) {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setEditing(null);
    fetchCategories();
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Delete this category? Articles in this category will become uncategorized."
      )
    )
      return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  }

  async function moveItem(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const reordered = [...categories];
    [reordered[index], reordered[newIndex]] = [
      reordered[newIndex],
      reordered[index],
    ];
    setCategories(reordered);

    await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderedIds: reordered.map((c) => c.id),
      }),
    });
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize your blog articles by category
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Category
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={newCat.name}
              onChange={(e) => {
                setNewCat((p) => ({
                  ...p,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                }));
              }}
              placeholder="Category name"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
            <input
              type="text"
              value={newCat.slug}
              onChange={(e) =>
                setNewCat((p) => ({ ...p, slug: e.target.value }))
              }
              placeholder="slug (auto-generated)"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
            <input
              type="text"
              value={newCat.description}
              onChange={(e) =>
                setNewCat((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Description (optional)"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            No categories yet. That&apos;s fine — your blog works
            perfectly without them.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Add categories when you&apos;re ready to organize your content.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="divide-y divide-gray-100">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === categories.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editing === cat.id ? (
                    <EditCategoryForm
                      category={cat}
                      onSave={(updates) => handleUpdate(cat.id, updates)}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {cat.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        /blog/category/{cat.slug}
                      </span>
                      <span className="ml-auto text-sm text-gray-500">
                        {cat.article_count} post
                        {cat.article_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {editing !== cat.id && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(cat.id)}
                      className="rounded px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="rounded px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Use arrows to reorder. Article counts update automatically. Categories
        appear in blog filters once created.
      </p>
    </div>
  );
}

function EditCategoryForm({
  category,
  onSave,
  onCancel,
}: {
  category: Category;
  onSave: (updates: Partial<Category>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(
    category.description ?? ""
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-40 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-[#2563EB]"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="flex-1 min-w-[120px] rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-[#2563EB]"
      />
      <button
        type="button"
        onClick={() =>
          onSave({ name, description: description || null })
        }
        className="rounded bg-[#2563EB] px-2 py-1 text-xs font-medium text-white"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </div>
  );
}
