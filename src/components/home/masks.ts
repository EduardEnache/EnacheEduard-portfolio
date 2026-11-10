/** Build time only: Bayer dither mask tiles as tiny PNG data URIs, emitted as CSS custom properties and keyframes. */
// @ts-ignore: this project ships no @types/node; zlib is only used at build time
import { deflateSync } from 'node:zlib';
import { rank, threshold } from '../../scripts/scenes/dither';

const CELL = 3; // css px per dither cell
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (b: Uint8Array) => {
  let c = 0xffffffff;
  for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const cat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
};
const u32 = (n: number) => new Uint8Array([n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const chunk = (type: string, data: Uint8Array) => {
  const t = cat(new TextEncoder().encode(type), data);
  return cat(u32(data.length), t, u32(crc(t)));
};

/** w x h greyscale+alpha PNG; `on(cx, cy)` says whether the cell (in dither cells) is opaque. */
function png(w: number, h: number, on: (cx: number, cy: number) => boolean): string {
  const row = w * 2 + 1;
  const raw = new Uint8Array(row * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw[y * row + 1 + x * 2 + 1] = on(Math.floor(x / CELL), Math.floor(y / CELL)) ? 255 : 0;
  const ihdr = cat(u32(w), u32(h), new Uint8Array([8, 4, 0, 0, 0]));
  const file = cat(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', new Uint8Array(deflateSync(raw))), chunk('IEND', new Uint8Array(0)));
  let bin = '';
  for (const b of file) bin += String.fromCharCode(b);
  return `url(data:image/png;base64,${btoa(bin)})`;
}

export const EDGE = { left: 140, bottom: 90, bottomPhone: 57, topPhone: 48, join: 72 };

export function ditherCss(): string {
  const cells = (px: number) => Math.round(px / CELL);
  const left = png(cells(EDGE.left) * CELL + CELL, 8 * CELL, (cx, cy) => (cx + 0.5) / cells(EDGE.left) > threshold(cx, cy));
  const bottom = (px: number) => png(8 * CELL, cells(px) * CELL, (cx, cy) => 1 - (cy + 0.5) / cells(px) > threshold(cx, cy));
  const top = png(8 * CELL, cells(EDGE.topPhone) * CELL, (cx, cy) => (cy + 0.5) / cells(EDGE.topPhone) > threshold(cx, cy));
  const join = png(8 * CELL, cells(EDGE.join) * CELL, (cx, cy) => 1 - (cy + 0.5) / cells(EDGE.join) > threshold(cx, cy));
  const levels = Array.from({ length: 17 }, (_, L) => png(8 * CELL, 8 * CELL, (cx, cy) => rank(cx, cy) < L * 4));
  const frames = levels.map((_, i) => {
    const L = 16 - i;
    return `${((i * 100) / 17).toFixed(3)}%{mask-image:${levels[L]}}`;
  }).join('');
  return `:root{--m-left:${left};--m-bottom:${bottom(EDGE.bottom)};--m-bottom-phone:${bottom(EDGE.bottomPhone)};--m-top-phone:${top};--m-join:${join};--m-full:${levels[16]};--cell:${CELL}px;--edge-left:${cells(EDGE.left) * CELL + CELL}px;--edge-bottom:${EDGE.bottom}px;--edge-bottom-phone:${EDGE.bottomPhone}px;--edge-top-phone:${EDGE.topPhone}px;--edge-join:${EDGE.join}px}@keyframes dither-out{${frames}100%{mask-image:${levels[0]}}}`;
}
