import type { APIRoute } from 'astro';
import { requireApiAuth } from '../../../lib/auth';
import { rewrite } from '../../../lib/ai/text-generation';

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { text } = await request.json();
    if (!text) return json({ error: 'Text is required' }, 400);
    const content = await rewrite(text);
    return json({ content });
  } catch (err: any) {
    return json({ error: err.message || 'Rewrite failed' }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
