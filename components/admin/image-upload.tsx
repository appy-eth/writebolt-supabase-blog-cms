"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const { url } = await res.json();
        onChange(url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-1">
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="h-40 w-full rounded-lg border border-gray-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-gray-600 shadow hover:bg-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/blog/image.jpg or paste URL"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}
    </div>
  );
}
