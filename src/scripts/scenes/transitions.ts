/** Persistent header: marks the current page (aria-current) and slides one short gold underline between nav items. */
const header = () => document.querySelector<HTMLElement>('.site-header');

function mark(pathname: string) {
  const h = header();
  const bar = h?.querySelector<HTMLElement>('.nav-mark');
  if (!h || !bar) return;
  // "Work" lives on the home page (#work) and owns the project pages
  const current = [...h.querySelectorAll<HTMLAnchorElement>('nav li a')].find((a) => {
    const href = new URL(a.href).pathname;
    return href === '/' ? pathname.startsWith('/work/') : pathname.startsWith(href);
  });
  h.querySelectorAll('nav a[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
  current?.setAttribute('aria-current', 'page');
  bar.hidden = !current;
  if (current) bar.style.transform = `translate(${current.offsetLeft + current.offsetWidth / 2}px, 0) translateX(-50%)`;
}

document.addEventListener('astro:page-load', () => mark(location.pathname));
document.addEventListener('astro:before-swap', (e) => mark(e.to.pathname));
// the header outlives page swaps, so one resize listener for the whole session is enough
addEventListener('resize', () => mark(location.pathname));

/** Emblem door: pick the circle origin from the emblem on the current page (still in the DOM at before-preparation) and
 *  re-apply it after the swap, because Astro replaces the <html> attributes. Home <-> project only; other moves keep the wipe. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let door: { mode: string; vars: Record<string, string> } | undefined;
const apply = () => {
  const r = document.documentElement;
  if (!door) { delete r.dataset.vt; return; }
  r.dataset.vt = door.mode;
  for (const k in door.vars) r.style.setProperty(k, door.vars[k]);
};
document.addEventListener('astro:before-preparation', (e) => {
  door = undefined;
  const from = e.from.pathname, to = e.to.pathname;
  const mode = from === '/' && to.startsWith('/work/') ? 'open' : from.startsWith('/work/') && to === '/' ? 'close' : '';
  if (reduced.matches || !mode || !('startViewTransition' in document)) return apply();
  const em = (mode === 'open' ? e.sourceElement?.closest('a')?.querySelector('.emblem') : document.querySelector('.p-frame .emblem'))?.getBoundingClientRect();
  const x = em ? em.left + em.width / 2 : innerWidth / 2, y = em ? em.top + em.height / 2 : innerHeight / 2;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  door = { mode, vars: { '--vt-x': `${x}px`, '--vt-y': `${y}px`, '--vt-r': `${Math.ceil(r)}px` } };
  apply();
});
document.addEventListener('astro:after-swap', apply);
