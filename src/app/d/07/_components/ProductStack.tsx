"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { bag, DELIVERY } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, formatINR, getOption, getProduct, priceOf, productsFor, type Product } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { PHOTOS } from "@/lib/photos";
import { setWoodQuietly } from "@/lib/wood";
import { IconArrow, IconHeart } from "./Icons";
import { LiveRating, Reviews } from "./Reviews";
import { shotOf, shotsOf, ShotPhoto, type Shot7 } from "./shots";
import { ProductCard } from "./shop/ProductCard";
import { productHref, sheet, shopHref, useSheetOpen } from "./store";

const REST = [0, 2.4, -2, 1.6, -1.2, 0.8];

/** Photos for a piece: its own shots, then the wood and the hands that worked it. */
function sheetsFor(p: Product): Shot7[] {
  const extra: Shot7[] = p.wood === "red" ? [{ photo: PHOTOS.redGrain }, { photo: PHOTOS.carving }] : [{ photo: PHOTOS.whiteLog }, { photo: PHOTOS.diyaHands }];
  const seen = new Set<string>();
  return [...shotsOf(p), ...extra].filter((s) => (seen.has(s.photo.id) ? false : (seen.add(s.photo.id), true))).slice(0, 5);
}

/** Three pieces from the same wood that go with this one: the same category first. */
function pairsFor(p: Product): Product[] {
  const rest = productsFor(p.wood).filter((x) => x.slug !== p.slug);
  return [...rest.filter((x) => x.category === p.category), ...rest.filter((x) => x.category !== p.category && x.featured), ...rest].filter(
    (x, i, a) => a.findIndex((y) => y.slug === x.slug) === i,
  ).slice(0, 3);
}

