"use client";

import { useEffect, useState } from "react";

interface AISettingsState {
  has_openai_key: boolean;
  has_replicate_key: boolean;
  image_provider: string;
  default_tone: string;
  default_image_style: string;
}

export function AISettingsForm() {
  const [settings, setSettings] = useState<AISettingsState | null>(null);
  const [openaiKey, setOpenaiKey] = useState("");
  const [replicateKey, setReplicateKey] = useState("");
  const [imageProvider, setImageProvider] = useState("openai");
  const [defaultTone, setDefaultTone] = useState("professional");
  const [defaultStyle, setDefaultStyle] = useState("photorealistic");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ai-settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setImageProvider(data.image_provider || "openai");
        setDefaultTone(data.default_tone || "professional");
        setDefaultStyle(data.default_image_style || "photorealistic");
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const body: Record<string, any> = {
        image_provider: imageProvider,
        default_tone: defaultTone,
        default_image_style: defaultStyle,
      };

      if (openaiKey) body.openai_api_key = openaiKey;
      if (replicateKey) body.replicate_api_key = replicateKey;

      const res = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSaved(true);
        setOpenaiKey("");
        setReplicateKey("");
        // Refresh state
        const updated = await fetch("/api/admin/ai-settings").then((r) =>
          r.json()
        );
        setSettings(updated);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save settings");
      }
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* OpenAI */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          OpenAI API Key
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Used for AI writing assist and DALL-E image generation.
        </p>

        <div className="mt-4">
          {settings?.has_openai_key && (
            <p className="mb-2 text-sm text-green-600 font-medium">
              Key configured (encrypted)
            </p>
          )}
          <input
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder={
              settings?.has_openai_key
                ? "Enter new key to replace"
                : "sk-..."
            }
            className="input"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Your key is encrypted with AES-256-GCM before storage. It is
            only decrypted server-side when making API calls.
          </p>
        </div>
      </div>

      {/* Image Provider */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Image Provider
        </h2>

        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="image_provider"
              value="openai"
              checked={imageProvider === "openai"}
              onChange={() => setImageProvider("openai")}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                OpenAI DALL-E 3
              </span>
              <p className="text-xs text-gray-500">
                Best quality for photorealistic and illustrated styles
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="image_provider"
              value="replicate"
              checked={imageProvider === "replicate"}
              onChange={() => setImageProvider("replicate")}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Replicate Flux
              </span>
              <p className="text-xs text-gray-500">
                Faster, cheaper — good for high-volume generation
              </p>
            </div>
          </label>
        </div>

        {imageProvider === "replicate" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Replicate API Key
            </label>
            {settings?.has_replicate_key && (
              <p className="mb-2 text-sm text-green-600 font-medium">
                Key configured (encrypted)
              </p>
            )}
            <input
              type="password"
              value={replicateKey}
              onChange={(e) => setReplicateKey(e.target.value)}
              placeholder={
                settings?.has_replicate_key
                  ? "Enter new key to replace"
                  : "r8_..."
              }
              className="input"
            />
            <p className="mt-1 text-xs text-gray-400">
              Only needed if using Replicate for image generation.
            </p>
          </div>
        )}
      </div>

      {/* Defaults */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Defaults</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Tone
            </label>
            <select
              value={defaultTone}
              onChange={(e) => setDefaultTone(e.target.value)}
              className="input"
            >
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="academic">Academic</option>
              <option value="friendly">Friendly</option>
              <option value="authoritative">Authoritative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Image Style
            </label>
            <select
              value={defaultStyle}
              onChange={(e) => setDefaultStyle(e.target.value)}
              className="input"
            >
              <option value="photorealistic">Photorealistic</option>
              <option value="illustrated">Illustrated</option>
              <option value="minimal">Minimal</option>
              <option value="editorial">Editorial</option>
              <option value="watercolor">Watercolor</option>
              <option value="3d-render">3D Render</option>
            </select>
          </div>
        </div>
      </div>

      {/* Writebolt Integration */}
      <div className="rounded-xl border border-dashed border-[#2563EB]/30 bg-blue-50/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Writebolt Integration
          <span className="ml-2 text-xs font-normal text-gray-400">
            Optional
          </span>
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          For researched, SEO-optimized articles with internal links and
          external citations, connect to the Writebolt platform.
        </p>
        <a
          href="https://writebolt.com/api"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:underline"
        >
          Get a free API key at writebolt.com
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && (
          <span className="text-sm font-medium text-green-600">
            Settings saved!
          </span>
        )}
      </div>
    </div>
  );
}
