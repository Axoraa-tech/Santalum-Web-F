"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { getFamily } from "@/lib/catalog";
import k from "../k";
import { closeTakeover, EASE, lockScroll, sheetStore, splitName, takeoverStore, unlockScroll, useReduced, useStore } from "./lib";
import { BagTab } from "./Nav";
import { ProductView } from "./ProductView";
import { WoodToggle } from "./WoodToggle";

/**
 * Full-screen product view on the home page. It opens out of the row you clicked (the clip grows from that
 * row's band to the whole screen) while the name stretches open letter by letter.
 */
export function Takeover() {
  const t = useStore(takeoverStore, null);
  const reduced = useReduced();
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const open = !!t;

  useEffect(() => {
    if (!open) return;
    lockScroll();
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sheetStore.get()) closeTakeover();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // a different product while open: start at the top
  const slug = t?.slug;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [slug]);

  const f = t ? getFamily(t.slug) : undefined;
  const from = t ? `inset(${t.top.toFixed(0)}px 0px ${Math.max(0, t.vh - t.top - t.height).toFixed(0)}px 0px)` : "";
  const half = t ? `inset(${(t.vh / 2).toFixed(0)}px 0px ${(t.vh / 2).toFixed(0)}px 0px)` : "";

  return (
    <AnimatePresence>
      {t && f && (
        <motion.div
          key="takeover"
          ref={scrollRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="k10-takeover-title"
          data-lenis-prevent
          initial={reduced ? { opacity: 0 } : { clipPath: from }}
          animate={reduced ? { opacity: 1 } : { clipPath: "inset(0px 0px 0px 0px)" }}
          exit={reduced ? { opacity: 0 } : { clipPath: half }}
          transition={{ duration: reduced ? 0.2 : 0.85, ease: EASE }}
          className="fixed inset-0 z-[150] overflow-y-auto overscroll-contain bg-[var(--k-bg)]"
        >
          <div className={`${k.navLine} sticky top-0 z-[3] flex h-12 items-center gap-4 pl-[var(--k-gut)] pr-[112px] md:h-14 md:gap-8 md:pr-[160px]`}>
            <button ref={closeRef} type="button" onClick={closeTakeover} className={`${k.mono} ${k.link} py-2`}>
              Close
            </button>
            <p className={`${k.disp} hidden truncate text-[20px] [font-variation-settings:'wdth'_70,'wght'_760] md:block`}>{splitName(f.name).head}</p>
            <WoodToggle size={22} className="ml-auto" />
            <BagTab />
          </div>
          <div className="pt-6 md:pt-10">
            <ProductView slug={t.slug} mode="overlay" titleId="k10-takeover-title" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
