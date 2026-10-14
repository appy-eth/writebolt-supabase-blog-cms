import type { APIRoute } from 'astro';
import { requireApiAuth } from '../../../lib/auth';
import { getStorageProvider } from '../../../lib/storage/provider';

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = requireApiAuth(request);
  if (unauthorized) return unauthorized;
  const storage = await getStorageProvider();
  const images = await storage.listImages();
  return json(images);
};

export const DELETE: APIRoute = async ({ request }) => {
  const unauthorized = requireApiAuth(request);
  if (unauthorized) return unauthorized;
  const { path } = await request.json();
  if (!path) return json({ error: 'Path required' }, 400);
  const storage = await getStorageProvider();
  await storage.deleteImage(path);
  return json({ success: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
