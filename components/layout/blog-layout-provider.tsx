import { getBlogSettings, getNavItems } from "@/lib/supabase/queries";
import { BlogHeader } from "./blog-header";
import { BlogFooter } from "./blog-footer";

export async function BlogLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getBlogSettings();
  const navItems = await getNavItems();

  const showHeader =
    settings.layout_mode === "standalone" ||
    settings.layout_mode === "custom";
  const showFooter =
    settings.layout_mode === "standalone" ||
    settings.layout_mode === "custom";

  return (
    <>
      {showHeader && settings.show_header && (
        <BlogHeader settings={settings} navItems={navItems} />
      )}
      <main className="min-h-screen">{children}</main>
      {showFooter && settings.show_footer && (
        <BlogFooter settings={settings} />
      )}
    </>
  );
}
