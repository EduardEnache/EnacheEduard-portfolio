/** CV page: one gold line draws down the timeline with scroll, a node fills per role, headings reveal by masked line, skills rows rise in. Reveals are per element on scroll; nothing starts hidden unless it is below the fold. */
import { scene, mm, conditions, gsap, ScrollTrigger, SplitText } from '../motion';
import { dur, ease, cssNum, stagger as staggerToken } from './tokens';

scene('cv', (el) => {
  mm.add({ motion: conditions.motion }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    el.classList.add('armed');
    const tide = ease('tide'), stagger = staggerToken(), lift = cssNum('--space-2');
    const splits: SplitText[] = [];

    const tl = el.querySelector<HTMLElement>('.tl'), line = el.querySelector<HTMLElement>('.tl-line');
    if (tl && line) {
      gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 60%', scrub: dur('ui') } });
    }
    el.querySelectorAll<HTMLElement>('.role').forEach((r) => {
      ScrollTrigger.create({ trigger: r, start: 'top 55%', onEnter: () => r.classList.add('on'), onLeaveBack: () => r.classList.remove('on') });
    });

    // Hidden start states exist only while a reveal is pending: a row is hidden only if it is below the fold right now,
    // and each scroll/resize sweeps the few pending rows, revealing every one that reached the fold or was scrolled past.
    // (No ScrollTrigger and no IntersectionObserver: a refresh can never re-hide, a fast fling can never skip a row.)
    const pending = new Map<Element, (delay: number) => void>();
    let raf = 0;
    const sweep = () => {
      raf = 0;
      let n = 0;
      pending.forEach((play, t) => {
        const r = t.getBoundingClientRect();
        if (r.top >= innerHeight) return;
        pending.delete(t);
        play(r.bottom < 0 ? 0 : n++ * stagger); // rows already scrolled past need no stagger
      });
    };
    const queue = () => { raf ||= requestAnimationFrame(sweep); };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    const reveal = (target: HTMLElement, hide: () => (delay: number) => void) => {
      if (target.getBoundingClientRect().top < innerHeight) return; // already on screen or above: stays as is
      pending.set(target, hide());
    };

    el.querySelectorAll<HTMLElement>('.tl :is(h2, h3)').forEach((h) => {
      const shown = new WeakSet<HTMLElement>();
      splits.push(SplitText.create(h, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit(self) {
          gsap.set(h, { visibility: 'visible' });
          if (shown.has(h)) return; // re-split after a resize or font load: keep it revealed
          pending.delete(h);
          gsap.set(self.lines, { clearProps: 'transform' });
          reveal(h, () => { gsap.set(self.lines, { yPercent: 110 }); return (delay) => { shown.add(h); gsap.to(self.lines, { yPercent: 0, duration: dur('reveal'), ease: tide, stagger, delay }); }; });
          if (!pending.has(h)) shown.add(h);
        },
      }));
    });

    for (const sel of ['.skills > div', '.certs li']) {
      el.querySelectorAll<HTMLElement>(sel).forEach((row) => reveal(row, () => {
        gsap.set(row, { opacity: 0, y: lift });
        return (delay) => gsap.to(row, { opacity: 1, y: 0, duration: dur('ui'), ease: tide, delay, clearProps: 'opacity,transform' });
      }));
    }

    document.fonts.ready.then(queue); // layout may have moved since the rows were measured

    return () => { removeEventListener('scroll', queue); removeEventListener('resize', queue); cancelAnimationFrame(raf); pending.clear(); gsap.set(el.querySelectorAll('.skills > div, .certs li'), { clearProps: 'opacity,transform' }); splits.forEach((s) => s.revert()); el.classList.remove('armed'); };
  });
});
