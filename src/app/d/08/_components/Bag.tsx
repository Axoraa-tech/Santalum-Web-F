"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { WOOD_NAMES, formatINR, getFamily, getVariant } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { s } from "./styles";

/** The floating counter top-right; opens a popover list of what is in the bag. */
export function Bag() {
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
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
        onClick={() => setOpen((o) => !o)}
        className={`${s.chip} ${s.btn} h-11 min-w-11 gap-2 px-3 hover:border-(--a-ink) ${open ? "border-(--a-ink)" : ""}`}
      >
        <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden>
          <path d="M4 7h12l-1 10H5L4 7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7.5 7V5.5a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="relative grid h-5 min-w-5 place-items-center overflow-hidden rounded-full bg-(--a-ink) px-1.5 text-[12px] font-semibold tabular-nums text-(--a-paper)">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={count}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 32 }}
              className="block"
            >
              {count}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>

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
            className="absolute right-0 top-[calc(100%+10px)] w-[min(92vw,380px)] origin-top-right rounded-[14px] border border-(--a-line) bg-(--a-card) p-4 text-(--a-ink) shadow-[0_30px_70px_-30px_rgba(31,29,26,0.55)] outline-none"
          >
            <div className="flex items-baseline justify-between">
              <p className={`${s.serif} text-[22px]`}>Your bag</p>
              <p className="text-[13px] text-(--a-muted)">
                {count} {count === 1 ? "piece" : "pieces"}
              </p>
            </div>
            {lines.length === 0 ? (
              <div className="mt-4 rounded-[10px] border border-dashed border-(--a-line-2) p-5 text-[14px] leading-relaxed text-(--a-ink-2)">
                Nothing here yet. Open any piece on the board and add it; it will be pinned here.
              </div>
            ) : (
              <>
                <ul className="mt-3 max-h-[46svh] divide-y divide-(--a-line) overflow-y-auto" data-lenis-prevent>
                  {lines.map((l) => (
                    <BagLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
                  ))}
                </ul>
                <div className="mt-3 flex items-baseline justify-between border-t border-(--a-line) pt-3">
                  <span className="text-[14px] text-(--a-muted)">Subtotal</span>
                  <span className="text-[18px] font-semibold tabular-nums">{formatINR(subtotal)}</span>
                </div>
                <Link
                  href="/d/08/checkout"
                  onClick={() => setOpen(false)}
                  className={`${s.btn} ${s.btnInk} mt-4 h-12 w-full text-[15px] font-medium`}
                >
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

function BagLine({ line }: { line: Line }) {
  const f = getFamily(line.slug);
  const v = getVariant(line.slug, line.wood);
  if (!f || !v) return null;
  const shot = v.shots[0];
  return (
    <li className="flex gap-3 py-3">
      <div className="relative h-[72px] w-[58px] shrink-0 overflow-hidden rounded-[4px] bg-(--a-paper-2)">
        <Photo p={shot.photo} tone={shot.tone} sizes="120px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium">{f.name}</p>
        <p className="text-[13px] text-(--a-muted)">{WOOD_NAMES[line.wood].common}</p>
        {line.custom && <p className="mt-0.5 text-[12px] text-(--a-ink-2)">{line.custom}</p>}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-(--a-line-2)">
            <button
              type="button"
              aria-label={`One fewer ${f.name}`}
              onClick={() => bag.setQty(line, line.qty - 1)}
              className="grid size-7 place-items-center rounded-full text-[16px] hover:bg-black/5 active:bg-black/10"
            >
              −
            </button>
            <span className="w-6 text-center text-[13px] tabular-nums" aria-live="polite">
              {line.qty}
            </span>
            <button
              type="button"
              aria-label={`One more ${f.name}`}
              onClick={() => bag.setQty(line, line.qty + 1)}
              className="grid size-7 place-items-center rounded-full text-[16px] hover:bg-black/5 active:bg-black/10"
            >
              +
            </button>
          </div>
          <span className="text-[14px] tabular-nums">{formatINR(v.price * line.qty)}</span>
        </div>
      </div>
    </li>
  );
}
