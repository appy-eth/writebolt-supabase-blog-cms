"use client";

interface WriteboltGenerateBtnProps {
  headline?: string;
  siteUrl?: string;
  variant?: "primary" | "inline";
}

export function WriteboltGenerateBtn({
  headline,
  siteUrl,
  variant = "primary",
}: WriteboltGenerateBtnProps) {
  function handleClick() {
    const params = new URLSearchParams();
    if (headline) params.set("topic", headline);
    if (siteUrl) params.set("url", siteUrl);
    params.set("ref", "blog-template");

    window.open(
      `https://writebolt.com/?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:underline"
      >
        <span>⚡</span>
        Generate with Writebolt
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-[#2563EB]/20 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚡</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            Generate with Writebolt
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Get a researched, SEO-optimized article with internal links and
            external citations.
          </p>
          <button
            type="button"
            onClick={handleClick}
            className="mt-3 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors"
          >
            Try Writebolt Free
          </button>
          <p className="mt-2 text-xs text-gray-400">
            Full research + SEO + internal links + citations
          </p>
        </div>
      </div>
    </div>
  );
}
