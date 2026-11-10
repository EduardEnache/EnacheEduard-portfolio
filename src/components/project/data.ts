import type { CollectionEntry } from 'astro:content';

export type LiveKey = 'anuntulcasei' | 'minecraft' | 'health' | 'monitoring' | 'oneway' | 'faelles' | 'copenhagen-pass-maximizer' | 'bucuresti-bites-vibes';

/** Optional fields the content schema may add; the page renders gracefully without them. */
export interface Extra {
  numbers?: { value: number; prefix?: string; suffix?: string; label: string }[];
  story?: { label: string; title: string; text: string; shot?: string }[];
  live?: LiveKey;
}
export type ProjectData = CollectionEntry<'projects'>['data'] & Extra;
export const dataOf = (e: CollectionEntry<'projects'>) => e.data as ProjectData;

/** Longest word length, so long titles can be sized to fit the line on any width. */
export const longest = (title: string) => Math.max(...title.split(/\s+/).map((w) => w.length));

/** Live strip rows: [label, API field, static fallback, format, total field]. */
export const liveRows: Record<LiveKey, { title: string; rows: [string, string, string, string?, string?][] }> = {
  anuntulcasei: { title: 'Live from AnunțulCasei', rows: [['Active listings', 'listings', '~122k'], ['Unique properties', 'properties', '~67k'], ['Portals healthy', 'portals_healthy', 'n/a', 'of', 'portals']] },
  minecraft: { title: 'Live from the server', rows: [['Server', 'online', 'n/a', 'bool'], ['Players online', 'players_online', 'n/a'], ['Version', 'version', 'n/a']] },
  health: { title: 'Live from the homelab', rows: [['Stacks running', 'stacks', 'n/a'], ['Uptime', 'uptime_days', 'n/a', 'days'], ['CPU', 'cpu_pct', 'n/a', 'pct']] },
  monitoring: { title: 'Live from Prometheus', rows: [['Scrape targets up', 'targets_up', 'n/a', 'of', 'targets'], ['Series in memory', 'series', 'n/a']] },
  oneway: repoBlock('ONE·WAY', 'n/a'),
  faelles: repoBlock('fælles.', 'Retired'),
  'copenhagen-pass-maximizer': repoBlock('Copenhagen Pass Maximizer', 'Retired'),
  'bucuresti-bites-vibes': repoBlock('București Bites & Vibes', 'Archived', false), // a single commit reads thin: no count row
};

/** Repo facts from the API; the service state falls back to what the project page already says. */
function repoBlock(name: string, status: string, commits = true) {
  return { title: `Live from the ${name} repo`, rows: [...(commits ? [['Commits', 'commits', 'n/a']] : []), ['Last commit', 'last_commit_at', 'n/a', 'date'], ['Service', 'status', status, 'cap']] as [string, string, string, string?, string?][] };
}
