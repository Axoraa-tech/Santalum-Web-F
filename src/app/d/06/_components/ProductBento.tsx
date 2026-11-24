"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, getFamily, formatINR, WOOD_NAMES } from "@/lib/catalog";
import { switchWood, useWood } from "@/lib/wood";
import { s } from "./cls";
import { CARE, cx, variantFor, WOOD_SHORT } from "./data";
import { bagUI, views } from "./store";
import { addToBag, IconCheck, Swatch } from "./ui";

/** A grid cell whose content fades in after the shared-layout growth (overlay) or simply sits (page). */
export function Fade({
  area,
  on,
  className,
  children,
  delay = 0.14,
}: {
  area: string;
  on: boolean;
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      style={{ gridArea: area }}
      className={className}
      initial={on ? { opacity: 0 } : false}
      animate={{ opacity: 1, transition: { delay: on ? delay : 0, duration: 0.35 } }}
      exit={on ? { opacity: 0, transition: { duration: 0.1 } } : undefined}
    >
      {children}
    </motion.div>
  );
}

/**
 * The product as a bento: gallery, facts, wood choice and add to bag. Used inside the
 * full-screen expansion (mode "overlay") and on /d/06/p/[slug] (mode "page").
 */
export function ProductBento({ slug, mode, from, img = false }: { slug: string; mode: "overlay" | "page"; from?: string; img?: boolean }) {
  const wood = useWood();
  const [shot, setShot] = useState(0);
  const [added, setAdded] = useState(false);
  const family = getFamily(slug);
  if (!family) return null;

  const { variant, wood: shown, made } = variantFor(family, wood);
  const i = Math.min(shot, variant.shots.length - 1);
  const cur = variant.shots[i];
  const overlay = mode === "overlay";
  const r = overlay ? s.r20 : "";
  const cat = CATEGORIES.find((c) => c.key === family.category);
  const names = WOOD_NAMES[shown];

  const add = () => {
    addToBag(family.slug, shown);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2600);
  };
  const openBag = () => {
    if (overlay) views.close();
    bagUI.open();
  };

  return (
    <div className={cx(s.bento, s.prod, overlay && "p-2 sm:p-3")}>
      {/* gallery: the photo that grew out of the tile */}
      <div style={{ gridArea: "gl" }} className={cx(s.tile, s.t2, r, "min-h-[118vw] sm:min-h-0")}>
        <motion.div
          layoutId={from ? `${from}-img` : undefined}
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: overlay ? 20 : 28 }}
          initial={from && !img ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={`${cur.photo.id}-${i}-${shown}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Photo p={cur.photo} tone={cur.tone} priority sizes="(min-width:1024px) 58vw, 100vw" />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {family.edition && (
          <Fade area="unset" on={overlay} className="absolute left-3 top-3 z-[1]">
            <span className={cx(s.mono, "block rounded-full bg-white px-3 py-1.5 text-[11px]")}>{family.edition}</span>
          </Fade>
        )}
      </div>

      {/* thumbnails */}
      <Fade area="th" on={overlay} className={cx(s.tile, r, "flex items-center gap-2 overflow-x-auto p-2")}>
        {variant.shots.map((sh, j) => (
          <button
            key={`${sh.photo.id}-${j}`}
            type="button"
            onClick={() => setShot(j)}
            aria-pressed={j === i}
            aria-label={`Photo ${j + 1} of ${variant.shots.length}: ${sh.photo.alt}`}
            className={cx(
              "relative h-[72px] w-[96px] shrink-0 overflow-hidden rounded-[14px] outline-offset-2 transition-[opacity,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.97]",
              j === i ? "shadow-[0_0_0_2px_#141414]" : "opacity-60 hover:opacity-100",
            )}
          >
            <Photo p={sh.photo} tone={sh.tone} sizes="96px" />
          </button>
        ))}
        <p className={cx(s.mono, s.muted, "ml-auto shrink-0 pl-3 pr-3 text-[11px]")}>
          {i + 1} of {variant.shots.length}
        </p>
      </Fade>

      {/* the essentials */}
      <Fade area="in" on={overlay} delay={0.1} className={cx(s.tile, r, "flex flex-col p-5 sm:p-7")}>
        <div className="flex flex-wrap gap-1.5 pr-12">
          <span className={cx(s.mono, "rounded-full bg-[#f6f4f0] px-3 py-1.5 text-[10.5px]")}>{cat?.label}</span>
          <span className={cx(s.mono, "rounded-full bg-[#f6f4f0] px-3 py-1.5 text-[10.5px]")}>{family.level}</span>
          {family.edition && <span className={cx(s.mono, "rounded-full bg-accent-soft px-3 py-1.5 text-[10.5px]")}>{family.edition}</span>}
        </div>
        {overlay ? (
          <h2 className={cx(s.display, "mt-6 text-[clamp(38px,8.5cqw,72px)]")}>{family.name}</h2>
        ) : (
          <h1 className={cx(s.display, "mt-6 text-[clamp(38px,8.5cqw,72px)]")}>{family.name}</h1>
        )}
        <p className={cx(s.monoWide, "mt-5 text-[24px] leading-none")}>{formatINR(variant.price)}</p>
        <p className={cx(s.muted, "mt-1.5 text-[13px]")}>{made ? `In ${WOOD_SHORT[shown].toLowerCase()}` : `Made only in ${WOOD_SHORT[shown].toLowerCase()}`}</p>
        <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.5]">{family.summary}</p>
        <p className={cx(s.muted, "mt-2 max-w-[46ch] text-[15px]")}>{variant.note}</p>

        <div className="mt-auto pt-7">
          <p className="mb-2 text-[13px] text-[#6b6b66]">Wood</p>
          <div role="radiogroup" aria-label="Wood" className="grid grid-cols-2 gap-2">
            {(["red", "white"] as const).map((w) => {
              const v = family.variants[w];
              const on = shown === w;
              return (
                <button
                  key={w}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!v}
                  onClick={() => v && wood !== w && switchWood(w)}
                  className={cx(
                    "flex min-w-0 items-center gap-3 rounded-[18px] p-3 text-left transition-[background-color,box-shadow,transform] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98]",
                    on ? "bg-[#141414] text-white" : "bg-[#f6f4f0] hover:shadow-[inset_0_0_0_1px_rgba(20,20,20,0.18)]",
                    !v && "cursor-not-allowed opacity-50 hover:shadow-none active:scale-100",
                  )}
                >
                  <Swatch wood={w} size={24} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">{WOOD_SHORT[w]}</span>
                    <span className={cx(s.mono, "block truncate text-[10.5px] opacity-70")}>{v ? formatINR(v.price) : "Not made in this wood"}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {made ? (
              <button type="button" className={cx(s.btn, s.btnLg, "min-w-[220px] flex-1")} onClick={add} aria-live="polite">
                {added ? (
                  <>
                    <IconCheck /> Added to bag
                  </>
                ) : (
                  <>Add to bag, {formatINR(variant.price)}</>
                )}
              </button>
            ) : (
              <button type="button" className={cx(s.btn, s.btnLg, "min-w-[220px] flex-1")} onClick={() => switchWood(shown)}>
                Switch to {WOOD_SHORT[shown].toLowerCase()}
              </button>
            )}
            {added && (
              <button type="button" className={cx(s.ghost, s.btnLg)} onClick={openBag}>
                View bag
              </button>
            )}
          </div>
          {overlay && (
            <Link
              href={`/d/06/p/${family.slug}`}
              onClick={() => views.close()}
              className="mt-4 inline-block rounded text-[14px] text-[#6b6b66] underline decoration-black/20 underline-offset-4 transition-colors hover:text-[#141414] hover:decoration-[#141414] focus-visible:outline-2 focus-visible:outline-accent"
            >
              Open the full page for this piece
            </Link>
          )}
        </div>
      </Fade>

      {/* story */}
      <Fade area="st" on={overlay} delay={0.18} className={cx(s.tile, r, "p-6 sm:p-7")}>
        <h3 className="text-[20px] font-medium tracking-[-0.025em]">How it is made</h3>
        <div className="mt-3 space-y-3 text-[16px] leading-[1.55] text-[#2b2b29]">
          {family.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Fade>

      {/* details */}
      <Fade area="dt" on={overlay} delay={0.2} className={cx(s.tile, s.t2, r, "p-6 sm:p-7")}>
        <h3 className="text-[20px] font-medium tracking-[-0.025em]">Details</h3>
        <dl className="mt-3 divide-y divide-black/[0.07]">
          {family.details.map((d) => (
            <div key={d.label} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 py-2.5">
              <dt className={cx(s.mono, s.muted, "text-[11px] leading-[20px]")}>{d.label}</dt>
              <dd className="text-[14px] leading-[20px]">{d.value}</dd>
            </div>
          ))}
        </dl>
      </Fade>

      {/* care */}
      <Fade area="cr" on={overlay} delay={0.22} className={cx(s.tile, r, "p-6")}>
        <h3 className="text-[18px] font-medium tracking-[-0.02em]">Care</h3>
        <ul className="mt-2 space-y-2 text-[14px] leading-[1.5] text-[#2b2b29]">
          {CARE[family.category].map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Fade>

      {/* the wood */}
      <Fade area="wd" on={overlay} delay={0.24} className={cx(s.tile, s.tint, r, "flex flex-col gap-3 p-6")}>
        <div className="flex items-center gap-3">
          <Swatch wood={shown} size={28} />
          <div className="min-w-0">
            <p className="truncate text-[17px] font-medium leading-tight">{names.common}</p>
            <p className={cx(s.mono, "truncate text-[10.5px] opacity-70")}>{names.latin}</p>
          </div>
        </div>
        <p className="text-[14px] leading-[1.5]">
          {names.sa}. From {names.origin === "Southern India" ? "southern India" : `the ${names.origin}`}.
        </p>
      </Fade>
    </div>
  );
}
