"use client";

import { useState } from "react";
import type { BlogSettings } from "@/types";

interface BlogSettingsFormProps {
  initialSettings: BlogSettings;
}

export function BlogSettingsForm({ initialSettings }: BlogSettingsFormProps) {
  const [settings, setSettings] = useState<BlogSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(updates: Partial<BlogSettings>) {
    setSettings((prev) => ({ ...prev, ...updates }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
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

  return (
    <div className="space-y-8">
      {/* Site Identity */}
      <Section title="Site Identity">
        <Field label="Blog Name">
          <input
            type="text"
            value={settings.blog_name}
            onChange={(e) => update({ blog_name: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Description">
          <textarea
            value={settings.blog_description}
            onChange={(e) => update({ blog_description: e.target.value })}
            rows={2}
            className="input resize-none"
          />
        </Field>
        <Field label="Logo URL">
          <input
            type="text"
            value={settings.logo_url ?? ""}
            onChange={(e) => update({ logo_url: e.target.value || null })}
            placeholder="/images/logo.png"
            className="input"
          />
        </Field>
        <Field label="Favicon URL">
          <input
            type="text"
            value={settings.favicon_url ?? ""}
            onChange={(e) => update({ favicon_url: e.target.value || null })}
            placeholder="/favicon.ico"
            className="input"
          />
        </Field>
      </Section>

      {/* Layout */}
      <Section title="Layout">
        <Field label="Layout Mode">
          <div className="space-y-2">
            {(["standalone", "embedded", "custom"] as const).map((mode) => (
              <label key={mode} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="layout_mode"
                  value={mode}
                  checked={settings.layout_mode === mode}
                  onChange={() => update({ layout_mode: mode })}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium capitalize text-gray-900">
                    {mode}
                  </span>
                  <p className="text-xs text-gray-500">
                    {mode === "standalone" &&
                      "Full blog site with header and footer"}
                    {mode === "embedded" &&
                      "No header/footer — use your app's layout"}
                    {mode === "custom" &&
                      "Blog header with your branding and links"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </Field>
        <Checkbox
          label="Show blog heading above articles"
          checked={settings.show_blog_title}
          onChange={(v) => update({ show_blog_title: v })}
        />
        <Checkbox
          label="Show reading time on articles"
          checked={settings.show_reading_time}
          onChange={(v) => update({ show_reading_time: v })}
        />
        <Checkbox
          label="Show table of contents on articles"
          checked={settings.show_table_of_contents}
          onChange={(v) => update({ show_table_of_contents: v })}
        />
        <Checkbox
          label="Show related articles"
          checked={settings.show_related_articles}
          onChange={(v) => update({ show_related_articles: v })}
        />
        <Checkbox
          label="Show author card"
          checked={settings.show_author_card}
          onChange={(v) => update({ show_author_card: v })}
        />
      </Section>

      {/* Content Defaults */}
      <Section title="Content Defaults">
        <Field label="Posts Per Page">
          <input
            type="number"
            value={settings.posts_per_page}
            onChange={(e) =>
              update({ posts_per_page: parseInt(e.target.value) || 10 })
            }
            min={1}
            max={50}
            className="input w-24"
          />
        </Field>
      </Section>

      {/* Image Storage */}
      <Section title="Image Storage">
        <div className="space-y-2">
          {(["local", "supabase"] as const).map((provider) => (
            <label key={provider} className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="image_storage"
                value={provider}
                checked={settings.image_storage_provider === provider}
                onChange={() =>
                  update({ image_storage_provider: provider })
                }
                className="mt-0.5"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {provider === "local"
                    ? "Local (public/images/blog/ — zero config)"
                    : "Supabase Storage (for high-volume blogs)"}
                </span>
              </div>
            </label>
          ))}
        </div>
        {settings.image_storage_provider === "supabase" && (
          <div className="mt-3">
            <Field label="Bucket Name">
              <input
                type="text"
                value={settings.supabase_storage_bucket}
                onChange={(e) =>
                  update({ supabase_storage_bucket: e.target.value })
                }
                className="input"
              />
            </Field>
            <p className="mt-1 text-xs text-amber-600">
              Make sure you&apos;ve created a public bucket named &quot;
              {settings.supabase_storage_bucket}&quot; in your Supabase
              project.
            </p>
          </div>
        )}
      </Section>

      {/* Inline CTA */}
      <Section title="Inline CTA">
        <Checkbox
          label="Enable inline CTA on articles"
          checked={settings.inline_cta_enabled}
          onChange={(v) => update({ inline_cta_enabled: v })}
        />
        {settings.inline_cta_enabled && (
          <div className="mt-3 space-y-3">
            <Field label="Title">
              <input
                type="text"
                value={settings.inline_cta_title ?? ""}
                onChange={(e) =>
                  update({ inline_cta_title: e.target.value || null })
                }
                className="input"
              />
            </Field>
            <Field label="Description">
              <input
                type="text"
                value={settings.inline_cta_description ?? ""}
                onChange={(e) =>
                  update({ inline_cta_description: e.target.value || null })
                }
                className="input"
              />
            </Field>
            <Field label="Button Text">
              <input
                type="text"
                value={settings.inline_cta_button_text ?? ""}
                onChange={(e) =>
                  update({
                    inline_cta_button_text: e.target.value || null,
                  })
                }
                className="input"
              />
            </Field>
            <Field label="Button URL">
              <input
                type="url"
                value={settings.inline_cta_button_url ?? ""}
                onChange={(e) =>
                  update({
                    inline_cta_button_url: e.target.value || null,
                  })
                }
                className="input"
              />
            </Field>
          </div>
        )}
      </Section>

      {/* Sidebar CTA */}
      <Section title="Sidebar CTA">
        <Checkbox
          label="Enable sidebar CTA"
          checked={settings.sidebar_cta_enabled}
          onChange={(v) => update({ sidebar_cta_enabled: v })}
        />
        {settings.sidebar_cta_enabled && (
          <div className="mt-3 space-y-3">
            <Field label="Title">
              <input
                type="text"
                value={settings.sidebar_cta_title ?? ""}
                onChange={(e) =>
                  update({ sidebar_cta_title: e.target.value || null })
                }
                className="input"
              />
            </Field>
            <Field label="Description">
              <input
                type="text"
                value={settings.sidebar_cta_description ?? ""}
                onChange={(e) =>
                  update({
                    sidebar_cta_description: e.target.value || null,
                  })
                }
                className="input"
              />
            </Field>
            <Field label="Button Text">
              <input
                type="text"
                value={settings.sidebar_cta_button_text ?? ""}
                onChange={(e) =>
                  update({
                    sidebar_cta_button_text: e.target.value || null,
                  })
                }
                className="input"
              />
            </Field>
            <Field label="Button URL">
              <input
                type="url"
                value={settings.sidebar_cta_button_url ?? ""}
                onChange={(e) =>
                  update({
                    sidebar_cta_button_url: e.target.value || null,
                  })
                }
                className="input"
              />
            </Field>
            <Field label="Image URL">
              <input
                type="text"
                value={settings.sidebar_cta_image_url ?? ""}
                onChange={(e) =>
                  update({
                    sidebar_cta_image_url: e.target.value || null,
                  })
                }
                className="input"
              />
            </Field>
          </div>
        )}
      </Section>

      {/* Newsletter */}
      <Section title="Newsletter">
        <Checkbox
          label="Enable newsletter signup"
          checked={settings.newsletter_enabled}
          onChange={(v) => update({ newsletter_enabled: v })}
        />
        {settings.newsletter_enabled && (
          <div className="mt-3 space-y-3">
            <Field label="Provider">
              <select
                value={settings.newsletter_provider ?? ""}
                onChange={(e) =>
                  update({
                    newsletter_provider: e.target.value || null,
                  })
                }
                className="input"
              >
                <option value="">Select provider</option>
                <option value="mailchimp">Mailchimp</option>
                <option value="convertkit">ConvertKit</option>
                <option value="buttondown">Buttondown</option>
                <option value="resend">Resend</option>
                <option value="custom">Custom webhook</option>
              </select>
            </Field>
            <Field label="Form Action URL">
              <input
                type="url"
                value={settings.newsletter_form_action ?? ""}
                onChange={(e) =>
                  update({
                    newsletter_form_action: e.target.value || null,
                  })
                }
                placeholder="https://..."
                className="input"
              />
            </Field>
            <Field label="Success Message">
              <input
                type="text"
                value={settings.newsletter_success_message}
                onChange={(e) =>
                  update({ newsletter_success_message: e.target.value })
                }
                className="input"
              />
            </Field>
          </div>
        )}
      </Section>

      {/* SEO */}
      <Section title="SEO Defaults">
        <Field label="Title Template">
          <input
            type="text"
            value={settings.site_title_template}
            onChange={(e) =>
              update({ site_title_template: e.target.value })
            }
            placeholder="{title} | {blog_name}"
            className="input"
          />
          <p className="mt-1 text-xs text-gray-500">
            Use {"{title}"} and {"{blog_name}"} as placeholders
          </p>
        </Field>
        <Field label="Default OG Image">
          <input
            type="text"
            value={settings.default_og_image ?? ""}
            onChange={(e) =>
              update({ default_og_image: e.target.value || null })
            }
            placeholder="/images/og-default.png"
            className="input"
          />
        </Field>
        <Field label="Google Analytics ID">
          <input
            type="text"
            value={settings.google_analytics_id ?? ""}
            onChange={(e) =>
              update({
                google_analytics_id: e.target.value || null,
              })
            }
            placeholder="G-XXXXXXXXXX"
            className="input"
          />
        </Field>
      </Section>

      {/* Social */}
      <Section title="Social Links">
        <Field label="Main Website">
          <input
            type="url"
            value={settings.social_website ?? ""}
            onChange={(e) =>
              update({ social_website: e.target.value || null })
            }
            className="input"
          />
        </Field>
        <Field label="Twitter / X">
          <input
            type="text"
            value={settings.social_twitter ?? ""}
            onChange={(e) =>
              update({ social_twitter: e.target.value || null })
            }
            placeholder="@handle or URL"
            className="input"
          />
        </Field>
        <Field label="LinkedIn">
          <input
            type="url"
            value={settings.social_linkedin ?? ""}
            onChange={(e) =>
              update({ social_linkedin: e.target.value || null })
            }
            className="input"
          />
        </Field>
        <Field label="GitHub">
          <input
            type="url"
            value={settings.social_github ?? ""}
            onChange={(e) =>
              update({ social_github: e.target.value || null })
            }
            className="input"
          />
        </Field>
        <Field label="YouTube">
          <input
            type="url"
            value={settings.social_youtube ?? ""}
            onChange={(e) =>
              update({ social_youtube: e.target.value || null })
            }
            className="input"
          />
        </Field>
      </Section>

      {/* Save button */}
      <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
