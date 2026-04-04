"use client";

import { useEffect, useState } from "react";
import type { BlogSettings } from "@/types";
import { BlogSettingsForm } from "@/components/admin/blog-settings-form";
import { NavMenuEditor } from "@/components/admin/nav-menu-editor";

export default function SettingsPage() {
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: BlogSettings) => {
        setSettings({
          ...data,
          scheduled_publishing_enabled:
            data.scheduled_publishing_enabled ?? true,
        });
        setLoading(false);
      });
  }, []);

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#2563EB]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Blog Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Configure your blog&apos;s identity, layout, and features
      </p>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_400px]">
        <BlogSettingsForm initialSettings={settings} />
        <div>
          <NavMenuEditor />
        </div>
      </div>
    </div>
  );
}
