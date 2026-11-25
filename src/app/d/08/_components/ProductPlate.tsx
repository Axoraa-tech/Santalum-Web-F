"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, formatINR, getProduct, priceLabel, priceOf, productsFor } from "@/lib/shop/products";
import { setWoodQuietly } from "@/lib/wood";
import { cardRect } from "../_lib/board";
import { NOTES } from "../_lib/copy";
import { atlas } from "../_lib/engine";
import { addToBag } from "../_lib/ui";
import { setMode } from "../_lib/view";
import { PinGlyph, WOOD_HEX } from "./Pins";
import { OptionPicker, QtyStepper, Stamp, Stars, WishButton, badgeTone } from "./ProductBits";
import { Reviews } from "./Reviews";
import { useReviews } from "@/lib/shop/reviews";
import { EditionTokens } from "./Shared";
import { WOOD_CLASS, s } from "./styles";

/* The plate is drawn in a 1000 × 860 space; callouts sit in the margins, leader lines run onto the photo. */
const PW = 1000;
const PH = 860;
const PHOTO = { x: 270, y: 40, w: 460, h: 575 };
const SPOTS: { at: [number, number]; box: { x: number; y: number }; side: "l" | "r" }[] = [
  { at: [430, 250], box: { x: 0, y: 110 }, side: "l" },
  { at: [590, 300], box: { x: 780, y: 170 }, side: "r" },
  { at: [455, 450], box: { x: 0, y: 420 }, side: "l" },
  { at: [570, 500], box: { x: 780, y: 480 }, side: "r" },
];
const BOX_W = 220;

