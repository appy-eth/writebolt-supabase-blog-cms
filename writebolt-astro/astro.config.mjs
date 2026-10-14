import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  site: process.env.SITE_URL || 'http://localhost:4321',
  adapter: node({ mode: 'standalone' }),
});
