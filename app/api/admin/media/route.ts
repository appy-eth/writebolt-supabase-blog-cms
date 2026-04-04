import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { getStorageProvider } from "@/lib/storage/provider";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const storage = await getStorageProvider();
  const images = await storage.listImages();
  return NextResponse.json(images);
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth) return auth;

  const { path } = await request.json();
  if (!path) {
    return NextResponse.json(
      { error: "Path required" },
      { status: 400 }
    );
  }

  const storage = await getStorageProvider();
  await storage.deleteImage(path);
  return NextResponse.json({ success: true });
}
