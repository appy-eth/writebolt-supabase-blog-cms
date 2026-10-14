import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/utils';

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

User-agent: Googlebot-News
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
Sitemap: ${absoluteUrl('/news-sitemap.xml')}
`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
