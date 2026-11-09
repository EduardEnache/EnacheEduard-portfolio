import { defineConfig } from 'astro/config';

// Static output; dev/preview bind to loopback only.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  server: { host: '127.0.0.1' },
  devToolbar: { enabled: false },
});
