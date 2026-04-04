"use client";

import { useState } from "react";
import type { BlogSettings } from "@/types";

export function EmailCaptureInline({ settings }: { settings: BlogSettings }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = settings.inline_cta_heading ?? "";
  const sub = settings.inline_cta_subheading ?? "";
  const placeholder =
    settings.inline_cta_email_placeholder?.trim() || "Enter your email";
  const buttonText = settings.inline_cta_button_text ?? "Subscribe";
  const redirect = settings.inline_cta_success_redirect_url?.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          listIdOverride: settings.inline_cta_list_id || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Something went wrong."
        );
        return;
      }
      if (redirect) {
        window.location.href = redirect;
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div
        className="my-8 rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950/30"
        role="status"
      >
        <p className="text-sm font-medium text-green-800 dark:text-green-300">
          {settings.newsletter_success_message}
        </p>
      </div>
    );
  }

  return (
    <div
      className="my-8 rounded-xl border border-[#2563EB]/20 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 dark:border-blue-800/30 dark:from-blue-950/30 dark:to-indigo-950/30"
      role="complementary"
      aria-label="Email signup"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
        {heading}
      </h3>
      {sub ? (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
          {sub}
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="inline-cta-email" className="sr-only">
          Email
        </label>
        <input
          id="inline-cta-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          {submitting ? "…" : buttonText}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
