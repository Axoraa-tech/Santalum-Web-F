"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { bag, bagPanel, bagSummary, useBag, useBagOpen, type BagItem } from "@/lib/shop/bag";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { dismissAdded, useAdded } from "../_lib/ui";
import { PinGlyph, WOOD_HEX } from "./Pins";
import { QtyStepper } from "./ProductBits";
import { s } from "./styles";

/** The floating counter top-right; opens a popover of what is pinned to the bag. */
export function Bag() {
  const lines = useBag();
  const hydrated = useHydrated();
  const { items, count, subtotal } = bagSummary(hydrated ? lines : []);
  const open = useBagOpen();
  const added = useAdded();
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) bagPanel.close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        bagPanel.close();
        btn.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => panel.current?.focus(), 40);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Bag, ${count} ${count === 1 ? "piece" : "pieces"}`}
        onClick={() => {
          dismissAdded();
          bagPanel.toggle();
        }}
        className={`${s.chip} ${s.btn} h-11 min-w-11 gap-2 px-3 hover:border-(--a-ink) ${open ? "border-(--a-ink)" : ""}`}
      >
        <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden>
          <path d="M4 7h12l-1 10H5L4 7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7.5 7V5.5a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="relative grid h-5 min-w-5 place-items-center overflow-hidden rounded-full bg-(--a-ink) px-1.5 text-[12px] font-semibold tabular-nums text-(--a-paper)">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={count} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ type: "spring", stiffness: 520, damping: 32 }} className="block">
              {count}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>

      <AnimatePresence>
        {added && !open && (
          <motion.div
            key={added.id}
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 top-[calc(100%+10px)] flex w-[min(86vw,300px)] items-center gap-3 rounded-[14px] border border-(--a-line) bg-(--a-card) p-2.5 shadow-[0_24px_50px_-24px_rgba(31,29,26,0.5)]"
          >
            <span className="relative size-12 shrink-0 overflow-hidden rounded-[6px] bg-(--a-paper-2)">
              <Photo p={{ id: added.photo, alt: "" }} tone={added.tone} sizes="96px" />
            </span>
            <span className="min-w-0 flex-1 text-[14px] leading-snug">
              <span className="block text-(--a-muted)">Pinned to your bag</span>
              <span className="block truncate font-medium">
                {added.name}
                {added.option ? `, ${added.option}` : ""}
              </span>
            </span>
            <button type="button" onClick={() => (dismissAdded(), bagPanel.open())} className={`${s.link} shrink-0 text-[14px]`}>
              View
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            id={id}
            role="dialog"
            aria-label="Your bag"
            tabIndex={-1}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] w-[min(92vw,390px)] origin-top-right rounded-[14px] border border-(--a-line) bg-(--a-card) p-4 text-(--a-ink) shadow-[0_30px_70px_-30px_rgba(31,29,26,0.55)] outline-none"
          >
            <div className="flex items-baseline justify-between">
              <p className={`${s.serif} text-[22px]`}>Your bag</p>
              <p className="text-[14px] text-(--a-muted)">
                {count} {count === 1 ? "piece" : "pieces"}
              </p>
            </div>
            {items.length === 0 ? (
              <div className="mt-4 rounded-[10px] border border-dashed border-(--a-line-2) p-5 text-[15px] leading-relaxed text-(--a-ink-2)">
                Nothing pinned yet.{" "}
                <Link href="/d/08/shop" onClick={() => bagPanel.close()} className={s.link}>
                  Open the shop
                </Link>{" "}
                or any piece on the board.
              </div>
            ) : (
              <>
                <ul className="mt-3 max-h-[46svh] divide-y divide-(--a-line) overflow-y-auto" data-lenis-prevent>
                  {items.map((it) => (
                    <BagRow key={it.key} it={it} />
                  ))}
                </ul>
                <div className="mt-3 flex items-baseline justify-between border-t border-(--a-line) pt-3">
                  <span className="text-[14px] text-(--a-muted)">Subtotal, delivery free</span>
                  <span className="text-[18px] font-semibold tabular-nums">{formatINR(subtotal)}</span>
                </div>
                <Link href="/d/08/checkout" onClick={() => bagPanel.close()} className={`${s.btn} ${s.btnInk} mt-4 h-12 w-full text-[15px] font-medium`}>
                  Go to checkout
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BagRow({ it }: { it: BagItem }) {
  const shot = it.product.shots[0];
  return (
    <li className="flex gap-3 py-3">
      <Link href={`/d/08/p/${it.slug}`} className="relative h-[72px] w-[58px] shrink-0 overflow-hidden rounded-[4px] bg-(--a-paper-2)">
        <Photo p={shot.photo} tone={shot.tone} sizes="120px" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium">{it.product.name}</p>
        <p className="flex items-center gap-1.5 text-[13px] text-(--a-muted)">
          <PinGlyph color={WOOD_HEX[it.product.wood]} className="h-3.5 w-2.5" />
          {CONTENT[it.product.wood].name}
          {it.optionValue ? `, ${it.optionValue.label}` : ""}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <QtyStepper size="sm" value={it.qty} onChange={(n) => bag.setQty(it.key, n)} label={it.product.name} />
          <span className="text-[14px] tabular-nums">{formatINR(it.total)}</span>
        </div>
      </div>
    </li>
  );
}
