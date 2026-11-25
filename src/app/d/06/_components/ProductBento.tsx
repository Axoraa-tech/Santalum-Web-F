"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { useWishlist, toggleWishlist } from "@/lib/shop/account";
import { DELIVERY } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, formatINR, getOption, getProduct, priceOf, type Product } from "@/lib/shop/products";
import { useReviews } from "@/lib/shop/reviews";
import { useHydrated } from "@/lib/shop/store";
import { s } from "./cls";
import { cx, GRAIN, shopHref, shotsOf, WOOD_SHORT } from "./data";
import { bagUI, views } from "./store";
import { addToBag, IconCheck, IconHeart, IconMinus, IconOpen, Stars, Swatch } from "./ui";

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

const PROVENANCE: Record<"red" | "white", { title: string; text: string }> = {
  red: {
    title: "Leaves with its batch record",
    text: "The species, the lot, where it came from, who finished it and when. If there is evidence, we show it. If there isn't, we don't invent it.",
  },
  white: {
    title: "The lot is on the label",
    text: "Where the heartwood came from and when it was distilled or carved. Oils carry their batch test report; if there isn't one, the label says so.",
  },
};

/**
 * The product as a bento: gallery, options, quantity, bag and wishlist, then the story, details,
 * care, the wood and the record. Used inside the full-screen expansion (mode "overlay") and on
 * /d/06/p/[slug] (mode "page"). A product belongs to one wood, so everything here follows it.
 */
export function ProductBento({ slug, mode, from, img = false }: { slug: string; mode: "overlay" | "page"; from?: string; img?: boolean }) {
  const p = getProduct(slug);
  if (!p) return null;
  return <Body key={p.slug} p={p} mode={mode} from={from} img={img} />;
}

