"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, getProduct, priceLabel, priceOf, formatINR, type Product } from "@/lib/shop/products";
import { cardH, cardRect, detailRect, woodOf, type CardPos } from "../_lib/board";
import { atlas } from "../_lib/engine";
import { addToBag } from "../_lib/ui";
import { EditionTokens } from "./Shared";
import { seededRating } from "@/lib/shop/reviews-data";
import { OptionPicker, QtyStepper, Stamp, RatingLine, Stars, WishButton, badgeTone } from "./ProductBits";
import { s } from "./styles";

/* ---------------- the pinned card on the board ---------------- */
export function ProductCard({ p, pos, open }: { p: Product; pos: CardPos; open: boolean }) {
  const h = cardH(pos.w);
  const shot = p.shots[0];
  return (
    <article data-node data-open={open} className={s.card} style={{ left: pos.x, top: pos.y, width: pos.w, height: h, ["--rot" as string]: `${pos.rot}deg` }}>
      <span className={s.pinHead} aria-hidden />
      <div className="relative overflow-hidden bg-(--a-paper-2)" style={{ height: Math.round(pos.w * 1.25) }}>
        <div className="absolute inset-0">
          <Photo p={shot.photo} tone={shot.tone} sizes="520px" className={s.photoZoom} />
        </div>
        {(p.badge || p.edition) && (
          <span className="absolute left-3 top-3 flex flex-col items-start gap-1 text-[17px]">
            {p.badge && <span className={`bg-(--a-card) px-2.5 py-1 font-medium ${badgeTone(p.badge) === "accent" ? "text-(--a-accent-deep)" : ""}`}>{p.badge}</span>}
            {p.edition && (
              <span className="bg-(--a-ink) px-2.5 py-1 text-(--a-paper)">
                {p.edition.left} of {p.edition.size} left
              </span>
            )}
          </span>
        )}
      </div>
      <div className="flex h-[136px] flex-col justify-between px-4 pb-4 pt-3">
        <h3 className={`${s.serif} line-clamp-2 text-balance text-[26px] leading-[1.1]`}>{p.name}</h3>
        <p className="flex items-baseline justify-between gap-2 text-[19px]">
          <span className="flex items-center gap-2 text-(--a-muted)">
            <Stars value={seededRating(p.slug).avg} className="size-[17px]" />
            <span className="tabular-nums">({seededRating(p.slug).count})</span>
          </span>
          <span className="shrink-0 font-semibold tabular-nums">{priceLabel(p)}</span>
        </p>
      </div>
      <button
        type="button"
        data-card={p.slug}
        aria-label={`${p.name}: open the details`}
        onClick={() => (open ? atlas.closeProduct() : atlas.openProduct(p.slug))}
        className="absolute inset-0 cursor-pointer rounded-none focus-visible:outline-offset-4"
      />
    </article>
  );
}