export function ProductPlate({ slug }: { slug: string }) {
  const p = getProduct(slug)!;
  const c = CONTENT[p.wood];
  const router = useRouter();
  const [shot, setShot] = useState(0);
  const [option, setOption] = useState(p.options?.values[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const cur = p.shots[Math.min(shot, p.shots.length - 1)];
  const price = priceOf(p, option);
  const notes = [...p.details.slice(0, 3), { label: "Wood", value: `${c.name}, ${c.latin}` }];
  const pairs = productsFor(p.wood)
    .filter((x) => x.slug !== p.slug)
    .sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category) || Number(!!b.featured) - Number(!!a.featured))
    .slice(0, 3);
  const twin = p.counterpart ? getProduct(p.counterpart) : undefined;
  const onBoard = !!cardRect(p.slug);
  const { summary } = useReviews(p.slug);

  // The page belongs to its product's wood.
  useEffect(() => {
    setWoodQuietly(p.wood);
  }, [p.wood]);

  const add = () => {
    addToBag(p.slug, { option, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };
  const back = () => {
    if (onBoard) atlas.pending = p.slug;
    setMode("canvas");
    router.push("/d/08");
  };

  const thumbs = (size: string) => (
    <div className="flex gap-2" role="group" aria-label="Photos">
      {p.shots.map((sh, i) => (
        <button
          key={`${sh.photo.id}-${i}`}
          type="button"
          aria-label={`Photo ${i + 1} of ${p.shots.length}`}
          aria-pressed={i === shot}
          onClick={() => setShot(i)}
          className={`relative ${size} overflow-hidden border-2 transition-transform duration-300 hover:-translate-y-0.5 ${i === shot ? "border-(--a-ink)" : "border-transparent opacity-75 hover:opacity-100"}`}
        >
          <Photo p={sh.photo} tone={sh.tone} sizes="128px" />
        </button>
      ))}
    </div>
  );

  return (
    <main className={`${s.paper} ${WOOD_CLASS[p.wood]} min-h-svh pt-24 md:pt-28`}>
      <div className="mx-auto w-full max-w-[1320px] px-4 md:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-(--a-ink-2)">
          <Link href="/d/08/shop" className={s.link}>
            {c.name} shop
          </Link>
          <span aria-hidden className="text-(--a-muted)">
            /
          </span>
          <Link href={`/d/08/shop?c=${p.category}`} className={s.link}>
            {categoryOf(p).label}
          </Link>
          <span aria-hidden className="hidden text-(--a-muted) sm:inline">
            /
          </span>
          <span className="hidden text-(--a-ink) sm:inline" aria-current="page">
            {p.name}
          </span>
        </nav>

        <div className="mt-5 grid gap-6 md:mt-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-14">
          {/* the plate stays in view while the notes beside it are read */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* wide screens: the annotated plate */}
            <div className="relative hidden lg:block" style={{ aspectRatio: `${PW} / ${PH}` }}>
              <div
                className="absolute overflow-hidden bg-(--a-paper-2) shadow-[0_40px_80px_-50px_rgba(31,29,26,0.7)] outline outline-[10px] outline-(--a-card)"
                style={{ left: `${(PHOTO.x / PW) * 100}%`, top: `${(PHOTO.y / PH) * 100}%`, width: `${(PHOTO.w / PW) * 100}%`, height: `${(PHOTO.h / PH) * 100}%` }}
              >
                <AnimatePresence initial={false}>
                  <motion.div key={shot} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                    <Photo p={cur.photo} tone={cur.tone} sizes="(min-width: 1024px) 560px, 1px" priority />
                  </motion.div>
                </AnimatePresence>
              </div>
              <svg viewBox={`0 0 ${PW} ${PH}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                {notes.map((_, i) => {
                  const sp = SPOTS[i];
                  const ax = sp.side === "l" ? sp.box.x + BOX_W + 12 : sp.box.x - 12;
                  const ay = sp.box.y + 14;
                  const kx = sp.side === "l" ? ax + 30 : ax - 30;
                  return (
                    <g key={i}>
                      <path d={`M${sp.at[0]} ${sp.at[1]} L${kx} ${ay} L${ax} ${ay}`} fill="none" stroke="var(--a-ink)" strokeWidth="1.2" strokeOpacity="0.8" />
                      <circle cx={sp.at[0]} cy={sp.at[1]} r="7" fill="var(--a-card)" stroke="var(--a-ink)" strokeWidth="1.6" />
                      <circle cx={sp.at[0]} cy={sp.at[1]} r="2.4" fill="var(--a-ink)" />
                    </g>
                  );
                })}
              </svg>
              {notes.map((d, i) => {
                const sp = SPOTS[i];
                return (
                  <div key={d.label} className={`absolute ${sp.side === "l" ? "text-right" : ""}`} style={{ left: `${(sp.box.x / PW) * 100}%`, top: `${(sp.box.y / PH) * 100}%`, width: `${(BOX_W / PW) * 100}%` }}>
                    <p className="text-[13px] text-(--a-muted)">{d.label}</p>
                    <p className={`${s.serif} mt-0.5 text-[17px] leading-snug`}>{d.value}</p>
                  </div>
                );
              })}
              <div className="absolute" style={{ left: `${(PHOTO.x / PW) * 100}%`, top: `${((PHOTO.y + PHOTO.h + 40) / PH) * 100}%` }}>
                {thumbs("size-16")}
              </div>
            </div>
            {/* phones and tablets */}
            <div className="lg:hidden">
              <div className="relative aspect-[5/4] overflow-hidden bg-(--a-paper-2) sm:aspect-[4/5]">
                <Photo p={cur.photo} tone={cur.tone} sizes="(max-width: 1023px) 100vw, 1px" priority />
              </div>
              <div className="mt-2.5">{thumbs("size-12 sm:size-14")}</div>
            </div>
          </div>

          <div>
            <p className="flex flex-wrap items-center gap-2 text-[14px] text-(--a-muted)">
              <PinGlyph color={WOOD_HEX[p.wood]} className="h-5 w-4" />
              {c.name}, <i>{c.latin}</i>
              {p.badge && <Stamp tone={badgeTone(p.badge)}>{p.badge}</Stamp>}
            </p>
            <h1 className={`${s.serif} mt-3 text-balance text-[clamp(2.3rem,4.4vw,3.6rem)] leading-[0.98] tracking-[-0.02em]`}>{p.name}</h1>
            {summary.count > 0 && (
              <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-[15px] text-(--a-ink-2) hover:text-(--a-ink)">
                <Stars value={summary.avg} />
                <span className="tabular-nums">{summary.avg.toFixed(1)}</span>
                <span className={s.link}>
                  {summary.count} {summary.count === 1 ? "review" : "reviews"}
                </span>
              </a>
            )}
            <p className="mt-3 text-[22px] font-semibold tabular-nums" aria-live="polite">
              {p.options ? formatINR(price) : priceLabel(p)}
            </p>
            <p className="mt-3 text-[17px] leading-relaxed text-(--a-ink-2) max-lg:hidden">{p.short}</p>
            {p.edition && (
              <div className="mt-4 border border-(--a-accent) bg-(--a-card) p-3">
                <p className="text-[15px] font-semibold text-(--a-accent-deep)">
                  {p.edition.left} of {p.edition.size} remain in this edition
                </p>
                <EditionTokens size={p.edition.size} left={p.edition.left} className="mt-2" />
              </div>
            )}
            {p.options && (
              <div className="mt-5">
                <OptionPicker product={p} value={option} onChange={setOption} name={`opt-${p.slug}`} />
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, Math.min(9, n)))} label={p.name} />
              <button type="button" onClick={add} aria-live="polite" className={`${s.btn} ${s.btnInk} min-h-12 flex-1 px-6 text-[16px] font-medium`}>
                {added ? "Added to your bag" : `Add to bag, ${formatINR(price * qty)}`}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <WishButton slug={p.slug} name={p.name} withLabel />
            </div>
            {/* phones: the buy box comes first, then the plate's notes */}
            <p className="mt-5 text-[17px] leading-relaxed text-(--a-ink-2) lg:hidden">{p.short}</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:hidden">
              {notes.map((d) => (
                <div key={d.label} className="border-l-2 border-(--a-accent) pl-3">
                  <dt className="text-[13px] text-(--a-muted)">{d.label}</dt>
                  <dd className={`${s.serif} text-[17px] leading-snug`}>{d.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex items-start gap-2 text-[15px] text-(--a-ink-2)">
              <span className={`${s.hroute} mt-2.5 h-[3px] w-6 shrink-0`} aria-hidden />
              {NOTES.delivery}
            </p>

            <div className="mt-8 space-y-3 border-t border-(--a-line-2) pt-6 text-[16px] leading-relaxed text-(--a-ink-2)">
              {p.story.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
            <dl className="mt-6 border-t border-(--a-line-2)">
              {p.details.map((d) => (
                <div key={d.label} className="flex justify-between gap-4 border-b border-(--a-line) py-2 text-[15px]">
                  <dt className="text-(--a-muted)">{d.label}</dt>
                  <dd className="text-right">{d.value}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-b border-(--a-line) py-2 text-[15px]">
                <dt className="text-(--a-muted)">Origin</dt>
                <dd className="text-right">{c.origin.region}</dd>
              </div>
            </dl>
            <div className="mt-6 border-l-2 border-(--a-accent) pl-4">
              <p className="text-[14px] text-(--a-muted)">Care</p>
              <p className="mt-1 text-[16px] leading-relaxed">{p.care}</p>
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-(--a-ink-2)">
              {p.wood === "red"
                ? "Leaves with its batch record: species, lot, origin, the hands that finished it and the date."
                : "Carries its lot on the label: where the wood came from, when it was distilled or carved, and the test report for oils."}
            </p>
            {twin && (
              <p className="mt-5 flex items-center gap-2 border-t border-dashed border-(--a-line-2) pt-4 text-[15px]">
                <PinGlyph color={WOOD_HEX[twin.wood]} filled={false} className="h-5 w-4 shrink-0" />
                <span>
                  Also in {CONTENT[twin.wood].name.toLowerCase()}:{" "}
                  <Link href={`/d/08/p/${twin.slug}`} className={s.link}>
                    {twin.name}
                  </Link>
                </span>
              </p>
            )}
          </div>
        </div>

        <section aria-labelledby="a8p-pairs" className="mt-24 border-t border-(--a-ink) pt-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="a8p-pairs" className={`${s.serif} text-[clamp(1.8rem,3.4vw,2.8rem)] leading-none`}>
              Pairs with
            </h2>
            <button type="button" onClick={back} className={`${s.link} text-[15px]`}>
              {onBoard ? "Show this piece on the board" : "Back to the board"}
            </button>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-8">
            {pairs.map((n, i) => (
              <li key={n.slug} className={i === 1 ? "sm:mt-10" : ""}>
                <Link href={`/d/08/p/${n.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-(--a-paper-2)">
                    <Photo p={n.shots[0].photo} tone={n.shots[0].tone} sizes="(min-width: 768px) 360px, 45vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
                  </div>
                  <p className={`${s.serif} mt-2 text-[18px] leading-tight decoration-(--a-accent) underline-offset-4 group-hover:underline`}>{n.name}</p>
                  <p className="mt-0.5 text-[15px] tabular-nums text-(--a-muted)">{priceLabel(n)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <Reviews slug={p.slug} name={p.name} />
      </div>
    </main>
  );
}
