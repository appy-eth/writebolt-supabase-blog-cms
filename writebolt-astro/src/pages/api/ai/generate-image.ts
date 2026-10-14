import type { APIRoute } from 'astro';
import { requireApiAuth } from '../../../lib/auth';
import { generateImage } from '../../../lib/ai/image-generation';

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { description, style, size } = await request.json();
    if (!description) return json({ error: 'Description is required' }, 400);
    const result = await generateImage(
      description,
      style || 'photorealistic',
      size || 'featured'
    );
    return json(result);
  } catch (err: any) {
    return json({ error: err.message || 'Image generation failed' }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
