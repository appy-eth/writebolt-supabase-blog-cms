import type { APIRoute } from 'astro';
import { escapeHtml } from '../../lib/utils';

export const GET: APIRoute = ({ url }) => {
  const title = (url.searchParams.get('title') || 'Blog Post').slice(0, 160);
  const author = (url.searchParams.get('author') || '').slice(0, 80);
  const category = (url.searchParams.get('category') || '').slice(0, 40);
  const blogName = (url.searchParams.get('blog') || 'Writebolt Blog').slice(0, 60);
  const titleSize = title.length > 60 ? 42 : 52;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <text x="80" y="90" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="#2563EB">⚡ ${escapeHtml(blogName)}</text>
  ${
    category
      ? `<rect x="${1200 - 80 - Math.min(category.length * 12 + 32, 280)}" y="62" rx="16" ry="16" width="${Math.min(category.length * 12 + 32, 280)}" height="32" fill="#EFF6FF"/>
         <text x="${1200 - 80 - Math.min(category.length * 12 + 32, 280) / 2}" y="84" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#2563EB">${escapeHtml(category)}</text>`
      : ''
  }
  <text x="80" y="320" font-family="system-ui, sans-serif" font-size="${titleSize}" font-weight="800" fill="#111827">
    <tspan x="80" dy="0">${escapeHtml(title.slice(0, 48))}</tspan>
    ${title.length > 48 ? `<tspan x="80" dy="${titleSize * 1.2}">${escapeHtml(title.slice(48, 96))}</tspan>` : ''}
    ${title.length > 96 ? `<tspan x="80" dy="${titleSize * 1.2}">${escapeHtml(title.slice(96))}</tspan>` : ''}
  </text>
  ${author ? `<text x="80" y="500" font-family="system-ui, sans-serif" font-size="22" fill="#6B7280">by ${escapeHtml(author)}</text>` : ''}
  <defs>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>
  <rect x="80" y="560" width="1040" height="6" rx="3" fill="url(#bar)"/>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
