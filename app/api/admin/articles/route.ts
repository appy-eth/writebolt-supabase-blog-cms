import { NextRequest, NextResponse } from "next/server";
import {
  getAllArticles,
  createArticle,
} from "@/lib/supabase/admin-queries";

export async function GET() {
  const articles = await getAllArticles();
  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
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
