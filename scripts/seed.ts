/**
 * Seeds default author, blog settings, nav, categories, and sample articles.
 * Called from `npm run setup` or `npm run setup -- --seed`.
 * Requires SUPABASE_SERVICE_ROLE_KEY and migration 001 applied.
 */

import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import { config } from "dotenv";

const root = process.cwd();
config({ path: path.join(root, ".env.local") });

function wordStats(markdown: string) {
  const text = markdown.trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const word_count = Math.max(0, words);
  const reading_time_minutes = word_count
    ? Math.max(1, Math.ceil(word_count / 200))
    : null;
  return { word_count, reading_time_minutes };
}

export async function seed(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  const supabase = createClient(url, key);

  const { data: existingAuthors } = await supabase
    .from("authors")
    .select("id")
    .limit(1);

  let authorId: string;

  if (existingAuthors && existingAuthors.length > 0) {
    authorId = (existingAuthors[0] as { id: string }).id;
    console.log("Authors already exist — skipping author insert.");
  } else {
    const { data: author, error: aErr } = await supabase
      .from("authors")
      .insert({
        name: "Editorial Team",
        slug: "editorial-team",
        bio: "Default author — edit in Supabase or the admin panel.",
        role: "admin",
        is_active: true,
      })
      .select("id")
      .single();

    if (aErr || !author) {
      throw new Error(
        `Failed to create author: ${aErr?.message ?? "unknown"}. Did you run the SQL migrations in Supabase?`
      );
    }
    authorId = author.id;
    console.log("✅ Created default author.");
  }

  const { data: settingsRow } = await supabase
    .from("blog_settings")
    .select("id")
    .limit(1);

  if (settingsRow && settingsRow.length > 0) {
    console.log("blog_settings already exists — skipping.");
  } else {
    const { error: sErr } = await supabase.from("blog_settings").insert({
      blog_name: "My Blog",
      blog_description:
        "A short tagline for your site. Edit this in Admin → Settings.",
      default_author_id: authorId,
    });

    if (sErr) {
      throw new Error(`Failed to insert blog_settings: ${sErr.message}`);
    }
    console.log("✅ Created default blog_settings row.");
  }

  const { data: nav } = await supabase.from("nav_items").select("id").limit(1);
  if (!nav || nav.length === 0) {
    await supabase.from("nav_items").insert({
      label: "Blog",
      url: "/blog",
      display_order: 0,
      is_visible: true,
    });
    console.log("✅ Created default nav item.");
  }

  const { count: catCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true });

  if ((catCount ?? 0) === 0) {
    await supabase.from("categories").insert([
      {
        name: "Getting Started",
        slug: "getting-started",
        description: null,
        display_order: 0,
      },
      {
        name: "Monetization",
        slug: "monetization",
        description: null,
        display_order: 1,
      },
      {
        name: "Writebolt",
        slug: "writebolt",
        description: null,
        display_order: 2,
      },
    ]);
    console.log("✅ Created default categories.");
  }

  const { count: articleCount } = await supabase
    .from("articles")
    .select("id", { count: "exact", head: true });

  if ((articleCount ?? 0) > 0) {
    console.log("Articles table not empty, skipping sample articles.");
    return;
  }

  const msDay = 24 * 60 * 60 * 1000;
  const t = Date.now();

  const body1 = `Welcome to your new blog! This site is powered by Writebolt's open-source blog template — built on Next.js and Supabase.

This is a sample article to show you what your blog looks like with content. Feel free to edit it, or delete it and start fresh.

To create your first real article, head to the admin panel and click "New Article."

Happy writing!`;

  const body2 = `Your blog comes with a built-in drafts and scheduling system. Here's how it works.

## Drafts

When you're working on an article that isn't ready yet, save it as a draft. Drafts are only visible to you in the admin panel — they won't appear on your public blog.

To save a draft, click the dropdown arrow next to the publish button and select "Save as Draft."

## Scheduled Publishing

Want an article to go live at a specific date and time? Use scheduled publishing.

Click the dropdown arrow next to the publish button and select "Schedule." Pick your date and time, and the article will automatically publish when that moment arrives.

Scheduled publishing runs via a GitHub Action every 6 hours. Check the README for setup instructions if you haven't configured it yet.

## Managing Your Articles

Your admin panel shows all articles with status filters: Published, Drafts, Scheduled, and Archived. You can change an article's status at any time — move a published article back to draft, reschedule a scheduled article, or publish a draft immediately.`;

  const body3 = `This template includes an optional ad network component that lets you earn revenue from your blog content.

## How It Works

The Writebolt Ad Network serves contextually relevant ads matched to your content. No tracking cookies, no third-party scripts, no shady ad tech. When a reader sees an ad, you earn 60% of the revenue.

## Getting Started

1. Register your site at [writebolt.app](https://writebolt.app) to get a Site ID
2. Add the \`<WriteboltAd />\` component to your blog layout where you want ads to appear
3. Start earning

Ads are completely optional. If you don't add the component, nothing shows. If the ad network has no relevant ads for your content, the component renders nothing — no empty boxes or broken layouts.

## Why Not Google AdSense?

The Writebolt Ad Network is designed specifically for developer and tech blogs. Ads are relevant to your audience, load fast, and respect reader privacy. You keep the majority of revenue.

Check the README for implementation details, or delete this article and ignore ads entirely — it's your blog.`;

  const body4 = `This open-source template gives you a fast, modern blog with drafts, scheduling, and optional ad revenue. But if you're serious about content, Writebolt Pro takes it further.

## What You Get with Pro

- **AI Article Generation** — Write full articles from a topic or headline in seconds
- **Bulk Creation** — Generate and schedule 20+ articles at once from a content calendar
- **Article Ideas Engine** — AI-powered suggestions based on trending topics in your niche and gaps in your existing content
- **One-Click Git Publishing** — Push articles directly to your blog's repo as pull requests
- **SEO Optimization** — Every article is optimized for search from the start

## Who It's For

Solo developers maintaining a blog, startup teams doing content marketing, agencies managing multiple blogs — anyone who wants to publish more without spending more time writing.

## Try It Free

Writebolt offers 3 free articles to start. No credit card required.

[Get started at writebolt.app →](https://writebolt.app)

---

*This is a sample article. Feel free to keep it, edit it, or delete it.*`;

  const samples: {
    headline: string;
    slug: string;
    published_at: string;
    category: string;
    excerpt: string;
    content_markdown: string;
  }[] = [
    {
      headline: "Hello World — Your New Blog is Live",
      slug: "hello-world",
      published_at: new Date(t - 3 * msDay).toISOString(),
      category: "getting-started",
      excerpt:
        "Welcome to your new blog powered by Writebolt, Next.js, and Supabase.",
      content_markdown: body1,
    },
    {
      headline: "How to Use Drafts and Scheduled Publishing",
      slug: "drafts-and-scheduling",
      published_at: new Date(t - 2 * msDay).toISOString(),
      category: "getting-started",
      excerpt:
        "Learn how drafts, scheduling, and the admin filters work in Writebolt.",
      content_markdown: body2,
    },
    {
      headline: "Earn Revenue with the Writebolt Ad Network",
      slug: "writebolt-ad-network",
      published_at: new Date(t - 1 * msDay).toISOString(),
      category: "monetization",
      excerpt:
        "Optional ads that respect privacy — earn revenue from your tech blog.",
      content_markdown: body3,
    },
    {
      headline: "Scale Your Content with Writebolt Pro",
      slug: "scale-with-writebolt-pro",
      published_at: new Date(t).toISOString(),
      category: "writebolt",
      excerpt:
        "AI generation, bulk scheduling, and more when you outgrow the template.",
      content_markdown: body4,
    },
  ];

  const rows = samples.map((s) => {
    const { word_count, reading_time_minutes } = wordStats(s.content_markdown);
    return {
      author_id: authorId,
      slug: s.slug,
      headline: s.headline,
      excerpt: s.excerpt,
      content_markdown: s.content_markdown,
      category: s.category,
      tags: [] as string[],
      featured_image: null,
      featured_image_alt: null,
      seo_title: null,
      seo_description: null,
      status: "published" as const,
      published_at: s.published_at,
      scheduled_date: null,
      word_count,
      reading_time_minutes,
    };
  });

  const { error: insErr } = await supabase.from("articles").insert(rows);

  if (insErr) {
    throw new Error(`Failed to insert sample articles: ${insErr.message}`);
  }

  console.log("Inserted 4 sample articles.");
}
