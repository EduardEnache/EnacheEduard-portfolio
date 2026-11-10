/** Load motion code after the page has painted and loaded, so GSAP never competes with the first paint (LCP). */
export function later(load: () => Promise<unknown>) {
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(() => void load(), { timeout: 1500 }) : setTimeout(load, 200));
  document.readyState === 'complete' ? go() : addEventListener('load', go, { once: true });
}
