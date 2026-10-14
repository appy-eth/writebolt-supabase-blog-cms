import { marked, type RendererObject } from 'marked';
import { slugify } from './utils';
import { extractMdxBlocks, restoreMdxBlocks } from './mdx-blocks';

const renderer: RendererObject = {
  heading({ text, depth }) {
    const plain = text.replace(/<[^>]*>/g, '');
    const id = slugify(plain);
    return `<h${depth} id="${id}"><a class="anchor-link" href="#${id}">${text}</a></h${depth}>\n`;
  },
};

marked.use({ gfm: true, renderer });

export async function renderMarkdown(markdown: string): Promise<string> {
  const { body, blocks } = extractMdxBlocks(markdown || '');
  const html = (await marked.parse(body, { async: true })) as string;
  return restoreMdxBlocks(html, blocks);
}
