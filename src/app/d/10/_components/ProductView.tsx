"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { bag, DELIVERY } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { useReviews } from "@/lib/shop/reviews";
import { categoryOf, formatINR, getOption, getProduct, priceOf, type Shot } from "@/lib/shop/products";
import { PHOTOS } from "@/lib/photos";
import { setWoodQuietly, useWood, type Wood } from "@/lib/wood";
import k from "../k";
import { EditionTicks, editionLine, Stars, Wish } from "./bits";
import { announceAdded, closeTakeover, EASE, fitLetters, fv, measure, onFonts, splitName, swapTakeover, unsplash, wdthFor } from "./lib";

const RECORD: Record<Wood, string> = {
  red: "Leaves with its batch record: species, lot, where it grew, who finished it and when. Red sandalwood is CITES Appendix II; we keep the papers for every lot.",
  white: "Carries its lot on the label: where the wood grew, when it was distilled or carved, and for oils the batch test report.",
};

/**
 * One product, set as type: the name stretches open letter by letter to the full width,
 * the main photograph sits in an arch, the initial letter carries the grain, specs are in mono.
 * Used by the full-screen takeover on the home page and by /d/10/p/[slug].
 * The piece belongs to one wood: on its own page the site follows that wood, and flipping the toggle
 * goes to the same piece in the other wood (or to the shop when there is none).
 */
