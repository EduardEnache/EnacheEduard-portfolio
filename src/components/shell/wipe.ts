/** Build time: the Bayer band that trails the gold line in the page wipe, as one tiny SVG mask (opaque at the top, transparent at the bottom, so the new page thins out toward the line). */
import { threshold } from '../../scripts/scenes/dither';

export const WIPE_COLS = 8;
export const WIPE_ROWS = 20;

export function wipeCss(): string {
  let d = '';
  for (let y = 0; y < WIPE_ROWS; y++) for (let x = 0; x < WIPE_COLS; x++) if (1 - (y + 0.5) / WIPE_ROWS > threshold(x, y)) d += `M${x} ${y}h1v1h-1z`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${WIPE_COLS}' height='${WIPE_ROWS}' viewBox='0 0 ${WIPE_COLS} ${WIPE_ROWS}' shape-rendering='crispEdges'><path d='${d}'/></svg>`;
  return `:root{--m-wipe:url("data:image/svg+xml,${encodeURIComponent(svg)}");--wipe-rows:${WIPE_ROWS};--wipe-cols:${WIPE_COLS}}`;
}
