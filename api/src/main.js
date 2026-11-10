import { createApp } from './app.js';

const e = process.env;
const list = (v, d) => (v || d).split(',').map((s) => s.trim()).filter(Boolean);
createApp({
  prometheusUrl: e.PROMETHEUS_URL, casataUrl: e.CASATA_API_URL, bridgeUrl: e.MC_BRIDGE_URL,
  bluemapUrl: /^https:\/\//.test(e.BLUEMAP_URL || '') ? e.BLUEMAP_URL : null,
  allowedOrigins: list(e.ALLOWED_ORIGINS, 'http://localhost:4321,http://127.0.0.1:4321'),
  trustProxy: e.TRUST_PROXY === '1', proxyHeader: (e.TRUST_PROXY_HEADER || 'x-forwarded-for').toLowerCase(),
}).listen(Number(e.PORT) || 8080, '0.0.0.0'); // 0.0.0.0 is inside the container; compose publishes 127.0.0.1 only
