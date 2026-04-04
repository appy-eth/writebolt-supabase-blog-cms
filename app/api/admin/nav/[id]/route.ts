import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import {
  updateNavItem,
  deleteNavItem,
} from "@/lib/supabase/admin-queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const body = await request.json();
  const item = await updateNavItem(params.id, body);
  if (!item) {
    return NextResponse.json(
      { error: "Failed to update nav item" },
      { status: 500 }
    );
  }
  return NextResponse.json(item);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const success = await deleteNavItem(params.id);
  if (!success) {
    return NextResponse.json(
      { error: "Failed to delete nav item" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
