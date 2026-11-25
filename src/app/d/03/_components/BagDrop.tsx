"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { bag, bagSummary, useBag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { formatINR } from "@/lib/shop/products";
import { productHref, SHOP } from "./bits";
import { ui, useUI } from "./store";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The bag drops from the top. Each piece hangs on one thread, as a bead with its name. */
export function BagDrop() {
  const { bag: open } = useUI();
  const lines = useBag();
  const { items, count, subtotal } = bagSummary(lines);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    close.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ui.closeBag();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="veil"
            className="fixed inset-0 z-[69] bg-(--ink)/15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={ui.closeBag}
            aria-hidden
          />
          <motion.section
            key="bag"
            id="s3-bag"
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            data-lenis-prevent
            className="fixed inset-x-0 top-0 z-[70] max-h-[92svh] overflow-y-auto rounded-b-[34px] bg-(--warm) shadow-[0_40px_80px_-50px_rgba(34,24,15,0.6)] md:inset-x-4 md:rounded-b-[48px]"
            initial={{ y: "-104%" }}
            animate={{ y: 0 }}
            exit={{ y: "-104%" }}
            transition={{ type: "spring", stiffness: 190, damping: 27 }}
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5 md:px-10 md:pt-8">
              <div>
                <h2 className="s3-serif text-[34px] leading-none md:text-[48px]">Your bag</h2>
                <p className="mt-2 text-[14px] text-(--muted)">
                  {count === 0 ? "Nothing on the thread yet" : `${count} ${count === 1 ? "piece" : "pieces"} on the thread`}
                </p>
              </div>
              <button
                ref={close}
                type="button"
                onClick={ui.closeBag}
                className="flex h-11 items-center gap-2 rounded-full border border-(--ink)/20 px-4 text-[14px] transition-colors hover:border-(--ink) active:bg-(--ink)/5"
              >
                Close
                <span aria-hidden className="relative block h-3 w-3">
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-(--ink)" />
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 -rotate-45 bg-(--ink)" />
                </span>
              </button>
            </div>

            {count === 0 ? (
              <div className="px-5 pb-10 pt-8 md:px-10 md:pb-12">
                <div className="relative flex items-center gap-4" aria-hidden>
                  <span className="h-px flex-1 bg-(--thread)" />
                  <span className="s3-knot" />
                  <span className="h-px w-16 bg-(--thread)" />
                </div>
                <p className="mt-6 max-w-[34rem] text-[16px] leading-[1.6] text-(--ink)/80">
                  The shop has every piece in both woods, strung by category. Add one and it hangs here.
                </p>
                <Link href={SHOP} onClick={ui.closeBag} className="s3-btn s3-btn-dark mt-6">
                  <span className="s3-bead s3-btn-bead" aria-hidden />
                  Go to the shop
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto px-5 pb-2 md:px-10" role="list" aria-label="Pieces in your bag">
                  <div className="relative flex min-w-max items-start pt-7">
                    <span className="absolute left-[-40px] right-[-40px] top-[calc(1.75rem+56px)] h-px bg-(--thread) md:top-[calc(1.75rem+66px)]" aria-hidden />
                    {items.map((l, i) => {
                      const shot = l.product.shots[0];
                      return (
                        <Fragment key={l.key}>
                          {i > 0 && <span className="s3-knot relative mx-3 mt-[52px] shrink-0 md:mx-5 md:mt-[62px]" aria-hidden />}
                          <motion.div
                            role="listitem"
                            className="w-[176px] shrink-0 md:w-[208px]"
                            initial={{ opacity: 0, x: -36 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.06 }}
                          >
                            <Link
                              href={productHref(l.slug)}
                              onClick={ui.closeBag}
                              className="relative block h-28 w-28 overflow-hidden rounded-full border-[3px] border-(--warm) shadow-[0_0_0_1px_rgba(176,141,87,0.6)] transition-transform duration-500 hover:scale-[1.04] active:scale-95 md:h-[132px] md:w-[132px]"
                              aria-label={`View ${l.product.name}`}
                            >
                              <Photo p={shot.photo} tone={shot.tone} sizes="132px" />
                            </Link>
                            <p className="s3-serif mt-4 text-[20px] leading-[1.1]">{l.product.name}</p>
                            <p className="mt-1 text-[14px] text-(--muted)">
                              {CONTENT[l.product.wood].name}
                              {l.optionValue ? `, ${l.optionValue.label}` : ""}
                            </p>
                            {l.note && <p className="mt-1 text-[13px] text-(--muted)">{l.note}</p>}
                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex items-center rounded-full border border-(--ink)/20">
                                <button
                                  type="button"
                                  onClick={() => bag.setQty(l.key, l.qty - 1)}
                                  aria-label={`One fewer ${l.product.name}`}
                                  className="grid h-9 w-9 place-items-center rounded-full text-[18px] transition-colors hover:bg-(--ink)/5 active:bg-(--ink)/10"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center text-[14px] tabular-nums" aria-label={`Quantity ${l.qty}`}>
                                  {l.qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => bag.setQty(l.key, l.qty + 1)}
                                  aria-label={`One more ${l.product.name}`}
                                  disabled={l.qty >= 9}
                                  className="grid h-9 w-9 place-items-center rounded-full text-[18px] transition-colors hover:bg-(--ink)/5 active:bg-(--ink)/10 disabled:opacity-30"
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-[15px] tabular-nums">{formatINR(l.total)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => bag.remove(l.key)}
                              className="mt-2 text-[13px] text-(--muted) underline decoration-(--thread) underline-offset-4 transition-colors hover:text-(--m-accent)"
                            >
                              Take it off the thread
                            </button>
                          </motion.div>
                        </Fragment>
                      );
                    })}
                    <span className="s3-knot relative ml-5 mt-[52px] shrink-0 md:mt-[62px]" aria-hidden />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-5 border-t border-(--line) px-5 py-6 md:flex-row md:items-center md:justify-between md:px-10 md:py-7">
                  <div>
                    <p className="flex items-baseline gap-3">
                      <span className="text-[14px] text-(--muted)">Subtotal</span>
                      <span className="s3-serif text-[30px] leading-none">{formatINR(subtotal)}</span>
                    </p>
                    <p className="mt-2 text-[14px] text-(--muted)">Free delivery across India, 3–5 working days. Express {formatINR(350)}.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={SHOP} onClick={ui.closeBag} className="s3-btn s3-btn-line">
                      Keep looking
                    </Link>
                    <Link href="/d/03/checkout" onClick={ui.closeBag} className="s3-btn s3-btn-dark">
                      <span className="s3-bead s3-btn-bead" aria-hidden />
                      Go to checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
