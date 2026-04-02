import { NextRequest, NextResponse } from "next/server";
import { getStorageProvider } from "@/lib/storage/provider";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    );
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/avif",
  ];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed" },
      { status: 400 }
    );
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "File too large (max 10MB)" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = await getStorageProvider();
    const url = await storage.saveImage(buffer, file.name);

    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
