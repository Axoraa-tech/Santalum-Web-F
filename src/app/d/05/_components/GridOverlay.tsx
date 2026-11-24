"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { gridFlag, useFlag } from "./store";

const COLS = Array.from({ length: 12 }, (_, i) => i);

/** The twelve-column grid the page is set on. Toggle with "g" or the colophon button. */
export function GridOverlay() {
  const on = useFlag(gridFlag);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) gridFlag.set(!gridFlag.get());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          className="x5-gridOverlay"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {COLS.map((i) => (
            <motion.span
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              style={{ transformOrigin: "50% 0" }}
              transition={{ duration: 0.5, delay: i * 0.025, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GridToggle({ className }: { className?: string }) {
  const on = useFlag(gridFlag);
  return (
    <button type="button" className={className} aria-pressed={on} onClick={() => gridFlag.set(!on)}>
      {on ? "Hide the grid" : "Show the grid"}
    </button>
  );
}
