"use client";

import { useState, useRef, useEffect } from "react";

interface PublishControlsProps {
  primaryLabel: string;
  saving: boolean;
  onPrimary: () => Promise<void>;
  onSaveDraft: () => Promise<void>;
  onPublishNow: () => Promise<void>;
  onSchedule: (iso: string) => Promise<void>;
  /** Edit mode only — moves article to archived status */
  onArchive?: () => Promise<void>;
}

export function PublishControls({
  primaryLabel,
  saving,
  onPrimary,
  onSaveDraft,
  onPublishNow,
  onSchedule,
  onArchive,
}: PublishControlsProps) {
  const [open, setOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [dt, setDt] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function runSchedule() {
    if (!dt) {
      alert("Pick a date and time.");
      return;
    }
    const iso = new Date(dt).toISOString();
    await onSchedule(iso);
    setScheduleOpen(false);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative flex items-center gap-0">
      <button
        type="button"
        onClick={() => onPrimary()}
        disabled={saving}
        className="rounded-l-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        {saving ? "Saving…" : primaryLabel}
      </button>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
        aria-expanded={open}
        aria-haspopup="menu"
        className="-ml-px rounded-r-lg border border-[#2563EB] bg-[#2563EB] px-2 py-2 text-white hover:bg-[#1D4ED8] disabled:opacity-50"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            onClick={async () => {
              await onSaveDraft();
              setOpen(false);
            }}
          >
            Save as Draft
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            onClick={async () => {
              await onPublishNow();
              setOpen(false);
            }}
          >
            Publish Now
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setScheduleOpen((s) => !s)}
          >
            Schedule…
          </button>
          {scheduleOpen && (
            <div className="border-t border-gray-100 px-3 py-3">
              <label className="block text-xs font-medium text-gray-500">
                Publish at (local time)
              </label>
              <input
                type="datetime-local"
                value={dt}
                onChange={(e) => setDt(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => runSchedule()}
                disabled={saving}
                className="mt-2 w-full rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Confirm schedule
              </button>
            </div>
          )}
          {onArchive && (
            <button
              type="button"
              role="menuitem"
              className="block w-full border-t border-gray-100 px-4 py-2 text-left text-sm text-amber-800 hover:bg-amber-50"
              onClick={async () => {
                await onArchive();
                setOpen(false);
              }}
            >
              Archive
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function publishPrimaryLabel(article: {
  status?: string;
  scheduled_for?: string | null;
}): string {
  const s = article.status ?? "draft";
  if (s === "scheduled") {
    if (article.scheduled_for) {
      return `Scheduled for ${new Date(article.scheduled_for).toLocaleString()}`;
    }
    return "Scheduled";
  }
  if (s === "draft") return "Save as Draft";
  if (s === "published") return "Update";
  if (s === "archived") return "Save";
  return "Publish Now";
}
