"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { bagTotals, useBag } from "@/lib/cart";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { slipFlag, useFlag } from "./store";

const WOODS: { key: Wood; label: string }[] = [
  { key: "red", label: "Red" },
  { key: "white", label: "White" },
];

/** Top-right: the wood toggle set as text with a sliding underline, and Bag (n). */
export function Controls() {
  const wood = useWood();
  const { count } = bagTotals(useBag());
  const open = useFlag(slipFlag);
  const woodsRef = useRef<HTMLDivElement>(null);

  // Measure both words so the underline can slide between them in CSS (driven by html[data-wood], no flash).
  useLayoutEffect(() => {
    const el = woodsRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.querySelector<HTMLElement>('[data-w="red"]');
      const w = el.querySelector<HTMLElement>('[data-w="white"]');
      if (!r || !w) return;
      el.style.setProperty("--rx", `${r.offsetLeft}px`);
      el.style.setProperty("--rw", `${r.offsetWidth}px`);
      el.style.setProperty("--wx", `${w.offsetLeft}px`);
      el.style.setProperty("--ww", `${w.offsetWidth}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, []);

  return (
    <div className="x5-controls">
      <div ref={woodsRef} className="x5-woods" role="group" aria-label="Wood">
        {WOODS.map((w, i) => (
          <span key={w.key} className="contents">
            {i === 1 && (
              <span aria-hidden className="x5-slash">
                /
              </span>
            )}
            <button
              type="button"
              data-w={w.key}
              className="x5-woodBtn"
              aria-pressed={wood === w.key}
              aria-label={`${w.label} sandalwood`}
              onClick={() => wood !== w.key && switchWood(w.key)}
            >
              {w.label}
            </button>
          </span>
        ))}
        <span aria-hidden className="x5-underline" />
      </div>
      <button
        type="button"
        className="x5-bagBtn"
        aria-expanded={open}
        aria-controls="idx-slip"
        onClick={() => slipFlag.set(!open)}
      >
        Bag&nbsp;(
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            className="x5-bagN"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {count}
          </motion.span>
        </AnimatePresence>
        )
      </button>
    </div>
  );
}
