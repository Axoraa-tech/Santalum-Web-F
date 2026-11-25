"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { getProduct, priceLabel, productsFor } from "@/lib/shop/products";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { s } from "./cx";
import { CHAPTERS, EASE, N_CHAPTERS, readout, shotsOf, workSide, type Chapter } from "./data";
import { RatingLine } from "./Stars";
import { chapterStore, scrollToId, story, useMedia } from "./store";

const LatheScene = dynamic(() => import("./LatheScene"), { ssr: false });

const N = N_CHAPTERS;

/**
 * The home page's first part: a 650svh scroll in which one billet of heartwood is turned,
 * chapter by chapter, into the pieces we make. Each wood turns its own pieces and tells its own
 * story; both are rendered and CSS shows the current one, so a reload in white never flashes red.
 */
export function Story() {
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const [chapter, setChapter] = useState(0);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);
  const lite = useMedia("(max-width: 767px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    story.p = v;
    const c = Math.min(N - 1, Math.floor(v * N));
    setChapter(c);
    if (chapterStore.get() !== -1) chapterStore.set(c);
  });

  useEffect(() => {
    story.p = scrollYProgress.get();
    chapterStore.set(Math.min(N - 1, Math.floor(story.p * N)));
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      const c = Math.min(N - 1, Math.floor(scrollYProgress.get() * N));
      setInView(e.isIntersecting);
      setChapter(c);
      chapterStore.set(e.isIntersecting ? c : -1);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      chapterStore.set(-1);
    };
  }, [scrollYProgress]);

  const cue = useTransform(scrollYProgress, [0, 0.025], [1, 0]);

  return (
    <section
      ref={section}
      id="lathe"
      aria-label="The lathe"
      className="relative h-[650svh]"
      onPointerMove={(e) => {
        story.px = (e.clientX / window.innerWidth) * 2 - 1;
        story.py = -((e.clientY / window.innerHeight) * 2 - 1);
      }}
    >
      {/* Anchors: each chapter's hold point, after its cut is finished. */}
      {CHAPTERS.red.map((c) => (
        <div
          key={c.id}
          id={`ch-${c.id}`}
          aria-hidden
          className="pointer-events-none absolute left-0 h-px w-px"
          style={{ top: c.id === 0 ? 0 : `calc(${((c.id + 0.68) / N) * 550}svh)` }}
        />
      ))}

      <div className="sticky top-0 h-svh overflow-hidden">
        {/* The 3D lathe. */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: ready ? 1 : 0, transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
          aria-hidden
        >
          <LatheScene key={lite ? "lite" : "full"} lite={lite} reduced={reduced} active={inView} onReady={() => setReady(true)} />
        </div>

        <Blueprint hidden={ready} />

        {/* Phones: soften the canvas under the text. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-[linear-gradient(to_top,var(--paper)_0%,var(--paper)_62%,color-mix(in_srgb,var(--paper)_85%,transparent)_78%,transparent)] md:hidden"
        />

        {CHAPTERS.red.map((c) => (
          <ChapterBlock key={c.id} i={c.id} progress={scrollYProgress} active={chapter === c.id} reduced={reduced} />
        ))}

        <Bed progress={scrollYProgress} chapter={chapter} />

        <motion.div
          style={{ opacity: cue }}
          aria-hidden
          className={`${s.mono} pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11.5px] text-(--steel) md:flex`}
        >
          <span>Scroll to turn</span>
          <span className="relative h-10 w-px overflow-hidden bg-(--hair)">
            <span className={`${s.scrollCue} absolute inset-0 bg-(--ink)`} />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/** Line drawing of the billet, shown while the 3D lathe loads (and if WebGL is unavailable). */
function Blueprint({ hidden }: { hidden: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[8%] w-[78vw] -translate-x-1/2 transition-opacity duration-700 md:left-auto md:right-[9vw] md:top-1/2 md:w-[36vw] md:-translate-x-0 md:-translate-y-1/2"
      style={{ opacity: hidden ? 0 : 1 }}
    >
      <svg viewBox="0 0 400 220" className={`${s.draw} w-full text-(--ink)`} fill="none" stroke="currentColor">
        <path pathLength={1} d="M20 110 H380" strokeWidth="0.75" strokeDasharray="10 4 2 4" opacity="0.5" />
        <path pathLength={1} d="M62 62 H338 Q344 62 344 68 V152 Q344 158 338 158 H62 Q56 158 56 152 V68 Q56 62 62 62 Z" strokeWidth="1.25" />
        <path pathLength={1} className={s.late} d="M40 104 L56 110 L40 116 Z M360 104 L344 110 L360 116 Z" strokeWidth="1" />
        <path pathLength={1} className={s.late} d="M56 186 H344 M56 180 V192 M344 180 V192" strokeWidth="0.75" />
        <path pathLength={1} className={s.late} d="M372 62 V158 M366 62 H378 M366 158 H378" strokeWidth="0.75" />
      </svg>
      <div className={`${s.mono} mt-1 flex justify-between text-[11px] text-(--steel)`}>
        <span>
          <WT red="Billet, red heartwood" white="Billet, white heartwood" />
        </span>
        <span>300 × Ø 100 mm</span>
      </div>
    </div>
  );
}

function ChapterBlock({ i, progress, active, reduced }: { i: number; progress: MotionValue<number>; active: boolean; reduced: boolean }) {
  const a = (i + 0.12) / N;
  const b = (i + 0.24) / N;
  const c = (i + 0.84) / N;
  const d = (i + 0.94) / N;
  const input = i === 0 ? [0, c, d] : i === N - 1 ? [a, b, 1] : [a, b, c, d];
  const op = i === 0 ? [1, 1, 0] : i === N - 1 ? [0, 1, 1] : [0, 1, 1, 0];
  const dy = reduced ? input.map(() => 0) : i === 0 ? [0, 0, -40] : i === N - 1 ? [40, 0, 0] : [40, 0, 0, -40];
  const opacity = useTransform(progress, input, op);
  const y = useTransform(progress, input, dy);
  const textLeft = workSide(i) === 1;

  return (
    <motion.div
      style={{ opacity, y }}
      inert={!active}
      aria-hidden={!active}
      className={`absolute inset-x-0 bottom-0 px-4 pb-[84px] md:inset-y-0 md:flex md:items-center md:px-0 md:pb-0 ${
        textLeft ? "md:left-[max(2rem,5.5vw)] md:right-auto" : "md:left-auto md:right-[calc(max(2rem,5.5vw)+150px)]"
      }`}
    >
      <div className="w-full md:w-[min(35rem,40vw)]">
        <W
          red={i === 0 ? <Hero ch={CHAPTERS.red[0]} wood="red" reduced={reduced} /> : <ChapterText ch={CHAPTERS.red[i]} wood="red" />}
          white={i === 0 ? <Hero ch={CHAPTERS.white[0]} wood="white" reduced={reduced} /> : <ChapterText ch={CHAPTERS.white[i]} wood="white" />}
        />
      </div>
    </motion.div>
  );
}

function ShopAction({ ch, wood, primary = true }: { ch: Chapter; wood: Wood; primary?: boolean }) {
  const cls = primary ? s.btn : s.btnLine;
  if (ch.shop.to === "shop") {
    return (
      <Link href={`/d/01/shop?c=${ch.shop.cat}`} className={cls}>
        {ch.shop.label}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => scrollToId(ch.shop.to === "next" ? "ch-1" : "vault")}
      className={cls}
      aria-label={ch.shop.to === "edition" ? `${ch.shop.label}, ${CONTENT[wood].edition.name}` : undefined}
    >
      {ch.shop.label}
    </button>
  );
}

function ChapterText({ ch, wood }: { ch: Chapter; wood: Wood }) {
  return (
    <>
      <p className={`${s.mono} flex items-center gap-3 text-[12px] text-(--steel)`}>
        <span className="tabular-nums text-(--ink)">
          Chapter {ch.id + 1} of {N}
        </span>
        <span className="h-px w-8 bg-(--hair-2)" />
        <span>{ch.short}</span>
      </p>
      <h2 className={`${s.x125} mt-3 text-[clamp(1.9rem,3.6vw,3.6rem)] font-[560] leading-[0.95] tracking-[-0.02em] md:mt-5`}>
        <span className="block">{ch.title[0]}</span>
        <span className="block">{ch.title[1]}</span>
      </h2>
      <p className="mt-3 line-clamp-3 max-w-[32rem] text-[14px] leading-[1.5] text-(--ink-2) md:mt-5 md:line-clamp-none md:text-[16px] md:leading-[1.55]">
        {ch.body}
      </p>
      <ul className="mt-4 md:mt-7">
        {ch.picks.map((slug, k) => (
          <ProductRow key={slug} slug={slug} extra={k > 1} />
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 md:mt-6">
        <ShopAction ch={ch} wood={wood} />
        <Link href="/d/01/shop" className={`${s.link} hidden md:inline`}>
          All {productsFor(wood).length} {CONTENT[wood].name.toLowerCase()} pieces
        </Link>
      </div>
    </>
  );
}

function Hero({ ch, wood, reduced }: { ch: Chapter; wood: Wood; reduced: boolean }) {
  const other: Wood = wood === "red" ? "white" : "red";
  const c = CONTENT[wood];
  const rise = (k: number) =>
    reduced
      ? {}
      : {
          initial: { y: "105%" },
          animate: { y: "0%" },
          transition: { duration: 1.1, delay: 0.15 + k * 0.09, ease: EASE },
        };
  return (
    <>
      <h1 className={`${s.x125} text-[clamp(2.7rem,6vw,6.6rem)] font-[600] leading-[0.9] tracking-[-0.03em]`}>
        <span className="block overflow-hidden pb-[0.06em]">
          <motion.span className="block" {...rise(0)}>
            {ch.title[0]}
          </motion.span>
        </span>
        <span className="block overflow-hidden pb-[0.06em]">
          <motion.span className="block" {...rise(1)}>
            {ch.title[1]}
          </motion.span>
        </span>
      </h1>
      <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6, ease: EASE }}>
        <p className="mt-3 line-clamp-3 max-w-[30rem] text-[14px] leading-[1.5] text-(--ink-2) md:mt-7 md:line-clamp-none md:text-[17px] md:leading-[1.55]">
          {ch.body}
        </p>
        <div className="mt-4 flex max-w-[30rem] items-start gap-4 border-t border-(--hair) pt-3 md:mt-8 md:pt-5">
          <span aria-hidden className={`mt-1 size-9 shrink-0 rounded-full ${wood === "red" ? "ring-red" : "ring-white"} shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]`} />
          <p className="text-[14px] leading-[1.5] text-(--ink-2)">
            This billet is {c.name.toLowerCase()}, <em className="not-italic text-(--ink)">{c.latin}</em>.{" "}
            <span className="hidden md:inline">{c.oneLine} </span>
            <button type="button" onClick={() => switchWood(other)} className={`${s.link} whitespace-nowrap text-(--ink)`}>
              Turn it in {CONTENT[other].name.toLowerCase()}
            </button>
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-8">
          <ShopAction ch={ch} wood={wood} />
          <Link href="/d/01/shop" className={s.btnLine}>
            {c.hero.cta}
          </Link>
        </div>
      </motion.div>
    </>
  );
}

function ProductRow({ slug, extra }: { slug: string; extra: boolean }) {
  const p = getProduct(slug);
  if (!p) return null;
  const shot = shotsOf(p)[0];
  return (
    <li className={`group items-center gap-3 border-t border-(--hair) py-2.5 last:border-b md:gap-4 md:py-3 ${extra ? "hidden md:flex" : "flex"}`}>
      <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-(--paper-2) md:size-14">
        <Photo p={shot.photo} tone={shot.tone} sizes="56px" className="transition-transform duration-500 group-hover:scale-110" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-[520] md:text-[15.5px]">{p.name}</span>
        <RatingLine slug={p.slug} className="hidden md:flex" />
      </span>
      <span className={`${s.mono} shrink-0 text-[12.5px] tabular-nums md:text-[13px]`}>{priceLabel(p)}</span>
      <Link href={`/d/01/p/${p.slug}`} className={`${s.link} shrink-0`} aria-label={`View ${p.name}`}>
        View
      </Link>
    </li>
  );
}

/** The lathe bed: a vertical ruler at the right edge with a carriage that tracks the story, plus readouts. */
function Bed({ progress, chapter }: { progress: MotionValue<number>; chapter: number }) {
  const wood = useWood();
  const y = useTransform(progress, (v) => `${v * 100}%`);
  const dia = useTransform(progress, (v) => `Ø ${Math.round(readout(v, wood).dia)} mm`);
  const rpm = useTransform(progress, (v) => `${(Math.round(readout(v, wood).rpm / 10) * 10).toLocaleString("en-IN")} rpm`);
  const short = <WT red={CHAPTERS.red[chapter].short} white={CHAPTERS.white[chapter].short} />;
  const ticks = Array.from({ length: 66 }, (_, k) => k);
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute bottom-[16svh] right-5 top-[16svh] hidden w-10 md:block lg:right-7">
        <svg className="absolute inset-0 h-full w-full overflow-visible text-(--ink)" preserveAspectRatio="none" viewBox="0 0 40 650">
          <line x1="30" y1="0" x2="30" y2="650" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {ticks.map((k) => (
            <line
              key={k}
              x1={k % 10 === 0 ? 18 : k % 5 === 0 ? 22 : 26}
              x2="30"
              y1={k * 10}
              y2={k * 10}
              stroke="currentColor"
              strokeOpacity={k % 10 === 0 ? 0.6 : 0.3}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {[0, 100, 200, 300, 400, 500, 600].map((mm) => (
          <span key={mm} className={`${s.mono} absolute right-[14px] -translate-y-1/2 text-[9.5px] tabular-nums text-(--steel)`} style={{ top: `${(mm / 650) * 100}%` }}>
            {mm}
          </span>
        ))}
        <motion.div style={{ y }} className="absolute inset-x-0 top-0 h-full">
          <div className="absolute right-[10px] top-0 flex -translate-y-1/2 items-center">
            <div className="mr-2 w-[8.6rem] rounded-[3px] bg-(--ink) px-2.5 py-2 text-(--paper) shadow-[0_8px_20px_-10px_rgb(0_0_0/0.5)]">
              <p className={`${s.mono} flex items-center justify-between text-[11px] leading-[1.5] tabular-nums`}>
                <motion.span>{dia}</motion.span>
              </p>
              <p className={`${s.mono} text-[11px] leading-[1.5] tabular-nums opacity-70`}>
                <motion.span>{rpm}</motion.span>
              </p>
              <p className={`${s.mono} mt-1 flex items-center gap-1.5 border-t border-white/15 pt-1 text-[11px] leading-[1.5]`}>
                <span className="size-1.5 rounded-full bg-(--accent)" />
                <span className="tabular-nums">
                  {chapter + 1}/{N}
                </span>
                <span className="opacity-70">{short}</span>
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-(--ink)">
              <path d="M0 2 L12 8 L0 14 Z" fill="currentColor" />
              <line x1="12" y1="8" x2="16" y2="8" stroke="currentColor" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Phones: the same readouts in one line under the nav. */}
      <div
        aria-hidden
        className={`${s.mono} pointer-events-none absolute inset-x-4 top-[62px] z-10 flex items-center justify-between rounded-[3px] border border-(--hair) bg-(--glass) px-2.5 py-1.5 text-[11px] tabular-nums text-(--ink) backdrop-blur-sm md:hidden`}
      >
        <motion.span>{dia}</motion.span>
        <motion.span>{rpm}</motion.span>
        <span>
          {chapter + 1}/{N} {short}
        </span>
      </div>
    </>
  );
}
