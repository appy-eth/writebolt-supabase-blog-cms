import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/ai/encryption";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const supabase = createClient();
  const { data } = await supabase
    .from("ai_settings")
    .select("*")
    .limit(1)
    .single();

  if (!data) {
    return NextResponse.json({
      has_openai_key: false,
      has_replicate_key: false,
      image_provider: "openai",
      default_tone: "professional",
      default_image_style: "photorealistic",
    });
  }

  return NextResponse.json({
    has_openai_key: !!data.openai_api_key_encrypted,
    has_replicate_key: !!data.replicate_api_key_encrypted,
    image_provider: data.image_provider,
    default_tone: data.default_tone,
    default_image_style: data.default_image_style,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const body = await request.json();
  const supabase = createClient();

  const updates: Record<string, any> = {};

  if (body.openai_api_key !== undefined) {
    updates.openai_api_key_encrypted = body.openai_api_key
      ? encrypt(body.openai_api_key)
      : null;
  }

  if (body.replicate_api_key !== undefined) {
    updates.replicate_api_key_encrypted = body.replicate_api_key
      ? encrypt(body.replicate_api_key)
      : null;
  }

  if (body.image_provider) updates.image_provider = body.image_provider;
  if (body.default_tone) updates.default_tone = body.default_tone;
  if (body.default_image_style)
    updates.default_image_style = body.default_image_style;

  // Check if row exists
  const { data: existing } = await supabase
    .from("ai_settings")
    .select("id")
    .limit(1)
    .single();

  let result;
  if (existing) {
    result = await supabase
      .from("ai_settings")
      .update(updates)
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from("ai_settings")
      .insert(updates)
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
