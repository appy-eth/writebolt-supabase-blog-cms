import { applyBase } from './paths.mjs';

/** Browser fetches must stay under /blog when the blog is mounted on a host site. */
export function clientPath(path: string): string {
  const base = document.querySelector('[data-wb-base]')?.getAttribute('data-wb-base') || '';
  return applyBase(base, path);
}
