import fs from "fs/promises";
import path from "path";
import type { StorageProvider, ImageMeta } from "./provider";

const BLOG_DIR = "public/images/blog";
const SITE_DIR = "public/images/site";

export class LocalStorageProvider implements StorageProvider {
  private getAbsDir(folder: "blog" | "site"): string {
    const rel = folder === "site" ? SITE_DIR : BLOG_DIR;
    return path.join(process.cwd(), rel);
  }

  async saveImage(
    file: Buffer,
    filename: string,
    folder: "blog" | "site" = "blog"
  ): Promise<string> {
    const dir = this.getAbsDir(folder);
    await fs.mkdir(dir, { recursive: true });

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = path.join(dir, safeName);

    // Avoid overwrites
    let finalPath = filePath;
    let counter = 1;
    while (await fileExists(finalPath)) {
      const ext = path.extname(safeName);
      const base = path.basename(safeName, ext);
      finalPath = path.join(dir, `${base}-${counter}${ext}`);
      counter++;
    }

    await fs.writeFile(finalPath, file);
    const relativeName = path.basename(finalPath);
    const prefix = folder === "site" ? "/images/site" : "/images/blog";
    return `${prefix}/${relativeName}`;
  }

  getImageUrl(imagePath: string): string {
    return imagePath;
  }

  async deleteImage(imagePath: string): Promise<void> {
    const filename = path.basename(imagePath);
    const folder = imagePath.startsWith("/images/site/") ? "site" : "blog";
    const filePath = path.join(this.getAbsDir(folder), filename);
    try {
      await fs.unlink(filePath);
    } catch {
      // File may not exist
    }
  }

  async listImages(): Promise<ImageMeta[]> {
    const dir = this.getAbsDir("blog");
    try {
      const files = await fs.readdir(dir);
      const imageFiles = files.filter((f) =>
        /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(f)
      );

      const items: ImageMeta[] = [];
      for (const file of imageFiles) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        items.push({
          name: file,
          path: `/images/blog/${file}`,
          url: `/images/blog/${file}`,
          size: stat.size,
          created_at: stat.birthtime.toISOString(),
        });
      }

      return items.sort(
        (a, b) =>
          new Date(b.created_at!).getTime() -
          new Date(a.created_at!).getTime()
      );
    } catch {
      return [];
    }
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
