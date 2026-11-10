import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Named media conditions: use inside scenes via mm.add({ motion, reduce, phone }, ...). */
export const conditions = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  phone: '(max-width: 700px)',
};
export const mm = gsap.matchMedia();
export { gsap, ScrollTrigger, SplitText };

type Init = (el: HTMLElement) => void;
const scenes = new Map<string, Init>();

/** Register a scene. It runs on every page load that contains [data-scene="name"], inside a gsap.context. */
export function scene(name: string, init: Init) {
  scenes.set(name, init);
}

let ctx: gsap.Context | undefined;
let lenis: Lenis | undefined;
const tick = (t: number) => lenis?.raf(t * 1000);

function start() {
  if (!matchMedia(conditions.reduce).matches) {
    lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }
  ctx = gsap.context(() => {
    scenes.forEach((init, name) => {
      document.querySelectorAll<HTMLElement>(`[data-scene="${name}"]`).forEach(init);
    });
  });
}

function stop() {
  ctx?.revert();
  mm.revert();
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = ctx = undefined;
}

document.addEventListener('astro:page-load', start);
document.addEventListener('astro:before-swap', stop);
