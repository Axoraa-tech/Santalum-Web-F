"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { WOOD_NAMES, formatINR, getFamily, type Family } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { CARD_POS, cardH, careFor, categoryOf, detailRect } from "../_lib/board";
import { atlas } from "../_lib/engine";
import { PinGlyph, WOOD_HEX } from "./Pins";
import { s } from "./styles";

/* ---------------- the pinned card on the board ---------------- */
export function ProductCard({ f, open }: { f: Family; open: boolean }) {
  const p = CARD_POS[f.slug];
  const h = cardH(p.w);
  const red = f.variants.red;
  const white = f.variants.white;
  const photo = (v: NonNullable<Family["variants"]["red"]>, faded = false) => (
    <div className="absolute inset-0">
      <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="520px" className={`${s.photoZoom} ${faded ? "opacity-55 grayscale-[0.5]" : ""}`} />
    </div>
  );
  return (
    <article
      data-node
      data-open={open}
      className={s.card}
      style={{ left: p.x, top: p.y, width: p.w, height: h, ["--rot" as string]: `${p.rot}deg` }}
    >
      <span className={s.pinHead} aria-hidden />
      <div className="relative overflow-hidden bg-(--a-paper-2)" style={{ height: Math.round(p.w * 1.25) }}>
        <W red={red ? photo(red) : photo(white!, true)} white={white ? photo(white) : photo(red!, true)} />
        {f.edition && (
          <span className="absolute left-3 top-3 bg-(--a-card) px-2.5 py-1 text-[17px] font-medium">{f.edition}</span>
        )}
        {(!red || !white) && (
          <W
            red={!red ? <span className="absolute inset-x-3 bottom-3 bg-(--a-ink) px-3 py-2 text-[17px] text-(--a-paper)">White sandalwood only</span> : null}
            white={!white ? <span className="absolute inset-x-3 bottom-3 bg-(--a-ink) px-3 py-2 text-[17px] text-(--a-paper)">Red sandalwood only</span> : null}
          />
        )}
      </div>
      <div className="flex h-[136px] flex-col justify-between px-4 pb-4 pt-3">
        <h3 className={`${s.serif} line-clamp-2 text-balance text-[26px] leading-[1.1]`}>{f.name}</h3>
        <p className="flex items-baseline justify-between gap-2 text-[19px]">
          <span className="text-(--a-muted)">{f.level}</span>
          <span className="font-semibold tabular-nums">
            <WT red={red ? formatINR(red.price) : "Not in red"} white={white ? formatINR(white.price) : "Not in white"} />
          </span>
        </p>
      </div>
      <button
        type="button"
        data-card={f.slug}
        aria-label={`${f.name}: open the details`}
        onClick={() => (open ? atlas.closeProduct() : atlas.openProduct(f.slug))}
        className="absolute inset-0 cursor-pointer rounded-none focus-visible:outline-offset-4"
      />
    </article>
  );
}

