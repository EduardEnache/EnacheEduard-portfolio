import http from 'node:http';
import * as src from './sources.js';

const TTL = 45_000, LIMIT = 60, WINDOW = 60_000;
export const REPO_SLUGS = ['oneway', 'faelles', 'copenhagen-pass-maximizer', 'bucuresti-bites-vibes'];
const ENDPOINTS = {
  health: src.health, anuntulcasei: src.anuntulcasei, minecraft: src.minecraft, monitoring: src.monitoring,
  ...Object.fromEntries(REPO_SLUGS.map((s) => [s, src.repo(s)])),
};

export function createApp(cfg) {
  const cache = {}; // name -> { at, data, inflight }
  const hits = new Map(); // ip -> { n, reset }

  // Fresh value, or the last good one flagged stale when the source fails. null = never had one.
  async function load(name) {
    const c = (cache[name] ??= {});
    if (c.data && Date.now() - c.at < TTL) return { ...c.data, updated_at: new Date(c.at).toISOString(), stale: false };
    c.inflight ??= ENDPOINTS[name](cfg)
      .then((data) => { c.data = data; c.at = Date.now(); return true; }, () => false)
      .finally(() => { c.inflight = null; });
    const ok = await c.inflight;
    return c.data ? { ...c.data, updated_at: new Date(c.at).toISOString(), stale: !ok } : null;
  }

  function clientIp(req) {
    if (cfg.trustProxy) {
      const v = req.headers[cfg.proxyHeader];
      if (typeof v === 'string' && v) return v.split(',').pop().trim().slice(0, 64); // rightmost = added by our one proxy
    }
    return req.socket.remoteAddress;
  }

  function limited(ip) {
    const now = Date.now();
    if (hits.size > 10_000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    let h = hits.get(ip);
    if (!h || h.reset < now) hits.set(ip, (h = { n: 0, reset: now + WINDOW }));
    return ++h.n > LIMIT;
  }

  return http.createServer(async (req, res) => {
    const send = (code, body, extra = {}) => {
      res.writeHead(code, {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
        'Referrer-Policy': 'no-referrer',
        'Cache-Control': code === 200 ? 'public, max-age=30' : 'no-store',
        Vary: 'Origin',
        ...extra,
      });
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify(body));
    };
    const origin = req.headers.origin;
    const cors = origin && cfg.allowedOrigins.includes(origin)
      ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS', 'Access-Control-Max-Age': '600' } : {};
    const ok = (code, body, extra) => send(code, body, { ...cors, ...extra });

    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return ok(405, { error: 'method not allowed' }, { Allow: 'GET, HEAD, OPTIONS' });
    const path = (req.url || '').split('?')[0];
    if (path === '/healthz') return ok(200, { ok: true });
    if (limited(clientIp(req))) return ok(429, { error: 'rate limited' }, { 'Retry-After': '60' });
    if (req.method === 'OPTIONS') return res.writeHead(204, { ...cors, Vary: 'Origin' }).end();

    const name = path.replace(/^\/v1\//, '');
    if (!path.startsWith('/v1/') || !(Object.hasOwn(ENDPOINTS, name) || name === 'all')) return ok(404, { error: 'not found' });

    if (name !== 'all') {
      const d = await load(name);
      return d ? ok(200, d) : ok(503, { error: 'unavailable', stale: true, updated_at: null });
    }
    const parts = await Promise.all(Object.keys(ENDPOINTS).map(load));
    const body = Object.fromEntries(Object.keys(ENDPOINTS).map((k, i) => [k, parts[i]]));
    const got = parts.filter(Boolean);
    return ok(200, {
      updated_at: got.length ? got.map((p) => p.updated_at).sort()[0] : null, // oldest part
      stale: got.length < parts.length || got.some((p) => p.stale),
      ...body,
    });
  });
}
