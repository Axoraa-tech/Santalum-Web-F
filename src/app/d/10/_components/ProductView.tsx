"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, formatINR, getFamily, WOOD_NAMES, type Shot } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { bag } from "@/lib/cart";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import k from "../k";
import { announceAdded, EASE, fitSize, onFonts, splitName, unsplash } from "./lib";

/** Placeholder photos not to show in the product gallery. */
const HIDDEN = new Set<string>();

/**
 * One product, set as type: the name stretches open letter by letter to the full width,
 * the main photograph sits in an arch, the initial letter carries the grain, specs are in mono.
 * Used by the full-screen takeover on the home page and by /d/10/p/[slug].
 */
export function ProductView({ slug, mode, titleId }: { slug: string; mode: "overlay" | "page"; titleId?: string }) {
  const wood = useWood();
  const f = getFamily(slug);
  const boxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const head = f ? splitName(f.name).head : "";

  useEffect(() => {
    const box = boxRef.current;
    const title = titleRef.current;
    if (!box || !title || !head) return;
    const fit = () => {
      const max = Math.max(72, window.innerHeight * 0.36);
      title.style.fontSize = `${Math.min(max, fitSize(head, box.clientWidth, 150, 820))}px`;
    };
    const off = onFonts(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => {
      off();
      ro.disconnect();
    };
  }, [head]);

  if (!f) return null;
  const { tail } = splitName(f.name);
  const other: Wood = wood === "red" ? "white" : "red";
  const own = f.variants[wood];
  const shownWood: Wood = own ? wood : other;
  const v = (own ?? f.variants[other])!;
  const cat = CATEGORIES.find((c) => c.key === f.category);
  const add = () => {
    bag.add(f.slug, wood);
    announceAdded(head, wood);
  };

  return (
    <article className="pb-16 md:pb-24">
      <header className={k.gut}>
        <div className={`${k.mono} flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[var(--k-grey)]`}>
          <span>{cat?.label}</span>
          <span>{tail || cat?.line}</span>
          <span>{f.edition ?? `${f.level} piece`}</span>
        </div>
        <div ref={boxRef} className="mt-4 md:mt-6">
          <h1 id={titleId} className="sr-only">
            {f.name}
          </h1>
          <p ref={titleRef} aria-hidden className={`${k.disp} w-max text-[13vw] leading-[0.8]`} key={head}>
            {head.split("").map((c, i) => (
              <span key={i} className={k.titleL} style={{ animationDelay: `${120 + i * 38}ms` }}>
                {c === " " ? " " : c}
              </span>
            ))}
          </p>
        </div>
      </header>

      <div className={`${k.gut} mt-8 grid grid-cols-1 gap-10 md:mt-12 md:grid-cols-12 md:gap-8`}>
        <Gallery key={`${f.slug}-${shownWood}`} shots={v.shots.filter((x) => !HIDDEN.has(x.photo.id))} initial={head.charAt(0)} grain={shownWood === "red" ? PHOTOS.redGrain.id : PHOTOS.whiteLog.id} />

        <div className="md:col-span-5 md:pl-4 lg:pl-10">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--k-ink)] pb-4">
            <p className={`${k.disp} text-[length:clamp(52px,6vw,96px)] tabular-nums [font-variation-settings:'wdth'_62,'wght'_820]`}>
              {formatINR(v.price)}
            </p>
            <p className={`${k.mono} pb-1 text-right text-[var(--k-grey)]`}>
              {WOOD_NAMES[shownWood].common}
              <br />
              <i>{WOOD_NAMES[shownWood].latin}</i>
            </p>
          </div>
          <p className={`${k.monoL} mt-4`}>{v.note}</p>

          <div className="mt-8">
            <p className={`${k.mono} text-[var(--k-grey)]`}>Wood</p>
            <div className="mt-2 flex items-end gap-6">
              {(["red", "white"] as const).map((w) => {
                const has = f.variants[w];
                return (
                  <button
                    key={w}
                    type="button"
                    disabled={!has}
                    aria-pressed={wood === w}
                    onClick={() => {
                      if (wood !== w) switchWood(w);
                    }}
                    className={`${k.pwoodBtn} text-left`}
                  >
                    <span className={`${k.pwood} block text-[length:clamp(48px,5.4vw,84px)]`}>{w === "red" ? "Red" : "White"}</span>
                    <span className={`${k.mono} mt-1 block text-[var(--k-grey)]`}>{has ? formatINR(has.price) : "Not made in this wood"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            {own ? (
              <button type="button" onClick={add} className={`${k.btn} w-full`}>
                <span className={k.btnLabel}>Add to bag</span>
                <span className={`${k.mono} opacity-70`}>{formatINR(own.price)}</span>
              </button>
            ) : (
              <div className="space-y-3">
                <p className={k.monoL}>
                  The {head.toLowerCase()} is made in {other} sandalwood only. {f.slug === "heartwood-oil" ? "Red sandalwood does not carry this oil." : ""}
                </p>
                <button type="button" onClick={() => switchWood(other)} className={`${k.btn} w-full`}>
                  <span className={k.btnLabel}>Switch to {other} sandalwood</span>
                </button>
              </div>
            )}
            <p className={`${k.mono} mt-3 text-[var(--k-grey)]`}>Complimentary delivery across India, dispatched within 3 to 5 working days.</p>
          </div>

          <p className={`${k.disp} mt-10 whitespace-normal text-[length:clamp(22px,2vw,30px)] leading-[1.08] [font-variation-settings:'wdth'_88,'wght'_520]`}>
            {f.summary}
          </p>
          <div className="mt-5 space-y-3 text-[17px] leading-[1.55]">
            {f.story.map((s) => (
              <p key={s}>{s}</p>
            ))}
          </div>

          <dl className="mt-8">
            <Spec label="Material">
              Heartwood of <i>{WOOD_NAMES[shownWood].latin}</i>
            </Spec>
            {f.details.map((d) => (
              <Spec key={d.label} label={d.label}>
                {d.value}
              </Spec>
            ))}
            <Spec label="Origin">{WOOD_NAMES[shownWood].origin}</Spec>
            <Spec label="Care">Keep dry and out of direct sun. Wipe with a soft cloth; a drop of natural oil once a season. It changes with handling; that is intended.</Spec>
            <Spec label="Returns">Unused pieces within 14 days, in their original packaging. Numbered editions are final.</Spec>
          </dl>

          {mode === "overlay" && (
            <Link href={`/d/10/p/${f.slug}`} className={`${k.btn} ${k.ghost} mt-8 w-full`}>
              <span className={k.btnLabel}>Open the full page</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function Spec({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-4 border-t border-[var(--k-line)] py-2.5">
      <dt className={`${k.mono} text-[var(--k-grey)]`}>{label}</dt>
      <dd className={k.monoL}>{children}</dd>
    </div>
  );
}

function Gallery({ shots, initial, grain }: { shots: Shot[]; initial: string; grain: string }) {
  const [i, setI] = useState(0);
  const cur = shots[i] ?? shots[0];
  const maskStyle = { backgroundImage: `url(${unsplash(grain, 1000)})` } as CSSProperties;
  return (
    <div className="grid grid-cols-12 gap-4 self-start md:sticky md:top-20 md:col-span-7 md:gap-6">
      <div className="relative col-span-12 aspect-[4/5] overflow-hidden rounded-b-[32px] rounded-t-[999px] bg-[var(--k-stone)] sm:col-span-8">
        <AnimatePresence initial={false}>
          <motion.div
            key={i}
            initial={{ clipPath: "inset(100% 0% 0% 0%)", zIndex: 1 }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", zIndex: 1 }}
            exit={{ zIndex: 0, opacity: 0.99, transition: { duration: 0.8 } }}
            transition={{ duration: 0.8, ease: EASE }}
            className="absolute inset-0"
          >
            <Photo p={cur.photo} tone={cur.tone} sizes="(min-width: 768px) 40vw, 100vw" priority />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="col-span-12 flex flex-row items-end justify-between gap-4 sm:col-span-4 sm:flex-col sm:items-start sm:justify-start sm:gap-8">
        <p aria-hidden className={`${k.letterMask} text-[34vw] sm:text-[24vw] md:text-[17vw] lg:text-[15vw]`} style={maskStyle}>
          {initial}
        </p>
        <div className="flex flex-wrap gap-3 sm:flex-col sm:items-start">
          {shots.map((s, j) => (
            <button
              key={j}
              type="button"
              onClick={() => setI(j)}
              aria-pressed={i === j}
              aria-label={`Show photograph ${j + 1} of ${shots.length}: ${s.photo.alt}`}
              className={`relative size-[72px] overflow-hidden rounded-full outline-offset-4 transition-[transform,box-shadow] duration-500 hover:scale-105 active:scale-95 md:size-[88px] ${i === j ? "shadow-[0_0_0_2px_var(--k-bg),0_0_0_3.5px_var(--k-ink)]" : ""}`}
            >
              <Photo p={s.photo} tone={s.tone} sizes="88px" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
