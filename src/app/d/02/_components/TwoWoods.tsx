"use client";

import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { WT } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import { switchWood, useWood } from "@/lib/wood";
import { COMPARE } from "./copy";
import { s } from "./cls";
import { clamp } from "./store";

function Row({ row, i, sep }: { row: (typeof COMPARE)[number]; i: number; sep: MotionValue<number> }) {
  const a = 0.32 + i * 0.07;
  const opacity = useTransform(sep, [a, a + 0.3], [0, 1]);
  const y = useTransform(sep, [a, a + 0.3], [14, 0]);
  return (
    <motion.div style={{ opacity, y }} className="grid grid-cols-[1fr_132px_1fr] items-center gap-4 border-b border-[var(--o-line)] py-3.5 last:border-b-0">
      <p className="text-right text-[14px] leading-snug text-[var(--o-ink)] xl:text-[15px]">{row.red}</p>
      <p className={`${s.syne} whitespace-nowrap rounded-full bg-[var(--o-ink)] px-2 py-1 text-center text-[12px] font-bold text-white`}>{row.label}</p>
      <p className="text-[14px] leading-snug text-[var(--o-ink)] xl:text-[15px]">{row.white}</p>
    </motion.div>
  );
}

/** Two overlapping photo circles. Pull them apart and the comparison appears in the gap. */
export function TwoWoods() {
  const wood = useWood();
  const reduced = !!useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(1200);
  const [open, setOpen] = useState(false);
  const drag = useRef<{ side: number; x0: number; s0: number; id: number; moved: boolean } | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const wide = w >= 900;
  const D = wide ? Math.min(w * 0.4, 540) : Math.min(w * 0.62, 320);
  const rest = D * 0.3;
  const gap = wide ? Math.min(660, w * 0.5) : 24;
  const shift = Math.max(20, (D + gap) / 2 - rest);

  const sep = useMotionValue(0);
  const sp = useSpring(sep, reduced ? { stiffness: 1000, damping: 100 } : { stiffness: 200, damping: 28, mass: 0.9 });
  const shiftMV = useMotionValue(shift);
  useEffect(() => {
    shiftMV.set(shift);
  }, [shift, shiftMV]);
  const lx = useTransform(() => -sp.get() * shiftMV.get());
  const rx = useTransform(() => sp.get() * shiftMV.get());
  const lensOpacity = useTransform(sp, [0, 0.25], [1, 0]);
  const lensScale = useTransform(sp, [0, 0.25], [1, 0.6]);
  const listOpacity = useTransform(sp, [0.2, 0.5], [0, 1]);
  const captionOpacity = useTransform(sp, [0, 0.35], [1, 0]);
  useMotionValueEvent(sep, "change", (v) => setOpen(v > 0.5));

  const down = (side: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { side, x0: e.clientX, s0: sep.get(), id: e.pointerId, moved: false };
  };
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > 4) d.moved = true;
    sep.set(clamp(d.s0 + (dx * d.side) / shift, -0.06, 1.06));
  };
  const up = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) {
      sep.set(d.s0 > 0.5 ? 0 : 1);
      return;
    }
    const v = sep.get();
    sep.set(v > (d.s0 > 0.5 ? 0.7 : 0.25) ? 1 : 0);
  };

  const circle = (side: -1 | 1) => {
    const red = side < 0;
    const target = red ? "red" : "white";
    const c = CONTENT[target];
    return (
      <motion.div
        className="absolute top-0"
        style={{ x: red ? lx : rx, width: D, left: `calc(50% - ${D / 2}px + ${side * rest}px)`, zIndex: red ? 1 : 2, mixBlendMode: red ? "normal" : "multiply" }}
      >
        <div
          onPointerDown={down(side)}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className={`relative cursor-grab touch-pan-y overflow-hidden rounded-full bg-[var(--o-floor)] shadow-[0_40px_80px_-40px_rgb(25_23_20/0.5)] active:cursor-grabbing`}
          style={{ width: D, height: D }}
        >
          <Photo p={red ? PHOTOS.redGrain : PHOTOS.whiteLog} sizes={`${Math.round(D)}px`} className="pointer-events-none select-none" />
          <span aria-hidden data-for={target} className={`${s.curRing} pointer-events-none absolute inset-0 rounded-full transition-[box-shadow] duration-500`} />
        </div>
        <motion.div style={{ opacity: captionOpacity }} className={`mt-6 ${red ? "text-left" : "text-right"} ${wide ? "" : "hidden"} ${open ? "pointer-events-none" : ""}`}>
          <p className={`${s.syne} text-[26px] font-bold leading-none tracking-[-0.03em]`}>{c.name}</p>
          <p className="mt-2 text-[14px] text-[var(--o-ink-2)]">
            <i>{c.latin}</i>, <span className={s.deva}>{c.sanskrit}</span>
          </p>
          <p className="mt-1 text-[14px] text-[var(--o-muted)]">{c.oneLine}</p>
          <button
            type="button"
            data-for={target}
            onClick={() => {
              if (wood !== target) switchWood(target);
            }}
            className={`${s.cur} mt-3 rounded-full border border-[var(--o-line)] px-4 py-1.5 text-[13px] font-semibold transition-colors hover:border-[var(--o-ink)]`}
          >
            <WT red={red ? "Showing this wood" : "Show this wood"} white={red ? "Show this wood" : "Showing this wood"} />
          </button>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <section id="woods" className="relative overflow-hidden bg-[var(--o-stone)] px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-12 md:items-end">
          <h2 className={`${s.display} text-[clamp(2.1rem,5.6vw,6rem)] md:col-span-7`}>
            <WT red="Not the sandalwood" white="The sandalwood" />
            <span className="block text-[var(--o-muted)]">
              <WT red="of perfume." white="of temples." />
            </span>
          </h2>
          <p className="max-w-[440px] text-[17px] leading-relaxed text-[var(--o-ink-2)] md:col-span-5 md:justify-self-end">
            <WT
              red="Red sandalwood shares a name with the fragrant one and very little else: another tree, another family, another set of rules. Pull the two circles apart to see where they part ways."
              white="White sandalwood is the one in the oil, the incense and the chandan paste. Red sandalwood shares the name, not the scent. Pull the two circles apart to see how far apart they are."
            />
          </p>
        </div>

        <div ref={stageRef} className="relative isolate mt-14 select-none md:mt-20" style={{ height: D + (wide ? 150 : 0) }}>
          {circle(-1)}
          {circle(1)}

          {/* the lens, where the circles overlap */}
          <motion.button
            type="button"
            onClick={() => sep.set(open ? 0 : 1)}
            aria-expanded={open}
            aria-controls="o2-compare"
            style={{ opacity: lensOpacity, scale: lensScale, top: D / 2 }}
            className={`${s.syne} absolute left-1/2 z-10 grid size-[104px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-center text-[13px] font-bold leading-tight shadow-[0_20px_40px_-20px_rgb(25_23_20/0.6)] transition-colors hover:bg-[var(--o-ink)] hover:text-white md:size-[124px] md:text-[14px]`}
          >
            <span>
              Pull
              <br />
              apart
              <svg viewBox="0 0 40 12" className="mx-auto mt-1 w-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M2 6h36M7 1.5L2 6l5 4.5M33 1.5L38 6l-5 4.5" />
              </svg>
            </span>
          </motion.button>

          {wide && (
            <motion.div
              id="o2-compare"
              style={{ opacity: listOpacity, width: gap - 48, top: D / 2 }}
              className="pointer-events-none absolute left-1/2 z-[5] -translate-x-1/2 -translate-y-1/2"
              aria-hidden={!open}
            >
              <div className="mb-3 grid grid-cols-[1fr_132px_1fr] gap-4">
                <p className={`${s.syne} text-right text-[15px] font-bold`}>Red</p>
                <span />
                <p className={`${s.syne} text-[15px] font-bold`}>White</p>
              </div>
              {COMPARE.map((r, i) => (
                <Row key={r.label} row={r} i={i} sep={sp} />
              ))}
              {open && (
                <button
                  type="button"
                  onClick={() => sep.set(0)}
                  className="pointer-events-auto mx-auto mt-5 block rounded-full border border-[var(--o-ink)] px-5 py-2 text-[13px] font-semibold transition-colors hover:bg-[var(--o-ink)] hover:text-white"
                >
                  Bring them together
                </button>
              )}
            </motion.div>
          )}
        </div>

        {!wide && (
          <dl id="o2-compare" className="mt-10 divide-y divide-[var(--o-line)] border-y border-[var(--o-line)]">
            <div className="grid grid-cols-2 gap-4 py-3">
              <dt className={`${s.syne} text-[16px] font-bold`}>Red sandalwood</dt>
              <dd className={`${s.syne} text-[16px] font-bold`}>White sandalwood</dd>
            </div>
            {COMPARE.map((r) => (
              <div key={r.label} className="py-3">
                <dt className="text-[12px] font-semibold text-[var(--o-muted)]">{r.label}</dt>
                <dd className="mt-1 grid grid-cols-2 gap-4 text-[14px] leading-snug">
                  <span>{r.red}</span>
                  <span>{r.white}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
