import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/ai/image-generation";

export async function POST(request: NextRequest) {
  try {
    const { description, style, size } = await request.json();
    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const result = await generateImage(
      description,
      style || "photorealistic",
      size || "featured"
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Image generation failed" },
      { status: 500 }
    );
  }
}
