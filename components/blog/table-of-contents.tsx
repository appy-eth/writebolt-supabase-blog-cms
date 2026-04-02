"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const article = document.querySelector("article, .prose");
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3");
    const items: TocItem[] = Array.from(elements).map((el) => {
      if (!el.id) {
        el.id = el.textContent
          ?.toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-") ?? "";
      }
      return {
        id: el.id,
        text: el.textContent ?? "",
        level: el.tagName === "H2" ? 2 : 3,
      };
    });

    setHeadings(items);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile: collapsible */}
      <div className="xl:hidden mb-8">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          aria-expanded={isOpen}
          aria-controls="toc-mobile"
        >
          Table of Contents
          <svg
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {isOpen && (
          <nav id="toc-mobile" className="mt-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900" aria-label="Table of contents">
            <TocList headings={headings} activeId={activeId} />
          </nav>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <nav className="hidden xl:block sticky top-24 w-64 shrink-0" aria-label="Table of contents">
        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 dark:text-gray-100">
          Table of Contents
        </h4>
        <TocList headings={headings} activeId={activeId} />
      </nav>
    </>
  );
}

function TocList({
  headings,
  activeId,
}: {
  headings: TocItem[];
  activeId: string;
}) {
  return (
    <ul className="space-y-2">
      {headings.map((heading) => (
        <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
          <a
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(heading.id)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className={`block text-sm leading-relaxed transition-colors ${
              activeId === heading.id
                ? "font-medium text-[#2563EB]"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
