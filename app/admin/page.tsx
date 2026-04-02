"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Article } from "@/types";

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    const res = await fetch("/api/admin/articles");
    if (res.ok) {
      setArticles(await res.json());
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this article?")) return;
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your blog articles
          </p>
        </div>
        <Link
          href="/admin/new"
          className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Article
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="mt-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No articles yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first article.
          </p>
          <Link
            href="/admin/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8]"
          >
            Write your first article
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">
                  Status
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
                  Category
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <Link
                        href={`/admin/edit/${article.id}`}
                        className="font-medium text-gray-900 hover:text-[#2563EB]"
                      >
                        {article.headline}
                      </Link>
                      <p className="mt-0.5 text-xs text-gray-500">
                        /{article.slug}
                      </p>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 sm:table-cell">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    {article.category ? (
                      <span className="text-sm text-gray-600">
                        {article.category}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="hidden px-6 py-4 lg:table-cell">
                    <span className="text-sm text-gray-500">
                      {new Date(article.updated_at).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/edit/${article.id}`}
                        className="rounded px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        Edit
                      </Link>
                      <a
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        View
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(article.id)}
                        className="rounded px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-green-50 text-green-700 ring-green-600/20",
    draft: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    archived: "bg-gray-50 text-gray-600 ring-gray-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  );
}