/** The product view: photographs are stacked sheets that peel away as you scroll; details stay at the side. */
export function ProductStack({ slug }: { slug: string }) {
  const p = getProduct(slug)!;
  // the server cannot know the motion preference, so the first client render matches it and then settles
  const hydrated = useHydrated();
  const reduce = !!useReducedMotion() && hydrated;
  const sheets = sheetsFor(p);
  const n = sheets.length;

  // The page belongs to its piece's wood; set before the first paint so the dock never shows the other one.
  useLayoutEffect(() => {
    setWoodQuietly(p.wood);
  }, [p.wood]);

  const buy = useBuy(p);
  const topBuy = useRef<HTMLDivElement>(null);
  const panelBuy = useRef<HTMLDivElement>(null);
  const bar = useBuyBar(topBuy, panelBuy);

  const col = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: col, offset: ["start start", "end end"] });
  const peel = useTransform(scrollYProgress, (v) => Math.min(1, v / 0.9) * (n - 1));

  const all = productsFor(p.wood);
  const at = all.findIndex((x) => x.slug === p.slug);
  const next = all[(at + 1) % all.length];
  const pairs = pairsFor(p);

  return (
    <div className="overflow-x-clip px-2 pt-2 md:px-3 md:pt-3 lg:px-[14px] lg:pt-[14px]">
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-[14px]">
        {/* the sheets */}
        {/* phones: the name, the price and the add come before the photographs */}
        <div ref={topBuy} className="px-3 pb-1 pt-3 lg:hidden">
          <p className="flex items-center justify-between gap-3 text-[13px] text-(--s7-muted)">
            {categoryOf(p).label}
            <a href="#reviews" className="transition hover:opacity-75">
              <LiveRating slug={p.slug} />
            </a>
          </p>
          <p className="d1 mt-1 text-[52px]">{p.name}</p>
          <p className="num mt-2 text-[15px]">
            {formatINR(buy.unit)} <span className="text-(--s7-muted)">in {CONTENT[p.wood].name.toLowerCase()}</span>
          </p>
          {p.options && <OptionCards product={p} buy={buy} row />}
          <div className="mt-3 flex items-center gap-2">
            <AddButton buy={buy} className="h-12 flex-1" />
            <Heart slug={p.slug} />
          </div>
        </div>
        <div
          ref={col}
          className="relative h-[calc(var(--n)*34svh)] md:h-[calc(var(--n)*45svh)] lg:col-span-7 lg:h-[calc(var(--n)*72svh)]"
          style={{ "--n": Math.max(2, n) } as CSSProperties}
        >
          <div className="sticky top-2 h-[min(calc(100svh-150px),125vw)] md:top-3 md:h-[calc(100svh-150px)] lg:top-[14px] lg:h-[calc(100svh-28px)]">
            <div className="relative size-full">
              {sheets.map((s, i) => (
                <Sheet key={s.photo.id} shot={s} i={i} n={n} peel={peel} reduce={!!reduce} />
              ))}
              <PeelHint peel={peel} n={n} />
            </div>
          </div>
        </div>

        {/* the details */}
        <Details product={p} buy={buy} buyRef={panelBuy} />
      </div>
      <BuyBar product={p} buy={buy} show={bar} />

      <Reviews slug={p.slug} name={p.name} />

      {/* pairs with: three from the same wood, fanned like a hand of cards */}
      <section aria-labelledby="s7-pairs" className="mt-3 rounded-[28px] bg-(--s7-sage) px-4 pb-6 pt-6 md:rounded-[40px] md:px-8 md:pb-10 md:pt-8 lg:mt-[14px] lg:rounded-[48px] lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="s7-pairs" className="d1 text-[clamp(2.8rem,6vw,5.6rem)]">
            Pairs with
          </h2>
          <Link
            href={shopHref(p.category)}
            className="inline-flex items-center gap-2 text-[15px] font-medium underline decoration-(--s7-ink)/25 underline-offset-[6px] transition hover:decoration-(--s7-accent)"
          >
            More in {categoryOf(p).label}
            <IconArrow width={16} height={16} />
          </Link>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3 md:gap-4">
          {pairs.map((x, i) => (
            <li key={x.slug} className={`transition-transform duration-500 ${["sm:-rotate-[2deg]", "sm:translate-y-4", "sm:rotate-[2deg]"][i]} hover:rotate-0`}>
              <ProductCard product={x} sizes="(min-width: 640px) 30vw, 90vw" />
            </li>
          ))}
        </ul>
      </section>

      {/* next card in the deck */}
      <Link
        href={productHref(next.slug)}
        className="group mt-3 grid overflow-hidden rounded-[28px] bg-(--s7-clay) md:grid-cols-12 md:rounded-[40px] lg:mt-[14px] lg:rounded-[48px]"
      >
        <div className="relative h-64 overflow-hidden md:col-span-5 md:h-auto md:min-h-[360px]">
          <ShotPhoto
            shot={shotOf(next)}
            sizes="(min-width: 768px) 40vw, 100vw"
            className="transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        </div>
        <div className="flex flex-col justify-between gap-8 p-6 md:col-span-7 md:p-10">
          <p className="text-[14px] text-(--s7-muted)">Next in {CONTENT[p.wood].name.toLowerCase()}</p>
          <div>
            <p className="d1 text-[clamp(3rem,7vw,7.5rem)] transition-colors group-hover:text-(--s7-accent)">{next.name}</p>
            <p className="mt-3 max-w-[50ch] text-[16px] leading-relaxed text-(--s7-body)">{next.short}</p>
          </div>
          <p className="flex items-center gap-3 text-[15px] font-medium">
            <span className="num">{formatINR(next.price)}</span>
            <span className="grid size-10 place-items-center rounded-full bg-(--s7-ink) text-(--s7-page) transition group-hover:translate-x-1 group-hover:bg-(--s7-accent)">
              <IconArrow width={18} height={18} />
            </span>
          </p>
        </div>
      </Link>
    </div>
  );
}

function Sheet({ shot, i, n, peel, reduce }: { shot: Shot7; i: number; n: number; peel: MotionValue<number>; reduce: boolean }) {
  const last = i === n - 1;
  // k < 0: still in the pile (depth = -k). 0..1: being peeled away.
  const k = useTransform(peel, (p) => Math.max(-4, Math.min(1, p - i)));
  const y = useTransform(k, (v) => (reduce ? "0%" : v >= 0 ? (last ? "0%" : `${-128 * v}%`) : `${Math.min(-v, 3) * 2.4}%`));
  const x = useTransform(k, (v) => (reduce || last || v < 0 ? "0%" : `${-9 * v}%`));
  const rotate = useTransform(k, (v) => (reduce ? 0 : v >= 0 ? (last ? 0 : -9 * v) : REST[i % REST.length] * Math.min(1, -v)));
  const rotateX = useTransform(k, (v) => (reduce || last || v < 0 ? 0 : 22 * v));
  const scale = useTransform(k, (v) => (reduce ? 1 : v >= 0 ? (last ? 1 : 1 + 0.04 * v) : 1 - 0.045 * Math.min(-v, 3)));
  const opacity = useTransform(k, (v) => (reduce && !last ? (v >= 0.5 ? 0 : 1) : 1));

  return (
    <motion.figure
      className="absolute inset-x-0 bottom-8 top-0 m-0 overflow-hidden rounded-[28px] bg-(--s7-stone) shadow-[0_30px_60px_-36px_rgba(27,23,18,0.55)] md:bottom-10 md:rounded-[40px] lg:bottom-11 lg:rounded-[48px]"
      style={{ y, x, rotate, rotateX, scale, opacity, zIndex: n - i, transformPerspective: 1400, originY: 1 }}
    >
      <ShotPhoto shot={shot} sizes="(min-width: 1024px) 58vw, 100vw" priority={i === 0} />
      <figcaption className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 md:bottom-6 md:left-6 md:right-6">
        <span className="rounded-full bg-white/90 px-3.5 py-2 text-[12.5px] leading-tight text-[#1B1712]">{shot.photo.alt}</span>
        <span className="num shrink-0 rounded-full bg-[#1B1712]/75 px-3 py-2 text-[12.5px] text-white">
          {i + 1}/{n}
        </span>
      </figcaption>
    </motion.figure>
  );
}

