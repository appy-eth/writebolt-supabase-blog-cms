"use client";

import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory?: string;
}

export function CategoryFilter({
  categories,
  activeCategory,
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Filter by category">
      <a
        href="/blog"
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          !activeCategory
            ? "bg-[#2563EB] text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        }`}
      >
        All
      </a>
      {categories.map((cat) => (
        <a
          key={cat.id}
          href={`/blog/category/${cat.slug}`}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === cat.slug
              ? "bg-[#2563EB] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          {cat.name}
        </a>
      ))}
    </nav>
  );
}
