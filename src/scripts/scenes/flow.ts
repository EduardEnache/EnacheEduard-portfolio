/** "How it works" flow map: stages draw in left to right (top to bottom on phones), then a slow gold pulse runs the main path while on screen. Hover or tap lights one node's edges. Without motion the static SVG is the final state. */
import { scene, mm, conditions, gsap } from '../motion';
import { dur, stagger } from './tokens';

const WIDE = '(min-width: 1100px)'; // keep equal to the breakpoint in flow.css
const NS = 'http://www.w3.org/2000/svg';

scene('flow', (fig) => {
  // highlight: wired in every motion mode; the listeners die with the figure when the page is swapped
  let lock: Element | null = null;
  const show = (node: Element | null) => {
    fig.querySelectorAll('.on, .hot, .is-hl').forEach((e) => e.classList.remove('on', 'hot', 'is-hl'));
    const svg = node?.ownerSVGElement;
    if (!node || !svg) return;
    const id = (node as SVGElement).dataset.id!;
    svg.classList.add('is-hl');
    node.classList.add('on', 'hot');
    svg.querySelectorAll(`.fl-edge[data-from="${id}"], .fl-edge[data-to="${id}"]`).forEach((e) => {
      e.classList.add('on');
      svg.querySelectorAll(`.fl-node[data-id="${(e as SVGElement).dataset.from}"], .fl-node[data-id="${(e as SVGElement).dataset.to}"]`).forEach((n) => n.classList.add('on'));
    });
  };
  const nodeOf = (e: Event) => (e.target as Element).closest('.fl-node');
  fig.addEventListener('pointerover', (e) => { const n = nodeOf(e); if (n) show(n); });
  fig.addEventListener('pointerleave', () => show(lock));
  fig.addEventListener('click', (e) => { const n = nodeOf(e); lock = n && n !== lock ? n : null; show(lock); });
  const away = (e: Event) => { if (!fig.contains(e.target as Node)) { lock = null; show(null); } };
  document.addEventListener('click', away);
  document.addEventListener('astro:before-swap', () => document.removeEventListener('click', away), { once: true });

  mm.add({ motion: conditions.motion, wide: WIDE }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    const svg = fig.querySelector<SVGSVGElement>(ctx.conditions.wide ? '.fl-h' : '.fl-v');
    if (!svg) return;
    const q = (sel: string, s?: number) => [...svg.querySelectorAll<SVGElement>(s === undefined ? sel : `${sel}[data-s="${s}"]`)];
    const stages = new Set(q('.fl-node').map((n) => n.dataset.s)).size;

    // intro: only when the figure is still below the fold, otherwise it stays as rendered
    let tl: gsap.core.Timeline | undefined, played = false, live = true, vis = false;
    if (fig.getBoundingClientRect().top >= innerHeight * 0.85) {
      live = false;
      const step = dur('reveal') * 0.8;
      tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' }, onComplete: () => { gsap.set(q('.fl-head, .fl-node, .fl-arrow, .fl-line'), { clearProps: 'opacity,transform,strokeDashoffset' }); live = true; sync(); } });
      gsap.set(q('.fl-head, .fl-arrow'), { opacity: 0 });
      gsap.set(q('.fl-node'), { opacity: 0, y: 8 });
      gsap.set(q('.fl-line'), { strokeDashoffset: 1 });
      for (let s = 0; s < stages; s++) {
        const t = s * step;
        tl.to(q('.fl-head', s), { opacity: 1, duration: dur('ui') }, t)
          .to(q('.fl-node', s), { opacity: 1, y: 0, duration: dur('ui'), stagger: stagger() }, t)
          .to(q('.fl-edge', s).map((e) => e.querySelector('.fl-line')), { strokeDashoffset: 0, duration: dur('reveal'), ease: 'power2.inOut', stagger: stagger() }, t + dur('ui') * 0.5)
          .to(q('.fl-edge', s).map((e) => e.querySelector('.fl-arrow')), { opacity: 1, duration: dur('ui') * 0.5, stagger: stagger() }, t + dur('ui') * 0.5 + dur('reveal') * 0.8);
      }
    }

    // pulse: one gold dot per main edge of a stage, stage after stage, then a rest
    const main = q('.fl-edge.main');
    const groups = [...new Set(main.map((e) => Number(e.dataset.s)))].sort((a, b) => a - b).map((s) => main.filter((e) => Number(e.dataset.s) === s).map((e) => e.querySelector<SVGPathElement>('.fl-line')!));
    const dots = Array.from({ length: Math.max(0, ...groups.map((g) => g.length)) }, () => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', '3'); c.setAttribute('class', 'fl-dot'); c.setAttribute('opacity', '0');
      svg.appendChild(c);
      return c;
    });
    const pl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: dur('scene') });
    groups.forEach((g, k) => {
      const o = { p: 0 }, lens = g.map((p) => p.getTotalLength());
      pl.fromTo(o, { p: 0 }, {
        p: 1, duration: dur('scene'), ease: 'sine.inOut',
        onUpdate: () => g.forEach((p, i) => {
          const pt = p.getPointAtLength(o.p * lens[i]);
          dots[i].setAttribute('cx', String(pt.x)); dots[i].setAttribute('cy', String(pt.y));
          dots[i].setAttribute('opacity', String(Math.min(1, o.p / 0.15, (1 - o.p) / 0.15)));
        }),
        onComplete: () => g.forEach((_, i) => dots[i].setAttribute('opacity', '0')),
      }, k * dur('scene') * 0.85);
    });
    function sync() { pl.paused(!(live && vis)); }

    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting;
      if (vis && tl && !played) { played = true; tl.play(); }
      sync();
    }, { rootMargin: '0px 0px -15% 0px' });
    io.observe(svg);
    return () => { io.disconnect(); dots.forEach((d) => d.remove()); };
  });
});
