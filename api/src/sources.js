import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);

// Each fetcher reads one upstream and returns a NEW object built field by field.
// Nothing from an upstream response is ever spread or passed through.

const get = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
  if (!res.ok) throw new Error('upstream');
  return res.json();
};
const num = (v, d = 0) => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(Number(v).toFixed(d)) : null);
const iso = (sec) => (Number.isFinite(sec) && sec > 0 ? new Date(sec * 1000).toISOString() : null);
const NAME = /^[A-Za-z0-9_]{1,16}$/; // Minecraft gamertag; also drops uuid-ish or odd values

async function prom(cfg, query) {
  const j = await get(`${cfg.prometheusUrl}/api/v1/query?query=${encodeURIComponent(query)}`);
  const r = j?.data?.result;
  if (j?.status !== 'success' || !Array.isArray(r)) throw new Error('upstream');
  return r.map((x) => [x.metric?.source, parseFloat(x.value?.[1])]);
}
const scalar = async (cfg, q) => (await prom(cfg, q))[0]?.[1];
const orNull = (p) => p.catch(() => null);

export async function health(cfg) {
  const node = 'job="node"';
  const root = `${node},mountpoint="/"`;
  const [up, cpu, mem, disk, containers, stacks] = await Promise.all([
    `(time()-node_boot_time_seconds{${node}})/86400`,
    `100-avg(rate(node_cpu_seconds_total{${node},mode="idle"}[5m]))*100`,
    `100*(1-node_memory_MemAvailable_bytes{${node}}/node_memory_MemTotal_bytes{${node}})`,
    `100*(1-node_filesystem_avail_bytes{${root}}/node_filesystem_size_bytes{${root}})`,
    `count(container_last_seen{job="cadvisor",name!=""}>time()-60)`,
    `count(count by (container_label_com_docker_compose_project)(container_last_seen{job="cadvisor",container_label_com_docker_compose_project!=""}>time()-60))`,
  ].map((q) => orNull(scalar(cfg, q))));
  if ([up, cpu, mem, disk, containers, stacks].every((v) => v == null)) throw new Error('upstream');
  return {
    uptime_days: num(up, 1), cpu_pct: num(cpu, 1), mem_pct: num(mem, 1), disk_pct: num(disk, 1),
    containers: num(containers), stacks: num(stacks),
    last_update: null, // no machine-readable weekly-update result exists yet
  };
}

export async function anuntulcasei(cfg) {
  const [stats, listings, health, scans] = await Promise.all([
    orNull(get(`${cfg.casataUrl}/stats`)),
    orNull(scalar(cfg, 'casata_catalogue_active_listings')),
    // a portal is healthy when not paused, last HTTP status < 400 and scanned within 24h
    orNull(prom(cfg, 'count(casata_source_paused==0 and casata_source_last_http_status<400 and time()-casata_source_last_scan_timestamp_seconds<86400)').then((r) => r[0]?.[1] ?? 0)),
    orNull(prom(cfg, 'casata_source_last_scan_timestamp_seconds')),
  ]);
  const portals = await orNull(prom(cfg, 'count(casata_source_active_listings)').then((r) => r[0]?.[1]));
  if (!stats && listings == null && !scans) throw new Error('upstream');
  return {
    listings: num(listings), properties: num(stats?.total), new_24h: num(stats?.newToday),
    portals: num(portals), portals_healthy: num(health),
    last_crawl_at: iso(scans ? Math.max(...scans.map((s) => s[1])) : NaN),
  };
}

export async function minecraft(cfg) {
  const [status, stats] = await Promise.all([get(`${cfg.bridgeUrl}/api/status`), orNull(get(`${cfg.bridgeUrl}/api/stats`))]);
  const players = (Array.isArray(status.players) ? status.players : []).map((p) => (typeof p === 'string' ? p : p?.name)).filter((n) => NAME.test(n));
  // No stat files yet (nobody has played) => leaderboard unavailable, not an empty invented one.
  const rows = stats && !stats.missing && Array.isArray(stats.players) ? stats.players : null;
  const board = rows && rows
    .filter((p) => NAME.test(p?.name) && !p.name.startsWith('bot_') && Number(p.deaths) >= 0)
    .sort((a, b) => b.deaths - a.deaths).slice(0, 10)
    .map((p) => ({ name: p.name, deaths: num(p.deaths), play_hours: num(p.play_hours, 1), mob_kills: num(p.mob_kills) }));
  return {
    online: status.online === true,
    version: typeof status.version === 'string' ? status.version.slice(0, 32) : null,
    players_online: num(status.players_online), players_max: num(status.players_max), players,
    deaths: board ? board.reduce((s, p) => s + p.deaths, 0) : null,
    leaderboard: board,
    bluemap_url: cfg.bluemapUrl || null,
  };
}

// Repo facts per project: counts, dates and a state word only (never messages, authors or paths).
// cfg.repos is a fixed slug -> { dir, project?, state? } map from config, never user input.
export const repo = (slug) => async (cfg) => {
  const r = cfg.repos?.[slug];
  if (!r) throw new Error('unconfigured');
  const git = (...a) => execFileAsync('git', ['--git-dir', r.dir, ...a], { timeout: 3000 }).then((o) => o.stdout.trim());
  const [count, last, running] = await Promise.all([
    git('rev-list', '--count', '--all'),
    git('log', '-1', '--all', '--format=%ct'),
    r.state || !r.project ? null
      : orNull(scalar(cfg, `count(container_last_seen{job="cadvisor",container_label_com_docker_compose_project="${r.project}"}>time()-60)`)),
  ]);
  return { commits: num(count), last_commit_at: iso(Number(last)), status: r.state ?? (running > 0 ? 'running' : 'stopped') };
};

// Prometheus itself: scrape targets up and series held.
export async function monitoring(cfg) {
  const [targets, up, series] = await Promise.all(['count(up)', 'count(up==1)', 'prometheus_tsdb_head_series'].map((q) => orNull(scalar(cfg, q))));
  if (targets == null) throw new Error('upstream');
  return { targets: num(targets), targets_up: num(up) ?? 0, series: num(series) };
}
