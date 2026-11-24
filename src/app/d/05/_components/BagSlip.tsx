"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { EASE } from "./content";
import { slipFlag, useFlag } from "./store";

const close = () => slipFlag.set(false);

/** The bag: a narrow printed order slip that slides down from under the top-right controls. */
export function BagSlip() {
  const open = useFlag(slipFlag);
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 80);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="x5-scrim"
            aria-hidden
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <div key="slot" className="x5-slot">
            <motion.aside
              id="idx-slip"
              role="dialog"
              aria-label="Your bag"
              className="x5-slip"
              initial={{ y: "-104%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-104%" }}
              transition={{ duration: 0.75, ease: EASE }}
              data-lenis-prevent
            >
              <span className="x5-perf" aria-hidden />
              <div className="x5-slipHead">
                <p className="x5-slipBrand">Santalum Maison</p>
                <button ref={closeRef} type="button" className="x5-textBtn" onClick={close}>
                  Close
                </button>
                <p className="x5-slipTitle">
                  Order slip, {count} {count === 1 ? "piece" : "pieces"}
                </p>
              </div>

              {count === 0 ? (
                <div className="x5-slipEmpty">
                  <p>Nothing on the slip yet. Open any row of the catalogue to add a piece.</p>
                  <Link href="/d/05#catalogue" onClick={close}>
                    Open the catalogue
                  </Link>
                </div>
              ) : (
                <>
                  <SlipLines lines={lines} editable />
                  <dl className="x5-totals">
                    <div>
                      <dt>Subtotal</dt>
                      <dd>{formatINR(subtotal)}</dd>
                    </div>
                    <div>
                      <dt>Delivery in India</dt>
                      <dd>Confirmed at checkout</dd>
                    </div>
                    <div className="x5-totalRow">
                      <dt>Total</dt>
                      <dd>{formatINR(subtotal)}</dd>
                    </div>
                  </dl>
                  <Link href="/d/05/checkout" className="x5-cta" onClick={close}>
                    <span>Go to checkout</span>
                    <span>{formatINR(subtotal)}</span>
                  </Link>
                  <p className="x5-slipNote">Preview: payments are not connected yet.</p>
                </>
              )}
            </motion.aside>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/** The printed lines of the slip. Shared with the checkout. */
export function SlipLines({ lines, editable = false }: { lines: Line[]; editable?: boolean }) {
  return (
    <ol className="x5-lines">
      {lines.map((l, i) => {
        const f = getFamily(l.slug);
        const v = getVariant(l.slug, l.wood);
        if (!f || !v) return null;
        return (
          <li key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} className="x5-line">
            <span className="x5-lineN">{i + 1}</span>
            <span className="x5-lineName">{f.name}</span>
            <span className="x5-linePrice">{formatINR(v.price * l.qty)}</span>
            <span className="x5-lineMeta">
              {WOOD_NAMES[l.wood].common}
              {l.custom ? `, ${l.custom}` : ""}
              {!editable && l.qty > 1 ? `, ${l.qty} at ${formatINR(v.price)}` : ""}
            </span>
            {editable && (
              <span className="x5-lineQty">
                <button type="button" className="x5-qtyBtn" aria-label={`One fewer ${f.name}`} onClick={() => bag.setQty(l, l.qty - 1)}>
                  −
                </button>
                <span className="x5-qtyN" aria-label={`Quantity ${l.qty}`}>
                  {l.qty}
                </span>
                <button
                  type="button"
                  className="x5-qtyBtn"
                  aria-label={`One more ${f.name}`}
                  disabled={l.qty >= 9}
                  onClick={() => bag.setQty(l, l.qty + 1)}
                >
                  +
                </button>
                <button type="button" className={`x5-textBtn x5-qtyRemove`} onClick={() => bag.setQty(l, 0)}>
                  Remove
                </button>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
