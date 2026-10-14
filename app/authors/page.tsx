import type { Metadata } from "next";
import { getAuthors, getBlogSettings } from "@/lib/supabase/queries";
import { AuthorCard } from "@/components/author/author-card";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBlogSettings();
  return {
    title: `Authors — ${settings.site_name}`,
    description: `Meet the authors of ${settings.site_name}`,
  };
}

export default async function AuthorsPage() {
  const authors = await getAuthors();
  const settings = await getBlogSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#111827]">Authors</h1>
      <p className="mt-2 text-[#6B7280]">
        Meet the people behind {settings.site_name}.
      </p>

      {authors.length === 0 ? (
        <p className="mt-8 text-[#6B7280]">No authors yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {authors.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      )}
    </div>
  );
}
