import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import {
  getAllArticles,
  createArticle,
} from "@/lib/supabase/admin-queries";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const raw = request.nextUrl.searchParams.get("status");
  const status =
    !raw || raw === "all" ? undefined : raw;
  const articles = await getAllArticles(status);
  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const body = await request.json();
  const article = await createArticle(body);
  if (!article) {
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
  return NextResponse.json(article, { status: 201 });
}
