"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { bag, bagSummary, useBag, type BagItem } from "@/lib/shop/bag";
import { formatINR, productsFor } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { useWood } from "@/lib/wood";
import { s } from "./cls";
import { cx, shotsOf, WOOD_SHORT } from "./data";
import { bagUI, useBagUI, useIsPhone, type BagFrom } from "./store";
import { addToBag, IconClose, IconMinus, IconOpen, trapTab } from "./ui";

/**
 * The bag panel grows (shared layout) out of whatever opened it: the bag pill in the top bar (on
 * phones too, where it carries the count), or the hero's bag tile.
 */
export function BagLayer() {
  const ui = useBagUI();
  const lines = useBag();
  const hydrated = useHydrated();
  const { items, count, subtotal } = bagSummary(hydrated ? lines : []);
  const phone = useIsPhone();

  return (
    <>
      <AnimatePresence>
        {ui.open && (
          <motion.div
            key="bag-scrim"
            className="fixed inset-0 z-[165] bg-[var(--b-canvas)]/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => bagUI.close()}
            aria-hidden
          />
        )}
        {ui.open && <Panel key="bag-panel" from={ui.from} phone={phone} items={items} count={count} subtotal={subtotal} />}
      </AnimatePresence>
    </>
  );
}

function Panel({ from, phone, items, count, subtotal }: { from: BagFrom; phone: boolean; items: BagItem[]; count: number; subtotal: number }) {
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

  const top = from === "bag-top";

  return (
    <motion.div
      ref={box}
      layoutId={from}
      role="dialog"
      aria-modal="true"
      aria-label="Bag"
      style={{ borderRadius: phone ? 0 : 28 }}
      className={cx(
        "fixed inset-0 z-[170] flex flex-col overflow-hidden bg-[var(--b-tile)] sm:inset-auto sm:right-3 sm:h-[min(720px,calc(100svh-24px))] sm:w-[min(440px,calc(100vw-24px))]",
        top ? "sm:top-3" : "sm:bottom-3",
      )}
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
          {items.length === 0 ? <Empty /> : <Lines items={items} />}
        </div>

        <div className="border-t border-[var(--b-line)] p-4 pb-[88px] sm:pb-4">
          <div className="flex items-baseline justify-between px-1">
            <span className="text-[15px]">Subtotal</span>
            <span className={cx(s.monoWide, "text-[20px]")}>{formatINR(subtotal)}</span>
          </div>
          <p className={cx(s.muted, "mt-1 px-1 text-[13px]")}>Free delivery across India. Express is chosen at checkout.</p>
          <div className="mt-4 flex gap-2">
            <Link href="/d/06/shop" className={cx(s.ghost, "flex-1")} onClick={() => bagUI.close()}>
              Keep looking
            </Link>
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

function Lines({ items }: { items: BagItem[] }) {
  return (
    <ul className="flex flex-col gap-2 pb-3">
      <AnimatePresence initial={false}>
        {items.map((l) => (
          <motion.li
            key={l.key}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="flex gap-3 rounded-[20px] bg-[var(--b-tile2)] p-2"
          >
            <Link
              href={`/d/06/p/${l.slug}`}
              onClick={() => bagUI.close()}
              className="relative size-[76px] shrink-0 overflow-hidden rounded-[14px] focus-visible:outline-2 focus-visible:outline-accent"
              aria-label={l.product.name}
            >
              <Photo p={shotsOf(l.product)[0].photo} tone={shotsOf(l.product)[0].tone} sizes="76px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col py-0.5 pr-1">
              <p className="truncate text-[15px] font-medium leading-tight">{l.product.name}</p>
              <p className={cx(s.mono, s.muted, "mt-0.5 truncate text-[10.5px]")}>
                {WOOD_SHORT[l.product.wood]}
                {l.optionValue ? `, ${l.optionValue.label}` : ""}
              </p>
              {l.note && <p className={cx(s.mono, "mt-0.5 truncate text-[10.5px]")}>Note: {l.note}</p>}
              <div className="mt-auto flex items-center justify-between pt-1.5">
                <div className="flex items-center gap-1 rounded-full bg-[var(--b-tile)] p-0.5">
                  <button type="button" className={cx(s.icon, s.iconSm, s.onWhite)} onClick={() => bag.setQty(l.key, l.qty - 1)} aria-label={l.qty === 1 ? `Remove ${l.product.name}` : `One fewer ${l.product.name}`}>
                    <IconMinus size={14} />
                  </button>
                  <span className={cx(s.mono, "w-5 text-center text-[13px]")} aria-label={`Quantity ${l.qty}`}>
                    {l.qty}
                  </span>
                  <button type="button" className={cx(s.icon, s.iconSm, s.onWhite)} onClick={() => bag.setQty(l.key, l.qty + 1)} disabled={l.qty >= 9} aria-label={`One more ${l.product.name}`}>
                    <IconOpen size={14} />
                  </button>
                </div>
                <span className={cx(s.mono, "text-[13px]")}>{formatINR(l.total)}</span>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

/** Empty: the three smallest things in the current wood, one tap each. */
function Empty() {
  const wood = useWood();
  const picks = [...productsFor(wood)].sort((a, b) => a.price - b.price).slice(0, 3);
  return (
    <div className="pb-3">
      <div className="rounded-[20px] bg-[var(--b-tile2)] p-5">
        <p className="text-[18px] font-medium tracking-[-0.02em]">Your bag is empty.</p>
        <p className={cx(s.muted, "mt-1 text-[14px]")}>
          {wood === "red" ? "Most people begin with something small, carried every day." : "Most people begin with something they light or wear."}
        </p>
      </div>
      <ul className="mt-2 flex flex-col gap-2">
        {picks.map((p) => (
          <li key={p.slug} className="flex items-center gap-3 rounded-[20px] bg-[var(--b-tile2)] p-2 pr-3">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-[14px]">
              <Photo p={shotsOf(p)[0].photo} tone={shotsOf(p)[0].tone} sizes="56px" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium">{p.name}</span>
              <span className={cx(s.mono, s.muted, "block text-[10.5px]")}>
                {formatINR(p.price)}
                {p.options ? `, ${p.options.values[0].label}` : ""}
              </span>
            </span>
            <button type="button" className={cx(s.btn, s.btnSm)} onClick={() => addToBag(p.slug)}>
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
