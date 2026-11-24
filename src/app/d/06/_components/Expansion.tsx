"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { getFamily } from "@/lib/catalog";
import { s } from "./cls";
import { cx, STORIES } from "./data";
import { ProductBento } from "./ProductBento";
import { useIsPhone, useView, views, type View } from "./store";
import { StoryView } from "./StoryView";
import { IconClose, trapTab } from "./ui";

/**
 * The signature move: a tile grows into a full-screen view (motion layoutId = the tile's id),
 * and closing returns it to the tile. Views opened from search have no tile and simply rise in.
 */
export function Expansion() {
  const v = useView();
  const phone = useIsPhone();
  return (
    <AnimatePresence>
      {v && (
        <motion.div
          key="scrim"
          className="fixed inset-0 z-[150] bg-[#eeede9]/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => views.close()}
          aria-hidden
        />
      )}
      {v && <Sheet key={`${v.kind}:${v.from}:${v.kind === "product" ? v.slug : v.id}`} v={v} phone={phone} />}
    </AnimatePresence>
  );
}

function Sheet({ v, phone }: { v: View; phone: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const solo = v.from.startsWith("solo-");

  useEffect(() => {
    const t = window.setTimeout(() => close.current?.focus({ preventScroll: true }), 90);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") views.close();
      if (e.key === "Tab" && box.current) trapTab(e, box.current);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const title = v.kind === "product" ? (getFamily(v.slug)?.name ?? "Piece") : STORIES[v.id].title;
  const enter = solo
    ? { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 40 } }
    : {};

  return (
    <motion.div
      ref={box}
      layoutId={solo ? undefined : v.from}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ borderRadius: phone ? 0 : 28 }}
      className="fixed inset-0 z-[160] overflow-hidden bg-[#e8e6e0] shadow-[0_40px_120px_-40px_rgba(20,20,20,0.45)] sm:inset-4"
      {...enter}
    >
      <motion.button
        ref={close}
        type="button"
        onClick={() => views.close()}
        aria-label="Close"
        className={cx(s.icon, s.onWhite, "absolute right-3 top-3 z-20 shadow-[0_4px_16px_-6px_rgba(20,20,20,0.3)] sm:right-5 sm:top-5")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.18 } }}
        exit={{ opacity: 0, transition: { duration: 0.08 } }}
      >
        <IconClose />
      </motion.button>
      <div className={cx(s.scroller, "h-full overflow-y-auto")} data-lenis-prevent>
        {v.kind === "product" ? (
          <ProductBento slug={v.slug} mode="overlay" from={solo ? undefined : v.from} img={v.img} />
        ) : (
          <StoryView id={v.id} from={solo ? undefined : v.from} img={v.img} />
        )}
      </div>
    </motion.div>
  );
}
