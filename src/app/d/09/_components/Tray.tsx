"use client";

import { AnimatePresence, animate, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { bag, bagSummary, useBag, type BagItem } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getOption, getProduct } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import s from "../styles";
import { EASE } from "./data";
import { openPiece, useAdded } from "./store";

/** The bag: a round offering tray at the bottom right that opens into a rounded panel. */
export function Tray() {
  const lines = useBag();
  const hydrated = useHydrated();
  const { items, count, subtotal } = bagSummary(hydrated ? lines : []);
  const [open, setOpen] = useState(false);
  const added = useAdded();
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!added || !button.current) return;
    const a = animate(button.current, { scale: [1, 1.14, 0.96, 1], rotate: [0, -8, 4, 0] }, { duration: 0.7, ease: EASE });
    return () => a.stop();
  }, [added]);

  useEffect(() => {
    if (!open) return;
    heading.current?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const addedP = added ? getProduct(added.slug) : undefined;
  const addedOpt = addedP && added ? getOption(addedP, added.option) : undefined;

  return (
    <div ref={wrap} className="fixed bottom-3 right-3 z-[140] sm:bottom-5 sm:right-5">
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Offering tray"
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ transformOrigin: "calc(100% - 32px) calc(100% + 40px)" }}
            className="absolute bottom-[80px] right-0 flex max-h-[min(640px,calc(100svh-120px))] w-[min(410px,calc(100vw-24px))] flex-col overflow-hidden rounded-[2.25rem] border border-[var(--hair)] bg-[var(--paper)] shadow-[0_40px_90px_-40px_rgb(42_36_32/0.6)]"
          >
            <div className="flex items-baseline justify-between px-6 pb-3 pt-6">
              <h2 ref={heading} tabIndex={-1} className={`${s.display} text-[32px] leading-none outline-none`}>
                Offering tray
              </h2>
              <span className={`${s.tab} text-[13px] text-[var(--muted)]`}>
                {count} {count === 1 ? "piece" : "pieces"}
              </span>
            </div>

            {count === 0 ? (
              <div className="px-6 pb-7">
                <p className="text-[15px] leading-[1.65] text-[var(--muted)]">Nothing on the tray yet. Open any piece in the day, or walk through the shop, and add it here.</p>
                <Link href="/d/09/shop" onClick={() => setOpen(false)} className={`${s.ghost} mt-5`}>
                  Go to the shop
                </Link>
              </div>
            ) : (
              <>
                <ul className={`${s.panelScroll} min-h-0 flex-1 overflow-y-auto overscroll-contain px-4`} data-lenis-prevent>
                  {items.map((it) => (
                    <TrayLine key={it.key} item={it} onOpen={() => setOpen(false)} />
                  ))}
                </ul>
                <div className="border-t border-[var(--hair)] px-6 pb-6 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[14px] text-[var(--muted)]">Subtotal</span>
                    <span className={`${s.num} text-[26px] leading-none`}>{formatINR(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-[var(--muted)]">Free delivery across India. Express ₹350.</p>
                  <Link href="/d/09/checkout" onClick={() => setOpen(false)} className={`${s.btn} mt-4 w-full`}>
                    Check out
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {added && addedP && !open && (
          <motion.p
            key={added.n}
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute bottom-[78px] right-0 w-max max-w-[min(300px,calc(100vw-24px))] rounded-[1.25rem] bg-[var(--ink)] px-4 py-2.5 text-[13px] leading-snug text-[var(--paper)]"
          >
            On the tray: {addedP.name}
            {addedOpt ? `, ${addedOpt.label}` : ""}
            {added.qty > 1 ? `, ${added.qty}` : ""}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Offering tray, ${count} ${count === 1 ? "piece" : "pieces"}`}
        onClick={() => setOpen((o) => !o)}
        className="group relative grid size-[62px] place-items-center rounded-full shadow-[0_14px_30px_-14px_rgb(42_36_32/0.6)] transition-transform duration-200 active:scale-95 sm:size-[68px]"
      >
        <svg viewBox="0 0 68 68" className="absolute inset-0 size-full transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:rotate-[24deg]" aria-hidden>
          <defs>
            <radialGradient id="d09-tray" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#f1e1bf" />
              <stop offset="100%" stopColor="#c9a46a" />
            </radialGradient>
          </defs>
          <circle cx="34" cy="34" r="33" fill="url(#d09-tray)" />
          <circle cx="34" cy="34" r="29.5" fill="none" stroke="rgb(90 64 30 / 0.35)" strokeWidth="0.8" />
          <circle cx="34" cy="34" r="20" fill="none" stroke="rgb(90 64 30 / 0.28)" strokeWidth="0.8" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={(34 + Math.cos(a) * 25).toFixed(2)} cy={(34 + Math.sin(a) * 25).toFixed(2)} r="1.1" fill="rgb(90 64 30 / 0.35)" />;
          })}
        </svg>
        <span className={`${s.num} relative text-[21px] font-normal leading-none text-[var(--ink)]`}>{count}</span>
      </button>
    </div>
  );
}

function TrayLine({ item, onOpen }: { item: BagItem; onOpen: () => void }) {
  const p = item.product;
  const sh = p.shots[0];
  return (
    <li className="flex items-center gap-4 border-b border-[var(--hair)] px-2 py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => {
          onOpen();
          openPiece(p.slug);
        }}
        aria-label={`Open ${p.name}`}
        className={`${s.press} ${s.mask} ${s.circle} size-14 shrink-0`}
      >
        <Photo p={sh.photo} tone={sh.tone} sizes="56px" />
      </button>
      <div className="min-w-0 flex-1">
        <p className={`${s.display} line-clamp-2 text-[19px] leading-tight`}>{p.name}</p>
        <p className="text-[12px] text-[var(--muted)]">
          {CONTENT[p.wood].name}
          {item.optionValue ? `, ${item.optionValue.label}` : ""}
        </p>
        {item.note && <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">Note: {item.note}</p>}
        <p className={`${s.tab} mt-0.5 text-[13px]`}>{formatINR(item.total)}</p>
      </div>
      <div className="flex items-center gap-1" role="group" aria-label={`Quantity of ${p.name}`}>
        <button
          type="button"
          onClick={() => bag.setQty(item.key, item.qty - 1)}
          aria-label={item.qty === 1 ? `Remove ${p.name}` : `One fewer ${p.name}`}
          className="grid size-8 place-items-center rounded-full border border-[var(--hair)] text-[16px] transition-colors hover:border-[var(--ink)] active:scale-90"
        >
          −
        </button>
        <span className={`${s.tab} w-6 text-center text-[14px]`} aria-live="polite">
          {item.qty}
        </span>
        <button
          type="button"
          onClick={() => bag.setQty(item.key, item.qty + 1)}
          disabled={item.qty >= 9}
          aria-label={`One more ${p.name}`}
          className="grid size-8 place-items-center rounded-full border border-[var(--hair)] text-[16px] transition-colors hover:border-[var(--ink)] active:scale-90 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </li>
  );
}
