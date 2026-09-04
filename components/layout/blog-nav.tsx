"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { Category } from "@/types";

interface BlogNavProps {
  categories: Category[];
}

export function BlogNav({ categories }: BlogNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  if (categories.length === 0) return null;

  function isActive(slug: string) {
    return pathname === `/blog/category/${slug}`;
  }

  return (
    <nav
      className="relative min-w-0 flex-1"
      aria-label="Blog categories"
    >
      <button
        type="button"
        className="sm:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle categories menu"
        aria-expanded={mobileOpen}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          {mobileOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
      </button>

      <ul className="hidden flex-wrap items-center gap-x-5 gap-y-1 sm:flex lg:gap-x-6">
        {categories.map((cat) => (
          <li key={cat.id}>
            <a
              href={`/blog/category/${cat.slug}`}
              className={`text-sm font-medium transition-colors lg:text-base ${
                isActive(cat.slug)
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              {cat.name}
            </a>
          </li>
        ))}
      </ul>

      {mobileOpen && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 bg-white py-2 shadow-lg sm:hidden dark:border-gray-800 dark:bg-gray-950">
          {categories.map((cat) => (
            <li key={cat.id}>
              <a
                href={`/blog/category/${cat.slug}`}
                className="block px-4 py-2.5 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
              >
                {cat.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
