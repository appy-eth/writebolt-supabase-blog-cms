"use client";

import { useState } from "react";
import type { Article } from "@/types";
import { ArticleCard } from "./article-card";

type TabKey = "featured" | "latest" | "popular";

interface ViewTabsProps {
  latestArticles: Article[];
  popularArticles: Article[];
}

export function ViewTabs({ latestArticles, popularArticles }: ViewTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("latest");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "featured", label: "Featured" },
    { key: "latest", label: "Latest" },
    { key: "popular", label: "Popular" },
  ];

  function getArticles(): Article[] {
    switch (activeTab) {
      case "popular":
        return popularArticles.length > 0 ? popularArticles : latestArticles;
      case "featured":
      case "latest":
      default:
        return latestArticles;
    }
  }

  const articles = getArticles();

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-8" role="tablist" aria-label="Article views">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative pb-2 text-base font-medium transition-colors ${
              activeTab === tab.key
                ? "text-[#2563EB]"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#2563EB]" />
            )}
          </button>
        ))}
      </div>

      {/* Article grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="tabpanel">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No articles published yet.
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Visit{" "}
            <a href="/admin/new" className="text-[#2563EB] hover:underline">
              /admin/new
            </a>{" "}
            to write your first article.
          </p>
        </div>
      )}
    </div>
  );
}
