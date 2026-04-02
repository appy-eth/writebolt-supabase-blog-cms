import { BlogLayoutProvider } from "@/components/layout/blog-layout-provider";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BlogLayoutProvider>{children}</BlogLayoutProvider>;
}
