/** Shared by /live/ and the project live strip: the refresh pulse along the gold line and numbers ticking from the old value to the new one. */
import { gsap, conditions } from '../motion';
import { dur, ease } from './tokens';

const reduced = () => matchMedia(conditions.reduce).matches;
const NUM = /\d[\d,]*\.?\d*/;
const SKIP_FMT = new Set(['list', 'ago', 'bool']);

/** First number in a value text; "~122k" reads as 122000. */
const num = (s: string) => {
  const m = NUM.exec(s);
  if (!m) return null;
  return parseFloat(m[0].replace(/,/g, '')) * (s[m.index + m[0].length]?.toLowerCase() === 'k' ? 1000 : 1);
};

/** One segment sweeps the block's .rail once. */
export function pulse(block: HTMLElement) {
  const run = block.querySelector<HTMLElement>('.pulse-run');
  if (!run || reduced()) return;
  gsap.killTweensOf(run);
  gsap.fromTo(run, { x: -run.offsetWidth, opacity: 1 }, { x: run.parentElement!.clientWidth - run.offsetWidth, duration: dur('scene'), ease: ease('tide'), onComplete: () => gsap.set(run, { opacity: 0 }) });
}

/**
 * Right after hydrateLive filled the block: show the previous value, then tick to the new one once the block is on screen.
 * Mono digits keep their width, so nothing shifts. Returns a cleanup.
 */
export function tickBlock(block: HTMLElement): () => void {
  if (reduced()) return () => {};
  const jobs: { el: HTMLElement; o: { v: number }; end: number; write: (v: number) => void }[] = [];
  block.querySelectorAll<HTMLElement>('[data-field]').forEach((el) => {
    if (SKIP_FMT.has(el.dataset.fmt ?? '') || el.dataset.field === 'version') return;
    const to = el.textContent ?? '', from = el.dataset.prev ?? '', m = NUM.exec(to), end = num(to);
    if (from === to || !m || end === null) return;
    const dec = (m[0].split('.')[1] ?? '').length;
    const write = (v: number) => { el.textContent = to.replace(m[0], v.toLocaleString('en', { minimumFractionDigits: dec, maximumFractionDigits: dec })); };
    // nothing to tick from ("n/a"): count up from 0 only when the block is already on screen, never leave a parked 0
    const start = num(from) ?? (block.getBoundingClientRect().top < innerHeight ? 0 : null);
    if (start === null) return;
    jobs.push({ el, o: { v: start }, end, write });
    write(start);
  });
  if (!jobs.length) return () => {};
  const run = () => jobs.forEach((j) => gsap.to(j.o, { v: j.end, duration: dur('scene'), ease: ease('tide'), onUpdate: () => j.write(j.o.v), onComplete: () => j.write(j.end) }));
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } });
  io.observe(block);
  return () => { io.disconnect(); jobs.forEach((j) => gsap.killTweensOf(j.o)); };
}