function Body({ p, mode, from, img }: { p: Product; mode: "overlay" | "page"; from?: string; img: boolean }) {
  const [shot, setShot] = useState(0);
  const [option, setOption] = useState<string | undefined>(p.options?.values[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const hydrated = useHydrated();
  const wishlist = useWishlist();
  const saved = hydrated && wishlist.includes(p.slug);
  const { summary } = useReviews(p.slug);

  const shots = shotsOf(p);
  const i = Math.min(shot, shots.length - 1);
  const cur = shots[i];
  const overlay = mode === "overlay";
  const r = overlay ? s.r20 : "";
  const cat = categoryOf(p);
  const c = CONTENT[p.wood];
  const unit = priceOf(p, option);
  const opt = getOption(p, option);
  const varies = !!p.options && new Set(p.options.values.map((v) => v.price)).size > 1;
  const counterpart = p.counterpart ? getProduct(p.counterpart) : undefined;

  const add = () => {
    addToBag(p.slug, { option, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2600);
  };
  const openBag = () => {
    if (overlay) views.close();
    bagUI.open("bag-top");
  };

  const onOptionKey = (e: KeyboardEvent) => {
    if (!p.options) return;
    const vals = p.options.values;
    const at = vals.findIndex((v) => v.id === option);
    let next = at;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (at + 1) % vals.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (at - 1 + vals.length) % vals.length;
    else return;
    e.preventDefault();
    setOption(vals[next].id);
    const el = (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>("[role=radio]")[next];
    el?.focus();
  };

  const Title = overlay ? "h2" : "h1";

  return (
    <div className={cx(s.bento, s.prod, overlay && "p-2 sm:p-3")}>
      {/* gallery: the photo that grew out of the tile */}
      <div style={{ gridArea: "gl" }} className={cx(s.tile, s.t2, r, "min-h-[110vw] sm:min-h-0")}>
        <motion.div
          layoutId={from ? `${from}-img` : undefined}
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: overlay ? 20 : 28 }}
          initial={from && !img ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={`${cur.photo.id}-${i}`}
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
        {(p.badge || p.edition) && (
          <Fade area="unset" on={overlay} className="absolute left-3 top-3 z-[1] flex gap-1.5">
            {p.badge && <span className={cx(s.mono, "block rounded-full bg-[var(--b-tile)] px-3 py-1.5 text-[11px]")}>{p.badge}</span>}
            {p.edition && (
              <span className={cx(s.mono, "block rounded-full bg-[var(--b-ink)] px-3 py-1.5 text-[11px] text-white")}>
                {p.edition.left} of {p.edition.size} left
              </span>
            )}
          </Fade>
        )}
      </div>

      {/* thumbnails */}
      <Fade area="th" on={overlay} className={cx(s.tile, r, "flex items-center gap-2 overflow-x-auto p-2")}>
        {shots.map((sh, j) => (
          <button
            key={`${sh.photo.id}-${j}`}
            type="button"
            onClick={() => setShot(j)}
            aria-pressed={j === i}
            aria-label={`Photo ${j + 1} of ${shots.length}: ${sh.photo.alt}`}
            className={cx(
              "relative h-[72px] w-[96px] shrink-0 overflow-hidden rounded-[14px] outline-offset-2 transition-[opacity,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.97]",
              j === i ? "shadow-[0_0_0_2px_var(--b-ink)]" : "opacity-60 hover:opacity-100",
            )}
          >
            <Photo p={sh.photo} tone={sh.tone} sizes="96px" />
          </button>
        ))}
        <p className={cx(s.mono, s.muted, "ml-auto shrink-0 pl-3 pr-3 text-[11px]")}>
          {i + 1} of {shots.length}
        </p>
      </Fade>

      {/* the essentials */}
      <Fade area="in" on={overlay} delay={0.1} className={cx(s.tile, r, "flex flex-col p-5 sm:p-7")}>
        <div className={cx("flex flex-wrap gap-1.5", overlay && "pr-12")}>
          <Link
            href={shopHref(cat.id)}
            onClick={() => overlay && views.close()}
            className={cx(s.chip, s.chipSm, s.mono)}
          >
            {cat.label}
          </Link>
          <span className={cx(s.mono, "inline-flex h-[30px] items-center gap-1.5 rounded-full bg-accent-soft px-3 text-[11px]")}>
            <Swatch wood={p.wood} size={11} />
            {c.name}
          </span>
        </div>
        <Title className={cx(s.display, "mt-6 text-[clamp(36px,8cqw,68px)]")}>{p.name}</Title>
        <p className={cx(s.mono, s.muted, "mt-2 text-[11px]")}>
          {c.name}, {c.latin}
        </p>
        <Link
          href={overlay ? `/d/06/p/${p.slug}#reviews` : "#reviews"}
          onClick={() => overlay && views.close()}
          className="mt-3 inline-flex items-center gap-2 self-start rounded-full py-1 text-[14px] transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Stars value={summary.avg} size={15} />
          <span className={s.mono}>{summary.avg.toFixed(1)}</span>
          <span className="text-[var(--b-muted)] underline decoration-[var(--b-line)] underline-offset-4">
            {summary.count} reviews
          </span>
        </Link>
        <div className="mt-5 flex items-baseline gap-3">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={unit}
              className={cx(s.monoWide, "text-[26px] leading-none")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {formatINR(unit)}
            </motion.p>
          </AnimatePresence>
          {opt && <span className={cx(s.mono, s.muted, "text-[11px]")}>{opt.label}</span>}
        </div>
        <p className="mt-4 max-w-[46ch] text-[17px] leading-[1.5]">{p.short}</p>

        {p.edition && <EditionDots size={p.edition.size} left={p.edition.left} wood={p.wood} />}

        <Terms p={p} />

        <div className="mt-auto pt-6">
          {p.options && (
            <div className="mb-4">
              <p id={`b6-opt-${p.slug}`} className="mb-2 text-[13px] text-[var(--b-muted)]">
                {p.options.name}
              </p>
              <div role="radiogroup" aria-labelledby={`b6-opt-${p.slug}`} className="flex flex-wrap gap-1.5" onKeyDown={onOptionKey}>
                {p.options.values.map((v) => {
                  const on = v.id === option;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      tabIndex={on ? 0 : -1}
                      onClick={() => setOption(v.id)}
                      className={s.opt}
                    >
                      <span className="text-[14px] font-medium leading-tight">{v.label}</span>
                      {varies && <span className={cx(s.mono, "text-[10.5px] leading-tight opacity-70")}>{formatINR(v.price)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-stretch gap-2">
            <div className="flex h-14 items-center gap-1 rounded-full bg-[var(--b-tile2)] p-1" role="group" aria-label="Quantity">
              <button type="button" className={cx(s.icon, s.onWhite)} onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="One fewer">
                <IconMinus size={15} />
              </button>
              <span className={cx(s.mono, "w-7 text-center text-[15px]")} aria-live="polite" aria-label={`Quantity ${qty}`}>
                {qty}
              </span>
              <button type="button" className={cx(s.icon, s.onWhite)} onClick={() => setQty((q) => Math.min(9, q + 1))} disabled={qty >= 9} aria-label="One more">
                <IconOpen size={15} />
              </button>
            </div>
            <button type="button" className={cx(s.btn, s.btnLg, "min-w-[200px] flex-1")} onClick={add}>
              <span aria-live="polite" className="inline-flex items-center gap-2">
                {added ? (
                  <>
                    <IconCheck /> Added to bag
                  </>
                ) : (
                  <>Add to bag, {formatINR(unit * qty)}</>
                )}
              </span>
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(p.slug)}
              aria-pressed={saved}
              aria-label={saved ? `Remove ${p.name} from your wishlist` : `Save ${p.name} to your wishlist`}
              className={cx(s.icon, s.iconLg, "shrink-0")}
            >
              <IconHeart size={20} filled={saved} />
            </button>
          </div>
          <AnimatePresence initial={false}>
            {added && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-2 pt-2">
                  <button type="button" className={cx(s.ghost, "flex-1")} onClick={openBag}>
                    View bag
                  </button>
                  <Link href="/d/06/checkout" onClick={() => overlay && views.close()} className={cx(s.ghost, "flex-1")}>
                    Checkout
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {overlay && (
            <Link
              href={`/d/06/p/${p.slug}`}
              onClick={() => views.close()}
              className="mt-4 inline-block rounded text-[14px] text-[var(--b-muted)] underline decoration-[var(--b-line)] underline-offset-4 transition-colors hover:text-[var(--b-ink)] hover:decoration-[var(--b-ink)] focus-visible:outline-2 focus-visible:outline-accent"
            >
              Open the full page for this piece
            </Link>
          )}
        </div>
      </Fade>

      {/* the rest stacks in three columns whose last tiles take up the slack, so no tile is left half empty */}
      <div style={{ gridArea: "lo" }} className="b6-plo">
        <div className="b6-pcol">
          {/* story */}
          <Fade area="auto" on={overlay} delay={0.18} className={cx(s.tile, r, "p-6 sm:p-7")}>
            <h3 className="text-[20px] font-medium tracking-[-0.025em]">{p.wood === "red" ? "How it is made" : "What it is"}</h3>
            <div className="mt-3 space-y-3 text-[16px] leading-[1.55] text-[var(--b-ink2)]">
              {p.story.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </Fade>

          {/* provenance */}
          <Fade area="auto" on={overlay} delay={0.26} className={cx(s.tile, s.dark, r, "flex flex-col justify-between gap-5 p-6 sm:p-7")}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[20px] font-medium tracking-[-0.025em]">{PROVENANCE[p.wood].title}</h3>
              <span className={cx(s.mono, "shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[10.5px]")}>e.g. {c.provenance.record[0].value}</span>
            </div>
            <p className="max-w-[56ch] text-[15px] leading-[1.55] text-white/75">{PROVENANCE[p.wood].text}</p>
          </Fade>
        </div>

        <div className="b6-pcol">
          {/* details */}
          <Fade area="auto" on={overlay} delay={0.2} className={cx(s.tile, s.t2, r, "p-6 sm:p-7")}>
            <h3 className="text-[20px] font-medium tracking-[-0.025em]">Details</h3>
            <dl className="mt-3 divide-y divide-[var(--b-line)]">
              {p.details.map((d) => (
                <div key={d.label} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 py-2.5">
                  <dt className={cx(s.mono, s.muted, "text-[11px] leading-[20px]")}>{d.label}</dt>
                  <dd className="text-[15px] leading-[20px]">{d.value}</dd>
                </div>
              ))}
            </dl>
          </Fade>

          {/* care */}
          <Fade area="auto" on={overlay} delay={0.22} className={cx(s.tile, r, "flex flex-col p-6")}>
            <h3 className="text-[18px] font-medium tracking-[-0.02em]">Care</h3>
            <p className="mt-2 text-[16px] leading-[1.5] text-[var(--b-ink2)]">{p.care}</p>
          </Fade>
        </div>

        <div className="b6-pcol b6-pcol3">
          {/* the wood, and the same piece in the other wood */}
          <Fade area="auto" on={overlay} delay={0.24} className={cx(s.tile, s.tint, r, "flex flex-col gap-3 p-6")}>
            <div className="flex items-center gap-3">
              <Swatch wood={p.wood} size={28} />
              <div className="min-w-0">
                <p className="truncate text-[17px] font-medium leading-tight">{c.name}</p>
                <p className={cx(s.mono, "truncate text-[10.5px] opacity-70")}>
                  {c.latin}, {c.sanskrit}
                </p>
              </div>
            </div>
            <p className="text-[15px] leading-[1.5]">{c.oneLine}</p>
            {/* a drawn panel of the grain that takes whatever height is left */}
            <span aria-hidden className="block min-h-14 flex-1 rounded-[16px] ring-1 ring-black/5" style={{ background: GRAIN[p.wood] }} />
            {counterpart && (
              <Link
                href={`/d/06/p/${counterpart.slug}`}
                onClick={() => overlay && views.close()}
                className="group flex items-center gap-3 rounded-[18px] bg-[var(--b-tile)] p-2 pr-3 transition-colors hover:bg-[var(--b-tile2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99]"
              >
                <span className="relative size-12 shrink-0 overflow-hidden rounded-[12px]">
                  <Photo p={shotsOf(counterpart)[0].photo} tone={shotsOf(counterpart)[0].tone} sizes="48px" />
                </span>
                <span className="min-w-0">
                  <span className={cx(s.mono, s.muted, "block text-[10.5px]")}>Also in {WOOD_SHORT[counterpart.wood].toLowerCase()}</span>
                  <span className="block truncate text-[14.5px] font-medium">{counterpart.name}</span>
                </span>
              </Link>
            )}
          </Fade>
        </div>
      </div>
    </div>
  );
}

/** What comes with the piece, as three small tiles: delivery, how it is packed, returns. */
function Terms({ p }: { p: Product }) {
  const cells: [string, string, string][] = [
    ["Delivery", "Free, 3–5 days", `Express ${formatINR(DELIVERY.express.price)}`],
    p.wood === "red" ? ["Packed", "Linen and a box", "Batch record inside"] : ["Packed", "Sealed and boxed", "Lot on the label"],
    p.edition ? ["Returns", "Final sale", "Numbered editions"] : ["Returns", "Within 14 days", "Unused, boxed"],
  ];
  return (
    <ul className="mt-5 grid grid-cols-3 gap-1.5" aria-label="Delivery, packing and returns">
      {cells.map(([k, v, note]) => (
        <li key={k} className={cx(s.inner, "flex min-w-0 flex-col gap-1 p-3")}>
          <span className={cx(s.mono, s.muted, "text-[10px]")}>{k}</span>
          <span className="text-[14px] font-medium leading-tight">{v}</span>
          <span className={cx(s.mono, s.muted, "text-[10px] leading-snug")}>{note}</span>
        </li>
      ))}
    </ul>
  );
}

/** Edition counter: one dot per number, the placed ones faint. */
function EditionDots({ size, left, wood }: { size: number; left: number; wood: "red" | "white" }) {
  const placed = size - left;
  return (
    <div className={cx(s.inner, "mt-5 p-4")}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] font-medium">
          {left} of {size} left
        </p>
        <p className={cx(s.mono, s.muted, "text-[10.5px]")}>{wood === "red" ? "Numbered cuffs" : "Numbered vials"}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-[5px]" aria-hidden>
        {Array.from({ length: size }, (_, i) => (
          <span key={i} className={cx("size-[9px] rounded-full", i < placed ? "bg-[var(--b-dim)]" : "bg-accent")} />
        ))}
      </div>
    </div>
  );
}
