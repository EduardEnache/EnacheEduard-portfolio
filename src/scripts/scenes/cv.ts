/** CV page: one gold line draws down the timeline with scroll, a node fills per role, headings reveal by masked line, skills rows stagger in. */
import { scene, mm, conditions, gsap, ScrollTrigger, SplitText } from '../motion';
import { dur, ease, cssNum } from './tokens';

scene('cv', (el) => {
  mm.add({ motion: conditions.motion }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    el.classList.add('armed');
    const tide = ease('tide'), stagger = cssNum('--stagger'), lift = cssNum('--space-2');
    const splits: SplitText[] = [];

    const tl = el.querySelector<HTMLElement>('.tl'), line = el.querySelector<HTMLElement>('.tl-line');
    if (tl && line) {
      gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 60%', end: 'bottom 60%', scrub: dur('ui') } });
    }
    el.querySelectorAll<HTMLElement>('.role').forEach((r) => {
      ScrollTrigger.create({ trigger: r, start: 'top 55%', onEnter: () => r.classList.add('on'), onLeaveBack: () => r.classList.remove('on') });
    });

    el.querySelectorAll<HTMLElement>('.tl :is(h2, h3)').forEach((h) => {
      splits.push(SplitText.create(h, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit(self) {
          gsap.set(h, { visibility: 'visible' });
          return gsap.from(self.lines, { yPercent: 110, duration: dur('reveal'), ease: tide, stagger, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
        },
      }));
    });

    const rise = (items: string, trigger: string) => {
      const rows = el.querySelectorAll<HTMLElement>(items);
      if (rows.length && el.querySelector(trigger)!.getBoundingClientRect().top >= innerHeight) gsap.from(rows, { opacity: 0, y: lift, duration: dur('reveal'), ease: tide, stagger, scrollTrigger: { trigger: el.querySelector(trigger)!, start: 'top 85%', once: true } });
    };
    rise('.skills > div', '.skills');
    rise('.certs li', '.certs');

    return () => { splits.forEach((s) => s.revert()); el.classList.remove('armed'); };
  });
});
