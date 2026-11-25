"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, priceOf, type Product } from "@/lib/shop/products";
import { setWoodQuietly, type Wood } from "@/lib/wood";
import { Pill } from "../Pill";
import { endTurn } from "../TurnVeil";
import { addToBag } from "./addToBag";
import { CheckIcon } from "./Icons";
import { shotsOf } from "./shots";
import { WishButton } from "./WishButton";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A product page belongs to its wood: arriving here sets the house to it, before paint, without the crossfade. */
export function FollowWood({ wood }: { wood: Wood }) {
  useLayoutEffect(() => {
    setWoodQuietly(wood);
    endTurn(); // arriving from the other wood's piece: the page has turned
  }, [wood]);
  return null;
}

/** The arched gallery: every photograph of the piece, round thumbnails to move between them. */
export function ProductGallery({ p }: { p: Product }) {
  const [i, setI] = useState(0);
  const shots = shotsOf(p);
  const shot = shots[Math.min(i, shots.length - 1)];
  return (
    <div className="lg:sticky lg:top-28">
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[3rem] bg-(--mz-surface)">
        <AnimatePresence initial={false}>
          <motion.div
            key={`${shot.photo.id}-${i}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute inset-0"
          >
            <Photo p={shot.photo} tone={shot.tone} priority={i === 0} sizes="(min-width: 1024px) 56vw, 100vw" />
          </motion.div>
        </AnimatePresence>
        {shots.length > 1 && (
          <div role="group" aria-label="Photographs" className="absolute bottom-5 left-5 flex gap-2 rounded-full bg-(--mz-bg)/80 p-1.5 backdrop-blur-xl md:bottom-6 md:left-6">
            {shots.map((s, n) => (
              <button
                key={s.photo.id + n}
                type="button"
                onClick={() => setI(n)}
                aria-label={`Photograph ${n + 1} of ${shots.length}: ${s.photo.alt}`}
                aria-pressed={n === i}
                className={`relative size-12 overflow-hidden rounded-full transition-[box-shadow,opacity] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent) ${
                  n === i ? "opacity-100 ring-2 ring-(--mz-ink) ring-offset-2 ring-offset-(--mz-bg)" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Photo p={s.photo} tone={s.tone} sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Option, quantity, price that follows them, add to bag and the wishlist. */
export function ProductBuy({ p }: { p: Product }) {
  const [opt, setOpt] = useState(p.options?.values[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const unit = priceOf(p, opt);
  const last = p.edition && p.edition.left <= 0;

  const add = () => {
    addToBag(btn.current, p, { option: opt, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div>
      <p className="font-display text-[34px] tabular-nums leading-none tracking-[-0.01em]" aria-live="polite">
        {formatINR(unit)}
        {p.options && new Set(p.options.values.map((v) => v.price)).size > 1 && <span className="ml-3 text-[15px] text-(--mz-ink-3)">for {p.options.values.find((v) => v.id === opt)?.label}</span>}
      </p>

      {p.options && (
        <fieldset className="mt-8">
          <legend className="mb-3 text-[14px] font-medium">{p.options.name}</legend>
          <div className="flex flex-wrap gap-2">
            {p.options.values.map((v) => {
              const on = opt === v.id;
              return (
                <label
                  key={v.id}
                  className={`relative flex h-12 cursor-pointer items-center gap-2 rounded-full px-5 text-[15px] transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--mz-accent) ${
                    on ? "text-(--mz-bg)" : "bg-(--mz-surface) text-(--mz-ink-2) hover:text-(--mz-ink)"
                  }`}
                >
                  <input type="radio" name={`opt-${p.slug}`} value={v.id} checked={on} onChange={() => setOpt(v.id)} className="sr-only" />
                  {on && <motion.span layoutId={`opt-${p.slug}`} className="absolute inset-0 rounded-full bg-(--mz-ink)" transition={{ type: "spring", bounce: 0.18, duration: 0.45 }} />}
                  <span className="relative">{v.label}</span>
                  <span className={`relative text-[13px] tabular-nums ${on ? "opacity-70" : "text-(--mz-ink-3)"}`}>{formatINR(v.price)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-8 flex items-center gap-2">
        <span className="flex h-14 shrink-0 items-center rounded-full border border-(--mz-line) px-1" role="group" aria-label="Quantity">
          <button
            type="button"
            aria-label="One fewer"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-11 place-items-center rounded-full text-[18px] text-(--mz-ink-2) hover:bg-(--mz-surface) hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-(--mz-accent)"
          >
            −
          </button>
          <span className="w-6 text-center tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            aria-label="One more"
            onClick={() => setQty((q) => Math.min(9, q + 1))}
            className="grid size-11 place-items-center rounded-full text-[18px] text-(--mz-ink-2) hover:bg-(--mz-surface) hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-(--mz-accent)"
          >
            +
          </button>
        </span>
        <Pill ref={btn} size="lg" onClick={add} disabled={!!last} className="min-w-0 flex-1 justify-between! px-6!">
          <span className="flex items-center gap-2 truncate">
            {added ? (
              <>
                <CheckIcon /> In your bag
              </>
            ) : last ? (
              "All placed"
            ) : (
              "Add to bag"
            )}
          </span>
          <span className="tabular-nums opacity-80 max-sm:hidden">{formatINR(unit * qty)}</span>
        </Pill>
        <WishButton slug={p.slug} name={p.name} size="lg" className="shrink-0" />
      </div>
    </div>
  );
}

export function Accordion({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  const [on, setOn] = useState(open);
  return (
    <div className="border-b border-(--mz-line)">
      <button
        type="button"
        onClick={() => setOn((o) => !o)}
        aria-expanded={on}
        className="flex w-full items-center justify-between rounded-sm py-5 text-left text-[16px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
      >
        {title}
        <span className="relative grid size-8 place-items-center rounded-full border border-(--mz-line)">
          <span className="absolute h-px w-3 bg-(--mz-ink)" />
          <motion.span className="absolute h-3 w-px bg-(--mz-ink)" animate={{ scaleY: on ? 0 : 1 }} transition={{ duration: 0.3 }} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {on && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-[16px] leading-relaxed text-(--mz-ink-2)">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
