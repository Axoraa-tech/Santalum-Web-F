"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { getFamily } from "@/lib/catalog";
import { ProductDetail } from "./ProductDetail";
import { ui, useUI } from "./store";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A piece opened from the strand: rises from below over the page. */
export function ProductOverlay() {
  const { product } = useUI();
  const f = product ? getFamily(product) : null;
  const close = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product) return;
    const prev = document.activeElement as HTMLElement | null;
    close.current?.focus({ preventScroll: true });
    panel.current?.scrollTo({ top: 0 });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ui.closeProduct();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [product]);

  return (
    <AnimatePresence>
      {f && (
        <>
          <motion.div
            key="veil"
            className="fixed inset-0 z-[89] bg-(--ink)/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={ui.closeProduct}
            aria-hidden
          />
          <motion.div
            key="panel"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={f.name}
            data-lenis-prevent
            className="fixed inset-x-0 bottom-0 top-3 z-[90] overflow-y-auto rounded-t-[36px] bg-(--linen) md:inset-x-4 md:top-4 md:rounded-t-[48px]"
            initial={{ y: "104%" }}
            animate={{ y: 0 }}
            exit={{ y: "104%" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-(--linen)/95 px-5 py-3 md:px-10 md:py-4">
              <div className="flex items-center gap-3" aria-hidden>
                <span className="h-px w-10 bg-(--thread)" />
                <span className="s3-bead h-3 w-3" />
                <span className="h-px w-10 bg-(--thread)" />
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/d/03/p/${f.slug}`}
                  onClick={ui.closeProduct}
                  className="hidden h-11 items-center rounded-full px-4 text-[14px] transition-colors hover:bg-(--ink)/5 active:bg-(--ink)/10 sm:flex"
                >
                  Open as a page
                </Link>
                <button
                  ref={close}
                  type="button"
                  onClick={ui.closeProduct}
                  className="flex h-11 items-center gap-2 rounded-full border border-(--ink)/20 px-4 text-[14px] transition-colors hover:border-(--ink) active:bg-(--ink)/5"
                >
                  Close
                  <span aria-hidden className="relative block h-3 w-3">
                    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-(--ink)" />
                    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 -rotate-45 bg-(--ink)" />
                  </span>
                </button>
              </div>
            </div>
            <div className="mx-auto max-w-[1360px] px-5 pb-28 pt-4 md:px-10 md:pt-6">
              <ProductDetail slug={f.slug} mode="overlay" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
