"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { bag, bagSummary, useBag, type BagItem } from "@/lib/shop/bag";
import { useNow } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { s } from "./cx";
import { EASE, partNo, shotsOf } from "./data";
import { openPiece } from "./SheetChange";
import { sheet, sheetStore, useStore } from "./store";

/**
 * The order number before release: the same SM-YYMM- series the placed order gets, with the last
 * four left blank. The workshop stamps them when the order is released, so the number seen here
 * is never a different one from the number on the job card.
 */
export function DraftOrderNo() {
  const now = useNow(60_000);
  const d = now === null ? null : new Date(now);
  const yymm = d ? `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}` : "····";
  return (
    <span title="The last four digits are stamped when the order is released">
      SM-{yymm}-<span className="text-(--steel)">····</span>
    </span>
  );
}

/** The bag: a work-order sheet that drops down from the top right. */
export function WorkOrder() {
  const open = useStore(sheetStore, false);
  const lines = useBag();
  const { items, count, subtotal } = bagSummary(lines);
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
          className="fixed inset-0 z-[55] bg-[color-mix(in_srgb,var(--ink)_14%,transparent)]"
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
          className={`${s.sheet} fixed right-2 top-[58px] z-[60] flex max-h-[calc(100svh-70px)] w-[min(460px,calc(100vw-16px))] flex-col border border-(--hair-2) shadow-[0_30px_70px_-30px_rgb(0_0_0/0.4)] outline-none md:right-4`}
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
              <dd className="tabular-nums">{count ? <DraftOrderNo /> : "None yet"}</dd>
              <dt className="text-(--steel)">Pieces</dt>
              <dd className="tabular-nums">{count}</dd>
            </dl>
          </div>

          {count === 0 ? (
            <div className="px-5 py-10">
              <p className="text-[17px]">Nothing on this order yet.</p>
              <p className="mt-2 text-[15px] leading-relaxed text-(--ink-2)">
                <WT
                  red="Twenty-six pieces are turned and carved in red sandalwood. Add any of them here."
                  white="Twenty-six bottles, jars, beads and carvings are made in white sandalwood. Add any of them here."
                />
              </p>
              <Link href="/d/01/shop" onClick={() => sheet.close()} className={`${s.btnLine} mt-6`}>
                <WT red="Open the parts catalogue" white="Open the lot catalogue" />
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
                {items.map((it) => (
                  <OrderLine key={it.key} item={it} />
                ))}
              </ul>
              <dl className={`${s.mono} border-t border-(--ink) px-5 pt-3 text-[12px]`}>
                <div className="flex justify-between py-1">
                  <dt className="text-(--ink-2)">Subtotal</dt>
                  <dd className="tabular-nums">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-(--ink-2)">Delivery in India</dt>
                  <dd>Free, 3–5 working days</dd>
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

function OrderLine({ item }: { item: BagItem }) {
  const p = item.product;
  const shot = shotsOf(p)[0];
  return (
    <li className="grid grid-cols-[1fr_5.5rem_5.5rem] items-center gap-2 border-b border-(--hair) px-5 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-(--paper-2)">
          <Photo p={shot.photo} tone={shot.tone} sizes="40px" />
        </span>
        <div className="min-w-0">
          <Link
            href={`/d/01/p/${p.slug}`}
            onClick={(e) => {
              sheet.close();
              openPiece(e, p.slug);
            }}
            className="block truncate text-[14px] font-[520] transition-colors hover:text-(--accent)">
            {p.name}
          </Link>
          <p className={`${s.mono} truncate text-[10.5px] text-(--steel)`}>
            {partNo(p.slug)} {item.optionValue ? `${item.optionValue.label}, ` : ""}
            {CONTENT[p.wood].latin}
          </p>
          {item.note && <p className={`${s.mono} truncate text-[10.5px] text-(--ink-2)`}>{item.note}</p>}
        </div>
      </div>
      <div className={`${s.mono} flex items-center justify-center text-[12px]`}>
        <button
          type="button"
          onClick={() => bag.setQty(item.key, item.qty - 1)}
          aria-label={item.qty === 1 ? `Remove ${p.name}` : `One fewer ${p.name}`}
          className={`${s.icon} size-7!`}
        >
          {item.qty === 1 ? "×" : "−"}
        </button>
        <span className="w-6 text-center tabular-nums">{item.qty}</span>
        <button type="button" onClick={() => bag.setQty(item.key, item.qty + 1)} disabled={item.qty >= 9} aria-label={`One more ${p.name}`} className={`${s.icon} size-7!`}>
          +
        </button>
      </div>
      <p className={`${s.mono} text-right text-[12px] tabular-nums`}>{formatINR(item.total)}</p>
    </li>
  );
}
