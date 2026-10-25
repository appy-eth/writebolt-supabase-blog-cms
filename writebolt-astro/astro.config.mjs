import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import { writebolt } from './integration/astro.mjs';

export default defineConfig({
  output: 'server',
  site: process.env.SITE_URL || 'http://localhost:4321',
  adapter: node({ mode: 'standalone' }),
  integrations: [writebolt({ standalone: true })],
});