function PeelHint({ peel, n }: { peel: MotionValue<number>; n: number }) {
  const opacity = useTransform(peel, (p) => Math.max(0, 1 - p * 2.5));
  if (n < 2) return null;
  return (
    <motion.p
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none absolute left-1/2 top-4 z-[20] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1B1712]/75 px-3.5 py-2 text-[12.5px] text-white md:top-6"
    >
      Scroll to turn the photographs
    </motion.p>
  );
}

function Details({ product: p, buy, buyRef }: { product: Product; buy: Buy; buyRef: RefObject<HTMLDivElement | null> }) {
  const panel = useRef<HTMLElement>(null);
  const top = useMotionValue(14);
  const { option, qty, setQty, unit } = buy;
  const c = CONTENT[p.wood];
  const counterpart = p.counterpart ? getProduct(p.counterpart) : undefined;

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const measure = () => top.set(Math.min(14, window.innerHeight - el.offsetHeight - 14));
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [top]);

  return (
    <motion.aside
      id="s7-details"
      ref={panel}
      style={{ top }}
      className="self-start rounded-[28px] bg-(--s7-surface) p-5 md:rounded-[40px] md:p-8 lg:sticky lg:col-span-5 lg:rounded-[48px] lg:p-10"
    >
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[14px] text-(--s7-muted)">
        <Link href={shopHref()} className="underline-offset-4 transition hover:text-(--s7-ink) hover:underline">
          Shop
        </Link>
        <span aria-hidden>/</span>
        <Link href={shopHref(p.category)} className="underline-offset-4 transition hover:text-(--s7-ink) hover:underline">
          {categoryOf(p).label}
        </Link>
      </nav>
      {(p.badge || p.edition) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {p.badge && <span className="rounded-full bg-(--s7-stone) px-3 py-1.5 text-[12.5px] font-medium">{p.badge}</span>}
          {p.edition && (
            <span className="num rounded-full bg-(--s7-ink) px-3 py-1.5 text-[12.5px] font-medium text-(--s7-page)">
              Edition of {p.edition.size}
            </span>
          )}
        </div>
      )}
      <h1 className="d1 mt-4 text-[clamp(3rem,min(5vw,10vh),5.6rem)]">{p.name}</h1>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-[15px]">
        <span aria-hidden className={`size-5 rounded-full ${p.wood === "red" ? "ring-red" : "ring-white"}`} />
        {c.name}, <i>{c.latin}</i>
      </p>
      <a href="#reviews" className="mt-3 inline-flex rounded-full transition hover:opacity-75">
        <LiveRating slug={p.slug} className="text-[14px]" />
      </a>
      <p className="mt-3 text-[17px] leading-relaxed text-(--s7-body)">{p.short}</p>

      <p className="d2 num mt-6 text-[44px]" aria-live="polite">
        {formatINR(unit)}
        {p.options && <span className="ml-3 align-middle text-[15px] font-normal tracking-normal text-(--s7-muted)">{getOption(p, option)?.label}</span>}
      </p>

      {p.options && <OptionCards product={p} buy={buy} />}

      <div ref={buyRef} className="mt-6 flex flex-wrap items-center gap-2.5">
        <div className="flex h-12 items-center rounded-full bg-(--s7-page) p-1 ring-1 ring-(--s7-ink)/10">
          <button
            type="button"
            aria-label="One fewer"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-10 place-items-center rounded-full text-[18px] transition hover:bg-(--s7-surface) active:scale-90"
          >
            &minus;
          </button>
          <span className="num w-8 text-center text-[15px]" aria-live="polite" aria-label={`Quantity ${qty}`}>
            {qty}
          </span>
          <button
            type="button"
            aria-label="One more"
            onClick={() => setQty((q) => Math.min(9, q + 1))}
            className="grid size-10 place-items-center rounded-full text-[18px] transition hover:bg-(--s7-surface) active:scale-90"
          >
            +
          </button>
        </div>
        <AddButton buy={buy} className="h-12 min-w-[220px] flex-1" />
        <Heart slug={p.slug} />
      </div>
      <p className="mt-3 text-[14.5px] text-(--s7-muted)">
        Free delivery across India, 3–5 working days. Express {formatINR(DELIVERY.express.price)}.
      </p>

      {p.edition && <Edition size={p.edition.size} left={p.edition.left} />}

      {counterpart && (
        <Link
          href={productHref(counterpart.slug)}
          className="group mt-6 flex items-center gap-3 rounded-[22px] bg-(--s7-page) p-2 pr-4 ring-1 ring-(--s7-ink)/8 transition hover:ring-(--s7-ink)/30"
        >
          <span className="relative size-16 shrink-0 overflow-hidden rounded-[16px]">
            <ShotPhoto shot={shotOf(counterpart)} sizes="64px" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] text-(--s7-muted)">Also in {CONTENT[counterpart.wood].name.toLowerCase()}</span>
            <span className="d3 block text-[18px]">{counterpart.name}</span>
          </span>
          <IconArrow width={18} height={18} className="shrink-0 transition group-hover:translate-x-1" />
        </Link>
      )}

      <div className="mt-9 border-t border-(--s7-ink)/12 pt-6">
        <h2 className="d3 text-[20px]">About the piece</h2>
        {p.story.map((s) => (
          <p key={s} className="mt-3 text-[16px] leading-relaxed text-(--s7-body)">
            {s}
          </p>
        ))}
      </div>

      <dl className="mt-6 text-[15px]">
        {[...p.details, { label: "Wood", value: `${c.name} (${c.latin}), heartwood` }].map((d) => (
          <div key={d.label} className="grid grid-cols-[120px_1fr] gap-3 border-t border-(--s7-ink)/12 py-2.5">
            <dt className="text-(--s7-muted)">{d.label}</dt>
            <dd>{d.value}</dd>
          </div>
        ))}
      </dl>

      <Fold title="Care">
        <p>{p.care}</p>
      </Fold>
      <Fold title={p.wood === "red" ? "The batch record" : "The lot record"}>
        <p>{c.provenance.text}</p>
        <p className="mt-2 text-(--s7-muted)">{c.regulation}</p>
      </Fold>
      <Fold title="Delivery and returns">
        <p>
          Free delivery across India, 3–5 working days, packed by hand and insured to the full value. Express delivery is{" "}
          {formatINR(DELIVERY.express.price)}, 1–2 working days. Unused pieces can be returned within 14 days in their original
          packaging. Numbered editions are final.
        </p>
      </Fold>
    </motion.aside>
  );
}

