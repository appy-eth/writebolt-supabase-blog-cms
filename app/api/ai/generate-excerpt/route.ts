import { NextRequest, NextResponse } from "next/server";
import { generateExcerpt } from "@/lib/ai/text-generation";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const excerpt = await generateExcerpt(content);
    return NextResponse.json({ excerpt });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Excerpt generation failed" },
      { status: 500 }
    );
  }
}
