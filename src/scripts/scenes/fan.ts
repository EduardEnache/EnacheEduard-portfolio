/** Projects scene loader: the kinetic word pauses off screen, the heavy fan code loads when the section nears the viewport. */
import { scene, mm, conditions } from '../motion';

scene('fan', (el) => {
  mm.add({ motion: conditions.motion }, (ctx) => {
    if (!ctx.conditions?.motion) return;
    let alive = true;
    let stop: (() => void) | undefined;
    const view = new IntersectionObserver(([e]) => el.classList.toggle('paused', !e.isIntersecting));
    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      import('./fan-core').then((m) => { if (alive) stop = m.mountFan(el); });
    }, { rootMargin: '60% 0px' });
    view.observe(el);
    near.observe(el);
    return () => { alive = false; view.disconnect(); near.disconnect(); stop?.(); el.classList.remove('paused'); };
  });
});
