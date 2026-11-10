import { createApp } from './app.js';

const e = process.env;
const list = (v, d) => (v || d).split(',').map((s) => s.trim()).filter(Boolean);
createApp({
  prometheusUrl: e.PROMETHEUS_URL, casataUrl: e.CASATA_API_URL, bridgeUrl: e.MC_BRIDGE_URL,
  bluemapUrl: /^https:\/\//.test(e.BLUEMAP_URL || '') ? e.BLUEMAP_URL : null,
  // repo dirs are read-only mounts (see docker-compose.yml); project = compose project label for the running check
  repos: {
    oneway: { dir: '/repos/oneway', project: 'oneway' },
    faelles: { dir: '/repos/faelles', state: 'retired' },
    'copenhagen-pass-maximizer': { dir: '/repos/copenhagen', state: 'retired' },
    'bucuresti-bites-vibes': { dir: '/repos/bucuresti', state: 'archived' },
  },
  allowedOrigins: list(e.ALLOWED_ORIGINS, 'http://localhost:4321,http://127.0.0.1:4321'),
  trustedProxy: e.TRUSTED_PROXY_IP || null, // the web container's fixed address; only it may set x-real-ip
}).listen(Number(e.PORT) || 8080, '0.0.0.0'); // 0.0.0.0 is inside the container; compose publishes 127.0.0.1 only
