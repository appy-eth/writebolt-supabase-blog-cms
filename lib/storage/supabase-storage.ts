import { createClient } from "@/lib/supabase/server";
import type { StorageProvider, ImageMeta } from "./provider";

export class SupabaseStorageProvider implements StorageProvider {
  constructor(private bucket: string) {}

  async saveImage(
    file: Buffer,
    filename: string,
    folder: "blog" | "site" = "blog"
  ): Promise<string> {
    const supabase = createClient();
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    const prefix = folder === "site" ? "site" : "blog";
    const filePath = `${prefix}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from(this.bucket)
      .upload(filePath, file, {
        contentType: getMimeType(safeName),
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    return this.getImageUrl(filePath);
  }

  getImageUrl(filePath: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${this.bucket}/${filePath}`;
  }

  async deleteImage(imagePath: string): Promise<void> {
    const supabase = createClient();
    // Extract the path within the bucket from the full URL
    const prefix = `/storage/v1/object/public/${this.bucket}/`;
    let filePath = imagePath;
    const idx = imagePath.indexOf(prefix);
    if (idx !== -1) {
      filePath = imagePath.slice(idx + prefix.length);
    }

    const { error } = await supabase.storage
      .from(this.bucket)
      .remove([filePath]);

    if (error) {
      console.error("Supabase Storage delete error:", error);
    }
  }

  async listImages(): Promise<ImageMeta[]> {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .list("blog", {
        limit: 200,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error || !data) return [];

    return data
      .filter((f) => f.name && /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(f.name))
      .map((f) => ({
        name: f.name,
        path: `blog/${f.name}`,
        url: this.getImageUrl(`blog/${f.name}`),
        size: f.metadata?.size,
        created_at: f.created_at,
      }));
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    avif: "image/avif",
    ico: "image/x-icon",
  };
  return types[ext ?? ""] || "application/octet-stream";
}
