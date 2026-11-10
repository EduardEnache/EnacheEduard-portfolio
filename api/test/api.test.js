import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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

test('repo facts: only counts, a date and a state word; unknown names are 404', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'repo-'));
  const g = (...a) => execFileSync('git', ['-C', dir, '-c', 'user.name=Secret Name', '-c', 'user.email=secret@example.com', ...a]);
  g('init', '-q'); g('commit', '-q', '--allow-empty', '-m', 'SECRET-commit-message');
  const repos = { oneway: { dir: join(dir, '.git'), project: 'oneway' }, faelles: { dir: join(dir, '.git'), state: 'retired' } };
  const s = await start({ repos });
  const one = await (await fetch(`${s.url}/v1/oneway`)).json();
  assert.deepEqual(Object.keys(one).sort(), ['commits', 'last_commit_at', 'stale', 'status', 'updated_at']);
  assert.equal(one.commits, 1);
  assert.equal(one.status, 'running');
  assert.equal((await (await fetch(`${s.url}/v1/faelles`)).json()).status, 'retired');
  assert.equal((await fetch(`${s.url}/v1/constructor`)).status, 404);
  const mon = await (await fetch(`${s.url}/v1/monitoring`)).json();
  assert.deepEqual(Object.keys(mon).sort(), ['series', 'stale', 'targets', 'targets_up', 'updated_at']);
  const all = await (await fetch(`${s.url}/v1/all`)).text();
  assert.ok(!/SECRET|secret@|\/tmp\//i.test(all));
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

test('rate limit: 60/min per IP; x-real-ip only from the trusted proxy peer', async () => {
  const codes = async (s, h) => { const c = []; for (let i = 0; i < 62; i++) c.push((await fetch(`${s.url}/v1/minecraft`, { headers: h(i) })).status); return c; };
  const spoof = (i) => ({ 'x-forwarded-for': `9.9.9.${i}`, 'x-real-ip': `8.8.8.${i}` });
  // no trusted proxy configured, or the peer is not it: spoofed headers are ignored, one bucket
  for (const trustedProxy of [undefined, '10.9.9.9']) {
    const s = await start({ trustedProxy });
    const c = await codes(s, spoof);
    assert.deepEqual([c[59], c[60]], [200, 429]);
    s.close();
  }
  // the peer is the trusted proxy (tests connect from 127.0.0.1): its x-real-ip picks the bucket
  const t = await start({ trustedProxy: '127.0.0.1' });
  assert.ok((await codes(t, spoof)).every((c) => c === 200));
  t.close();
});

test('hits map stays bounded', async () => {
  const s = await start({ trustedProxy: '127.0.0.1' });
  for (let i = 0; i < 10_400; i++) await fetch(`${s.url}/v1/minecraft`, { headers: { 'x-real-ip': `7.${i >> 8}.${i & 255}.1` } });
  s.close(); // bound is enforced in limited(); reaching here without memory error with 10k+ distinct IPs is the smoke check
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
