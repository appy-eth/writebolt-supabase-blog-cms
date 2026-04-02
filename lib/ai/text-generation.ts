import { getOpenAIClient } from "./provider";
import { PROMPTS } from "./prompts";

async function generate(prompt: string): Promise<string> {
  const openai = await getOpenAIClient();
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4000,
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function generateDraft(
  topic: string,
  tone: string = "professional"
): Promise<string> {
  return generate(PROMPTS.generateDraft(topic, tone));
}

export async function rewrite(text: string): Promise<string> {
  return generate(PROMPTS.rewrite(text));
}

export async function expand(text: string): Promise<string> {
  return generate(PROMPTS.expand(text));
}

export async function suggestHeadlines(
  topic: string
): Promise<string[]> {
  const result = await generate(PROMPTS.suggestHeadlines(topic));
  return result
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((line) => line.length > 0);
}

export async function generateExcerpt(
  content: string
): Promise<string> {
  return generate(PROMPTS.generateExcerpt(content));
}
