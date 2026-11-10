import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';

const SECRET = 'SECRET-xyz-10.1.2.3';
let fail = false, upstreamCalls = 0;
const prom = (v) => ({ status: 'success', data: { result: [{ metric: { source: 'olx', instance: SECRET }, value: [0, String(v)] }] } });

// Fake Prometheus + CasaTa API + MC bridge on one server, each response stuffed with extra secret-looking fields.
const upstream = http.createServer((req, res) => {
  upstreamCalls++;
  if (fail) return res.writeHead(500).end(SECRET);
  const u = new URL(req.url, 'http://x');
  const body =
    u.pathname === '/api/v1/query' ? prom(7)
    : u.pathname === '/stats' ? { total: 100, newToday: 5, token: SECRET }
    : u.pathname === '/api/status' ? { online: true, version: '1.2', players_online: 1, players_max: 20, players: ['Steve', { name: 'Alex', uuid: SECRET }, '10.0.0.5'], ip: SECRET }
    : { missing: false, players: [{ name: 'Steve', deaths: 3, play_hours: 1.5, mob_kills: 2, uuid: SECRET, password: SECRET }, { name: 'bot_x', deaths: 99 }] };
  res.setHeader('content-type', 'application/json').end(JSON.stringify(body));
});
await new Promise((r) => upstream.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${upstream.address().port}`;

const start = async (extra = {}) => {
  const app = createApp({ prometheusUrl: base, casataUrl: base, bridgeUrl: base, bluemapUrl: 'https://map.example/', allowedOrigins: ['http://localhost:4321'], ...extra });
  await new Promise((r) => app.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${app.address().port}`;
  return { url, close: () => app.close() };
};

test('allow-list: no upstream extras leak, shapes are fixed', async () => {
  const s = await start();
  for (const p of ['health', 'anuntulcasei', 'minecraft', 'all']) {
    const text = await (await fetch(`${s.url}/v1/${p}`)).text();
    assert.ok(!text.includes('SECRET') && !text.includes('10.0.0.5'), p);
    assert.match(text, /"updated_at":"/);
    assert.match(text, /"stale":false/);
  }
  const mc = await (await fetch(`${s.url}/v1/minecraft`)).json();
  assert.deepEqual(mc.players, ['Steve', 'Alex']);
  assert.deepEqual(mc.leaderboard, [{ name: 'Steve', deaths: 3, play_hours: 1.5, mob_kills: 2 }]);
  assert.equal(mc.bluemap_url, 'https://map.example/');
  s.close();
});

test('stale fallback, never leaks upstream error, 503 when nothing cached', async () => {
  fail = true;
  const cold = await start();
  const r = await fetch(`${cold.url}/v1/health`);
  assert.equal(r.status, 503);
  assert.ok(!(await r.text()).includes('SECRET'));
  cold.close();

  fail = false;
  const s = await start();
  assert.equal((await (await fetch(`${s.url}/v1/health`)).json()).stale, false);
  // force expiry by moving the clock, then break the upstream
  const now = Date.now; Date.now = () => now() + 60_000;
  fail = true;
  const j = await (await fetch(`${s.url}/v1/health`)).json();
  Date.now = now; fail = false;
  assert.equal(j.stale, true);
  assert.equal(j.stacks, 7);
  s.close();
});

test('cache: second request does not hit upstream', async () => {
  const s = await start();
  await fetch(`${s.url}/v1/minecraft`);
  const n = upstreamCalls;
  await fetch(`${s.url}/v1/minecraft`);
  assert.equal(upstreamCalls, n);
  s.close();
});

test('rate limit: 60/min per IP, proxy header only when trusted', async () => {
  const s = await start();
  const codes = [];
  for (let i = 0; i < 62; i++) codes.push((await fetch(`${s.url}/v1/minecraft`, { headers: { 'x-forwarded-for': `9.9.9.${i}` } })).status);
  assert.deepEqual([codes[59], codes[60]], [200, 429]); // spoofed header ignored
  s.close();
  const t = await start({ trustProxy: true, proxyHeader: 'x-forwarded-for' });
  const c2 = [];
  for (let i = 0; i < 62; i++) c2.push((await fetch(`${t.url}/v1/minecraft`, { headers: { 'x-forwarded-for': `1.1.1.1, 9.9.9.${i}` } })).status);
  assert.ok(c2.every((c) => c === 200)); // rightmost entry differs each time
  t.close();
});

test('CORS and methods', async () => {
  const s = await start();
  const ok = await fetch(`${s.url}/v1/health`, { headers: { origin: 'http://localhost:4321' } });
  assert.equal(ok.headers.get('access-control-allow-origin'), 'http://localhost:4321');
  const bad = await fetch(`${s.url}/v1/health`, { headers: { origin: 'https://evil.example' } });
  assert.equal(bad.headers.get('access-control-allow-origin'), null);
  assert.equal(bad.headers.get('x-content-type-options'), 'nosniff');
  const pre = await fetch(`${s.url}/v1/health`, { method: 'OPTIONS', headers: { origin: 'http://localhost:4321' } });
  assert.equal(pre.status, 204);
  assert.equal((await fetch(`${s.url}/v1/health`, { method: 'POST' })).status, 405);
  assert.equal((await fetch(`${s.url}/nope`)).status, 404);
  s.close();
});

test.after(() => upstream.close());
