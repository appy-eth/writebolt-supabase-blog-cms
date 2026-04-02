import { NextRequest, NextResponse } from "next/server";
import { getBlogSettings } from "@/lib/supabase/queries";
import { updateBlogSettings } from "@/lib/supabase/admin-queries";

export async function GET() {
  const settings = await getBlogSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const settings = await updateBlogSettings(body);
  if (!settings) {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
  return NextResponse.json(settings);
}
