import type { BlogSettings } from "@/types";

/** Standalone or custom layout with the site header visible. */
export function blogHasBrandedHeader(settings: BlogSettings): boolean {
  return (
    (settings.layout_mode === "standalone" ||
      settings.layout_mode === "custom") &&
    settings.show_header
  );
}

/**
 * Extra page-level blog title (h1). Skip when the branded header already shows the name.
 */
export function shouldShowPageBlogTitle(settings: BlogSettings): boolean {
  return settings.show_blog_title && !blogHasBrandedHeader(settings);
}

export function isEmbeddedBlogLayout(settings: BlogSettings): boolean {
  return settings.layout_mode === "embedded";
}
