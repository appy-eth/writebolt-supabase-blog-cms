import fs from "fs/promises";
import path from "path";
import type { StorageProvider, ImageMeta } from "./provider";

const IMAGE_DIR = "public/images/blog";

export class LocalStorageProvider implements StorageProvider {
  private getAbsDir(): string {
    return path.join(process.cwd(), IMAGE_DIR);
  }

  async saveImage(file: Buffer, filename: string): Promise<string> {
    const dir = this.getAbsDir();
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
    return `/images/blog/${relativeName}`;
  }

  getImageUrl(imagePath: string): string {
    return imagePath;
  }

  async deleteImage(imagePath: string): Promise<void> {
    const filename = path.basename(imagePath);
    const filePath = path.join(this.getAbsDir(), filename);
    try {
      await fs.unlink(filePath);
    } catch {
      // File may not exist
    }
  }

  async listImages(): Promise<ImageMeta[]> {
    const dir = this.getAbsDir();
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
