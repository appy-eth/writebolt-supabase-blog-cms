import { NextRequest, NextResponse } from "next/server";
import { generateDraft } from "@/lib/ai/text-generation";

export async function POST(request: NextRequest) {
  try {
    const { topic, tone } = await request.json();
    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const content = await generateDraft(topic, tone);
    return NextResponse.json({ content });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Generation failed" },
      { status: 500 }
    );
  }
}
