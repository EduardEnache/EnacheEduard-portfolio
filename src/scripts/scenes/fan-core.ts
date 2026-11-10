/** The fan: scroll scrubs the rotation (sticky stage), Draggable drives the same scroll range, focus centres a card. */
import { gsap, ScrollTrigger } from '../motion';
import { Draggable } from 'gsap/Draggable';
import { maskUrls } from './dither';
import { cssNum, dur, stagger } from './tokens';
import { cameFrom, viaHistory } from './transitions';

gsap.registerPlugin(Draggable);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function mountFan(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>('.fan-track')!;
  const zone = root.querySelector<HTMLElement>('.fan-zone')!;
  const fan = root.querySelector<HTMLElement>('.fan')!;
  const spokes = [...root.querySelectorAll<HTMLElement>('.spoke')];
  const cards = spokes.map((s) => s.querySelector<HTMLElement>('.card')!);
  const ins = cards.map((c) => c.querySelector<HTMLElement>('.in')!);
  const hub = { live: root.querySelector('.h-live')!, i: root.querySelector('.h-idx')!, n: root.querySelector('.h-name')!, d: root.querySelector('.h-desc')!, s: root.querySelector('.h-stat')! };
  const N = cards.length;
  const step = cssNum('--fan-step', root);
  const limit = cssNum('--fan-limit', root);
  const lift = cssNum('--fan-lift', root);
  const ac = new AbortController();
  const on = { signal: ac.signal };
  /* coming back from a project page: start on its card (direct loads: card 1) */
  const first = Math.max(0, cards.findIndex((c) => c.getAttribute('href') === `/work/${cameFrom()}/`));
  const state = { rot: first };
  let active = first;

  function print(i: number, animate = true) {
    const c = cards[i];
    hub.i.textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
    hub.n.textContent = c.dataset.name ?? '';
    hub.d.textContent = c.dataset.desc ?? '';
    hub.s.textContent = c.dataset.stat ?? '';
    hub.live.textContent = `${c.dataset.name}. ${c.dataset.desc}. ${c.dataset.stat}`; // announced once per card
    if (animate) gsap.fromTo([hub.n, hub.d, hub.s], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: dur('ui'), stagger: stagger(), overwrite: true });
  }

  /* per frame: only transform/opacity, only for cards that moved, cards outside the arc are hidden and left alone */
  const seen: { t: string; o: string; z: string; v: boolean; l: number }[] = Array.from({ length: N }, () => ({ t: '', o: '', z: '', v: true, l: -1 }));
  function render() {
    for (let i = 0; i < N; i++) {
      const f = i - state.rot, a = f * step, d = Math.abs(f), memo = seen[i];
      const vis = Math.abs(a) < limit;
      if (vis !== memo.v) { memo.v = vis; spokes[i].style.visibility = vis ? '' : 'hidden'; spokes[i].style.willChange = vis ? 'transform' : 'auto'; }
      if (!vis) continue;
      const t = `rotate(${a}deg)`, o = String(clamp01((limit - Math.abs(a)) / 12)), z = String(Math.round(100 - d * 10)), l = Math.max(0, 1 - d);
      if (t !== memo.t) { memo.t = t; spokes[i].style.transform = t; }
      if (o !== memo.o) { memo.o = o; spokes[i].style.opacity = o; }
      if (z !== memo.z) { memo.z = z; spokes[i].style.zIndex = z; }
      if (l !== memo.l && (l > 0 || memo.l > 0)) { ins[i].style.transform = `translateY(${-lift * l}px) scale(${1 + 0.06 * l})`; }
      memo.l = l;
    }
    const idx = Math.round(state.rot);
    if (idx !== active) {
      cards[active].classList.remove('on');
      active = idx;
      cards[idx].classList.add('on');
      print(idx);
    }
  }
  if (first) { cards[0].classList.remove('on'); cards[first].classList.add('on'); print(first, false); }
  render();

  /* fromTo: ScrollTrigger owns the rotation from scroll progress, so the tween must span 0..N-1 even when we start mid-way */
  const tween = gsap.fromTo(state, { rot: 0 }, {
    rot: N - 1, ease: 'none', onUpdate: render, immediateRender: false,
    scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: dur('ui'), invalidateOnRefresh: true },
  });
  const st = tween.scrollTrigger!;
  const scrollToProgress = (p: number) => window.scrollTo({ top: st.start + clamp01(p) * (st.end - st.start), behavior: 'instant' });
  /* browser Back/Forward: motion.ts restores the exact scroll; only a normal navigation ("All projects") snaps to the card */
  const restored = viaHistory() && history.state?.scrollY > 0;
  if (first) { if (!restored) scrollToProgress(first / (N - 1)); ScrollTrigger.update(); st.getTween()?.progress(1); } // scroll and card agree, no smoothing run-up from card 1

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
    gsap.killTweensOf([hub.n, hub.d, hub.s]);
    spokes.forEach((s) => s.removeAttribute('style'));
    root.querySelectorAll<HTMLElement>('.fb').forEach((f) => f.removeAttribute('style'));
    ins.forEach((i) => i.removeAttribute('style'));
    ScrollTrigger.refresh();
  };
}
