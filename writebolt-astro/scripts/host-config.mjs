/**
 * Wire writebolt() into the Astro site that already exists.
 */
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';

const CONFIG_NAMES = ['astro.config.mjs', 'astro.config.ts', 'astro.config.js'];
const LAYOUTS = [
  'src/layouts/Layout.astro',
  'src/layouts/BaseLayout.astro',
  'src/layouts/Base.astro',
  'src/layouts/PageLayout.astro',
  'src/layouts/MainLayout.astro',
  'src/layouts/Page.astro',
];

export function findAstroConfig(hostDir) {
  return CONFIG_NAMES.map((name) => join(hostDir, name)).find((file) => existsSync(file)) || '';
}

export function findLayout(hostDir) {
  return LAYOUTS.find((file) => existsSync(join(hostDir, file))) || '';
}

export function hasDefaultSlot(source) {
  const tags = source.match(/<slot\b[^>]*>/g) || [];
  return tags.some((tag) => !/\bname\s*=/.test(tag));
}

export function configHasAdapter(source) {
  return /\badapter\s*:/.test(source);
}

export function ensureWriteboltIntegration(source, { importPath, layoutPath }) {
  if (/writebolt\s*\(/.test(source)) return { source, changed: false };
  const importLine = `import { writebolt } from '${importPath}';`;
  const call = `writebolt({ layout: '${layoutPath}' })`;
  let next = source;
  if (!source.includes(importPath)) {
    const imports = [...next.matchAll(/^import .+$/gm)];
    if (imports.length) {
      const last = imports[imports.length - 1];
      const at = last.index + last[0].length;
      next = `${next.slice(0, at)}\n${importLine}${next.slice(at)}`;
    } else {
      next = `${importLine}\n${next}`;
    }
  }
  if (/integrations\s*:\s*\[/.test(next)) {
    next = next.replace(/integrations\s*:\s*\[/, `integrations: [\n    ${call},`);
    return { source: next, changed: true };
  }
  if (/defineConfig\s*\(\s*\{/.test(next)) {
    next = next.replace(
      /defineConfig\s*\(\s*\{/,
      `defineConfig({\n  integrations: [\n    ${call},\n  ],`
    );
    return { source: next, changed: true };
  }
  return { source, changed: false, manual: true, importLine, call };
}

export function integrationImportPath(blogDir) {
  return `./${basename(blogDir)}/integration/astro.mjs`;
}
