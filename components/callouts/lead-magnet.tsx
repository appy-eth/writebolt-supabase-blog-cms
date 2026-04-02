"use client";

import { useState } from "react";

interface LeadMagnetProps {
  title: string;
  description: string;
  buttonText?: string;
  imageUrl?: string;
  formAction?: string;
}

export function LeadMagnet({
  title,
  description,
  buttonText = "Download Free",
  imageUrl,
  formAction,
}: LeadMagnetProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !formAction) return;

    setSubmitting(true);
    try {
      await fetch(formAction, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        mode: "no-cors",
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="my-8 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white sm:flex-row dark:border-gray-700 dark:bg-gray-800"
      role="complementary"
      aria-label="Lead magnet"
    >
      {imageUrl && (
        <div className="sm:w-1/3">
          <img
            src={imageUrl}
            alt={title}
            className="h-48 w-full object-cover sm:h-full"
            loading="lazy"
          />
        </div>
      )}
      <div className={`flex-1 p-6 ${imageUrl ? "" : "sm:p-8"}`}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>

        {formAction && !submitted ? (
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <label htmlFor="lead-magnet-email" className="sr-only">
              Email address
            </label>
            <input
              id="lead-magnet-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
            <button
              type="submit"
              disabled={submitting}
              className="shrink-0 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
            >
              {submitting ? "..." : buttonText}
            </button>
          </form>
        ) : formAction && submitted ? (
          <p className="mt-4 text-sm font-medium text-green-600 dark:text-green-400">
            Check your email for the download link!
          </p>
        ) : (
          <a
            href="#"
            className="mt-4 inline-block rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            {buttonText}
          </a>
        )}
      </div>
    </div>
  );
}
