import { NextRequest, NextResponse } from "next/server";
import { rewrite } from "@/lib/ai/text-generation";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const content = await rewrite(text);
    return NextResponse.json({ content });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Rewrite failed" },
      { status: 500 }
    );
  }
}
