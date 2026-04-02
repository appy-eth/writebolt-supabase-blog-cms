import { NextRequest, NextResponse } from "next/server";
import { expand } from "@/lib/ai/text-generation";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const content = await expand(text);
    return NextResponse.json({ content });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Expansion failed" },
      { status: 500 }
    );
  }
}
