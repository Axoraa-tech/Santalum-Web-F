import { clamp, fitSize, fv } from "./lib";

/**
 * The per-letter type engine used by the hero word and the footer wordmark.
 * Each letter's width and weight follow the pointer's distance from it; the base axes come from scroll;
 * the word is refitted every frame so it always runs edge to edge. Several copies of the same word
 * (e.g. ink on paper + paper on the photo) receive identical styles so they stay registered.
 */
export type KineticOptions = {
  text: string;
  copies: HTMLElement[];
  /** Width the word must fill, in px. */
  target: () => number;
  /** Base axes before the pointer acts (may follow scroll). */
  base: () => { wdth: number; wght: number };
  pointer: boolean;
  /** Letters arrive one by one from hairline-condensed. */
  intro: boolean;
  /** How far (in wdth units) the pointer pushes letters apart. */
  amp?: number;
  /** Optional readout of the average axes. */
  onFrame?: (wdth: number, wght: number) => void;
};

export function kinetic(o: KineticOptions) {
  const sets = o.copies.map((c) => Array.from(c.querySelectorAll<HTMLElement>("[data-l]")));
  const n = sets[0]?.length ?? 0;
  const amp = o.amp ?? 80;
  const b0 = o.base();
  const cur = Array.from({ length: n }, () => (o.intro ? { wd: 50, wg: 100 } : { wd: b0.wdth, wg: b0.wght }));
  const t0 = performance.now();
  const introEnd = o.intro ? n * 60 + 1100 : 0;

  let px = -1e5;
  let py = -1e5;
  let present = 0;
  let presentTarget = 0;
  let raf = 0;
  let queued = false;
  let visible = true;

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
  });
  if (o.copies[0]) io.observe(o.copies[0]);

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    px = e.clientX;
    py = e.clientY;
    presentTarget = 1;
    if (visible) wake();
  };
  const onLeave = () => {
    presentTarget = 0;
    wake();
  };
  if (o.pointer) {
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
  }

  function frame(now: number) {
    queued = false;
    const word = o.copies[0];
    if (!word || !n) return;
    const b = o.base();
    const letters = sets[0];

    // read (layout from the previous frame)
    const rect = word.getBoundingClientRect();
    const W = rect.width || 1;
    const H = rect.height || 1;
    const centers = letters.map((l) => l.offsetLeft + l.offsetWidth / 2);

    present += (presentTarget - present) * 0.08;
    const dy = py - (rect.top + H / 2);
    const P = o.pointer ? present * Math.exp(-Math.pow(dy / (H * 1.7), 2)) : 0;
    const elapsed = now - t0;
    let busy = elapsed < introEnd || Math.abs(presentTarget - present) > 0.002;

    let sumW = 0;
    let sumG = 0;
    for (let i = 0; i < n; i++) {
      const dx = px - rect.left - centers[i];
      const g = Math.exp(-Math.pow(dx / (W * 0.1), 2));
      let twd = clamp(b.wdth + P * amp * (g - 0.42), 50, 150);
      let twg = clamp(b.wght + P * (180 + 720 * g - b.wght), 100, 900);
      if (elapsed < i * 60) {
        twd = 50;
        twg = 100;
      }
      const c = cur[i];
      c.wd += (twd - c.wd) * 0.12;
      c.wg += (twg - c.wg) * 0.12;
      if (Math.abs(twd - c.wd) > 0.08 || Math.abs(twg - c.wg) > 0.4) busy = true;
      sumW += c.wd;
      sumG += c.wg;
    }

    // write
    for (const set of sets) for (let i = 0; i < n; i++) set[i].style.fontVariationSettings = fv(cur[i].wd, cur[i].wg);

    const target = o.target();
    let size: number;
    if (elapsed < introEnd) {
      // during the entrance the size follows the settled word, so letters stretch out to the edges
      size = fitSize(o.text, target, b.wdth, b.wght);
    } else {
      const fs = parseFloat(word.style.fontSize) || parseFloat(getComputedStyle(word).fontSize);
      const w = word.offsetWidth;
      size = w ? (fs * target) / w : fs;
    }
    for (const c of o.copies) c.style.fontSize = `${size.toFixed(2)}px`;
    o.onFrame?.(sumW / n, sumG / n);

    if (busy) wake();
  }

  function wake() {
    if (queued) return;
    queued = true;
    raf = requestAnimationFrame(frame);
  }

  wake();

  return {
    wake,
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    },
  };
}
