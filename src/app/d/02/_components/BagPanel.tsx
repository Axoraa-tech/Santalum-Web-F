"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { bag, bagSummary, useBag, type BagItem } from "@/lib/shop/bag";
import { featured, formatINR, priceLabel, type Product } from "@/lib/shop/products";
import { useWood } from "@/lib/wood";
import { CHECKOUT, DELIVERY_LINE, SHOP, WOOD_LABEL, productHref, splitName } from "./copy";
import { bagUI, lockScroll, unlockScroll, useBagUI } from "./store";
import { ArrowIcon, CloseIcon, QuickAdd } from "./ui";
import { s } from "./cls";

function LineRow({ item }: { item: BagItem }) {
  const p = item.product;
  const [name, sub] = splitName(p.name);
  const shot = p.shots[0];
  return (
    <li className="flex gap-4 py-4">
      <Link href={productHref(p.slug)} onClick={() => bagUI.close()} className="relative size-[72px] shrink-0 overflow-hidden rounded-full bg-[var(--o-floor)] transition-transform hover:scale-105">
        <Photo p={shot.photo} tone={shot.tone} sizes="72px" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`${s.syne} text-[17px] font-bold leading-tight tracking-[-0.02em]`}>
              {name}
              {sub && <span className="font-semibold text-[var(--o-muted)]">, {sub}</span>}
            </p>
            <p className="mt-0.5 text-[13px] text-[var(--o-muted)]">
              {WOOD_LABEL[p.wood]}
              {item.optionValue && `, ${item.optionValue.label}`}
            </p>
            {item.note && <p className="mt-1 text-[13px] text-[var(--o-ink-2)]">{item.note}</p>}
          </div>
          <p className="shrink-0 text-[15px] font-semibold tabular-nums">{formatINR(item.total)}</p>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            aria-label={`One fewer ${p.name}`}
            onClick={() => bag.setQty(item.key, item.qty - 1)}
            className="grid size-8 place-items-center rounded-full border border-[var(--o-line)] text-[16px] transition-colors hover:border-[var(--o-ink)] active:scale-90"
          >
            −
          </button>
          <span className="w-7 text-center text-[14px] tabular-nums" aria-label={`Quantity ${item.qty}`}>
            {item.qty}
          </span>
          <button
            type="button"
            aria-label={`One more ${p.name}`}
            onClick={() => bag.setQty(item.key, item.qty + 1)}
            disabled={item.qty >= 9}
            className="grid size-8 place-items-center rounded-full border border-[var(--o-line)] text-[16px] transition-colors hover:border-[var(--o-ink)] active:scale-90 disabled:opacity-40"
          >
            +
          </button>
          <button type="button" onClick={() => bag.remove(item.key)} className="ml-auto text-[13px] text-[var(--o-muted)] underline-offset-4 hover:text-[var(--o-ink)] hover:underline">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

function PickRow({ p, small = false }: { p: Product; small?: boolean }) {
  return (
    <li className={`flex items-center gap-3 rounded-full p-1.5 pr-2 ${small ? "bg-[var(--o-stone)]" : "border border-[var(--o-line)]"}`}>
      <Link href={productHref(p.slug)} onClick={() => bagUI.close()} className={`relative shrink-0 overflow-hidden rounded-full bg-[var(--o-floor)] ${small ? "size-11" : "size-14"}`}>
        <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="56px" />
      </Link>
      <span className="min-w-0 flex-1">
        <span className={`${s.syne} block truncate font-bold ${small ? "text-[14px]" : "text-[15px]"}`}>{splitName(p.name)[0]}</span>
        <span className="block text-[13px] tabular-nums text-[var(--o-muted)]">{priceLabel(p)}</span>
      </span>
      <QuickAdd product={p} />
    </li>
  );
}

function Empty() {
  const wood = useWood();
  return (
    <div className="flex flex-1 flex-col">
      <p className="mt-2 text-[16px] text-[var(--o-ink-2)]">
        Nothing in your bag yet. {wood === "red" ? "Three red pieces from the ring, to begin with:" : "Three white pieces from the ring, to begin with:"}
      </p>
      <ul className="mt-6 space-y-3">
        {featured(wood)
          .slice(0, 3)
          .map((p) => (
            <PickRow key={p.slug} p={p} />
          ))}
      </ul>
    </div>
  );
}

/** A short "goes with" row under a small bag, so the panel never sits half empty. */
function Pairs({ have }: { have: string[] }) {
  const wood = useWood();
  const picks = featured(wood)
    .filter((p) => !have.includes(p.slug))
    .slice(0, 2);
  if (!picks.length) return null;
  return (
    <div className="mt-auto pb-4 pt-8">
      <p className="text-[13px] font-semibold text-[var(--o-muted)]">From the ring</p>
      <ul className="mt-3 space-y-2">
        {picks.map((p) => (
          <PickRow key={p.slug} p={p} small />
        ))}
      </ul>
    </div>
  );
}

/** The bag: grows out of the round bag button as a circle and settles into a rounded panel. */
export function BagPanel() {
  const { open, x, y, r } = useBagUI();
  const lines = useBag();
  const reduced = !!useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { items, count, subtotal } = bagSummary(lines);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") bagUI.close();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 90);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  const shut = `circle(26px at ${x}px ${y}px)`;
  const full = `circle(${r}px at ${x}px ${y}px)`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="veil"
            aria-hidden
            onClick={() => bagUI.close()}
            className="fixed inset-0 z-[150] bg-[rgb(25_23_20/0.18)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            key="clip"
            className="pointer-events-none fixed inset-0 z-[151]"
            initial={reduced ? { opacity: 0 } : { clipPath: shut }}
            animate={reduced ? { opacity: 1 } : { clipPath: full }}
            exit={reduced ? { opacity: 0 } : { clipPath: shut }}
            transition={{ duration: reduced ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="o2-bag-title"
              className="pointer-events-auto absolute inset-0 flex flex-col bg-[var(--o-card)] md:inset-auto md:right-4 md:top-4 md:h-[min(760px,calc(100svh-32px))] md:w-[440px] md:rounded-[36px] md:shadow-[0_40px_120px_-30px_rgb(25_23_20/0.5)]"
            >
              <div className="relative px-6 pb-2 pr-20 pt-6 md:px-8 md:pt-8">
                <h2 id="o2-bag-title" className={`${s.display} text-[40px]`}>
                  Your bag
                </h2>
                <p className="mt-2 text-[14px] text-[var(--o-muted)]">{count === 0 ? "Empty" : `${count} ${count === 1 ? "piece" : "pieces"}`}</p>
                {/* sits exactly where the bag button was, so the button becomes the close button */}
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close bag"
                  onClick={() => bagUI.close()}
                  className="absolute right-4 top-4 grid size-14 place-items-center rounded-full bg-[var(--o-ink)] text-white transition-transform duration-300 hover:rotate-90 active:scale-90 md:right-2 md:top-2"
                >
                  <CloseIcon />
                </button>
              </div>

              <div data-lenis-prevent className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-6 md:px-8">
                {items.length === 0 ? (
                  <Empty />
                ) : (
                  <>
                    <ul className="divide-y divide-[var(--o-line)]">
                      {items.map((it) => (
                        <LineRow key={it.key} item={it} />
                      ))}
                    </ul>
                    {items.length < 3 && <Pairs have={items.map((l) => l.slug)} />}
                  </>
                )}
              </div>

              <div className="border-t border-[var(--o-line)] px-6 pb-7 pt-5 md:px-8">
                <div className="flex items-baseline justify-between">
                  <p className="text-[15px]">Subtotal</p>
                  <p className={`${s.syne} text-[26px] font-bold tabular-nums tracking-[-0.03em]`}>{formatINR(subtotal)}</p>
                </div>
                <p className="mt-1 text-[13px] text-[var(--o-muted)]">{DELIVERY_LINE}</p>
                {count > 0 ? (
                  <Link
                    href={CHECKOUT}
                    onClick={() => bagUI.close()}
                    className="group mt-5 flex h-14 items-center justify-between rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.99]"
                  >
                    Checkout
                    <span className="grid size-10 place-items-center rounded-full bg-[var(--m-accent)] transition-transform duration-300 group-hover:translate-x-0.5">
                      <ArrowIcon />
                    </span>
                  </Link>
                ) : (
                  <Link
                    href={SHOP}
                    onClick={() => bagUI.close()}
                    className="mt-5 flex h-14 w-full items-center justify-center rounded-full border border-[var(--o-ink)] text-[15px] font-semibold transition-colors hover:bg-[var(--o-ink)] hover:text-white"
                  >
                    Go to the shop
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
