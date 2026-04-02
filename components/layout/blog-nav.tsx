"use client";

import { useState } from "react";
import type { NavItem } from "@/types";

interface BlogNavProps {
  navItems: NavItem[];
}

export function BlogNav({ navItems }: BlogNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (navItems.length === 0) return null;

  return (
    <nav aria-label="Blog navigation">
      {/* Mobile menu button */}
      <button
        type="button"
        className="sm:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
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

      {/* Desktop nav */}
      <ul className="hidden sm:flex items-center gap-6">
        {navItems.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target={item.open_in_new_tab ? "_blank" : undefined}
              rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile nav */}
      {mobileOpen && (
        <ul className="absolute left-0 right-0 top-full z-50 border-b border-gray-200 bg-white px-4 py-4 sm:hidden dark:border-gray-800 dark:bg-gray-950">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target={item.open_in_new_tab ? "_blank" : undefined}
                rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                className="block py-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
