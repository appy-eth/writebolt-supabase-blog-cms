import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import {
  getAllNavItems,
  createNavItem,
  reorderNavItems,
} from "@/lib/supabase/admin-queries";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const items = await getAllNavItems();
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const body = await request.json();
  const item = await createNavItem(body);
  if (!item) {
    return NextResponse.json(
      { error: "Failed to create nav item" },
      { status: 500 }
    );
  }
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const body = await request.json();
  if (body.orderedIds) {
    const success = await reorderNavItems(body.orderedIds);
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
