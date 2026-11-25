"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { bag, bagSummary, useBag, type BagItem } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { formatINR } from "@/lib/shop/products";
import { EASE } from "./content";
import { slipFlag, useFlag } from "./store";

const close = () => slipFlag.set(false);

/** The bag: a narrow printed order slip that slides down from under the top-right controls. */
export function BagSlip() {
  const open = useFlag(slipFlag);
  const { items, count, subtotal } = bagSummary(useBag());
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
                  <p>Nothing on the slip yet. Every piece in the catalogue has an Add or a Choose beside it.</p>
                  <Link href="/d/05/shop" onClick={close}>
                    Open the catalogue
                  </Link>
                </div>
              ) : (
                <>
                  <SlipLines items={items} editable />
                  <dl className="x5-totals">
                    <div>
                      <dt>Subtotal</dt>
                      <dd>{formatINR(subtotal)}</dd>
                    </div>
                    <div>
                      <dt>Delivery in India</dt>
                      <dd>Free; express ₹350</dd>
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
                  <p className="x5-slipNote">Sign in or create an account at checkout to place the order.</p>
                </>
              )}
            </motion.aside>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/** The printed lines of the slip. Shared with the checkout and the confirmation. */
export function SlipLines({ items, editable = false }: { items: BagItem[]; editable?: boolean }) {
  return (
    <ol className="x5-lines">
      {items.map((l, i) => (
        <li key={l.key} className="x5-line">
          <span className="x5-lineN">{i + 1}</span>
          <span className="x5-lineName">
            {editable ? (
              <Link href={`/d/05/p/${l.slug}`} onClick={close} className="x5-lineLink">
                {l.product.name}
              </Link>
            ) : (
              l.product.name
            )}
          </span>
          <span className="x5-linePrice">{formatINR(l.total)}</span>
          <span className="x5-lineMeta">
            {CONTENT[l.product.wood].name}
            {l.optionValue ? `, ${l.optionValue.label}` : ""}
            {l.note ? `, ${l.note}` : ""}
            {!editable && l.qty > 1 ? `, ${l.qty} at ${formatINR(l.unitPrice)}` : ""}
          </span>
          {editable && (
            <span className="x5-lineQty">
              <button type="button" className="x5-qtyBtn" aria-label={`One fewer ${l.product.name}`} onClick={() => bag.setQty(l.key, l.qty - 1)}>
                −
              </button>
              <span className="x5-qtyN" aria-label={`Quantity ${l.qty}`}>
                {l.qty}
              </span>
              <button
                type="button"
                className="x5-qtyBtn"
                aria-label={`One more ${l.product.name}`}
                disabled={l.qty >= 9}
                onClick={() => bag.setQty(l.key, l.qty + 1)}
              >
                +
              </button>
              <button type="button" className="x5-textBtn x5-qtyRemove" onClick={() => bag.remove(l.key)}>
                Remove
              </button>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
