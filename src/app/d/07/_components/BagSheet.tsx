"use client";

import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { FAMILIES, formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { useWood } from "@/lib/wood";
import { IconClose } from "./Icons";
import { getLenis, HOME, sheet, useSheetOpen } from "./store";

/** The bag: a sheet that rises out of the dock. Drag the handle down (or flick) to put it away. */
export function BagSheet() {
  const open = useSheetOpen();
  return <AnimatePresence>{open && <SheetBody key="sheet" />}</AnimatePresence>;
}

function SheetBody() {
  const lines = useBag();
  const wood = useWood();
  const { count, subtotal } = bagTotals(lines);
  const controls = useDragControls();
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const lenis = getLenis();
    lenis?.stop();
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") sheet.close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
      lenis?.start();
      prev?.focus({ preventScroll: true });
    };
  }, []);

  const suggestions = FAMILIES.filter((f) => f.variants[wood] && f.level === "Discovery").concat(
    FAMILIES.filter((f) => f.variants[wood] && f.level === "Ritual").slice(0, 1),
  );

  return (
    <>
      <motion.div
        aria-hidden
        onClick={() => sheet.close()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[170] bg-[#1B1712]/30"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="s7-bag-title"
        drag="y"
        dragListener={false}
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.9 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 520) sheet.close();
        }}
        initial={reduce ? { opacity: 0 } : { y: "70%", scale: 0.55, opacity: 0, borderRadius: 26 }}
        animate={reduce ? { opacity: 1 } : { y: 0, scale: 1, opacity: 1, borderRadius: 36 }}
        exit={reduce ? { opacity: 0 } : { y: "75%", scale: 0.55, opacity: 0, borderRadius: 26 }}
        transition={{ type: "spring", stiffness: 300, damping: 32, mass: 0.9 }}
        style={{ originY: 1 }}
        className="fixed inset-x-2 bottom-[72px] z-[180] mx-auto flex max-h-[calc(100svh-96px)] xl:bottom-2 xl:max-h-[84svh] max-w-[600px] flex-col overflow-hidden bg-[#F8F6F2] shadow-[0_40px_90px_-30px_rgba(27,23,18,0.6)] ring-1 ring-[#1B1712]/10"
      >
        {/* handle + header: the drag zone */}
        <div
          onPointerDown={(e) => controls.start(e)}
          className="shrink-0 cursor-grab touch-none select-none px-5 pb-3 pt-2.5 active:cursor-grabbing md:px-7"
        >
          <div aria-hidden className="mx-auto h-1.5 w-12 rounded-full bg-[#1B1712]/20" />
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h2 id="s7-bag-title" className="d1 text-[44px] md:text-[56px]">
                Your bag
              </h2>
              <p className="num mt-1.5 text-[14px] text-[#77706A]">
                {count === 0 ? "Nothing in it yet" : `${count} ${count === 1 ? "piece" : "pieces"}, ${formatINR(subtotal)}`}
              </p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={() => sheet.close()}
              aria-label="Close the bag"
              className="grid size-11 place-items-center rounded-full bg-white text-[#1B1712] ring-1 ring-[#1B1712]/10 transition hover:bg-[#1B1712] hover:text-white active:scale-95"
            >
              <IconClose />
            </button>
          </div>
        </div>

        <div data-lenis-prevent className="s7-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 md:px-5">
          {count === 0 ? (
            <div className="px-2 pb-2 pt-2">
              <p className="max-w-sm text-[15px] leading-relaxed text-[#77706A]">
                Small pieces to begin with, in {WOOD_NAMES[wood].common.toLowerCase()}:
              </p>
              <ul className="mt-4 grid gap-2">
                {suggestions.map((f) => {
                  const v = f.variants[wood]!;
                  return (
                    <li key={f.slug} className="flex items-center gap-3 rounded-[22px] bg-white p-2 pr-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-[16px]">
                        <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="64px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="d3 text-[17px]">{f.name}</p>
                        <p className="num text-[13px] text-[#77706A]">{formatINR(v.price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => bag.add(f.slug, wood)}
                        className="rounded-full bg-[#1B1712] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-95"
                      >
                        Add
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <ul className="grid gap-2">
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <BagLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {count > 0 && (
          <div className="shrink-0 border-t border-[#1B1712]/10 bg-white/60 px-5 pb-5 pt-4 md:px-7">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] text-[#77706A]">Subtotal</span>
              <span className="num d3 text-[26px]">{formatINR(subtotal)}</span>
            </div>
            <p className="mt-1 text-[13px] text-[#77706A]">Delivery in India is complimentary. Gift wrap is chosen at checkout.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => sheet.close()}
                className="h-12 flex-1 rounded-full bg-white text-[15px] font-medium ring-1 ring-[#1B1712]/12 transition hover:ring-[#1B1712]/40 active:scale-[0.98]"
              >
                Keep looking
              </button>
              <Link
                href={`${HOME}/checkout`}
                onClick={() => sheet.close()}
                className="grid h-12 flex-[1.4] place-items-center rounded-full bg-[#1B1712] text-[15px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-[0.98]"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}

function BagLine({ line }: { line: Line }) {
  const f = getFamily(line.slug);
  const v = getVariant(line.slug, line.wood);
  if (!f || !v) return null;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.22 } }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className="flex items-center gap-3 rounded-[24px] bg-white p-2 pr-3 md:gap-4"
    >
      <Link
        href={`${HOME}/p/${f.slug}`}
        onClick={() => sheet.close()}
        className="relative size-[76px] shrink-0 overflow-hidden rounded-[18px] transition hover:opacity-85"
        aria-label={f.name}
      >
        <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="76px" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="d3 truncate text-[18px]">{f.name}</p>
        <p className="text-[13px] text-[#77706A]">{WOOD_NAMES[line.wood].common}</p>
        {line.custom && <p className="mt-0.5 text-[13px] text-[var(--m-accent)]">{line.custom}</p>}
        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => bag.setQty(line, line.qty - 1)}
            aria-label={line.qty === 1 ? `Remove ${f.name}` : `One fewer ${f.name}`}
            className="grid size-8 place-items-center rounded-full bg-[#1B1712]/[0.06] text-[16px] transition hover:bg-[#1B1712]/15 active:scale-90"
          >
            &minus;
          </button>
          <span className="num w-7 text-center text-[14px]" aria-live="polite">
            {line.qty}
          </span>
          <button
            type="button"
            onClick={() => bag.setQty(line, line.qty + 1)}
            disabled={line.qty >= 9}
            aria-label={`One more ${f.name}`}
            className="grid size-8 place-items-center rounded-full bg-[#1B1712]/[0.06] text-[16px] transition hover:bg-[#1B1712]/15 active:scale-90 disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>
      <p className="num self-start pt-1 text-[15px] font-medium">{formatINR(v.price * line.qty)}</p>
    </motion.li>
  );
}
