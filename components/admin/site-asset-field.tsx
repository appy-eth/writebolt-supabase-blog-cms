"use client";

import { useRef, useState } from "react";

interface SiteAssetFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder: string;
  /** Shown in helper text */
  relativeDir: string;
}

export function SiteAssetField({
  label,
  value,
  onChange,
  placeholder,
  relativeDir,
}: SiteAssetFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "site");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const { url } = await res.json();
        onChange(url);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input flex-1"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.ico"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Files are saved under <code className="rounded bg-gray-100 px-1">{relativeDir}</code>{" "}
        in your repo (or your storage bucket when using Supabase Storage).
      </p>
    </div>
  );
}
