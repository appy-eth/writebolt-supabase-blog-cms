import { getOpenAIClient, getReplicateApiKey, getAISettings } from "./provider";
import { PROMPTS } from "./prompts";
import { getStorageProvider } from "@/lib/storage/provider";

interface GenerateImageResult {
  url: string;
  altText: string;
}

export async function generateImage(
  description: string,
  style: string = "photorealistic",
  size: "featured" | "inline" = "featured"
): Promise<GenerateImageResult> {
  const settings = await getAISettings();
  const provider = settings?.image_provider ?? "openai";

  const prompt = PROMPTS.generateImagePrompt(description, style);

  let imageBuffer: Buffer;

  if (provider === "replicate") {
    imageBuffer = await generateWithReplicate(prompt);
  } else {
    imageBuffer = await generateWithDallE(prompt, size);
  }

  const filename = `ai-${Date.now()}.png`;
  const storage = await getStorageProvider();
  const url = await storage.saveImage(imageBuffer, filename);

  return {
    url,
    altText: description,
  };
}

async function generateWithDallE(
  prompt: string,
  size: "featured" | "inline"
): Promise<Buffer> {
  const openai = await getOpenAIClient();
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  const dimensions = size === "featured" ? "1792x1024" : "1024x1024";

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: dimensions as "1792x1024" | "1024x1024",
    response_format: "b64_json",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("No image generated");
  }

  return Buffer.from(b64, "base64");
}

async function generateWithReplicate(prompt: string): Promise<Buffer> {
  const apiKey = await getReplicateApiKey();
  if (!apiKey) {
    throw new Error("Replicate API key not configured");
  }

  // Create prediction
  const createRes = await fetch(
    "https://api.replicate.com/v1/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version:
          "black-forest-labs/flux-1.1-pro",
        input: {
          prompt,
          width: 1344,
          height: 768,
          num_outputs: 1,
        },
      }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Replicate error: ${err}`);
  }

  let prediction = await createRes.json();

  // Poll for completion
  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed"
  ) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const pollRes = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );
    prediction = await pollRes.json();
  }

  if (prediction.status === "failed") {
    throw new Error(
      `Image generation failed: ${prediction.error || "Unknown error"}`
    );
  }

  const imageUrl = prediction.output?.[0] || prediction.output;
  if (!imageUrl) {
    throw new Error("No image URL in Replicate response");
  }

  const imageRes = await fetch(imageUrl);
  const arrayBuffer = await imageRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
