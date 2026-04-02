import { getBlogSettings } from "@/lib/supabase/queries";
import { LocalStorageProvider } from "./local";
import { SupabaseStorageProvider } from "./supabase-storage";

export interface ImageMeta {
  name: string;
  path: string;
  url: string;
  size?: number;
  created_at?: string;
}

export interface StorageProvider {
  saveImage(file: Buffer, filename: string): Promise<string>;
  getImageUrl(path: string): string;
  deleteImage(path: string): Promise<void>;
  listImages(prefix?: string): Promise<ImageMeta[]>;
}

export async function getStorageProvider(): Promise<StorageProvider> {
  const settings = await getBlogSettings();
  if (settings.image_storage_provider === "supabase") {
    return new SupabaseStorageProvider(settings.supabase_storage_bucket);
  }
  return new LocalStorageProvider();
}
