/** Project page scenes: numbers count up, the story rail draws with scroll, screenshots dissolve in, live values hydrate. */
import { scene, mm, conditions, gsap, ScrollTrigger } from '../motion';
import { dur, ease } from './tokens';

const decimals = (n: number) => (String(n).split('.')[1] ?? '').length;

scene('project', (el) => {
  mm.add({ motion: conditions.motion }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.25 });
    el.classList.add('armed');

    el.querySelectorAll<HTMLElement>('.n[data-to]').forEach((n) => {
      const to = Number(n.dataset.to), d = decimals(to), o = { v: 0 };
      const show = () => { n.textContent = `${n.dataset.pre ?? ''}${o.v.toLocaleString('en', { minimumFractionDigits: d, maximumFractionDigits: d })}${n.dataset.suf ?? ''}`; };
      show();
      gsap.to(o, { v: to, duration: dur('scene'), ease: ease('tide'), onUpdate: show, scrollTrigger: { trigger: n, start: 'top 90%', once: true } });
    });

    const story = el.querySelector<HTMLElement>('.story'), rail = el.querySelector<HTMLElement>('.rail');
    if (story && rail) {
      gsap.fromTo(rail, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: story, start: 'top 70%', end: 'bottom 60%', scrub: dur('ui') } });
    }
    el.querySelectorAll<HTMLElement>('.scene').forEach((s) => {
      ScrollTrigger.create({ trigger: s, start: 'top 70%', onEnter: () => s.classList.add('on'), onLeaveBack: () => s.classList.remove('on') });
    });
    el.querySelectorAll<HTMLElement>('.veil').forEach((v) => io.observe(v));

    return () => { io.disconnect(); el.classList.remove('armed'); };
  });
});

/** The live strip hydrates in every motion mode: one request, static fallback stays when the API is silent. */
scene('project-live', (block) => {
  let dead = false;
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    const { hydrateLive } = await import('../live');
    await hydrateLive(block.parentElement!);
    if (!dead && block.dataset.state === 'live') block.classList.add('pulse');
  }, { rootMargin: '50% 0px' });
  io.observe(block);
  document.addEventListener('astro:before-swap', () => { dead = true; io.disconnect(); }, { once: true });
});
