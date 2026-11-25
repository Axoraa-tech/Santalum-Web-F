"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { bag, bagSummary, DELIVERY, useBag, type BagItem } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { formatINR } from "@/lib/shop/products";
import { useWood } from "@/lib/wood";
import k from "../k";
import { Thumb } from "./bits";
import { EASE, lockScroll, sheetStore, splitName, unlockScroll, useStore } from "./lib";

/** The bag drops from the top as a full-width sheet: a typographic list, set large. It can hold both woods at once. */
export function BagSheet() {
  const open = useStore(sheetStore, false);
  const lines = useBag();
  const wood = useWood();
  const { items, count, subtotal } = bagSummary(lines);
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = () => sheetStore.set(false);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") sheetStore.set(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            aria-hidden
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[160] bg-[rgb(18_18_18/0.32)]"
          />
          <motion.section
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Bag"
            data-lenis-prevent
            initial={{ y: "-102%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-102%" }}
            transition={{ duration: 0.75, ease: EASE }}
            className="fixed inset-x-0 top-0 z-[161] max-h-[90svh] overflow-y-auto rounded-b-[32px] bg-[var(--k10-bg)] shadow-[0_40px_80px_-40px_rgba(18,18,18,0.45)]"
          >
            <div className={`${k.gut} sticky top-0 z-[1] flex h-12 items-center justify-between border-b border-[var(--k10-line)] bg-[var(--k10-bg)]`}>
              <p className={k.mono}>
                Bag, {count} {count === 1 ? "piece" : "pieces"}
              </p>
              <button ref={closeRef} type="button" onClick={close} className={`${k.mono} ${k.link} py-2`}>
                Close
              </button>
            </div>

            {count === 0 ? (
              <div className={`${k.gut} grid grid-cols-1 gap-8 py-12 md:grid-cols-[1fr_auto] md:items-end md:py-16`}>
                <div>
                  <p className={`${k.disp} text-[length:clamp(44px,9vw,150px)] [font-variation-settings:'wdth'_60,'wght'_800]`}>Nothing here yet</p>
                  <p className={`${k.monoL} mt-4 max-w-[52ch]`}>
                    {wood === "red"
                      ? "Malas, objects and jewellery turned from red heartwood are in the shop, 26 of them."
                      : "Oil, attar, incense and Mysuru carving in white sandalwood are in the shop, 26 of them."}
                  </p>
                </div>
                <Link href="/d/10/shop" onClick={close} className={k.btn}>
                  <span className={k.btnLabel}>Go to the shop</span>
                </Link>
              </div>
            ) : (
              <>
                <ul className={k.gut}>
                  {items.map((it) => (
                    <Line key={it.key} it={it} onNavigate={close} />
                  ))}
                </ul>
                <div className={`${k.gut} grid grid-cols-1 gap-6 pb-10 pt-8 md:grid-cols-12 md:items-end md:pb-12`}>
                  <div className="md:col-span-5">
                    <p className={`${k.mono} text-[var(--k10-grey)]`}>Subtotal</p>
                    <p className={`${k.disp} mt-2 text-[length:clamp(48px,8vw,120px)] tabular-nums [font-variation-settings:'wdth'_70,'wght'_820]`}>
                      {formatINR(subtotal)}
                    </p>
                  </div>
                  <p className={`${k.mono} text-[var(--k10-grey)] md:col-span-4`}>
                    Free delivery across India, 3–5 working days. Express {formatINR(DELIVERY.express.price)}, chosen at checkout. You sign in or create an
                    account at checkout so you can track the order.
                  </p>
                  <div className="flex flex-wrap gap-3 md:col-span-3 md:justify-end">
                    <Link href="/d/10/checkout" onClick={close} className={`${k.btn} w-full md:w-auto`}>
                      <span className={k.btnLabel}>Checkout</span>
                      <span className={`${k.mono} opacity-70`}>{formatINR(subtotal)}</span>
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

function Line({ it, onNavigate }: { it: BagItem; onNavigate: () => void }) {
  const p = it.product;
  const { head, tail } = splitName(p.name);
  const meta = [CONTENT[p.wood].name, tail, it.optionValue?.label, it.qty > 1 ? `${formatINR(it.unitPrice)} each` : ""].filter(Boolean).join(", ");
  return (
    <li className="grid grid-cols-[1fr_auto] items-end gap-x-6 gap-y-3 border-b border-[var(--k10-line)] py-5 md:grid-cols-[auto_1fr_auto_auto_9rem]">
      <Thumb p={p} sizes="120px" className="hidden h-[64px] w-[110px] self-center md:block" />
      <div className="min-w-0 md:col-start-2 md:row-start-1">
        <Link
          href={`/d/10/p/${p.slug}`}
          onClick={onNavigate}
          className={`${k.disp} block truncate text-[length:clamp(36px,6vw,92px)] leading-[0.86] transition-[font-variation-settings] duration-700 [font-variation-settings:'wdth'_55,'wght'_800] hover:[font-variation-settings:'wdth'_120,'wght'_820]`}
        >
          {head}
        </Link>
        <p className={`${k.mono} mt-2 text-[var(--k10-grey)]`}>{meta}</p>
        {it.note && <p className={`${k.mono} mt-1`}>Your note: {it.note}</p>}
      </div>
      <div className="col-start-2 row-start-1 flex items-center gap-1 self-center md:col-start-3 md:self-end">
        <button
          type="button"
          onClick={() => bag.setQty(it.key, it.qty - 1)}
          aria-label={`One fewer ${p.name}`}
          className="grid size-11 place-items-center rounded-full text-[26px] transition-colors hover:bg-[var(--k10-ink)] hover:text-[var(--k10-bg)] active:scale-95"
        >
          −
        </button>
        <span className={`${k.disp} w-[1.1em] text-center text-[44px] tabular-nums [font-variation-settings:'wdth'_60,'wght'_800]`} aria-label={`Quantity ${it.qty}`}>
          {it.qty}
        </span>
        <button
          type="button"
          onClick={() => bag.setQty(it.key, it.qty + 1)}
          disabled={it.qty >= 9}
          aria-label={`One more ${p.name}`}
          className="grid size-11 place-items-center rounded-full text-[26px] transition-colors hover:bg-[var(--k10-ink)] hover:text-[var(--k10-bg)] active:scale-95 disabled:opacity-30"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() => bag.remove(it.key)}
        className={`${k.mono} ${k.link} justify-self-start text-[var(--k10-grey)] md:col-start-4 md:row-start-1 md:justify-self-end md:pb-2`}
      >
        Remove
      </button>
      <p className={`${k.monoL} text-right tabular-nums md:col-start-5 md:row-start-1 md:pb-1.5`}>{formatINR(it.total)}</p>
    </li>
  );
}
