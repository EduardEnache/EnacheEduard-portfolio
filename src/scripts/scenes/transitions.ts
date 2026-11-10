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
