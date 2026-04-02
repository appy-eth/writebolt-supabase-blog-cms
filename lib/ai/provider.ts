import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "./encryption";

interface AISettings {
  openai_api_key_encrypted: string | null;
  image_provider: string;
  replicate_api_key_encrypted: string | null;
  default_tone: string;
  default_image_style: string;
}

export async function getAISettings(): Promise<AISettings | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("ai_settings")
    .select("*")
    .limit(1)
    .single();

  return data as AISettings | null;
}

export async function getOpenAIClient(): Promise<OpenAI | null> {
  const settings = await getAISettings();
  if (!settings?.openai_api_key_encrypted) return null;

  try {
    const apiKey = decrypt(settings.openai_api_key_encrypted);
    return new OpenAI({ apiKey });
  } catch {
    console.error("Failed to decrypt OpenAI API key");
    return null;
  }
}

export async function getReplicateApiKey(): Promise<string | null> {
  const settings = await getAISettings();
  if (!settings?.replicate_api_key_encrypted) return null;

  try {
    return decrypt(settings.replicate_api_key_encrypted);
  } catch {
    console.error("Failed to decrypt Replicate API key");
    return null;
  }
}

export async function getDecryptedOpenAIKey(): Promise<string | null> {
  const settings = await getAISettings();
  if (!settings?.openai_api_key_encrypted) return null;

  try {
    return decrypt(settings.openai_api_key_encrypted);
  } catch {
    return null;
  }
}