/* ---------------- the detail, shared by the board and the phone sheet ---------------- */
function ProductDetail({ slug, layout }: { slug: string; layout: "world" | "sheet" }) {
  const f = getFamily(slug)!;
  const wood = useWood();
  const v = f.variants[wood];
  const other: Wood = wood === "red" ? "white" : "red";
  const shown = v ?? f.variants[other]!;
  const [shot, setShot] = useState(0);
  const [added, setAdded] = useState(false);
  const shots = shown.shots;
  const cur = shots[Math.min(shot, shots.length - 1)];
  const world = layout === "world";

  const add = () => {
    bag.add(slug, wood);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className={world ? "grid grid-cols-[300px_1fr] gap-7" : "flex flex-col gap-5"}>
      <div>
        <div className={`relative overflow-hidden bg-(--a-paper-2) ${world ? "h-[375px]" : "aspect-[4/3]"}`}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={`${wood}-${shot}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0"
            >
              <Photo p={cur.photo} tone={cur.tone} sizes={world ? "640px" : "92vw"} />
            </motion.div>
          </AnimatePresence>
          {!v && (
            <span className="absolute inset-x-3 bottom-3 bg-(--a-ink) px-3 py-2 text-[14px] text-(--a-paper)">
              Shown in {WOOD_NAMES[other].common.toLowerCase()}
            </span>
          )}
        </div>
        <div className="mt-2.5 flex gap-2" role="group" aria-label="Photos">
          {shots.map((sh, i) => (
            <button
              key={`${sh.photo.id}-${i}`}
              type="button"
              aria-label={`Photo ${i + 1} of ${shots.length}`}
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
        <p className="mt-4 text-[14px] leading-snug text-(--a-muted)">{careFor(f)}</p>
      </div>

      <div className="min-w-0">
        <p className="text-[14px] text-(--a-muted)">
          {categoryOf(f.category).label}
          <span aria-hidden> / </span>
          {f.edition ?? f.level}
        </p>
        <h2 id="a8-detail-title" tabIndex={-1} className={`${s.serif} mt-1 text-balance pr-16 text-[38px] leading-[1.04] outline-none`}>
          {f.name}
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-(--a-ink-2)">{f.summary}</p>

        <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Wood">
          {(["red", "white"] as const).map((w) => {
            const vv = f.variants[w];
            const on = wood === w;
            return (
              <button
                key={w}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={!vv}
                onClick={() => switchWood(w)}
                className={`flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${
                  on ? "border-(--a-ink) bg-(--a-card)" : "border-(--a-line-2) hover:border-(--a-ink) active:bg-black/5"
                }`}
              >
                <PinGlyph color={WOOD_HEX[w]} filled={on} className="h-6 w-[18px] shrink-0" />
                <span className="min-w-0">
                  <span className="block text-[13px] text-(--a-muted)">{WOOD_NAMES[w].common}</span>
                  <span className="block text-[16px] font-semibold tabular-nums">{vv ? formatINR(vv.price) : "Not made"}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 text-[15px] italic text-(--a-ink-2)">{v ? v.note : `Made in ${WOOD_NAMES[other].common.toLowerCase()} only.`}</p>

        <dl className="mt-4 border-t border-(--a-line)">
          {f.details.map((d) => (
            <div key={d.label} className="flex justify-between gap-4 border-b border-(--a-line) py-1.5 text-[14px]">
              <dt className="text-(--a-muted)">{d.label}</dt>
              <dd className="text-right">{d.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {v ? (
            <button type="button" onClick={add} className={`${s.btn} ${s.btnInk} h-12 min-w-[180px] px-6 text-[15px] font-medium`} aria-live="polite">
              {added ? "Added to your bag" : `Add to bag, ${formatINR(v.price)}`}
            </button>
          ) : (
            <button type="button" onClick={() => switchWood(other)} className={`${s.btn} ${s.btnInk} h-12 px-6 text-[15px] font-medium`}>
              Switch to {WOOD_NAMES[other].common.toLowerCase()}
            </button>
          )}
          <Link href={`/d/08/p/${f.slug}`} className={`${s.link} text-[15px]`}>
            Open the full page
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Beside the card, in the canvas, with a dashed tie between them and a wash over the rest of the board. */
export function DetailInWorld({ slug }: { slug: string }) {
  const r = detailRect(slug);
  const c = CARD_POS[slug];
  const ch = cardH(c.w);
  const right = r.x > c.x;
  const x1 = right ? c.x + c.w : c.x;
  const y1 = c.y + ch / 2;
  const x2 = right ? r.x : r.x + r.w;
  const y2 = r.y + 120;
  return (
    <>
      <svg className="pointer-events-none absolute left-0 top-0 z-[45] overflow-visible" width="1" height="1" aria-hidden>
        <path
          d={`M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`}
          fill="none"
          stroke="var(--m-accent)"
          strokeWidth="3"
          strokeDasharray="10 9"
        />
        <circle cx={x1} cy={y1} r="7" fill="var(--m-accent)" />
        <circle cx={x2} cy={y2} r="7" fill="var(--a-card)" stroke="var(--m-accent)" strokeWidth="3" />
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
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            atlas.closeProduct();
          }
        }}
      >
        <button
          type="button"
          onClick={() => atlas.closeProduct()}
          className={`${s.btn} ${s.btnLine} absolute right-4 top-4 z-10 h-9 px-3.5 text-[13px]`}
        >
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
          className="absolute inset-0 z-30 cursor-zoom-out bg-[rgb(245_244_239/0.72)]"
        />
      )}
    </AnimatePresence>
  );
}

/** On narrow screens the detail rises as a sheet instead. */
export function DetailSheet({ slug }: { slug: string | null }) {
  return (
    <AnimatePresence>
      {slug && (
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
            className="fixed inset-0 z-[130] bg-[rgb(31_29_26/0.25)]"
          />
          <motion.div
            key={slug}
            role="dialog"
            aria-modal="true"
            aria-labelledby="a8-detail-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            onKeyDown={(e) => e.key === "Escape" && atlas.closeProduct()}
            className="fixed inset-x-0 bottom-0 z-[140] max-h-[86svh] overflow-y-auto rounded-t-[18px] border-t border-(--a-line) bg-(--a-card) px-5 pb-28 pt-3 shadow-[0_-30px_60px_-30px_rgba(31,29,26,0.5)]"
            data-lenis-prevent
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-(--a-line-2)" aria-hidden />
            <div className="mb-2 flex justify-end">
              <button type="button" onClick={() => atlas.closeProduct()} className={`${s.btn} ${s.btnLine} h-9 px-3.5 text-[13px]`}>
                Close
              </button>
            </div>
            <ProductDetail key={slug} slug={slug} layout="sheet" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
