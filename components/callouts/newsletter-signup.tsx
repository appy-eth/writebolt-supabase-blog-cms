"use client";

import { useState } from "react";

interface NewsletterSignupProps {
  formAction: string;
  title?: string;
  description?: string;
  successMessage?: string;
  showNameField?: boolean;
  variant?: "card" | "inline" | "footer";
}

export function NewsletterSignup({
  formAction,
  title = "Subscribe to our newsletter",
  description = "Get the latest articles delivered to your inbox.",
  successMessage = "Thanks for subscribing!",
  showNameField = false,
  variant = "card",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setError(null);

    try {
      await fetch(formAction, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, first_name: firstName || undefined }),
        mode: "no-cors",
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        className={`rounded-xl p-6 text-center ${
          variant === "footer"
            ? ""
            : "border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
        }`}
      >
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          {successMessage}
        </p>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="my-8" role="form" aria-label="Newsletter signup">
        <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <label htmlFor="newsletter-email-inline" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email-inline"
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
            {submitting ? "..." : "Subscribe"}
          </button>
        </form>
        {error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div role="form" aria-label="Newsletter signup">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <label htmlFor="newsletter-email-footer" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email-footer"
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
            {submitting ? "..." : "Subscribe"}
          </button>
        </form>
        {error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }

  // variant === "card"
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      role="form"
      aria-label="Newsletter signup"
    >
      <h3 className="font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {showNameField && (
          <div>
            <label
              htmlFor="newsletter-name"
              className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
            >
              First name (optional)
            </label>
            <input
              id="newsletter-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
        )}
        <div>
          <label htmlFor="newsletter-email-card" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email-card"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
        >
          {submitting ? "Subscribing..." : "Subscribe"}
        </button>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
}
