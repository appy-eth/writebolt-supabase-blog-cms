"use client";

import { useState } from "react";

interface AIAssistToolbarProps {
  headline: string;
  content: string;
  selectedText: string;
  onContentUpdate: (content: string) => void;
  onExcerptGenerated: (excerpt: string) => void;
  onHeadlinesGenerated: (headlines: string[]) => void;
  hasApiKey: boolean;
}

export function AIAssistToolbar({
  headline,
  content,
  selectedText,
  onContentUpdate,
  onExcerptGenerated,
  onHeadlinesGenerated,
  hasApiKey,
}: AIAssistToolbarProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function callAI(action: string, body: Record<string, any>) {
    setLoading(action);
    try {
      const res = await fetch(`/api/ai/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "AI request failed");
        return null;
      }
      return await res.json();
    } catch {
      alert("AI request failed");
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function handleGenerateDraft() {
    const topic = headline || prompt("Enter a topic for the draft:");
    if (!topic) return;
    if (
      content &&
      !confirm("This will replace the current content. Continue?")
    )
      return;

    const result = await callAI("generate-draft", { topic });
    if (result?.content) onContentUpdate(result.content);
  }

  async function handleRewrite() {
    if (!selectedText) {
      alert("Select some text in the editor first.");
      return;
    }
    const result = await callAI("rewrite", { text: selectedText });
    if (result?.content) {
      onContentUpdate(content.replace(selectedText, result.content));
    }
  }

  async function handleExpand() {
    if (!selectedText) {
      alert("Select some text in the editor first.");
      return;
    }
    const result = await callAI("expand", { text: selectedText });
    if (result?.content) {
      onContentUpdate(content.replace(selectedText, result.content));
    }
  }

  async function handleSuggestHeadlines() {
    const topic = headline || "this article";
    const result = await callAI("suggest-headline", { topic });
    if (result?.headlines) onHeadlinesGenerated(result.headlines);
  }

  async function handleGenerateExcerpt() {
    if (!content) {
      alert("Write some content first.");
      return;
    }
    const result = await callAI("generate-excerpt", { content });
    if (result?.excerpt) onExcerptGenerated(result.excerpt);
  }

  if (!hasApiKey) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-2.5">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
        </svg>
        <span className="text-sm text-gray-500">
          Add your OpenAI API key in{" "}
          <a
            href="/admin/settings/ai"
            className="font-medium text-[#2563EB] hover:underline"
          >
            Settings &rarr; AI
          </a>{" "}
          to enable AI assist.
        </span>
      </div>
    );
  }

  const actions = [
    {
      id: "generate-draft",
      label: "Generate Draft",
      icon: "✨",
      onClick: handleGenerateDraft,
    },
    {
      id: "rewrite",
      label: "Rewrite",
      icon: "🔄",
      onClick: handleRewrite,
    },
    {
      id: "expand",
      label: "Expand",
      icon: "📝",
      onClick: handleExpand,
    },
    {
      id: "suggest-headline",
      label: "Headlines",
      icon: "💡",
      onClick: handleSuggestHeadlines,
    },
    {
      id: "generate-excerpt",
      label: "Excerpt",
      icon: "📋",
      onClick: handleGenerateExcerpt,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <span className="mr-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
        AI
      </span>
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={action.onClick}
          disabled={loading !== null}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
            loading === action.id
              ? "bg-[#2563EB] text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          } disabled:opacity-50`}
        >
          {loading === action.id ? (
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <span>{action.icon}</span>
          )}
          {action.label}
        </button>
      ))}
    </div>
  );
}
