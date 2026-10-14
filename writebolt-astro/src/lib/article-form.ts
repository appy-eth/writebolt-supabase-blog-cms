import { parseTags, slugify } from './utils';
import { calculateReadingTime, calculateWordCount } from './reading-time';

export function articlePayloadFromForm(form: FormData, existing?: { published_at?: string | null }) {
  const headline = form.get('headline')?.toString() || '';
  const slug = form.get('slug')?.toString() || slugify(headline);
  const content_markdown = form.get('content_markdown')?.toString() || '';
  const excerpt = form.get('excerpt')?.toString() || '';
  const featured_image = form.get('featured_image')?.toString() || '';
  const featured_image_alt = form.get('featured_image_alt')?.toString() || null;
  const category_id = form.get('category_id')?.toString() || null;
  const author_id = form.get('author_id')?.toString() || null;
  const tags = parseTags(form.get('tags')?.toString());
  const seo_title = form.get('seo_title')?.toString() || null;
  const seo_description = form.get('seo_description')?.toString() || null;
  const action = form.get('action')?.toString() || 'draft';

  const status =
    action === 'publish'
      ? 'published'
      : action === 'schedule'
        ? 'scheduled'
        : action === 'archive'
          ? 'archived'
          : 'draft';

  const published_at =
    status === 'published' && !existing?.published_at
      ? new Date().toISOString()
      : existing?.published_at ?? (status === 'published' ? new Date().toISOString() : null);

  const scheduled_for =
    status === 'scheduled' ? form.get('scheduled_for')?.toString() || null : null;

  return {
    headline,
    slug,
    content_markdown,
    excerpt,
    featured_image,
    featured_image_alt,
    category_id: category_id || null,
    author_id: author_id || null,
    tags,
    seo_title,
    seo_description,
    status,
    published_at,
    scheduled_for,
    word_count: calculateWordCount(content_markdown),
    reading_time_minutes: calculateReadingTime(content_markdown),
    updated_at: new Date().toISOString(),
  };
}
