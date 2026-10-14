import type { APIRoute } from 'astro';
import { getSiteSettings } from '../../../lib/data';

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string; listIdOverride?: string | null };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Valid email required' }, 400);
  }

  const settings = await getSiteSettings();
  const listId =
    (body.listIdOverride && String(body.listIdOverride).trim()) ||
    settings.newsletter_list_id?.trim() ||
    null;

  if (!process.env.NEWSLETTER_API_KEY) {
    return json(
      {
        error:
          'Newsletter API is not configured. Add NEWSLETTER_API_KEY to .env (see README).',
      },
      503
    );
  }

  if (!listId) {
    return json(
      {
        error:
          'No audience/list ID configured. Set it under Settings → Newsletter.',
      },
      400
    );
  }

  console.info('[newsletter] subscribe', {
    provider: settings.newsletter_provider,
    listId,
    email,
  });

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
