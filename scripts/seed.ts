/**
 * Inserts default author + blog settings (requires DB schema from SQL migration).
 * Run after: npm run setup, then paste supabase/migrations/001_writebolt_blog_schema.sql in Supabase SQL Editor.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

const root = process.cwd();
config({ path: path.join(root, ".env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.\nRun: npm run setup\n"
    );
    process.exit(1);
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
      console.error(
        "Failed to create author. Did you run the SQL migration in Supabase?\n",
        aErr?.message
      );
      process.exit(1);
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
      blog_description: "Built with Writebolt — edit this in Admin → Settings.",
      default_author_id: authorId,
    });

    if (sErr) {
      console.error("Failed to insert blog_settings:", sErr.message);
      process.exit(1);
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

  console.log("\nDone. Run: npm run dev\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
