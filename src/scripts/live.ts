import { site } from '../data/site';

type Data = Record<string, unknown>;
const NA = 'not available yet';

/** One request to `${PUBLIC_API_BASE}/all`; null when unset, slow or failing (the static fallback then stays). */
export async function fetchLive(timeoutMs = 4000): Promise<Record<string, Data | null> | null> {
  if (!site.apiBase) return null;
  try {
    const res = await fetch(site.apiBase.replace(/\/$/, '') + '/all', { signal: AbortSignal.timeout(timeoutMs) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

const int = (v: number) => v.toLocaleString('en');
const ago = (iso: string) => {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  const [n, unit] = s < 90 ? [Math.round(s), 'second'] : s < 5400 ? [Math.round(s / 60), 'minute'] : s < 129600 ? [Math.round(s / 3600), 'hour'] : [Math.round(s / 86400), 'day'];
  return n === 0 ? 'just now' : `${n} ${unit}${n === 1 ? '' : 's'} ago`;
};

/** Text for one [data-field]; null means the API has no value yet. */
function format(el: HTMLElement, d: Data): string | null {
  const v = d[el.dataset.field!];
  switch (el.dataset.fmt) {
    case 'pct': return typeof v === 'number' ? `${v}%` : null;
    case 'days': return typeof v === 'number' ? `${v} days` : null;
    case 'of': { // "7 of 7": value is field, total is data-of
      const t = d[el.dataset.of!];
      return typeof v === 'number' && typeof t === 'number' ? `${v} of ${t}` : null;
    }
    case 'date': return typeof v === 'string' && !isNaN(Date.parse(v)) ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
    case 'cap': return typeof v === 'string' && v ? v[0].toUpperCase() + v.slice(1) : null;
    case 'bool': return typeof v === 'boolean' ? (v ? 'Online' : 'Offline') : null;
    case 'list': return Array.isArray(v) && v.length ? v.join(', ') : 'nobody right now';
    default: return typeof v === 'number' ? int(v) : typeof v === 'string' ? v : null;
  }
}

function fill(block: HTMLElement, d: Data) {
  block.querySelectorAll<HTMLElement>('[data-field]').forEach((el) => {
    el.dataset.prev = el.textContent ?? ''; // lets a scene tick from the old value to the new one
    if (el.dataset.fmt === 'ago') { // relative time inside a <time datetime>
      const iso = typeof d[el.dataset.field!] === 'string' ? (d[el.dataset.field!] as string) : '';
      if (iso && el instanceof HTMLTimeElement) { el.dateTime = iso; el.textContent = `Last crawl: ${ago(iso)}`; return; }
      el.textContent = 'Last crawl: n/a'; return;
    }
    el.textContent = format(el, d) ?? NA;
  });

  const board = block.querySelector<HTMLOListElement>('[data-board]');
  if (board) {
    const rows = Array.isArray(d.leaderboard) ? (d.leaderboard as { name: string; deaths: number }[]) : [];
    board.replaceChildren(...rows.map((r) => {
      const li = document.createElement('li');
      li.textContent = `${r.name}: ${r.deaths} ${r.deaths === 1 ? 'death' : 'deaths'}`;
      return li;
    }));
    board.hidden = !rows.length;
    block.querySelector<HTMLElement>('[data-empty]')!.hidden = rows.length > 0;
  }

  const map = block.querySelector<HTMLAnchorElement>('[data-bluemap]');
  if (map) {
    const url = typeof d.bluemap_url === 'string' ? d.bluemap_url : '';
    if (url) map.href = url;
    map.hidden = !url;
  }

  block.dataset.state = d.stale ? 'stale' : 'live';
  block.querySelector('[data-status]')!.textContent = d.stale ? 'Last known values' : 'Live';
  block.dispatchEvent(new CustomEvent('live:fill', { detail: { state: block.dataset.state } }));
}

/** Fills every [data-live] block under root; resolves true when the API answered, false when the fallback stays. */
export async function hydrateLive(root: ParentNode = document): Promise<boolean> {
  const all = await fetchLive();
  if (!all) return false;
  root.querySelectorAll<HTMLElement>('[data-live]').forEach((block) => {
    const d = all[block.dataset.live!];
    if (d) fill(block, d);
  });
  return true;
}
