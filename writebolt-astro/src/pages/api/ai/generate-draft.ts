import type { APIRoute } from 'astro';
import { requireApiAuth } from '../../../lib/auth';
import { generateDraft } from '../../../lib/ai/text-generation';

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireApiAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { topic, tone } = await request.json();
    if (!topic) return json({ error: 'Topic is required' }, 400);
    const content = await generateDraft(topic, tone);
    return json({ content });
  } catch (err: any) {
    return json({ error: err.message || 'Generation failed' }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