/** An edition as a row of small tokens: the ones already placed are filled. */
function Edition({ size, left }: { size: number; left: number }) {
  const placed = size - left;
  return (
    <div className="mt-6 rounded-[22px] bg-(--s7-accent-soft) p-4">
      <p className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-medium">
          {left} of {size} still to be placed
        </span>
        <span className="num text-[13px] text-(--s7-accent-deep)">{placed} with their owners</span>
      </p>
      <div aria-hidden className="mt-3 flex flex-wrap gap-1">
        {Array.from({ length: size }, (_, i) => (
          <span key={i} className={`size-3 rounded-full ${i < placed ? "bg-(--s7-accent)" : "ring-1 ring-(--s7-accent)/50"}`} />
        ))}
      </div>
    </div>
  );
}

function Fold({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-t border-(--s7-ink)/12 [&:last-of-type]:border-b">
      <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-[15px] font-medium transition hover:text-(--s7-accent) [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="grid size-7 place-items-center rounded-full bg-(--s7-page) text-[16px] transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-4 text-[15px] leading-relaxed text-(--s7-body)">{children}</div>
    </details>
  );
}

/* ---------- buying: one state shared by the phone header, the slip bar and the panel ---------- */

function useBuy(p: Product) {
  const [option, setOption] = useState<string | undefined>(p.options?.values[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const unit = priceOf(p, option);
  const add = () => {
    bag.add(p.slug, { option, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
    sheet.open();
  };
  return { option, setOption, qty, setQty, unit, added, add };
}
type Buy = ReturnType<typeof useBuy>;

/** The bar shows on phones only while neither the header's add nor the panel's add is on screen. */
function useBuyBar(a: RefObject<HTMLElement | null>, b: RefObject<HTMLElement | null>) {
  const [seen, setSeen] = useState({ a: true, b: false });
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      setSeen((prev) => {
        const next = { ...prev };
        for (const e of entries) {
          if (e.target === a.current) next.a = e.isIntersecting;
          if (e.target === b.current) next.b = e.isIntersecting;
        }
        return next;
      });
    });
    if (a.current) io.observe(a.current);
    if (b.current) io.observe(b.current);
    return () => io.disconnect();
  }, [a, b]);
  return !seen.a && !seen.b;
}

function OptionCards({ product: p, buy, row = false }: { product: Product; buy: Buy; row?: boolean }) {
  const values = p.options!.values;
  return (
    <fieldset className={row ? "mt-3" : "mt-4"}>
      <legend className={row ? "sr-only" : "text-[14px] text-(--s7-muted)"}>{p.options!.name}</legend>
      <div className={`flex gap-2 ${row ? "s7-noscroll -mx-3 overflow-x-auto px-3 pb-1 pt-1" : "mt-2 flex-wrap"}`}>
        {values.map((v) => {
          const on = (buy.option ?? values[0].id) === v.id;
          return (
            <label
              key={v.id}
              className={`relative flex shrink-0 cursor-pointer flex-col rounded-[18px] px-4 py-2.5 transition active:scale-[0.98] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--s7-accent) ${
                on ? "-translate-y-0.5 bg-(--s7-ink) text-(--s7-page) shadow-[0_12px_22px_-14px_rgba(27,23,18,0.7)]" : "bg-(--s7-page) ring-1 ring-(--s7-ink)/12 hover:ring-(--s7-ink)/35"
              }`}
            >
              <input type="radio" name={`opt-${p.slug}${row ? "-top" : ""}`} value={v.id} checked={on} onChange={() => buy.setOption(v.id)} className="sr-only" />
              <span className="text-[15px] font-medium">{v.label}</span>
              <span className={`num text-[13px] ${on ? "text-(--s7-page)/70" : "text-(--s7-muted)"}`}>{formatINR(v.price)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function AddButton({ buy, className = "" }: { buy: Buy; className?: string }) {
  return (
    <button
      type="button"
      onClick={buy.add}
      className={`inline-flex items-center justify-between gap-4 rounded-full bg-(--s7-ink) pl-6 pr-5 text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-[0.98] ${className}`}
    >
      <span>{buy.added ? "Added to the bag" : "Add to the bag"}</span>
      <span className="num opacity-75">{formatINR(buy.unit * buy.qty)}</span>
    </button>
  );
}

function Heart({ slug }: { slug: string }) {
  const hydrated = useHydrated();
  const wish = useWishlist();
  const saved = hydrated && wish.includes(slug);
  return (
    <button
      type="button"
      onClick={() => toggleWishlist(slug)}
      aria-pressed={saved}
      aria-label={saved ? "Remove from your wishlist" : "Save to your wishlist"}
      className={`grid size-12 shrink-0 place-items-center rounded-full transition active:scale-90 ${
        saved ? "bg-(--s7-accent) text-white" : "bg-(--s7-page) ring-1 ring-(--s7-ink)/12 hover:ring-(--s7-ink)/35"
      }`}
    >
      <IconHeart filled={saved} width={20} height={20} />
    </button>
  );
}

/** Phones: once both adds have scrolled away, a small card is dealt up from behind the dock with the price and the add. */
function BuyBar({ product: p, buy, show }: { product: Product; buy: Buy; show: boolean }) {
  const open = useSheetOpen();
  const reduce = useReducedMotion();
  const opt = p.options ? getOption(p, buy.option)?.label : undefined;
  return (
    <AnimatePresence>
      {show && !open && (
        <motion.div
          key="bar"
          initial={reduce ? { opacity: 0 } : { y: 90, rotate: -2.5, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 90, rotate: 2, opacity: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
          className="fixed inset-x-2 bottom-[140px] z-[140] flex items-center gap-2 rounded-[22px] bg-(--s7-surface) p-1.5 shadow-[0_22px_44px_-20px_rgba(27,23,18,0.6)] ring-1 ring-(--s7-ink)/8 lg:hidden"
        >
          <span className="relative size-11 shrink-0 overflow-hidden rounded-[16px]">
            <ShotPhoto shot={shotOf(p)} sizes="44px" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="d3 block truncate text-[15px]">{p.name}</span>
            <span className="num block truncate text-[12.5px] text-(--s7-muted)">
              {formatINR(buy.unit)}
              {opt ? `, ${opt}` : ""}
            </span>
          </span>
          <button
            type="button"
            onClick={buy.add}
            className="h-11 shrink-0 rounded-full bg-(--s7-ink) px-4 text-[14px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-95"
          >
            {buy.added ? "Added" : "Add to the bag"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
