import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  configHasAdapter,
  ensureWriteboltIntegration,
  findAstroConfig,
  findLayout,
  hasDefaultSlot,
} from './host-config.mjs';

test('hasDefaultSlot ignores a named head slot', () => {
  assert.equal(hasDefaultSlot('<slot name="head" />'), false);
  assert.equal(hasDefaultSlot('<slot />'), true);
  assert.equal(hasDefaultSlot('<slot></slot>'), true);
  assert.equal(hasDefaultSlot('<slot name="head" /><slot />'), true);
});

test('ensureWriteboltIntegration adds the import and the integrations entry', () => {
  const source = `import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()],
});
`;
  const result = ensureWriteboltIntegration(source, {
    importPath: './writebolt-astro/integration/astro.mjs',
    layoutPath: './src/layouts/Layout.astro',
  });
  assert.equal(result.changed, true);
  assert.match(result.source, /import \{ writebolt \} from '\.\/writebolt-astro\/integration\/astro\.mjs';/);
  assert.match(result.source, /writebolt\(\{ layout: '\.\/src\/layouts\/Layout\.astro' \}\)/);
  assert.match(result.source, /sitemap\(\)/);
});

test('ensureWriteboltIntegration leaves an existing call alone', () => {
  const source = `import { writebolt } from './writebolt-astro/integration/astro.mjs';
export default defineConfig({ integrations: [writebolt({ layout: './src/layouts/Layout.astro' })] });
`;
  const result = ensureWriteboltIntegration(source, {
    importPath: './writebolt-astro/integration/astro.mjs',
    layoutPath: './src/layouts/Layout.astro',
  });
  assert.equal(result.changed, false);
  assert.equal(result.source, source);
});

test('ensureWriteboltIntegration creates an integrations array', () => {
  const source = `import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://example.com',
});
`;
  const result = ensureWriteboltIntegration(source, {
    importPath: './writebolt-astro/integration/astro.mjs',
    layoutPath: './src/layouts/Base.astro',
  });
  assert.equal(result.changed, true);
  assert.match(result.source, /integrations: \[\n    writebolt\(\{ layout: '\.\/src\/layouts\/Base\.astro' \}\),\n  \],/);
});

test('configHasAdapter sees an adapter assignment', () => {
  assert.equal(configHasAdapter('adapter: node({ mode: "standalone" }),'), true);
  assert.equal(configHasAdapter('export default defineConfig({ site: "https://example.com" });'), false);
});

test('findAstroConfig and findLayout use the site files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'writebolt-host-'));
  writeFileSync(join(dir, 'astro.config.mjs'), 'export default {};\n');
  mkdirSync(join(dir, 'src', 'layouts'), { recursive: true });
  writeFileSync(join(dir, 'src', 'layouts', 'Layout.astro'), '<slot />\n');
  assert.equal(findAstroConfig(dir), join(dir, 'astro.config.mjs'));
  assert.equal(findLayout(dir), 'src/layouts/Layout.astro');
});
