"use client";

import { useEffect, useRef, useState } from "react";
import type { ImageMeta } from "@/lib/storage/provider";

export function MediaLibrary() {
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    const res = await fetch("/api/admin/media");
    if (res.ok) setImages(await res.json());
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    setUploading(false);
    fetchImages();

    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(path: string) {
    if (!confirm("Delete this image?")) return;
    await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    fetchImages();
  }

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  function formatSize(bytes?: number) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Media Library
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {images.length} image{images.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No images yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload images to use in your articles.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.path}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex w-full items-center justify-between p-3">
                  <button
                    type="button"
                    onClick={() => handleCopy(image.url)}
                    className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-white"
                  >
                    {copied === image.url ? "Copied!" : "Copy URL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(image.path)}
                    className="rounded-md bg-red-500/90 p-1 text-white hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="px-3 py-2">
                <p className="truncate text-xs font-medium text-gray-700">
                  {image.name}
                </p>
                {image.size && (
                  <p className="text-xs text-gray-400">
                    {formatSize(image.size)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
