import type { APIRoute } from 'astro';
import { requireApiAuth } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { encrypt } from '../../../lib/ai/encryption';

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = requireApiAuth(request);
  if (unauthorized) return unauthorized;

  const { data } = await supabaseAdmin
    .from('ai_settings')
    .select('*')
    .limit(1)
    .single();

  if (!data) {
    return json({
      has_openai_key: false,
      has_replicate_key: false,
      image_provider: 'openai',
      default_tone: 'professional',
      default_image_style: 'photorealistic',
    });
  }

  return json({
    has_openai_key: !!data.openai_api_key_encrypted,
    has_replicate_key: !!data.replicate_api_key_encrypted,
    image_provider: data.image_provider,
    default_tone: data.default_tone,
    default_image_style: data.default_image_style,
  });
};

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = requireApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.openai_api_key !== undefined) {
    updates.openai_api_key_encrypted = body.openai_api_key
      ? encrypt(body.openai_api_key)
      : null;
  }
  if (body.replicate_api_key !== undefined) {
    updates.replicate_api_key_encrypted = body.replicate_api_key
      ? encrypt(body.replicate_api_key)
      : null;
  }
  if (body.image_provider) updates.image_provider = body.image_provider;
  if (body.default_tone) updates.default_tone = body.default_tone;
  if (body.default_image_style) updates.default_image_style = body.default_image_style;

  const { data: existing } = await supabaseAdmin
    .from('ai_settings')
    .select('id')
    .limit(1)
    .single();

  const result = existing
    ? await supabaseAdmin.from('ai_settings').update(updates).eq('id', existing.id)
    : await supabaseAdmin.from('ai_settings').insert(updates);

  if (result.error) return json({ error: result.error.message }, 500);
  return json({ success: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
