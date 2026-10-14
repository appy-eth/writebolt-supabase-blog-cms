import { escapeHtml } from './utils';

const BLOCK_TAGS = 'CTAInline|CTASidebar|LeadMagnet|NewsletterSignup';
const BLOCK_RE = new RegExp(`<(${BLOCK_TAGS})(\\s[^>]*?)?\\s*/>`, 'gs');
const ATTR_RE = /([a-zA-Z][\w-]*)=["']([^"']*)["']/g;

let leadId = 0;

function parseAttrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  let m: RegExpExecArray | null;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(raw))) {
    out[m[1]] = m[2];
  }
  return out;
}

function renderCTAInline(attrs: Record<string, string>): string {
  const title = escapeHtml(attrs.title || 'Learn more');
  const description = attrs.description
    ? `<p>${escapeHtml(attrs.description)}</p>`
    : '';
  const buttonText = escapeHtml(attrs.buttonText || 'Get started');
  const buttonUrl = escapeHtml(attrs.buttonUrl || '#');
  const variant = ['highlight', 'subtle', 'branded'].includes(attrs.variant)
    ? attrs.variant
    : 'highlight';
  return `<aside class="mdx-cta mdx-cta--${variant}" role="complementary" aria-label="Call to action"><h3>${title}</h3>${description}<a href="${buttonUrl}" class="btn ${variant === 'branded' ? 'btn--on-dark' : 'btn--primary'}">${buttonText}</a></aside>`;
}

function renderCTASidebar(attrs: Record<string, string>): string {
  const title = escapeHtml(attrs.title || '');
  const description = attrs.description
    ? `<p>${escapeHtml(attrs.description)}</p>`
    : '';
  const image = attrs.imageUrl
    ? `<img src="${escapeHtml(attrs.imageUrl)}" alt="" loading="lazy" />`
    : '';
  const button =
    attrs.buttonText && attrs.buttonUrl
      ? `<a href="${escapeHtml(attrs.buttonUrl)}" class="btn btn--primary">${escapeHtml(attrs.buttonText)}</a>`
      : '';
  return `<aside class="cta-card mdx-cta-sidebar" role="complementary" aria-label="Sidebar call to action">${image}<h3>${title}</h3>${description}${button}</aside>`;
}

function renderLeadMagnet(attrs: Record<string, string>): string {
  const id = `lead-email-${++leadId}`;
  const title = escapeHtml(attrs.title || '');
  const description = escapeHtml(attrs.description || '');
  const buttonText = escapeHtml(attrs.buttonText || 'Download Free');
  const image = attrs.imageUrl
    ? `<div class="lead-magnet__media"><img src="${escapeHtml(attrs.imageUrl)}" alt="${title}" loading="lazy" /></div>`
    : '';
  const formAction = attrs.formAction?.trim();
  const body = formAction
    ? `<form class="lead-magnet__form" data-lead-form data-action="${escapeHtml(formAction)}">
        <label for="${id}" class="sr-only">Email address</label>
        <input id="${id}" type="email" required placeholder="you@example.com" data-lead-email />
        <button type="submit" class="btn btn--primary" data-lead-submit>${buttonText}</button>
      </form>
      <p class="lead-magnet__done" data-lead-done hidden>Check your email for the download link!</p>`
    : `<a href="#" class="btn btn--primary">${buttonText}</a>`;

  return `<aside class="lead-magnet" role="complementary" aria-label="Lead magnet">${image}<div class="lead-magnet__body"><h3>${title}</h3><p>${description}</p>${body}</div></aside>`;
}

function renderNewsletter(attrs: Record<string, string>): string {
  const id = `mdx-nl-${++leadId}`;
  const title = escapeHtml(attrs.title || 'Subscribe to our newsletter');
  const description = escapeHtml(
    attrs.description || 'Get the latest articles delivered to your inbox.'
  );
  const placeholder = escapeHtml(attrs.emailPlaceholder || 'Enter your email');
  const buttonLabel = escapeHtml(attrs.buttonLabel || 'Subscribe');
  const success = escapeHtml(attrs.successMessage || 'Thanks for subscribing!');
  const listId = escapeHtml(attrs.listId || '');
  const redirect = escapeHtml(attrs.successRedirectUrl || '');
  const embedUrl = attrs.embedUrl?.trim();

  const form = embedUrl
    ? `<form action="${escapeHtml(embedUrl)}" method="post" target="_blank" class="newsletter__form">
        <label for="${id}" class="sr-only">Email</label>
        <input id="${id}" name="EMAIL" type="email" required placeholder="${placeholder}" />
        <button type="submit" class="btn btn--primary">${buttonLabel}</button>
      </form>`
    : `<form class="newsletter__form" data-nl-form data-list-id="${listId}" data-redirect="${redirect}">
        <label for="${id}" class="sr-only">Email address</label>
        <input id="${id}" type="email" required placeholder="${placeholder}" data-nl-email />
        <button type="submit" class="btn btn--primary" data-nl-submit>${buttonLabel}</button>
        <p class="newsletter__error" data-nl-error hidden></p>
      </form>`;

  return `<div class="newsletter newsletter--card mdx-newsletter" data-newsletter>
    <div class="newsletter__form-wrap">
      <h3>${title}</h3>
      <p>${description}</p>
      ${form}
    </div>
    <div class="newsletter__success" data-nl-success hidden><p>${success}</p></div>
  </div>`;
}

function renderBlock(name: string, attrs: Record<string, string>): string {
  switch (name) {
    case 'CTAInline':
      return renderCTAInline(attrs);
    case 'CTASidebar':
      return renderCTASidebar(attrs);
    case 'LeadMagnet':
      return renderLeadMagnet(attrs);
    case 'NewsletterSignup':
      return renderNewsletter(attrs);
    default:
      return '';
  }
}

export function extractMdxBlocks(markdown: string): {
  body: string;
  blocks: string[];
} {
  leadId = 0;
  const blocks: string[] = [];
  const body = markdown.replace(BLOCK_RE, (_full, name: string, attrs: string) => {
    const html = renderBlock(name, parseAttrs(attrs || ''));
    const i = blocks.length;
    blocks.push(html);
    return `\n\n<!--MDX_BLOCK_${i}-->\n\n`;
  });
  return { body, blocks };
}

export function restoreMdxBlocks(html: string, blocks: string[]): string {
  return html.replace(
    /<p>\s*<!--MDX_BLOCK_(\d+)-->\s*<\/p>|<!--MDX_BLOCK_(\d+)-->/g,
    (_full, a, b) => {
      const i = parseInt(a ?? b, 10);
      return blocks[i] ?? '';
    }
  );
}
