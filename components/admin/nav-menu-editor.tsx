"use client";

import { useEffect, useState } from "react";
import type { NavItem } from "@/types";

export function NavMenuEditor() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ label: "", url: "" });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const res = await fetch("/api/admin/nav");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  async function handleAdd() {
    if (!newItem.label || !newItem.url) return;
    const isExternal = newItem.url.startsWith("http");
    const res = await fetch("/api/admin/nav", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newItem,
        open_in_new_tab: isExternal,
        display_order: items.length,
      }),
    });
    if (res.ok) {
      setNewItem({ label: "", url: "" });
      setShowAdd(false);
      fetchItems();
    }
  }

  async function handleUpdate(id: string, updates: Partial<NavItem>) {
    await fetch(`/api/admin/nav/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setEditing(null);
    fetchItems();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/admin/nav/${id}`, { method: "DELETE" });
    fetchItems();
  }

  async function moveItem(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setItems(reordered);

    await fetch("/api/admin/nav", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderedIds: reordered.map((i) => i.id),
      }),
    });
  }

  if (loading) {
    return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Navigation Menu
        </h2>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="text-sm font-medium text-[#2563EB] hover:underline"
        >
          + Add Item
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 flex gap-2 rounded-lg border border-dashed border-gray-300 p-3">
          <input
            type="text"
            value={newItem.label}
            onChange={(e) =>
              setNewItem((p) => ({ ...p, label: e.target.value }))
            }
            placeholder="Label"
            className="flex-1 rounded border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
          />
          <input
            type="text"
            value={newItem.url}
            onChange={(e) =>
              setNewItem((p) => ({ ...p, url: e.target.value }))
            }
            placeholder="/about or https://..."
            className="flex-1 rounded border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="shrink-0 rounded bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1D4ED8]"
          >
            Add
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">
          No menu items yet. Add some to configure your header navigation.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-3"
            >
              {/* Reorder buttons */}
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
                  disabled={index === items.length - 1}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {editing === item.id ? (
                  <EditItemForm
                    item={item}
                    onSave={(updates) => handleUpdate(item.id, updates)}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.label}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {item.url}
                    </span>
                    {item.open_in_new_tab && (
                      <span className="ml-1.5 text-xs text-gray-400">
                        ↗
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              {editing !== item.id && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(item.id)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Use arrows to reorder. External links auto-open in new tab.
      </p>
    </div>
  );
}

function EditItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: NavItem;
  onSave: (updates: Partial<NavItem>) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(item.label);
  const [url, setUrl] = useState(item.url);
  const [openInNewTab, setOpenInNewTab] = useState(item.open_in_new_tab);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-28 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-[#2563EB]"
      />
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 min-w-[120px] rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-[#2563EB]"
      />
      <label className="flex items-center gap-1 text-xs text-gray-500">
        <input
          type="checkbox"
          checked={openInNewTab}
          onChange={(e) => setOpenInNewTab(e.target.checked)}
        />
        New tab
      </label>
      <button
        type="button"
        onClick={() => onSave({ label, url, open_in_new_tab: openInNewTab })}
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
