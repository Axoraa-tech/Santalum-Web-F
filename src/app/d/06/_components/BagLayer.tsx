"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { formatINR, getFamily, getVariant } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { s } from "./cls";
import { cx, WOOD_SHORT } from "./data";
import { bagUI, useAdded, useBagUI, useHeroBag, useIsPhone } from "./store";
import { addToBag, IconBag, IconClose, IconMinus, IconOpen, trapTab } from "./ui";

/**
 * The bag: a small tile pinned bottom-right that grows (shared layout) into the bag panel.
 * While the hero's bag tile is on screen the pinned tile steps aside.
 */
export function BagLayer() {
  const ui = useBagUI();
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const heroVisible = useHeroBag();
  const phone = useIsPhone();
  const bump = useAdded();
  const last = lines[lines.length - 1];
  const lastV = last ? getVariant(last.slug, last.wood) : undefined;

  return (
    <>
      <AnimatePresence>
        {(!heroVisible || (ui.open && ui.from === "bag-dock")) && (
          <motion.button
            key="dock"
            layoutId="bag-dock"
            type="button"
            onClick={() => bagUI.open("bag-dock")}
            aria-label={`Open bag, ${count} ${count === 1 ? "piece" : "pieces"}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            style={{ borderRadius: 22 }}
            className="group fixed bottom-3 right-3 z-[140] flex h-14 items-center gap-3 bg-white p-1.5 shadow-[0_1px_2px_rgba(20,20,20,0.06),0_16px_40px_-18px_rgba(20,20,20,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:pr-4"
          >
            <span className="relative grid size-11 place-items-center overflow-hidden rounded-[16px] bg-accent-soft">
              {lastV ? <Photo p={lastV.shots[0].photo} tone={lastV.shots[0].tone} sizes="44px" /> : <IconBag size={20} />}
              <motion.span
                key={bump}
                initial={{ scale: bump ? 1.7 : 1 }}
                animate={{ scale: 1 }}
                className={cx(s.mono, "absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#141414] px-1 text-[10px] text-white")}
              >
                {count}
              </motion.span>
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-[14px] font-medium leading-tight">Bag</span>
              <span className={cx(s.mono, s.muted, "block text-[10.5px]")}>{count ? formatINR(subtotal) : "Empty"}</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ui.open && (
          <motion.div
            key="bag-scrim"
            className="fixed inset-0 z-[165] bg-[#eeede9]/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => bagUI.close()}
            aria-hidden
          />
        )}
        {ui.open && <Panel key="bag-panel" from={ui.from} phone={phone} lines={lines} count={count} subtotal={subtotal} />}
      </AnimatePresence>
    </>
  );
}

function Panel({ from, phone, lines, count, subtotal }: { from: string; phone: boolean; lines: Line[]; count: number; subtotal: number }) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => close.current?.focus({ preventScroll: true }), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") bagUI.close();
      if (e.key === "Tab" && box.current) trapTab(e, box.current);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <motion.div
      ref={box}
      layoutId={from}
      role="dialog"
      aria-modal="true"
      aria-label="Bag"
      style={{ borderRadius: phone ? 0 : 28 }}
      className="fixed inset-0 z-[170] flex flex-col overflow-hidden bg-white sm:inset-auto sm:bottom-3 sm:right-3 sm:h-[min(720px,calc(100svh-24px))] sm:w-[min(440px,calc(100vw-24px))]"
    >
      <motion.div
        className="flex h-full min-h-0 flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.3 } }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
      >
        <div className="flex items-center justify-between gap-3 p-5 pb-3">
          <div>
            <p className="text-[26px] font-medium leading-none tracking-[-0.04em]">Bag</p>
            <p className={cx(s.mono, s.muted, "mt-1.5 text-[11px]")}>
              {count} {count === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <button ref={close} type="button" className={s.icon} onClick={() => bagUI.close()} aria-label="Close bag">
            <IconClose />
          </button>
        </div>

        <div className={cx(s.scroller, "min-h-0 flex-1 overflow-y-auto px-3")} data-lenis-prevent>
          {lines.length === 0 ? <Empty /> : <Lines lines={lines} />}
        </div>

        <div className="border-t border-black/[0.06] p-4 pb-[88px] sm:pb-4">
          <div className="flex items-baseline justify-between px-1">
            <span className="text-[15px]">Subtotal</span>
            <span className={cx(s.monoWide, "text-[20px]")}>{formatINR(subtotal)}</span>
          </div>
          <p className={cx(s.muted, "mt-1 px-1 text-[13px]")}>Delivery and payment are confirmed at checkout.</p>
          <div className="mt-4 flex gap-2">
            <button type="button" className={cx(s.ghost, "flex-1")} onClick={() => bagUI.close()}>
              Keep looking
            </button>
            {count > 0 ? (
              <Link href="/d/06/checkout" className={cx(s.btn, "flex-1")} onClick={() => bagUI.close()}>
                Checkout
              </Link>
            ) : (
              <button type="button" className={cx(s.btn, "flex-1")} disabled>
                Checkout
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Lines({ lines }: { lines: Line[] }) {
  return (
    <ul className="flex flex-col gap-2 pb-3">
      <AnimatePresence initial={false}>
        {lines.map((l) => {
          const f = getFamily(l.slug);
          const v = getVariant(l.slug, l.wood);
          if (!f || !v) return null;
          return (
            <motion.li
              key={`${l.slug}-${l.wood}-${l.custom ?? ""}`}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="flex gap-3 rounded-[20px] bg-[#f6f4f0] p-2"
            >
              <span className="relative size-[76px] shrink-0 overflow-hidden rounded-[14px]">
                <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="76px" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col py-0.5 pr-1">
                <p className="truncate text-[15px] font-medium leading-tight">{f.name}</p>
                <p className={cx(s.mono, s.muted, "mt-0.5 text-[10.5px]")}>{WOOD_SHORT[l.wood]}</p>
                {l.custom && <p className={cx(s.mono, "mt-0.5 truncate text-[10.5px]")}>Custom: {l.custom}</p>}
                <div className="mt-auto flex items-center justify-between pt-1.5">
                  <div className="flex items-center gap-1 rounded-full bg-white p-0.5">
                    <button type="button" className={cx(s.icon, s.iconSm, s.onWhite)} onClick={() => bag.setQty(l, l.qty - 1)} aria-label={`One fewer ${f.name}`}>
                      <IconMinus size={14} />
                    </button>
                    <span className={cx(s.mono, "w-5 text-center text-[13px]")} aria-label={`Quantity ${l.qty}`}>
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      className={cx(s.icon, s.iconSm, s.onWhite)}
                      onClick={() => bag.setQty(l, l.qty + 1)}
                      disabled={l.qty >= 9}
                      aria-label={`One more ${f.name}`}
                    >
                      <IconOpen size={14} />
                    </button>
                  </div>
                  <span className={cx(s.mono, "text-[13px]")}>{formatINR(v.price * l.qty)}</span>
                </div>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

function Empty() {
  const wood = useWood();
  const picks = ["key-fob", "coaster-pair", "heartwood-powder"];
  return (
    <div className="pb-3">
      <div className="rounded-[20px] bg-[#f6f4f0] p-5">
        <p className="text-[18px] font-medium tracking-[-0.02em]">Your bag is empty.</p>
        <p className={cx(s.muted, "mt-1 text-[14px]")}>Most people begin with something small, carried every day.</p>
      </div>
      <ul className="mt-2 flex flex-col gap-2">
        {picks.map((slug) => {
          const f = getFamily(slug)!;
          const v = f.variants[wood];
          if (!v) return null;
          return (
            <li key={slug} className="flex items-center gap-3 rounded-[20px] bg-[#f6f4f0] p-2 pr-3">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-[14px]">
                <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="56px" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{f.name}</span>
                <span className={cx(s.mono, s.muted, "block text-[10.5px]")}>{formatINR(v.price)}</span>
              </span>
              <button type="button" className={cx(s.btn, s.btnSm)} onClick={() => addToBag(slug, wood)}>
                Add
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
