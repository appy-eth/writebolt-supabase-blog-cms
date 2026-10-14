import type { APIRoute } from 'astro';
import { requireApiAuth } from '../../../lib/auth';
import { generateExcerpt } from '../../../lib/ai/text-generation';

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { content } = await request.json();
    if (!content) return json({ error: 'Content is required' }, 400);
    const excerpt = await generateExcerpt(content);
    return json({ excerpt });
  } catch (err: any) {
    return json({ error: err.message || 'Excerpt generation failed' }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
