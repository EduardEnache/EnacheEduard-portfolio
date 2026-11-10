/** /live/: first fetch on load, then every 60 s while the tab is visible. Each fill pulses the block's line, ticks its numbers and moves the gauges. */
import { scene, mm, conditions, gsap } from '../motion';
import { dur, ease } from './tokens';
import { hydrateLive } from '../live';
import { pulse, tickBlock } from './live-pulse';

const EVERY = 60_000;
const OFFLINE = 'Offline, showing last known values';

scene('live', (el) => {
  mm.add({ motion: conditions.motion, reduce: conditions.reduce }, (ctx) => {
    const calm = !!ctx.conditions?.reduce;
    const blocks = [...el.querySelectorAll<HTMLElement>('[data-live]')];
    const ticks = new Map<HTMLElement, () => void>();
    let dead = false, busy = false, last = 0, timer: ReturnType<typeof setTimeout> | undefined;

    const onFill = (e: Event) => {
      const block = e.currentTarget as HTMLElement;
      block.querySelectorAll<HTMLElement>('.stat:has(.gauge)').forEach((s) => {
        const v = parseFloat(s.querySelector('dd')?.textContent ?? '');
        s.querySelector<HTMLElement>('.gauge')!.style.setProperty('--v', String(Number.isFinite(v) ? Math.min(1, v / 100) : 0));
      });
      ticks.get(block)?.();
      ticks.set(block, tickBlock(block));
      pulse(block);
    };
    blocks.forEach((b) => b.addEventListener('live:fill', onFill));

    const schedule = () => { clearTimeout(timer); if (!document.hidden) timer = setTimeout(refresh, EVERY); };
    async function refresh() {
      if (busy || dead) return;
      busy = true; last = Date.now();
      const ok = await hydrateLive(el);
      busy = false;
      if (dead) return;
      if (!ok) blocks.forEach((b) => { b.dataset.state = 'offline'; b.querySelector('[data-status]')!.textContent = OFFLINE; });
      schedule();
    }
    const onVisible = () => {
      if (document.hidden) clearTimeout(timer);
      else if (Date.now() - last >= EVERY) refresh();
      else schedule();
    };
    document.addEventListener('visibilitychange', onVisible);
    refresh();

    if (!calm) {
      blocks.forEach((b) => {
        const line = b.querySelector('.line');
        if (line) gsap.to(line, { scaleX: 1, duration: dur('scene'), ease: ease('tide'), scrollTrigger: { trigger: b, start: 'top 85%', once: true } });
      });
    }

    return () => {
      dead = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
      blocks.forEach((b) => b.removeEventListener('live:fill', onFill));
      ticks.forEach((stop) => stop());
      gsap.killTweensOf(el.querySelectorAll('.pulse-run'));
    };
  });
});
