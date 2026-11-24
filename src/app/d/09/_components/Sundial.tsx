"use client";

import { AnimatePresence, motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import s from "../styles";
import { CHAPTERS, EASE, chapterAt, hhmm } from "./data";
import { scrollToId } from "./store";

type Stop = { id: string; time: string; name: string; min: number };
const STOPS: Stop[] = [
  ...CHAPTERS.map((c) => ({ id: `ch-${c.key}`, time: hhmm(c.min), name: c.name, min: c.min })),
  { id: "all-pieces", time: "19:10", name: "All pieces", min: 1150 },
];

/** Angle on the ring for each stop: dawn in the west, noon at the top, golden hour in the east, evening below. */
function ringPos(i: number) {
  const a = ((180 - i * 45) * Math.PI) / 180;
  return { left: `${(50 + 34 * Math.cos(a)).toFixed(2)}%`, top: `${(50 - 34 * Math.sin(a)).toFixed(2)}%` };
}

/**
 * The progress control, top right: a small dial whose hand follows the time of day.
 * Opens a ring of the day's chapters. On the home page it scrolls; elsewhere it links home.
 */
export function Sundial({ minutes, mode }: { minutes: MotionValue<number>; mode: "scroll" | "link" }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => minutes.get());
  const id = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const firstItem = useRef<HTMLElement | null>(null);

  useMotionValueEvent(minutes, "change", (v) => {
    setNow((prev) => (Math.round(prev) === Math.round(v) ? prev : v));
  });

  const hand = useTransform(minutes, (m) => 180 + ((m - 360) / 720) * 180);
  const label = hhmm(now);
  const chapter = chapterAt(now);
  const current = CHAPTERS.indexOf(chapter);

  useEffect(() => {
    if (!open) return;
    firstItem.current?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (stop: Stop) => {
    setOpen(false);
    scrollToId(stop.id);
  };

  return (
    <div ref={wrap} className="fixed right-3 top-3 z-[130] sm:right-5 sm:top-3.5 lg:right-7">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${label}, ${chapter.name}. Chapters of the day`}
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-3 rounded-full py-1 pl-1 pr-1 transition-transform duration-200 active:scale-95 sm:pl-4"
      >
        <span className="hidden text-right sm:block">
          <span className={`${s.tab} block text-[15px] leading-none tracking-[0.02em]`}>{label}</span>
          <span className="mt-1 block text-[11px] leading-none text-[var(--muted)]">{chapter.name}</span>
        </span>
        <span className="relative grid size-12 place-items-center rounded-full border border-[var(--hair)] bg-[var(--paper)] shadow-[0_8px_24px_-14px_rgb(42_36_32/0.5)] transition-colors duration-300 group-hover:border-[var(--ink)]">
          <svg viewBox="0 0 48 48" className="absolute inset-0 size-full" aria-hidden>
            {Array.from({ length: 15 }, (_, i) => {
              const a = Math.PI - (i / 14) * Math.PI;
              const r1 = i % 3 === 0 ? 15 : 17;
              return (
                <line
                  key={i}
                  x1={(24 + Math.cos(a) * r1).toFixed(2)}
                  y1={(26 - Math.sin(a) * r1).toFixed(2)}
                  x2={(24 + Math.cos(a) * 19.5).toFixed(2)}
                  y2={(26 - Math.sin(a) * 19.5).toFixed(2)}
                  stroke="rgb(42 36 32 / 0.35)"
                  strokeWidth="1"
                />
              );
            })}
            <line x1="6" y1="26" x2="42" y2="26" stroke="rgb(42 36 32 / 0.2)" strokeWidth="1" />
          </svg>
          <motion.span className="absolute left-1/2 top-[26px] h-0 w-0" style={{ rotate: hand }}>
            <span className="absolute left-0 top-[-0.5px] h-px w-[15px] bg-[var(--ink)]" />
            <span className="absolute left-[13px] top-[-3.5px] size-[7px] rounded-full bg-[var(--m-accent)]" />
          </motion.span>
          <span className="absolute left-1/2 top-[26px] size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ink)]" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            id={id}
            aria-label="Chapters of the day"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ transformOrigin: "calc(100% - 24px) -12px" }}
            className="absolute right-0 top-[calc(100%+10px)] size-[min(316px,calc(100vw-24px))] rounded-full border border-[var(--hair)] bg-[var(--paper)] shadow-[0_40px_80px_-40px_rgb(42_36_32/0.55)] sm:size-[352px]"
          >
            <span aria-hidden className="absolute inset-[15%] rounded-full border border-dashed border-[rgb(42_36_32/0.16)]" />
            <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className={`${s.display} ${s.tab} text-[44px] leading-none sm:text-[52px]`}>{label}</p>
                <p className="mt-2 text-[13px] text-[var(--muted)]">{chapter.theme}</p>
              </div>
            </div>
            <ul>
              {STOPS.map((stop, i) => {
                const pos = ringPos(i);
                const on = i === current;
                const inner = (
                  <>
                    <span className={`${s.tab} block text-[11px] leading-none ${on ? "text-[var(--m-accent)]" : "text-[var(--muted)]"}`}>
                      {stop.time}
                    </span>
                    <span className={`${s.display} mt-1 block whitespace-nowrap text-[17px] leading-none sm:text-[19px]`}>{stop.name}</span>
                  </>
                );
                const cls = `absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-center transition-colors duration-300 hover:bg-[var(--m-accent-soft)] active:scale-95 ${
                  on ? "bg-[var(--m-accent-soft)]" : "bg-[var(--paper)]"
                }`;
                return (
                  <motion.li
                    key={stop.id}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.05 + i * 0.035 }}
                    className="absolute"
                    style={pos}
                  >
                    {mode === "scroll" ? (
                      <button
                        type="button"
                        ref={i === 0 ? (el) => void (firstItem.current = el) : undefined}
                        onClick={() => go(stop)}
                        aria-current={on ? "step" : undefined}
                        className={cls}
                      >
                        {inner}
                      </button>
                    ) : (
                      <Link
                        href={`/d/09#${stop.id}`}
                        ref={i === 0 ? (el) => void (firstItem.current = el) : undefined}
                        onClick={() => setOpen(false)}
                        className={`${cls} block`}
                      >
                        {inner}
                      </Link>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
