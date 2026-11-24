"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, WOOD_NAMES, type Family, type Shot } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { PHOTOS } from "@/lib/photos";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { IconArrow } from "./Icons";
import { CARE, catLabel, HOME, inWood, sheet } from "./store";

const REST = [0, 2.4, -2, 1.6, -1.2, 0.8];

/** Photos for a piece: its own shots, then the wood and the hands that worked it. */
function sheetsFor(f: Family, wood: Wood): Shot[] {
  const v = f.variants[wood]!;
  const extra: Shot[] = [{ photo: wood === "red" ? PHOTOS.redGrain : PHOTOS.whiteLog }, { photo: PHOTOS.carving }];
  const seen = new Set<string>();
  return [...v.shots, ...extra].filter((s) => (seen.has(s.photo.id) ? false : (seen.add(s.photo.id), true))).slice(0, 5);
}

/** The product view: photographs are stacked sheets that peel away as you scroll; details stay at the side. */
export function ProductStack({ slug }: { slug: string }) {
  const f = getFamily(slug)!;
  const wood = useWood();
  const reduce = useReducedMotion();
  const other: Wood = wood === "red" ? "white" : "red";
  const v = f.variants[wood];
  const shownWood: Wood = v ? wood : other;
  const shown = f.variants[shownWood]!;
  const sheets = sheetsFor(f, shownWood);
  const n = sheets.length;

  const col = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: col, offset: ["start start", "end end"] });
  const peel = useTransform(scrollYProgress, (p) => Math.min(1, p / 0.9) * (n - 1));

  const fams = inWood(wood);
  const at = fams.findIndex((x) => x.slug === f.slug);
  const next = fams[(at + 1 + fams.length) % fams.length] ?? fams[0];
  const nextV = next.variants[wood]!;

  return (
    <main className="px-2 pb-[150px] pt-2 md:px-3 md:pt-3 lg:px-[14px] lg:pb-[100px] lg:pt-[14px]">
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-[14px]">
        {/* the sheets */}
        <div className="px-3 pb-1 pt-3 lg:hidden">
          <p className="text-[13px] text-[#77706A]">{catLabel(f.category)}</p>
          <p className="d1 mt-1 text-[52px]">{f.name}</p>
          <p className="num mt-2 text-[15px]">
            {formatINR(shown.price)} <span className="text-[#77706A]">in {WOOD_NAMES[shownWood].common.toLowerCase()}</span>
          </p>
        </div>
        <div
          ref={col}
          className="relative h-[calc(var(--n)*55svh)] lg:col-span-7 lg:h-[calc(var(--n)*72svh)]"
          style={{ "--n": Math.max(2, n) } as CSSProperties}
        >
          <div className="sticky top-2 h-[calc(100svh-150px)] md:top-3 lg:top-[14px] lg:h-[calc(100svh-28px)]">
            <div className="relative size-full">
              {sheets.map((s, i) => (
                <Sheet key={`${shownWood}-${s.photo.id}`} shot={s} i={i} n={n} peel={peel} reduce={!!reduce} />
              ))}
              <PeelHint peel={peel} n={n} />
            </div>
          </div>
        </div>

        {/* the details */}
        <Details family={f} wood={wood} shownWood={shownWood} />
      </div>

      {/* next card in the deck */}
      <Link
        href={`${HOME}/p/${next.slug}`}
        className="group mt-3 grid overflow-hidden rounded-[28px] bg-[#E4E8E0] md:grid-cols-12 md:rounded-[40px] lg:mt-[14px] lg:rounded-[48px]"
      >
        <div className="relative h-64 overflow-hidden md:col-span-5 md:h-auto md:min-h-[380px]">
          <Photo
            p={nextV.shots[0].photo}
            tone={nextV.shots[0].tone}
            sizes="(min-width: 768px) 40vw, 100vw"
            className="transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        </div>
        <div className="flex flex-col justify-between gap-8 p-6 md:col-span-7 md:p-10">
          <p className="text-[14px] text-[#77706A]">Next in the deck</p>
          <div>
            <p className="d1 text-[clamp(3rem,7vw,7.5rem)] transition-colors group-hover:text-[var(--m-accent)]">{next.name}</p>
            <p className="mt-3 max-w-[50ch] text-[16px] leading-relaxed text-[#3d3731]">{next.summary}</p>
          </div>
          <p className="flex items-center gap-3 text-[15px] font-medium">
            <span className="num">{formatINR(nextV.price)}</span>
            <span className="grid size-10 place-items-center rounded-full bg-[#1B1712] text-white transition group-hover:translate-x-1 group-hover:bg-[var(--m-accent)]">
              <IconArrow width={18} height={18} />
            </span>
          </p>
        </div>
      </Link>
    </main>
  );
}

