import type { BlogSettings, Category } from "@/types";
import { BlogNav } from "./blog-nav";
import { ThemeToggle } from "./theme-toggle";

interface BlogHeaderProps {
  settings: BlogSettings;
  categories: Category[];
}

export function BlogHeader({ settings, categories }: BlogHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6">
          <a
            href="/blog"
            className="flex shrink-0 items-center gap-3"
          >
            {settings.logo_url && (
              <img
                src={settings.logo_url}
                alt={settings.blog_name}
                className="h-8 w-auto"
              />
            )}
            <span className="font-serif text-xl font-bold text-gray-900 dark:text-gray-100">
              {settings.blog_name}
            </span>
          </a>
          <BlogNav categories={categories} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
