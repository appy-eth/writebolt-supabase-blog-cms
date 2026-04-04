import { NextRequest, NextResponse } from "next/server";
import { getBlogSettings } from "@/lib/supabase/queries";

/**
 * Newsletter signup via JSON POST. Uses list IDs from blog settings plus
 * NEWSLETTER_API_KEY from the server environment (set in .env.local or hosting).
 * Wire your provider (Resend, Mailchimp API, etc.) inside this route when ready.
 */
export async function POST(request: NextRequest) {
  let body: { email?: string; listIdOverride?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const settings = await getBlogSettings();
  const listId =
    (body.listIdOverride && String(body.listIdOverride).trim()) ||
    settings.newsletter_list_id?.trim() ||
    null;

  if (!process.env.NEWSLETTER_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Newsletter API is not configured. Add NEWSLETTER_API_KEY to .env.local (see README).",
      },
      { status: 503 }
    );
  }

  if (!listId) {
    return NextResponse.json(
      {
        error:
          "No audience/list ID configured. Set it under Blog Settings → Newsletter.",
      },
      { status: 400 }
    );
  }

  // Integrate your provider here (Resend audiences, Mailchimp API, etc.)
  console.info("[newsletter] subscribe", {
    provider: settings.newsletter_provider,
    listId,
    email,
  });

  return NextResponse.json({ ok: true });
}
