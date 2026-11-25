"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, formatINR, getProduct, priceOf, type Product } from "@/lib/shop/products";
import { EASE, WOOD_LABEL, otherWood, productHref, shopHref, splitName } from "./copy";
import { OptionPicker } from "./OptionPicker";
import { lockScroll, unlockScroll, useMedia } from "./store";
import { AddButton, ArrowIcon, CloseIcon, Swatch, WishButton } from "./ui";
import { s } from "./cls";

/** The piece opened from the ring: a card on the right (a full-screen sheet on phones). */
export function DetailCard({ product, onClose, reduced }: { product: Product; onClose: () => void; reduced: boolean }) {
  const desktop = useMedia("(min-width: 768px)", true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [option, setOption] = useState(product.options?.values[0].id ?? "");
  const [name, sub] = splitName(product.name);
  const longest = Math.max(...name.split(" ").map((w) => w.length));
  const cat = categoryOf(product);
  const twin = product.counterpart ? getProduct(product.counterpart) : undefined;
  const c = CONTENT[product.wood];

  useEffect(() => {
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 80);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [onClose]);

  const from = reduced ? { opacity: 0 } : desktop ? { x: "108%" } : { y: "100%" };
  const to = reduced ? { opacity: 1 } : desktop ? { x: "0%" } : { y: "0%" };

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-0 z-[105] bg-[rgb(25_23_20/0.06)] md:bg-transparent"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="o2-detail-title"
        data-lenis-prevent
        className="fixed inset-x-0 bottom-0 top-[5svh] z-[110] overflow-y-auto overscroll-contain rounded-t-[32px] bg-[var(--o-card)] shadow-[0_-20px_60px_-20px_rgb(25_23_20/0.35)] md:inset-y-4 md:left-auto md:right-4 md:top-4 md:w-[min(520px,44vw)] md:rounded-[36px] md:shadow-[0_40px_120px_-30px_rgb(25_23_20/0.45)]"
        initial={from}
        animate={to}
        exit={from}
        transition={{ duration: reduced ? 0.2 : 0.75, ease: EASE }}
      >
        <div className="relative px-6 pb-10 pt-6 md:px-9 md:pt-8">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="sticky top-0 z-10 float-right grid size-12 place-items-center rounded-full bg-[var(--o-ink)] text-white transition-transform duration-300 hover:rotate-90 active:scale-90"
          >
            <CloseIcon />
          </button>

          {/* two overlapping round photos */}
          <div className="relative mb-8 mt-2 h-[250px] w-[300px] max-w-full md:h-[280px] md:w-[340px]">
            <div className="absolute left-0 top-0 size-[230px] overflow-hidden rounded-full bg-[var(--o-floor)] md:size-[260px]">
              <Photo p={product.shots[0].photo} tone={product.shots[0].tone} sizes="260px" />
            </div>
            {product.shots[1] && (
              <div className="absolute bottom-0 right-0 size-[124px] overflow-hidden rounded-full border-[5px] border-[var(--o-card)] bg-[var(--o-floor)] md:size-[140px]">
                <Photo p={product.shots[1].photo} tone={product.shots[1].tone} sizes="140px" />
              </div>
            )}
          </div>

          <p className="text-[14px] text-[var(--o-muted)]">
            <Link href={shopHref(cat.id)} className="font-semibold text-[var(--m-accent)] underline-offset-4 hover:underline">
              {cat.label}
            </Link>
            {product.badge && <span>, {product.badge.toLowerCase()}</span>}
          </p>
          <h2
            id="o2-detail-title"
            className={`${s.display} mt-2 text-[length:var(--fm)] md:text-[length:var(--fd)]`}
            style={{ "--fm": `min(13vw, ${(86 / (longest * 0.86)).toFixed(2)}vw)`, "--fd": `min(2.9rem, ${Math.round(430 / (longest * 0.86))}px)` } as React.CSSProperties}
          >
            {name}
          </h2>
          {sub && <p className={`${s.syne} mt-2 text-[20px] font-semibold text-[var(--o-ink-2)]`}>{sub}</p>}

          <div className="mt-6 flex items-baseline gap-3">
            <p className={`${s.syne} text-[34px] font-bold tabular-nums tracking-[-0.03em]`}>{formatINR(priceOf(product, option))}</p>
            <p className="flex items-center gap-2 text-[14px] text-[var(--o-muted)]">
              <Swatch wood={product.wood} className="size-4" />
              {WOOD_LABEL[product.wood]}, <i>{c.latin}</i>
            </p>
          </div>
          {product.edition && (
            <p className="mt-1 text-[14px] font-semibold text-[var(--m-accent)]">
              Edition of {product.edition.size}. {product.edition.left} still to be placed.
            </p>
          )}

          <p className="mt-5 text-[17px] leading-relaxed">{product.short}</p>

          {product.options && (
            <div className="mt-6">
              <OptionPicker product={product} value={option} onChange={setOption} compact />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AddButton product={product} option={option || undefined} className="flex-1" />
            <WishButton slug={product.slug} name={product.name} className="size-14" />
          </div>
          <Link
            href={productHref(product.slug)}
            className="group mt-3 flex h-14 items-center justify-between rounded-full border border-[var(--o-line)] pl-6 pr-2 text-[15px] font-semibold transition-colors hover:border-[var(--o-ink)]"
          >
            The full page: story, details and care
            <span className="grid size-10 place-items-center rounded-full bg-[var(--o-floor)] transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowIcon className="size-4" />
            </span>
          </Link>

          <div className="mt-10 space-y-3 text-[16px] leading-relaxed text-[var(--o-ink-2)]">
            {product.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <dl className="mt-8 divide-y divide-[var(--o-line)] border-y border-[var(--o-line)]">
            {product.details.map((d) => (
              <div key={d.label} className="flex justify-between gap-6 py-3 text-[15px]">
                <dt className="text-[var(--o-muted)]">{d.label}</dt>
                <dd className="text-right font-medium">{d.value}</dd>
              </div>
            ))}
          </dl>

          {twin && (
            <Link href={productHref(twin.slug)} className="group mt-8 flex items-center gap-4 rounded-full bg-[var(--o-stone)] p-2 pr-5 transition-colors hover:bg-[var(--o-floor)]">
              <span className="relative flex shrink-0">
                <Swatch wood={product.wood} className="size-11" />
                <Swatch wood={otherWood(product.wood)} className="-ml-4 size-11 ring-2 ring-[var(--o-stone)]" />
              </span>
              <span className="min-w-0 text-[14px] leading-snug">
                <span className="block text-[var(--o-muted)]">Also in {WOOD_LABEL[twin.wood].toLowerCase()}</span>
                <span className={`${s.syne} block truncate text-[15px] font-bold group-hover:underline`}>{twin.name}</span>
              </span>
            </Link>
          )}
        </div>
      </motion.aside>
    </>
  );
}
