import type { BlogSettings, NavItem } from "@/types";
import { BlogNav } from "./blog-nav";
import { ThemeToggle } from "./theme-toggle";

interface BlogHeaderProps {
  settings: BlogSettings;
  navItems: NavItem[];
}

export function BlogHeader({ settings, navItems }: BlogHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="/blog" className="flex items-center gap-3">
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
        <div className="flex items-center gap-2">
          <BlogNav navItems={navItems} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
