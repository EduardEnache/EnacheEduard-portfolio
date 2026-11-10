/** Projects scene loader: the kinetic word pauses off screen, the heavy fan code loads when the section nears the viewport. */
import { scene, mm, conditions } from '../motion';
import { cameFrom } from './transitions';

scene('fan', (el) => {
  /* reduced motion / baseline row: bring the card we came back from into view */
  mm.add({ reduce: conditions.reduce }, (ctx) => {
    const fan = el.querySelector<HTMLElement>('.fan'), slug = cameFrom();
    const spoke = ctx.conditions?.reduce && slug ? fan?.querySelector(`a.card[href="/work/${slug}/"]`)?.closest('.spoke') : null;
    if (fan && spoke) fan.scrollLeft += spoke.getBoundingClientRect().left - fan.getBoundingClientRect().left - parseFloat(getComputedStyle(fan).paddingLeft);
  });
  mm.add({ motion: conditions.motion }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    let alive = true;
    let stop: (() => void) | undefined;
    const view = new IntersectionObserver(([e]) => el.classList.toggle('paused', !e.isIntersecting));
    const load = () => import('./fan-core').then((m) => { if (alive) stop = m.mountFan(el); });
    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      load();
    }, { rootMargin: '60% 0px' });
    view.observe(el);
    if (cameFrom()) load(); // coming back from a project: mount now, before the view transition captures the page
    else near.observe(el);
    return () => { alive = false; view.disconnect(); near.disconnect(); stop?.(); el.classList.remove('paused'); };
  });
});
