/** Read design tokens (CSS custom properties) so JS never carries its own colours, eases or timings. */
const style = (el: Element = document.documentElement) => getComputedStyle(el);
export const cssVar = (name: string, el?: Element) => style(el).getPropertyValue(name).trim();
export const cssNum = (name: string, el?: Element) => parseFloat(cssVar(name, el));
/** '0.6s' / '600ms' to seconds (the build minifies 0.06s to 60ms, so parseFloat alone is off by 1000). */
const secs = (v: string) => (v.endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v));
export const dur = (name: string) => secs(cssVar(`--dur-${name}`));
/** The --stagger token in seconds, as GSAP wants it. */
export const stagger = () => secs(cssVar('--stagger'));
/** A GSAP ease function from an ease token written as a CSS four-point bezier. */
export function ease(name: string): (t: number) => number {
  const m = cssVar(`--ease-${name}`).match(/\(([^)]+)\)/);
  const [x1, y1, x2, y2] = m ? m[1].split(',').map(parseFloat) : [0, 0, 1, 1];
  const bez = (a: number, b: number, t: number) => 3 * a * (1 - t) * (1 - t) * t + 3 * b * (1 - t) * t * t + t * t * t;
  return (x) => {
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 20; i++) { t = (lo + hi) / 2; bez(x1, x2, t) < x ? (lo = t) : (hi = t); }
    return bez(y1, y2, t);
  };
}
