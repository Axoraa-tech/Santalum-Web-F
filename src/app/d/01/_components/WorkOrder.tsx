"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { s } from "./cx";
import { EASE, partNo } from "./data";
import { scrollToId, sheet, sheetStore, useStore } from "./store";

/** A stable work-order number for the current bag (no clocks or randomness during render). */
export function orderNumber(lines: Line[]) {
  let h = 7;
  for (const l of lines) for (const ch of `${l.slug}${l.wood}${l.qty}${l.custom ?? ""}`) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return `WO-26-${String(h).padStart(4, "0")}`;
}

/** The bag: a work-order sheet that drops down from the top right. */
export function WorkOrder() {
  const open = useStore(sheetStore, false);
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") sheet.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="veil"
          className="fixed inset-0 z-[55] bg-[rgb(26_27_29/0.14)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => sheet.close()}
          aria-hidden
        />
      )}
      {open && (
        <motion.div
          key="sheet"
          id="work-order"
          ref={panel}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wo-title"
          initial={{ clipPath: "inset(0% 0% 100% 0%)", y: -10 }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)", y: -10 }}
          transition={{ duration: 0.6, ease: EASE }}
          data-lenis-prevent
          className={`${s.sheet} fixed right-2 top-[58px] z-[60] flex max-h-[calc(100svh-70px)] w-[min(460px,calc(100vw-16px))] flex-col border border-(--hair-2) shadow-[0_30px_70px_-30px_rgb(26_27_29/0.45)] outline-none md:right-4`}
        >
          {/* Title block */}
          <div className="grid grid-cols-[1fr_auto] border-b border-(--ink)">
            <div className="px-5 pb-3 pt-4">
              <h2 id="wo-title" className={`${s.x110} text-[22px] font-[620] leading-none tracking-[-0.01em]`}>
                Work order
              </h2>
              <p className={`${s.mono} mt-2 text-[11px] text-(--steel)`}>Your bag, as the workshop will read it</p>
            </div>
            <dl className={`${s.mono} grid grid-cols-[auto_auto] content-center gap-x-3 gap-y-1 border-l border-(--hair-2) px-4 text-[11px]`}>
              <dt className="text-(--steel)">No.</dt>
              <dd className="tabular-nums">{count ? orderNumber(lines) : "—"}</dd>
              <dt className="text-(--steel)">Items</dt>
              <dd className="tabular-nums">{count}</dd>
            </dl>
          </div>

          {count === 0 ? (
            <div className="px-5 py-10">
              <p className="text-[17px]">Nothing on this order yet.</p>
              <p className="mt-2 text-[14px] leading-relaxed text-(--ink-2)">
                Every piece in the parts list can be added here, in red or white sandalwood.
              </p>
              <Link
                href="/d/01#parts"
                onClick={(e) => {
                  sheet.close();
                  if (document.getElementById("parts")) {
                    e.preventDefault();
                    scrollToId("parts");
                  }
                }}
                className={`${s.btnLine} mt-6`}
              >
                Open the parts list
              </Link>
            </div>
          ) : (
            <>
              <div className={`${s.mono} grid grid-cols-[1fr_5.5rem_5.5rem] gap-2 border-b border-(--hair-2) px-5 py-2 text-[10.5px] text-(--steel)`}>
                <span>Item</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Amount</span>
              </div>
              <ul className="min-h-0 flex-1 overflow-y-auto">
                {lines.map((l) => (
                  <OrderLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
                ))}
              </ul>
              <dl className={`${s.mono} border-t border-(--ink) px-5 pt-3 text-[12px]`}>
                <div className="flex justify-between py-1">
                  <dt className="text-(--ink-2)">Subtotal</dt>
                  <dd className="tabular-nums">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-(--ink-2)">Delivery in India</dt>
                  <dd>Complimentary</dd>
                </div>
                <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-(--hair-2) py-3">
                  <dt>Total</dt>
                  <dd className={`${s.x110} font-[family-name:var(--f01-archivo)] text-[24px] font-[600] tabular-nums`}>{formatINR(subtotal)}</dd>
                </div>
              </dl>
              <div className="flex items-center justify-between gap-3 border-t border-(--hair-2) px-5 py-4">
                <button type="button" onClick={() => sheet.close()} className={s.link}>
                  Keep browsing
                </button>
                <Link href="/d/01/checkout" onClick={() => sheet.close()} className={s.btn}>
                  Release to checkout
                </Link>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OrderLine({ line }: { line: Line }) {
  const f = getFamily(line.slug);
  const v = getVariant(line.slug, line.wood);
  if (!f || !v) return null;
  const shot = v.shots[0];
  return (
    <li className="grid grid-cols-[1fr_5.5rem_5.5rem] items-center gap-2 border-b border-(--hair) px-5 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-(--paper-2)">
          <Photo p={shot.photo} tone={shot.tone} sizes="40px" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-[520]">{f.name}</p>
          <p className={`${s.mono} truncate text-[10.5px] text-(--steel)`}>
            {partNo(f.slug)} {WOOD_NAMES[line.wood].latin}
          </p>
          {line.custom && <p className={`${s.mono} truncate text-[10.5px] text-(--ink-2)`}>{line.custom}</p>}
        </div>
      </div>
      <div className={`${s.mono} flex items-center justify-center text-[12px]`}>
        <button
          type="button"
          onClick={() => bag.setQty(line, line.qty - 1)}
          aria-label={line.qty === 1 ? `Remove ${f.name}` : `One fewer ${f.name}`}
          className="grid size-7 place-items-center rounded-full transition-colors hover:bg-[rgb(26_27_29/0.07)] active:bg-[rgb(26_27_29/0.12)]"
        >
          {line.qty === 1 ? "×" : "−"}
        </button>
        <span className="w-6 text-center tabular-nums">{line.qty}</span>
        <button
          type="button"
          onClick={() => bag.setQty(line, line.qty + 1)}
          disabled={line.qty >= 9}
          aria-label={`One more ${f.name}`}
          className="grid size-7 place-items-center rounded-full transition-colors hover:bg-[rgb(26_27_29/0.07)] active:bg-[rgb(26_27_29/0.12)] disabled:opacity-30"
        >
          +
        </button>
      </div>
      <p className={`${s.mono} text-right text-[12px] tabular-nums`}>{formatINR(v.price * line.qty)}</p>
    </li>
  );
}
