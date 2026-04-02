"use client";

import { useState } from "react";

interface AIImageGeneratorProps {
  open: boolean;
  onClose: () => void;
  onImageGenerated: (url: string, altText: string) => void;
  mode: "featured" | "inline";
}

const STYLES = [
  "Photorealistic",
  "Illustrated",
  "Minimal",
  "Editorial",
  "Watercolor",
  "3D Render",
];

export function AIImageGenerator({
  open,
  onClose,
  onImageGenerated,
  mode,
}: AIImageGeneratorProps) {
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("Photorealistic");
  const [altText, setAltText] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleGenerate() {
    if (!description) return;
    setGenerating(true);
    setError(null);
    setGeneratedUrl(null);

    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          style: style.toLowerCase(),
          size: mode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      setGeneratedUrl(data.url);
      setAltText(data.altText || description);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  function handleUse() {
    if (generatedUrl) {
      onImageGenerated(generatedUrl, altText);
      handleReset();
      onClose();
    }
  }

  function handleReset() {
    setDescription("");
    setStyle("Photorealistic");
    setAltText("");
    setGeneratedUrl(null);
    setError(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Generate Image
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe your image
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A modern office with people discussing financial charts on a whiteboard"
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Style picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    style === s
                      ? "bg-[#2563EB] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!description || generating}
            className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </span>
            ) : (
              "Generate Image"
            )}
          </button>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Preview */}
          {generatedUrl && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <img
                  src={generatedUrl}
                  alt={altText}
                  className="w-full object-cover"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Alt text
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={handleUse}
                  className="flex-1 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  Use This Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