/* ---------------- the detail, shared by the board and the phone sheet ---------------- */
function ProductDetail({ slug, layout }: { slug: string; layout: "world" | "sheet" }) {
  const p = getProduct(slug)!;
  const c = CONTENT[p.wood];
  const [shot, setShot] = useState(0);
  const [option, setOption] = useState(p.options?.values[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const cur = p.shots[Math.min(shot, p.shots.length - 1)];
  const world = layout === "world";
  const price = priceOf(p, option);

  const add = () => {
    addToBag(slug, { option, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className={world ? "grid grid-cols-[300px_1fr] gap-7" : "flex flex-col gap-5"}>
      <div>
        <div className={`relative overflow-hidden bg-(--a-paper-2) ${world ? "h-[375px]" : "aspect-[4/3]"}`}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div key={shot} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="absolute inset-0">
              <Photo p={cur.photo} tone={cur.tone} sizes={world ? "640px" : "92vw"} />
            </motion.div>
          </AnimatePresence>
          <WishButton slug={p.slug} name={p.name} className="absolute right-3 top-3" />
        </div>
        <div className="mt-2.5 flex gap-2" role="group" aria-label="Photos">
          {p.shots.map((sh, i) => (
            <button
              key={`${sh.photo.id}-${i}`}
              type="button"
              aria-label={`Photo ${i + 1} of ${p.shots.length}`}
              aria-pressed={i === shot}
              onClick={() => setShot(i)}
              className={`relative size-[60px] overflow-hidden border transition-[border-color,transform] duration-300 hover:-translate-y-0.5 active:translate-y-0 ${
                i === shot ? "border-(--a-ink)" : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <Photo p={sh.photo} tone={sh.tone} sizes="120px" />
            </button>
          ))}
        </div>
        <p className="mt-4 text-[14px] leading-snug text-(--a-muted)">{p.care}</p>
      </div>

      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-[14px] text-(--a-muted)">
          {categoryOf(p).label}
          {p.badge && <Stamp tone={badgeTone(p.badge)}>{p.badge}</Stamp>}
        </p>
        <h2 id="a8-detail-title" tabIndex={-1} className={`${s.serif} mt-1 text-balance pr-16 text-[36px] leading-[1.04] outline-none`}>
          {p.name}
        </h2>
        <p className="mt-1 text-[14px] text-(--a-ink-2)">
          {c.name}, <i>{c.latin}</i>
        </p>
        <RatingLine slug={p.slug} className="mt-2" />
        <p className="mt-3 text-[16px] leading-relaxed text-(--a-ink-2)">{p.short}</p>
        {p.edition && (
          <div className="mt-3 flex items-center gap-3">
            <EditionTokens size={p.edition.size} left={p.edition.left} className="max-w-[260px]" />
            <span className="text-[14px] text-(--a-accent-deep)">
              {p.edition.left} of {p.edition.size} left
            </span>
          </div>
        )}
        {p.options && (
          <div className="mt-4">
            <OptionPicker product={p} value={option} onChange={setOption} name={`opt-${layout}-${p.slug}`} />
          </div>
        )}
        <dl className="mt-4 border-t border-(--a-line)">
          {p.details.slice(0, 3).map((d) => (
            <div key={d.label} className="flex justify-between gap-4 border-b border-(--a-line) py-1.5 text-[14px]">
              <dt className="text-(--a-muted)">{d.label}</dt>
              <dd className="text-right">{d.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, Math.min(9, n)))} label={p.name} />
          <button type="button" onClick={add} className={`${s.btn} ${s.btnInk} h-12 min-w-[200px] flex-1 px-6 text-[15px] font-medium`} aria-live="polite">
            {added ? "Added to your bag" : `Add to bag, ${formatINR(price * qty)}`}
          </button>
        </div>
        <p className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[14px]">
          <span className="text-(--a-muted)">Free delivery across India</span>
          <Link href={`/d/08/p/${p.slug}`} className={s.link}>
            Open the full page
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Beside the card, in the canvas, with a dashed tie between them and a wash over the rest of the board. */
export function DetailInWorld({ slug }: { slug: string }) {
  const r = detailRect(slug);
  const c = cardRect(slug);
  if (!c) return null;
  const right = r.x > c.x;
  const x1 = right ? c.x + c.w : c.x;
  const y1 = c.y + c.h / 2;
  const x2 = right ? r.x : r.x + r.w;
  const y2 = r.y + 120;
  return (
    <>
      <svg className="pointer-events-none absolute left-0 top-0 z-[45] overflow-visible" width="1" height="1" aria-hidden>
        <path d={`M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`} fill="none" stroke="var(--a-accent)" strokeWidth="3" strokeDasharray="10 9" />
        <circle cx={x1} cy={y1} r="7" fill="var(--a-accent)" />
        <circle cx={x2} cy={y2} r="7" fill="var(--a-card)" stroke="var(--a-accent)" strokeWidth="3" />
      </svg>
      <motion.section
        data-node
        role="dialog"
        aria-modal="false"
        aria-labelledby="a8-detail-title"
        initial={{ opacity: 0, x: right ? -24 : 24, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={`${s.selectable} absolute z-50 cursor-auto border border-(--a-line-2) bg-(--a-card) p-7 shadow-[0_50px_90px_-40px_rgba(31,29,26,0.6)]`}
        style={{ left: r.x, top: r.y, width: r.w }}
        data-nodrag
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            atlas.closeProduct();
          }
        }}
      >
        <button type="button" onClick={() => atlas.closeProduct()} className={`${s.btn} ${s.btnLine} absolute right-4 top-4 z-10 h-9 px-3.5 text-[13px]`}>
          Close
        </button>
        <ProductDetail key={slug} slug={slug} layout="world" />
      </motion.section>
    </>
  );
}

/** The wash behind an open detail; clicking it closes the detail. */
export function Wash({ on }: { on: boolean }) {
  return (
    <AnimatePresence>
      {on && (
        <motion.button
          type="button"
          tabIndex={-1}
          aria-label="Close the product details"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => atlas.closeProduct()}
          className="absolute inset-0 z-30 cursor-zoom-out bg-(--a-paper)/70"
        />
      )}
    </AnimatePresence>
  );
}

/** On narrow screens the detail rises as a sheet instead. */
export function DetailSheet({ slug }: { slug: string | null }) {
  const valid = slug && getProduct(slug) ? slug : null;
  return (
    <AnimatePresence>
      {valid && (
        <>
          <motion.button
            key="scrim"
            type="button"
            tabIndex={-1}
            aria-label="Close the product details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => atlas.closeProduct()}
            className="fixed inset-0 z-[130] bg-(--a-ink)/25"
          />
          <motion.div
            key={valid}
            role="dialog"
            aria-modal="true"
            aria-labelledby="a8-detail-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            onKeyDown={(e) => e.key === "Escape" && atlas.closeProduct()}
            className={`fixed inset-x-0 bottom-0 z-[140] max-h-[86svh] overflow-y-auto rounded-t-[18px] border-t border-(--a-line) bg-(--a-card) px-5 pb-28 pt-3 shadow-[0_-30px_60px_-30px_rgba(31,29,26,0.5)] ${woodOf(valid) === "white" ? s.asWhite : s.asRed}`}
            data-lenis-prevent
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-(--a-line-2)" aria-hidden />
            <div className="mb-2 flex justify-end">
              <button type="button" onClick={() => atlas.closeProduct()} className={`${s.btn} ${s.btnLine} h-9 px-3.5 text-[13px]`}>
                Close
              </button>
            </div>
            <ProductDetail key={valid} slug={valid} layout="sheet" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
