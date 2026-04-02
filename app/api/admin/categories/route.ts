import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/supabase/queries";
import {
  createCategory,
  reorderCategories,
} from "@/lib/supabase/admin-queries";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const category = await createCategory(body);
  if (!category) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
  return NextResponse.json(category, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  if (body.orderedIds) {
    const success = await reorderCategories(body.orderedIds);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to reorder" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
