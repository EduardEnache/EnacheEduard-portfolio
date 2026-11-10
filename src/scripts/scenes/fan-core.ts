/** The fan: scroll scrubs the rotation (sticky stage), Draggable drives the same scroll range, focus centres a card. */
import { gsap, ScrollTrigger } from '../motion';
import { Draggable } from 'gsap/Draggable';
import { maskUrls } from './dither';
import { cssNum, dur } from './tokens';

gsap.registerPlugin(Draggable);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function mountFan(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>('.fan-track')!;
  const zone = root.querySelector<HTMLElement>('.fan-zone')!;
  const fan = root.querySelector<HTMLElement>('.fan')!;
  const spokes = [...root.querySelectorAll<HTMLElement>('.spoke')];
  const cards = spokes.map((s) => s.querySelector<HTMLElement>('.card')!);
  const ins = cards.map((c) => c.querySelector<HTMLElement>('.in')!);
  const hub = { i: root.querySelector('.h-idx')!, n: root.querySelector('.h-name')!, d: root.querySelector('.h-desc')!, s: root.querySelector('.h-stat')! };
  const N = cards.length;
  const step = cssNum('--fan-step', root);
  const limit = cssNum('--fan-limit', root);
  const lift = cssNum('--fan-lift', root);
  const ac = new AbortController();
  const on = { signal: ac.signal };
  const state = { rot: 0 };
  let active = 0;
  const typer = { n: 0 };

  function print(i: number) {
    const c = cards[i];
    const txt = c.dataset.desc ?? '';
    hub.i.textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
    hub.n.textContent = c.dataset.name ?? '';
    hub.s.textContent = c.dataset.stat ?? '';
    gsap.killTweensOf(typer);
    typer.n = 0;
    gsap.to(typer, { n: txt.length, duration: dur('ui'), ease: 'none', onUpdate: () => { hub.d.textContent = txt.slice(0, Math.round(typer.n)); } });
    gsap.fromTo([hub.n, hub.s], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: dur('ui'), stagger: cssNum('--stagger') });
  }

  function render() {
    for (let i = 0; i < N; i++) {
      const f = i - state.rot, a = f * step, d = Math.abs(f), l = Math.max(0, 1 - d);
      spokes[i].style.transform = `rotate(${a}deg)`;
      spokes[i].style.opacity = String(clamp01((limit - Math.abs(a)) / 12));
      spokes[i].style.zIndex = String(Math.round(100 - d * 10));
      ins[i].style.transform = `translateY(${-lift * l}px) scale(${1 + 0.06 * l})`;
    }
    const idx = Math.round(state.rot);
    if (idx !== active) {
      cards[active].classList.remove('on');
      active = idx;
      cards[idx].classList.add('on');
      print(idx);
    }
  }
  render();

  const tween = gsap.to(state, {
    rot: N - 1, ease: 'none', onUpdate: render,
    scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: dur('ui'), invalidateOnRefresh: true },
  });
  const st = tween.scrollTrigger!;
  const scrollToProgress = (p: number) => window.scrollTo({ top: st.start + clamp01(p) * (st.end - st.start), behavior: 'instant' });

  /* drag rotates by driving the same scroll range; vertical gestures stay native (touch-action: pan-y) */
  let moved = false;
  const drag = Draggable.create(document.createElement('div'), {
    type: 'x', trigger: zone, minimumMovement: 6, dragClickables: true,
    onPress() { moved = false; },
    onDrag() { moved = true; scrollToProgress(st.progress - this.deltaX / (window.innerWidth * 1.1)); },
  })[0];
  fan.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, { capture: true, ...on });

  /* keyboard: focusing a card centres it; hover/focus swaps the face through the Bayer masks */
  let urls: string[] | undefined; // built on first hover so mounting stays cheap
  cards.forEach((c, i) => {
    c.addEventListener('focus', () => scrollToProgress(i / (N - 1)), on);
    const alt = c.querySelector<HTMLElement>('.fb');
    if (!alt) return;
    const o = { l: 0 };
    const set = () => { const u = urls![Math.round(o.l)]; alt.style.maskImage = u; alt.style.setProperty('-webkit-mask-image', u); };
    const go = (to: number) => {
      if (!urls) { urls = maskUrls(cssNum('--cell', root)); alt.style.opacity = '1'; }
      alt.style.opacity = '1';
      set();
      gsap.to(o, { l: to, duration: dur('ui'), ease: 'none', overwrite: true, onUpdate: set });
    };
    c.addEventListener('pointerenter', () => go(16), on);
    c.addEventListener('pointerleave', () => go(0), on);
    c.addEventListener('focus', () => go(16), on);
    c.addEventListener('blur', () => go(0), on);
  });

  return () => {
    ac.abort();
    drag.kill();
    tween.kill();
    gsap.killTweensOf(typer);
    spokes.forEach((s) => s.removeAttribute('style'));
    root.querySelectorAll<HTMLElement>('.fb').forEach((f) => f.removeAttribute('style'));
    ins.forEach((i) => i.removeAttribute('style'));
    ScrollTrigger.refresh();
  };
}
