import { NextRequest, NextResponse } from "next/server";
import { suggestHeadlines } from "@/lib/ai/text-generation";

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();
    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const headlines = await suggestHeadlines(topic);
    return NextResponse.json({ headlines });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Headline generation failed" },
      { status: 500 }
    );
  }
}
