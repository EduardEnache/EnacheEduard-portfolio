/** Typographic cards for projects without a screenshot: palette theme plus simple line art, keyed by slug. */
const lines = {
  rack: '<rect x="30" y="30" width="62" height="14"/><rect x="30" y="49" width="62" height="14"/><rect x="30" y="68" width="62" height="14"/><rect x="35" y="34" width="6" height="6"/><rect x="35" y="53" width="6" height="6"/><rect x="35" y="72" width="6" height="6"/><line x1="48" y1="37" x2="80" y2="37"/><line x1="48" y1="56" x2="72" y2="56"/><line x1="48" y1="75" x2="84" y2="75"/>',
  chart: '<line x1="10" y1="80" x2="92" y2="80"/><line x1="10" y1="34" x2="10" y2="80"/><polyline points="14,72 30,58 46,64 62,42 78,50 92,28"/><rect x="26" y="68" width="8" height="12"/><rect x="58" y="54" width="8" height="26"/><rect x="74" y="62" width="8" height="18"/>',
  blocks: '<rect x="34" y="32" width="16" height="16"/><rect x="54" y="32" width="16" height="16"/><rect x="74" y="32" width="16" height="16"/><rect x="34" y="52" width="16" height="16"/><rect x="74" y="52" width="16" height="16"/><rect x="34" y="72" width="16" height="16"/><rect x="54" y="72" width="16" height="16"/><line x1="54" y1="52" x2="70" y2="68"/>',
  streets: '<line x1="36" y1="30" x2="36" y2="86"/><line x1="58" y1="30" x2="58" y2="86"/><line x1="80" y1="30" x2="80" y2="86"/><line x1="26" y1="46" x2="92" y2="46"/><line x1="26" y1="68" x2="92" y2="68"/><rect x="54" y="42" width="8" height="8"/>',
};
export interface Art { theme: 'water' | 'sky' | 'taupe' | 'haze'; svg: string }
const bySlug: Record<string, Art> = {
  homelab: { theme: 'water', svg: lines.rack },
  'grafana-observability': { theme: 'sky', svg: lines.chart },
  minecraft: { theme: 'taupe', svg: lines.blocks },
  'bucuresti-bites-vibes': { theme: 'haze', svg: lines.streets },
};
export const artFor = (slug: string): Art => bySlug[slug] ?? { theme: 'haze', svg: lines.blocks };
/** Strokes draw themselves: every shape gets pathLength 1 so one dash rule fits all. */
export const drawable = (svg: string) => svg.replace(/<(rect|line|polyline)/g, '<$1 pathLength="1"');
