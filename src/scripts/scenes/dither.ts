/** Ordered Bayer 8x8 thresholds, shared by the build-time mask generator and the runtime hover swap. */
const M: number[][] = [[0]];
for (let k = 0; k < 3; k++) {
  const s = M.length;
  const n: number[][] = [];
  for (let y = 0; y < s * 2; y++) {
    n.push([]);
    for (let x = 0; x < s * 2; x++) n[y][x] = M[y % s][x % s] * 4 + [[0, 2], [3, 1]][y >= s ? 1 : 0][x >= s ? 1 : 0];
  }
  M.length = 0;
  M.push(...n);
}

/** Threshold 0..1 for cell (x, y). */
export const threshold = (x: number, y: number) => (M[y & 7][x & 7] + 0.5) / 64;
/** Raw Bayer rank 0..63 for cell (x, y). */
export const rank = (x: number, y: number) => M[y & 7][x & 7];

/** Runtime: 17 mask tiles from empty to opaque (canvas data URLs), cell size in css px. */
export function maskUrls(cell: number): string[] {
  const out: string[] = [];
  for (let L = 0; L <= 16; L++) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = cell * 8;
    const c = cv.getContext('2d')!;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (rank(x, y) < L * 4) c.fillRect(x * cell, y * cell, cell, cell);
    out.push(`url(${cv.toDataURL()})`);
  }
  return out;
}
