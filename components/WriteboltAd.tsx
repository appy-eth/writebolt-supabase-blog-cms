"use client";

import { useEffect, useRef, useState } from "react";

export type WriteboltAdPlacement = "sidebar" | "in-article" | "footer";

export interface WriteboltAdProps {
  placement: WriteboltAdPlacement;
  /** Registered site ID for revenue share (optional — house ads if omitted) */
  siteId?: string;
}

type AdPayload = {
  ad_id: string;
  headline: string;
  body: string;
  cta: string;
  url: string;
  image_url?: string | null;
  style?: "minimal" | "card" | "banner";
};

const DEFAULT_API = "https://api.writebolt.app";

function adsApiBase(): string {
  if (typeof process.env.NEXT_PUBLIC_WRITEBOLT_ADS_API_URL === "string") {
    return process.env.NEXT_PUBLIC_WRITEBOLT_ADS_API_URL.replace(/\/$/, "");
  }
  return DEFAULT_API;
}

export function WriteboltAd({ placement, siteId }: WriteboltAdProps) {
  const [ad, setAd] = useState<AdPayload | null>(null);
  const impressionSent = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const base = adsApiBase();
    const params = new URLSearchParams();
    params.set("placement", placement);
    if (siteId) params.set("site_id", siteId);
    if (typeof window !== "undefined") {
      params.set("url", window.location.href);
    }

    fetch(`${base}/ads/serve?${params.toString()}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AdPayload | null) => {
        if (cancelled || !data?.ad_id) return;
        setAd(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [placement, siteId]);

  useEffect(() => {
    if (!ad?.ad_id || impressionSent.current) return;
    impressionSent.current = true;
    const base = adsApiBase();
    const q = new URLSearchParams({ ad_id: ad.ad_id });
    if (siteId) q.set("site_id", siteId);
    const img = new Image();
    img.alt = "";
    img.width = 1;
    img.height = 1;
    img.src = `${base}/ads/impression?${q.toString()}`;
  }, [ad, siteId]);

  if (!ad) return null;

  const base = adsApiBase();
  const clickParams = new URLSearchParams({ ad_id: ad.ad_id });
  if (siteId) clickParams.set("site_id", siteId);
  const clickHref = `${base}/ads/click?${clickParams.toString()}`;

  const style = ad.style ?? "card";
  const shell =
    placement === "sidebar"
      ? "max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      : placement === "footer"
        ? "w-full rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/80"
        : "my-10 w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900";

  const minimal = style === "minimal";

  return (
    <aside
      className={shell}
      data-writebolt-ad={placement}
      aria-label="Advertisement"
    >
      {!minimal && ad.image_url ? (
        <a
          href={clickHref}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mb-3 block overflow-hidden rounded-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.image_url}
            alt=""
            className="h-auto w-full object-cover"
          />
        </a>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Sponsored
      </p>
      <h3 className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
        <a
          href={clickHref}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="hover:text-brand dark:hover:text-blue-400"
        >
          {ad.headline}
        </a>
      </h3>
      {ad.body ? (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{ad.body}</p>
      ) : null}
      <a
        href={clickHref}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mt-3 inline-flex items-center text-sm font-medium text-brand hover:underline dark:text-blue-400"
      >
        {ad.cta}
      </a>
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        <a
          href="https://writebolt.com/?ref=ad-attribution"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Ad by Writebolt
        </a>
      </p>
    </aside>
  );
}