export function ProductView({ slug, mode, titleId }: { slug: string; mode: "overlay" | "page"; titleId?: string }) {
  const p = getProduct(slug);
  const router = useRouter();
  const wood = useWood();
  const boxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const head = p ? splitName(p.name).head : "";
  const [opt, setOpt] = useState<string | undefined>(p?.options?.values[0].id);
  const [qty, setQty] = useState(1);
  const { summary } = useReviews(slug);

  // the page belongs to its product's wood: set before paint, so a piece never shows in the other wood's colours
  useLayoutEffect(() => {
    if (p && mode === "page") setWoodQuietly(p.wood);
  }, [p, mode]);

  // a flip of the toggle while looking at a piece: follow it into the other wood
  const prevWood = useRef<Wood | null>(null);
  useEffect(() => {
    const was = prevWood.current;
    prevWood.current = wood;
    if (!p || was !== p.wood || wood === p.wood) return;
    if (mode === "page") router.push(p.counterpart ? `/d/10/p/${p.counterpart}` : "/d/10/shop");
    else if (p.counterpart) swapTakeover(p.counterpart);
    else closeTakeover();
  }, [wood, p, mode, router]);

  useEffect(() => {
    const box = boxRef.current;
    const title = titleRef.current;
    if (!box || !title || !head) return;
    const fit = () => {
      const max = Math.max(72, window.innerHeight * 0.36);
      title.style.fontSize = `${Math.min(max, fitLetters(head, box.clientWidth * 0.99, 150, 820))}px`;
    };
    const off = onFonts(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => {
      off();
      ro.disconnect();
    };
  }, [head]);

  if (!p) return null;
  const { tail } = splitName(p.name);
  const c = CONTENT[p.wood];
  const cat = categoryOf(p);
  const ov = getOption(p, opt);
  const unit = priceOf(p, opt);
  const add = () => {
    bag.add(p.slug, { option: ov?.id, qty });
    announceAdded(`${head}${ov ? `, ${ov.label}` : ""}${qty > 1 ? ` × ${qty}` : ""}`, p.wood);
  };

  return (
    <article className="pb-16 md:pb-24">
      <header className={k.gut}>
        <div className={`${k.mono} flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[var(--k10-grey)]`}>
          <Link href={`/d/10/shop?c=${cat.id}`} className={k.link}>
            {cat.label}
          </Link>
          <span>{tail || p.short}</span>
          <span className={p.badge ? "text-[var(--k10-accent)]" : ""}>{editionLine(p) || p.badge || c.name}</span>
        </div>
        <div ref={boxRef} className="mt-4 md:mt-6">
          <h1 id={titleId} className="sr-only">
            {p.name}, {c.name.toLowerCase()}
          </h1>
          <p ref={titleRef} aria-hidden className={`${k.disp} w-max text-[13vw] leading-[0.8]`} key={head}>
            {head.split("").map((ch, i) => (
              <span key={i} className={k.titleL} style={{ animationDelay: `${120 + i * 38}ms` }}>
                {ch === " " ? " " : ch}
              </span>
            ))}
          </p>
        </div>
      </header>

      <div className={`${k.gut} mt-8 grid grid-cols-1 gap-10 md:mt-12 md:grid-cols-12 md:gap-8`}>
        <Gallery key={p.slug} shots={p.shots} initial={head.charAt(0)} grain={p.wood === "red" ? PHOTOS.redGrain.id : PHOTOS.whiteLog.id} />

        <div className="min-w-0 md:col-span-5 md:pl-4 lg:pl-10">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--k10-ink)] pb-4">
            <p aria-live="polite" className={`${k.disp} text-[length:clamp(52px,6vw,96px)] tabular-nums [font-variation-settings:'wdth'_62,'wght'_820]`}>
              {formatINR(unit)}
            </p>
            <p className={`${k.mono} pb-1 text-right text-[var(--k10-grey)]`}>
              {c.name}
              <br />
              <i>{c.latin}</i>
            </p>
          </div>
          {summary.count > 0 && (
            <a href={mode === "page" ? "#reviews" : `/d/10/p/${p.slug}#reviews`} className={`${k.mono} ${k.link} mt-4 inline-flex items-center gap-2`}>
              <Stars value={summary.avg} size={16} />
              <span className="tabular-nums">{summary.avg.toFixed(1)}</span>
              <span className="text-[var(--k10-grey)]">
                {summary.count} {summary.count === 1 ? "review" : "reviews"}
              </span>
            </a>
          )}
          <p className={`${k.disp} mt-5 whitespace-normal text-[length:clamp(22px,2vw,30px)] leading-[1.08] [font-variation-settings:'wdth'_88,'wght'_520]`}>
            {p.short}
          </p>

          {p.options && (
            <fieldset className="mt-8">
              <legend className={`${k.mono} text-[var(--k10-grey)]`}>{p.options.name}</legend>
              <div className="mt-2 border-b border-[var(--k10-line)]">
                {p.options.values.map((v) => (
                  <label key={v.id} className={`${k.opt} grid-cols-[18px_1fr_auto] items-center gap-4 py-2.5`}>
                    <input type="radio" name={`k10-opt-${p.slug}`} value={v.id} checked={ov?.id === v.id} onChange={() => setOpt(v.id)} />
                    <span className={k.optDot} aria-hidden />
                    <span className={`${k.optName} text-[length:clamp(30px,3vw,46px)]`}>{v.label}</span>
                    <span className={`${k.monoL} tabular-nums`}>{formatINR(v.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={`${k.mono} text-[var(--k10-grey)]`} id={`k10-qty-${p.slug}`}>
                Quantity
              </p>
              <div role="group" aria-labelledby={`k10-qty-${p.slug}`} className="mt-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQty((n) => Math.max(1, n - 1))}
                  disabled={qty <= 1}
                  aria-label="One fewer"
                  className="grid size-11 place-items-center rounded-full text-[26px] transition-colors hover:bg-[var(--k10-ink)] hover:text-[var(--k10-bg)] active:scale-95 disabled:opacity-30"
                >
                  −
                </button>
                <span aria-live="polite" className={`${k.disp} w-[1.1em] text-center text-[44px] tabular-nums [font-variation-settings:'wdth'_60,'wght'_800]`}>
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((n) => Math.min(9, n + 1))}
                  disabled={qty >= 9}
                  aria-label="One more"
                  className="grid size-11 place-items-center rounded-full text-[26px] transition-colors hover:bg-[var(--k10-ink)] hover:text-[var(--k10-bg)] active:scale-95 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
            <Wish p={p} className="text-[13px]" />
          </div>

          <div className="mt-5">
            <button type="button" onClick={add} className={`${k.btn} w-full`}>
              <span className={k.btnLabel}>Add to bag</span>
              <span className={`${k.mono} opacity-70`}>{formatINR(unit * qty)}</span>
            </button>
            <p className={`${k.mono} mt-3 text-[var(--k10-grey)]`}>
              Free delivery across India, 3–5 working days. Express {formatINR(DELIVERY.express.price)}.
            </p>
          </div>

          {p.edition && (
            <div className="mt-10 border-t border-[var(--k10-ink)] pt-4">
              <p className={`${k.disp} text-[length:clamp(40px,4.6vw,72px)] leading-[0.85] tabular-nums [font-variation-settings:'wdth'_70,'wght'_840]`}>
                {p.edition.left} of {p.edition.size} left
              </p>
              <p className={`${k.mono} mt-2 text-[var(--k10-grey)]`}>Numbered, and entered in the registry. Filled: placed. Open: still free.</p>
              <div className="mt-3">
                <EditionTicks size={p.edition.size} left={p.edition.left} />
              </div>
            </div>
          )}

          <div className="mt-10 space-y-3 text-[17px] leading-[1.55]">
            {p.story.map((s) => (
              <p key={s}>{s}</p>
            ))}
          </div>

          <dl className="mt-8">
            <Spec label="Material">
              Heartwood of <i>{c.latin}</i>
            </Spec>
            {p.details.map((d) => (
              <Spec key={d.label} label={d.label}>
                {d.value}
              </Spec>
            ))}
            <Spec label="Origin">{c.origin.region}</Spec>
            <Spec label="Care">{p.care}</Spec>
            <Spec label="Record">{RECORD[p.wood]}</Spec>
            <Spec label="Delivery">
              {DELIVERY.standard.label}, free across India. {DELIVERY.express.label}, {formatINR(DELIVERY.express.price)}.
            </Spec>
            <Spec label="Returns">Unused pieces within 14 days, in their original packaging. Numbered editions are final.</Spec>
          </dl>

          {mode === "overlay" && (
            <Link href={`/d/10/p/${p.slug}`} className={`${k.btn} ${k.ghost} mt-8 w-full`}>
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
    <div className="grid grid-cols-[6.5rem_1fr] gap-4 border-t border-[var(--k10-line)] py-2.5">
      <dt className={`${k.mono} text-[var(--k10-grey)]`}>{label}</dt>
      <dd className={k.monoL}>{children}</dd>
    </div>
  );
}

function Gallery({ shots, initial, grain }: { shots: Shot[]; initial: string; grain: string }) {
  const [i, setI] = useState(0);
  const cur = shots[i] ?? shots[0];
  const many = shots.length > 1;
  const maskStyle = { backgroundImage: `url(${unsplash(grain, 1000)})` } as CSSProperties;
  const archRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLParagraphElement>(null);

  // Beside the arch (sm and up) the grain letter runs the arch's full height above the caption: as tall as
  // the column allows, then condensed on the wdth axis until it fits the column's width. No empty band.
  useEffect(() => {
    const arch = archRef.current;
    const col = colRef.current;
    const foot = footRef.current;
    const letter = letterRef.current;
    if (!arch || !col || !foot || !letter || !initial) return;
    const fit = () => {
      if (window.innerWidth < 640) {
        letter.style.fontSize = "";
        letter.style.fontVariationSettings = "";
        return;
      }
      const h = arch.clientHeight - foot.offsetHeight - 32;
      const w = col.clientWidth * 0.98;
      if (h <= 0 || !w) return;
      let size = h / 0.78;
      const wd = wdthFor(initial, w, size, 900);
      const at = measure(initial, wd, 900, size);
      if (at > w) size = (size * w) / at;
      letter.style.fontSize = `${size.toFixed(1)}px`;
      letter.style.fontVariationSettings = fv(wd, 900);
    };
    const off = onFonts(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(arch);
    ro.observe(col);
    ro.observe(foot);
    return () => {
      off();
      ro.disconnect();
    };
  }, [initial]);

  return (
    <div className="grid grid-cols-12 gap-4 self-start md:sticky md:top-20 md:col-span-7 md:gap-6">
      <div ref={archRef} className="relative col-span-12 aspect-[4/5] overflow-hidden rounded-b-[32px] rounded-t-[999px] bg-[var(--k10-stone)] sm:col-span-8">
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
      {/* the grain letter hangs from the top of the arch and fills the column down to the caption, which sits on the arch's baseline */}
      <div ref={colRef} className="col-span-12 flex min-w-0 flex-row items-end justify-between gap-4 sm:col-span-4 sm:flex-col sm:items-start sm:justify-between sm:gap-8">
        <p ref={letterRef} aria-hidden className={`${k.letterMask} text-[34vw] sm:text-[24vw] md:text-[17vw] lg:text-[15vw]`} style={maskStyle}>
          {initial}
        </p>
        <div ref={footRef} className="flex flex-col items-end gap-4 sm:items-start">
          <p className={`${k.mono} max-w-[22ch] text-right text-[var(--k10-grey)] sm:text-left ${many ? "hidden sm:block" : ""}`} aria-live="polite">
            {many && (
              <>
                <span className="tabular-nums text-[var(--k10-ink)]">
                  {String(i + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
                </span>
                <br />
              </>
            )}
            {cur.photo.alt}
          </p>
          {/* one photograph needs no picker */}
          {many && (
            <div className="flex flex-wrap gap-3 sm:flex-col sm:items-start">
              {shots.map((s, j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setI(j)}
                  aria-pressed={i === j}
                  aria-label={`Show photograph ${j + 1} of ${shots.length}: ${s.photo.alt}`}
                  className={`relative size-[72px] overflow-hidden rounded-full outline-offset-4 transition-[transform,box-shadow] duration-500 hover:scale-105 active:scale-95 md:size-[88px] ${i === j ? "shadow-[0_0_0_2px_var(--k10-bg),0_0_0_3.5px_var(--k10-ink)]" : ""}`}
                >
                  <Photo p={s.photo} tone={s.tone} sizes="88px" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
