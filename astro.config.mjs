import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

try { process.loadEnvFile(); } catch {} // astro.config does not read .env on its own
// Static output; dev/preview bind to loopback only. SITE_URL overrides the production origin (e.g. the *.pages.dev preview).
const site = process.env.SITE_URL || 'https://eduardenache.ro';
export default defineConfig({
  site,
  output: 'static',
  outDir: process.env.DIST || 'dist', // DIST lets a scratch build run without touching the live dist/
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  server: { host: '127.0.0.1' },
  devToolbar: { enabled: false },
});
