import { NextRequest, NextResponse } from "next/server";
import {
  getArticleById,
  updateArticle,
  deleteArticle,
} from "@/lib/supabase/admin-queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const article = await getArticleById(params.id);
  if (!article) {
    return NextResponse.json(
      { error: "Article not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(article);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const article = await updateArticle(params.id, body);
  if (!article) {
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
  return NextResponse.json(article);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const success = await deleteArticle(params.id);
  if (!success) {
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
