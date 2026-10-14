import type { APIRoute } from 'astro';
import { requireApiAuth } from '../../lib/auth';
import { getStorageProvider, type AssetFolder } from '../../lib/storage/provider';

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireApiAuth(request);
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get('file');
  const folderRaw = formData.get('folder');
  const folder: AssetFolder = folderRaw === 'site' ? 'site' : 'blog';

  if (!(file instanceof File)) {
    return json({ error: 'No file provided' }, 400);
  }

  const allowedBlog = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/avif',
  ];
  const allowedSite = [
    ...allowedBlog,
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'application/octet-stream',
  ];
  const allowedTypes = folder === 'site' ? allowedSite : allowedBlog;

  if (!allowedTypes.includes(file.type)) {
    return json({ error: 'File type not allowed' }, 400);
  }
  if (file.size > 10 * 1024 * 1024) {
    return json({ error: 'File too large (max 10MB)' }, 400);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = await getStorageProvider();
    const url = await storage.saveImage(buffer, file.name, folder);
    return json({ url }, 201);
  } catch (err) {
    console.error('Upload error:', err);
    return json({ error: 'Upload failed' }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
