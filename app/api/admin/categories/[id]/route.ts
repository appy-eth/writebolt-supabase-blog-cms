import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import {
  updateCategory,
  deleteCategory,
} from "@/lib/supabase/admin-queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const body = await request.json();
  const category = await updateCategory(params.id, body);
  if (!category) {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
  return NextResponse.json(category);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const success = await deleteCategory(params.id);
  if (!success) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
