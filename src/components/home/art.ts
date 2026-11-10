/** One round emblem per project: same medallion (sky above a horizon, water below), flat Dusk tones, fine strokes that self-draw. */
const c = { sky: 'var(--sky-300)', mid: 'var(--sky-500)', dusk: 'var(--sky-700)', ink: 'var(--water-900)', deep: 'var(--water-800)', sea: 'var(--water-600)', paper: 'var(--paper)', haze: 'var(--haze-200)', gold: 'var(--gold-400)', taupe: 'var(--taupe-500)', taupeL: 'var(--taupe-300)' };
const line = (x1: number, y1: number, x2: number, y2: number, s = c.paper) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}"/>`;
const poly = (pts: string, s = c.paper) => `<polyline points="${pts}" stroke="${s}"/>`;
const dot = (x: number, y: number, r: number, f: string) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;
const shape = (d: string, f: string) => `<path d="${d}" fill="${f}"/>`;
/** Medallion: sky disc, water segment below the horizon (y 64), gold horizon, two faint reflections. */
const base = `<circle cx="50" cy="50" r="46" fill="${c.sky}"/>${shape('M6.2 64A46 46 0 0 0 93.8 64Z', c.deep)}`;
const frame = (art: string, strokes: string) =>
  `${base}${art}<g class="st" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${line(6, 64, 94, 64, c.gold)}${line(34, 72, 66, 72, c.mid)}${line(42, 79, 58, 79, c.mid)}${strokes}<circle cx="50" cy="50" r="46" stroke="${c.paper}" stroke-opacity=".5"/></g>`;

const emblems: Record<string, string> = {
  // roofline of three houses, a pin over the tallest
  anuntulcasei: frame(
    shape('M16 64V48l11-9 11 9v16Z', c.dusk) + shape('M38 64V40l12-12 12 12v24Z', c.sea) + shape('M62 64V50l10-8 10 8v14Z', c.dusk) +
      shape('M72 14a8 8 0 0 1 8 8c0 6-8 14-8 14s-8-8-8-14a8 8 0 0 1 8-8Z', c.gold) + dot(72, 22, 2.8, c.ink),
    line(44, 52, 56, 52) + line(44, 58, 56, 58) + line(23, 56, 31, 56) + line(68, 58, 76, 58) + poly('38,40 50,28 62,40', c.gold)),
  // rack of three units with a pulse line running through the water
  homelab: frame(
    shape('M30 64V24h40v40Z', c.sea) + shape('M33 27h34v10H33ZM33 39h34v10H33ZM33 51h34v10H33Z', c.dusk) + dot(38, 32, 1.8, c.gold) + dot(38, 44, 1.8, c.gold) + dot(38, 56, 1.8, c.gold),
    line(46, 32, 62, 32) + line(46, 44, 58, 44) + line(46, 56, 62, 56) + poly('14,76 30,76 36,68 42,84 50,72 56,78 86,78', c.gold)),
  // two nodes, one direction
  oneway: frame(
    dot(27, 48, 10, c.ink) + dot(73, 48, 10, c.gold) + dot(27, 80, 3, c.sea) + dot(73, 80, 3, c.sea),
    line(40, 48, 58, 48, c.ink) + poly('52,42 59,48 52,54', c.ink) + `<circle cx="27" cy="48" r="14" stroke="${c.mid}"/>` + `<circle cx="73" cy="48" r="14" stroke="${c.mid}"/>`),
  // two photo frames overlapping, one with a sun over hills
  'faelles': frame(
    `<rect x="22" y="28" width="32" height="30" fill="${c.mid}" transform="rotate(-8 38 43)"/><rect x="42" y="30" width="34" height="30" fill="${c.paper}" transform="rotate(6 59 45)"/>` + dot(66, 40, 3.4, c.gold) + shape('M46 60l10-12 8 8 6-6 5 10Z', c.taupe),
    `<rect x="22" y="28" width="32" height="30" stroke="${c.paper}" transform="rotate(-8 38 43)"/><rect x="42" y="30" width="34" height="30" stroke="${c.ink}" transform="rotate(6 59 45)"/>`),
  // a pass with ticket notches, a harbour spire behind it
  'copenhagen-pass-maximizer': frame(
    shape('M47 40l3-28 3 28Z', c.ink) + shape('M20 62V40h60v22Z', c.paper) + dot(20, 51, 4.5, c.sky) + dot(80, 51, 4.5, c.sky) + dot(64, 51, 5, c.gold),
    line(30, 48, 52, 48, c.ink) + line(30, 55, 44, 55, c.ink) + line(58, 41, 58, 61, c.taupeL)),
  // a plate with fork and knife above, a street grid in the water
  'bucuresti-bites-vibes': frame(
    dot(50, 42, 16, c.paper) + dot(50, 42, 9, c.haze) + dot(50, 42, 3, c.gold),
    line(24, 26, 24, 56, c.ink) + line(21, 26, 21, 34, c.ink) + line(27, 26, 27, 34, c.ink) + line(76, 26, 76, 56, c.ink) +
      line(26, 84, 74, 84, c.mid) + line(32, 68, 28, 90, c.mid) + line(50, 68, 50, 90, c.mid) + line(68, 68, 72, 90, c.mid) + line(20, 76, 80, 76, c.mid)),
  // a dashboard panel with a rising line
  'grafana-observability': frame(
    shape('M20 20h60v44H20Z', c.sea) + shape('M24 24h52v26H24Z', c.deep),
    line(26, 56, 74, 56, c.taupeL) + line(30, 60, 42, 60, c.taupeL) + poly('28,46 38,40 46,43 58,32 66,34 73,27', c.gold) + `<path d="M20 20h60v44H20Z" stroke="${c.paper}"/>`),
  // isometric block resting on the horizon
  minecraft: frame(
    shape('M50 14l24 12-24 12-24-12Z', c.haze) + shape('M26 26l24 12v26L26 52Z', c.taupe) + shape('M74 26L50 38v26l24-12Z', c.dusk),
    poly('50,20 58,24 50,28 42,24 50,20', c.taupe) + poly('26,26 50,38 74,26') + line(50, 38, 50, 64) + poly('26,26 26,52 50,64 74,52 74,26', c.paper)),
};
export interface Art { theme: 'water' | 'sky' | 'taupe' | 'ink'; svg: string }
const themes: Record<string, Art['theme']> = { anuntulcasei: 'ink', homelab: 'water', oneway: 'sky', faelles: 'taupe', 'copenhagen-pass-maximizer': 'water', 'bucuresti-bites-vibes': 'taupe', 'grafana-observability': 'sky', minecraft: 'ink' };
export const artFor = (slug: string): Art => ({ theme: themes[slug] ?? 'ink', svg: emblems[slug] ?? emblems.minecraft });
/** Strokes draw themselves: every shape gets pathLength 1 so one dash rule fits all. */
export const drawable = (svg: string) => svg.replace(/<(rect|line|polyline|path|circle)/g, '<$1 pathLength="1"');
