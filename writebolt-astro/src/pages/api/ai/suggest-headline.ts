import type { APIRoute } from 'astro';
import { requireApiAuth } from '../../../lib/auth';
import { suggestHeadlines } from '../../../lib/ai/text-generation';

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { topic } = await request.json();
    if (!topic) return json({ error: 'Topic is required' }, 400);
    const headlines = await suggestHeadlines(topic);
    return json({ headlines });
  } catch (err: any) {
    return json({ error: err.message || 'Headline generation failed' }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