function Sheet({ shot, i, n, peel, reduce }: { shot: Shot; i: number; n: number; peel: MotionValue<number>; reduce: boolean }) {
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
      className="absolute inset-x-0 bottom-8 top-0 m-0 overflow-hidden rounded-[28px] md:bottom-10 lg:bottom-11 bg-[#E9E5DC] shadow-[0_30px_60px_-36px_rgba(27,23,18,0.55)] md:rounded-[40px] lg:rounded-[48px]"
      style={{ y, x, rotate, rotateX, scale, opacity, zIndex: n - i, transformPerspective: 1400, originY: 1 }}
    >
      <Photo p={shot.photo} tone={shot.tone} sizes="(min-width: 1024px) 58vw, 100vw" priority={i === 0} />
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

function Details({ family: f, wood, shownWood }: { family: Family; wood: Wood; shownWood: Wood }) {
  const panel = useRef<HTMLElement>(null);
  const top = useMotionValue(14);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const v = f.variants[wood];
  const shown = f.variants[shownWood]!;
  const other: Wood = wood === "red" ? "white" : "red";

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

  const add = () => {
    bag.add(f.slug, wood, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
    sheet.open();
  };

  return (
    <motion.aside
      ref={panel}
      style={{ top }}
      className="self-start rounded-[28px] bg-white p-5 md:rounded-[40px] md:p-8 lg:sticky lg:col-span-5 lg:rounded-[48px] lg:p-10"
    >
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[13.5px] text-[#77706A]">
        <Link href={`${HOME}#pieces`} className="underline-offset-4 transition hover:text-[#1B1712] hover:underline">
          The pieces
        </Link>
        <span aria-hidden>/</span>
        <span>{catLabel(f.category)}</span>
      </nav>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#E9E5DC] px-3 py-1.5 text-[12.5px] font-medium">{f.level}</span>
        {f.edition && <span className="rounded-full bg-[#1B1712] px-3 py-1.5 text-[12.5px] font-medium text-white">{f.edition}</span>}
      </div>
      <h1 className="d1 mt-4 text-[clamp(3rem,min(5vw,10vh),5.6rem)]">{f.name}</h1>
      <p className="mt-4 text-[16.5px] leading-relaxed text-[#3d3731]">{f.summary}</p>

      <fieldset className="mt-7">
        <legend className="text-[13.5px] text-[#77706A]">Wood</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["red", "white"] as const).map((w) => {
            const wv = f.variants[w];
            const on = wood === w;
            return (
              <button
                key={w}
                type="button"
                aria-pressed={on}
                disabled={!wv}
                onClick={() => !on && switchWood(w)}
                className={`flex items-center gap-3 rounded-[20px] p-3 text-left transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 ${
                  on ? "bg-[#1B1712] text-white" : "bg-[#F8F6F2] ring-1 ring-[#1B1712]/10 hover:ring-[#1B1712]/35"
                }`}
              >
                <span className={`size-8 shrink-0 rounded-full ${w === "red" ? "ring-red" : "ring-white"}`} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium">{WOOD_NAMES[w].common}</span>
                  <span className={`num block text-[13px] ${on ? "text-white/70" : "text-[#77706A]"}`}>
                    {wv ? formatINR(wv.price) : `Not made in ${w}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <p className="mt-3 text-[14.5px] text-[#77706A]">{shown.note}</p>

      {v ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex h-12 items-center rounded-full bg-[#F8F6F2] p-1 ring-1 ring-[#1B1712]/10">
            <button
              type="button"
              aria-label="One fewer"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid size-10 place-items-center rounded-full text-[18px] transition hover:bg-white active:scale-90"
            >
              &minus;
            </button>
            <span className="num w-8 text-center text-[15px]" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              aria-label="One more"
              onClick={() => setQty((q) => Math.min(9, q + 1))}
              className="grid size-10 place-items-center rounded-full text-[18px] transition hover:bg-white active:scale-90"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={add}
            className="inline-flex h-12 flex-1 items-center justify-between gap-4 rounded-full bg-[#1B1712] pl-6 pr-5 text-[15px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-[0.98]"
          >
            <span>{added ? "Added to the bag" : "Add to the bag"}</span>
            <span className="num text-white/75">{formatINR(v.price * qty)}</span>
          </button>
        </div>
      ) : (
        <div className="mt-6 rounded-[22px] bg-[var(--m-accent-soft)] p-4">
          <p className="text-[15px]">
            This piece is made only in {WOOD_NAMES[other].common.toLowerCase()}. {f.variants[other]?.note}
          </p>
          <button
            type="button"
            onClick={() => switchWood(other)}
            className="mt-3 inline-flex h-11 items-center rounded-full bg-[#1B1712] px-5 text-[14.5px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-[0.98]"
          >
            Switch to {WOOD_NAMES[other].common.toLowerCase()}
          </button>
        </div>
      )}

      <div className="mt-9 border-t border-[#1B1712]/12 pt-6">
        <h2 className="d3 text-[20px]">About the piece</h2>
        {f.story.map((p) => (
          <p key={p} className="mt-3 text-[15.5px] leading-relaxed text-[#3d3731]">
            {p}
          </p>
        ))}
      </div>

      <dl className="mt-6 text-[14.5px]">
        {[...f.details, { label: "Wood", value: `${WOOD_NAMES[shownWood].common} (${WOOD_NAMES[shownWood].latin})` }].map((d) => (
          <div key={d.label} className="grid grid-cols-[120px_1fr] gap-3 border-t border-[#1B1712]/12 py-2.5">
            <dt className="text-[#77706A]">{d.label}</dt>
            <dd>{d.value}</dd>
          </div>
        ))}
      </dl>

      <Fold title="Care">
        <ul className="grid gap-2">
          {CARE[f.category].map((c) => (
            <li key={c} className="flex gap-2.5">
              <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-[var(--m-accent)]" aria-hidden />
              {c}
            </li>
          ))}
        </ul>
      </Fold>
      <Fold title="Delivery and returns">
        <p>
          Complimentary delivery across India, packed by hand. Unused pieces can be returned within 14 days in their original
          packaging. Numbered editions are final.
        </p>
      </Fold>
    </motion.aside>
  );
}

function Fold({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-t border-[#1B1712]/12 [&:last-of-type]:border-b">
      <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-[15px] font-medium transition hover:text-[var(--m-accent)] [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="grid size-7 place-items-center rounded-full bg-[#F8F6F2] text-[16px] transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-4 text-[14.5px] leading-relaxed text-[#3d3731]">{children}</div>
    </details>
  );
}
