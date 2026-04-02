"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const article = document.querySelector("article, .prose");
    if (!article) return;

    function handleScroll() {
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const scrolled = window.scrollY - articleTop;
      const windowHeight = window.innerHeight;

      const pct = Math.min(
        100,
        Math.max(0, (scrolled / (articleHeight - windowHeight)) * 100)
      );

      setProgress(pct);
      setVisible(scrolled > 100);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 h-[3px] bg-gray-100 dark:bg-gray-800"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-[#2563EB] transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
