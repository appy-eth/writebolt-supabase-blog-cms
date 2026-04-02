"use client";

import { useCallback, useRef, useEffect } from "react";

interface ArticleEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange?: (selectedText: string) => void;
}

export function ArticleEditor({
  content,
  onChange,
  onSelectionChange,
}: ArticleEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !onSelectionChange) return;

    function handleSelect() {
      const ta = textareaRef.current;
      if (!ta) return;
      const selected = ta.value.slice(ta.selectionStart, ta.selectionEnd);
      onSelectionChange!(selected);
    }

    textarea.addEventListener("select", handleSelect);
    textarea.addEventListener("mouseup", handleSelect);
    textarea.addEventListener("keyup", handleSelect);

    return () => {
      textarea.removeEventListener("select", handleSelect);
      textarea.removeEventListener("mouseup", handleSelect);
      textarea.removeEventListener("keyup", handleSelect);
    };
  }, [onSelectionChange]);

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = content.slice(start, end);
      const replacement = `${prefix}${selected}${suffix}`;
      const newContent =
        content.slice(0, start) + replacement + content.slice(end);

      onChange(newContent);

      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = start + prefix.length + selected.length;
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [content, onChange]
  );

  const toolbarActions = [
    { label: "B", title: "Bold", action: () => insertMarkdown("**", "**") },
    { label: "I", title: "Italic", action: () => insertMarkdown("*", "*") },
    { label: "H2", title: "Heading 2", action: () => insertMarkdown("\n## ") },
    { label: "H3", title: "Heading 3", action: () => insertMarkdown("\n### ") },
    { label: "Link", title: "Link", action: () => insertMarkdown("[", "](url)") },
    { label: "Img", title: "Image", action: () => insertMarkdown("![alt](", ")") },
    { label: "UL", title: "Bullet list", action: () => insertMarkdown("\n- ") },
    { label: "OL", title: "Numbered list", action: () => insertMarkdown("\n1. ") },
    { label: "Quote", title: "Blockquote", action: () => insertMarkdown("\n> ") },
    { label: "Code", title: "Code", action: () => insertMarkdown("`", "`") },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        {toolbarActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.action}
            title={action.title}
            className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your article in Markdown..."
        className="block min-h-[500px] w-full resize-y border-0 px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 outline-none"
        spellCheck
      />
    </div>
  );
}
