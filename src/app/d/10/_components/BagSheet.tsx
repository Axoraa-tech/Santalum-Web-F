"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import k from "../k";
import { EASE, lockScroll, sheetStore, splitName, unlockScroll, useStore } from "./lib";
import { HashLink } from "./Nav";

/** The bag drops from the top as a full-width sheet: a typographic list, set large. */
export function BagSheet() {
  const open = useStore(sheetStore, false);
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
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
            className="fixed inset-x-0 top-0 z-[161] max-h-[90svh] overflow-y-auto rounded-b-[32px] bg-[var(--k-bg)] shadow-[0_40px_80px_-40px_rgba(18,18,18,0.45)]"
          >
            <div className={`${k.gut} sticky top-0 z-[1] flex h-12 items-center justify-between border-b border-[var(--k-line)] bg-[var(--k-bg)]`}>
              <p className={k.mono}>
                Bag, {count} {count === 1 ? "piece" : "pieces"}
              </p>
              <button ref={closeRef} type="button" onClick={close} className={`${k.mono} ${k.link} py-2`}>
                Close
              </button>
            </div>

            {count === 0 ? (
              <div className={`${k.gut} grid grid-cols-1 gap-8 py-12 md:grid-cols-[1fr_auto] md:items-end md:py-16`}>
                <p className={`${k.disp} text-[length:clamp(44px,9vw,150px)] [font-variation-settings:'wdth'_60,'wght'_800]`}>
                  Nothing here yet
                </p>
                <HashLink id="collection" before={close} className={k.btn}>
                  <span className={k.btnLabel}>See the collection</span>
                </HashLink>
              </div>
            ) : (
              <>
                <ul className={k.gut}>
                  {lines.map((l) => (
                    <BagLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} onNavigate={close} />
                  ))}
                </ul>
                <div className={`${k.gut} grid grid-cols-1 gap-6 pb-10 pt-8 md:grid-cols-12 md:items-end md:pb-12`}>
                  <div className="md:col-span-5">
                    <p className={`${k.mono} text-[var(--k-grey)]`}>Subtotal</p>
                    <p className={`${k.disp} mt-2 text-[length:clamp(48px,8vw,120px)] tabular-nums [font-variation-settings:'wdth'_70,'wght'_820]`}>
                      {formatINR(subtotal)}
                    </p>
                  </div>
                  <p className={`${k.mono} text-[var(--k-grey)] md:col-span-4`}>
                    Delivery is complimentary across India. Preview: payments are not connected yet, so nothing is charged.
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

function BagLine({ line, onNavigate }: { line: Line; onNavigate: () => void }) {
  const f = getFamily(line.slug);
  const v = getVariant(line.slug, line.wood);
  if (!f || !v) return null;
  const { head, tail } = splitName(f.name);
  return (
    <li className="grid grid-cols-[1fr_auto] items-end gap-x-6 gap-y-3 border-b border-[var(--k-line)] py-5 md:grid-cols-[1fr_auto_auto_9rem]">
      <div className="min-w-0 md:col-start-1 md:row-start-1">
        <Link
          href={`/d/10/p/${f.slug}`}
          onClick={onNavigate}
          className={`${k.disp} block truncate text-[length:clamp(36px,6vw,92px)] leading-[0.86] transition-[font-variation-settings] duration-700 [font-variation-settings:'wdth'_55,'wght'_800] hover:[font-variation-settings:'wdth'_120,'wght'_820]`}
        >
          {head}
        </Link>
        <p className={`${k.mono} mt-2 text-[var(--k-grey)]`}>
          {WOOD_NAMES[line.wood].common}
          {tail ? `, ${tail}` : ""}
          {f.edition ? `, ${f.edition.toLowerCase()}` : ""}
        </p>
        {line.custom && <p className={`${k.mono} mt-1`}>Your note: {line.custom}</p>}
      </div>
      <div className="col-start-2 row-start-1 flex items-center gap-1 self-center md:self-end">
        <button
          type="button"
          onClick={() => bag.setQty(line, line.qty - 1)}
          aria-label={`One fewer ${f.name}`}
          className="grid size-11 place-items-center rounded-full text-[26px] transition-colors hover:bg-[var(--k-ink)] hover:text-[var(--k-bg)] active:scale-95"
        >
          −
        </button>
        <span className={`${k.disp} w-[1.1em] text-center text-[44px] tabular-nums [font-variation-settings:'wdth'_60,'wght'_800]`} aria-label={`Quantity ${line.qty}`}>
          {line.qty}
        </span>
        <button
          type="button"
          onClick={() => bag.setQty(line, line.qty + 1)}
          disabled={line.qty >= 9}
          aria-label={`One more ${f.name}`}
          className="grid size-11 place-items-center rounded-full text-[26px] transition-colors hover:bg-[var(--k-ink)] hover:text-[var(--k-bg)] active:scale-95 disabled:opacity-30"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() => bag.setQty(line, 0)}
        className={`${k.mono} ${k.link} justify-self-start text-[var(--k-grey)] md:col-start-3 md:row-start-1 md:justify-self-end md:pb-2`}
      >
        Remove
      </button>
      <p className={`${k.monoL} text-right tabular-nums md:col-start-4 md:row-start-1 md:pb-1.5`}>{formatINR(v.price * line.qty)}</p>
    </li>
  );
}
