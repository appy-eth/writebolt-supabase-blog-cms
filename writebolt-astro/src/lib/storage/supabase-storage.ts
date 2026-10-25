import { supabaseUrl } from '../env';
import { supabaseAdmin } from '../supabase';
import type { StorageProvider, ImageMeta, AssetFolder } from './provider';

export class SupabaseStorageProvider implements StorageProvider {
  constructor(private bucket: string) {}

  async saveImage(
    file: Buffer,
    filename: string,
    folder: AssetFolder = 'blog'
  ): Promise<string> {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
    const filePath = `${folder}/${Date.now()}-${safeName}`;

    const { error } = await supabaseAdmin.storage.from(this.bucket).upload(filePath, file, {
      contentType: getMimeType(safeName),
      upsert: false,
    });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    return this.getImageUrl(filePath);
  }

  getImageUrl(filePath: string): string {
    return `${supabaseUrl()}/storage/v1/object/public/${this.bucket}/${filePath}`;
  }

  async deleteImage(imagePath: string): Promise<void> {
    const prefix = `/storage/v1/object/public/${this.bucket}/`;
    let filePath = imagePath;
    const idx = imagePath.indexOf(prefix);
    if (idx !== -1) filePath = imagePath.slice(idx + prefix.length);

    const { error } = await supabaseAdmin.storage.from(this.bucket).remove([filePath]);
    if (error) console.error('Supabase Storage delete error:', error);
  }

  async listImages(): Promise<ImageMeta[]> {
    const { data, error } = await supabaseAdmin.storage.from(this.bucket).list('blog', {
      limit: 200,
      sortBy: { column: 'created_at', order: 'desc' },
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
  const ext = filename.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    avif: 'image/avif',
    ico: 'image/x-icon',
  };
  return types[ext ?? ''] || 'application/octet-stream';
}
