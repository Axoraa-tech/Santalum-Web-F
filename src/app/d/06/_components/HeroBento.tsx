"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { WT } from "@/components/maison/W";
import { bagTotals, useBag } from "@/lib/cart";
import { formatINR, getFamily, getVariant } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { switchWood, useWood } from "@/lib/wood";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { cx, RECORDS, WOOD_SHORT } from "./data";
import { ClockTile } from "./hero/ClockTile";
import { GrainCanvas } from "./hero/GrainCanvas";
import { IndiaMap } from "./hero/IndiaMap";
import { LadderTile } from "./hero/LadderTile";
import { bagUI, heroBag, useAdded, views } from "./store";
import { Corner, IconBag } from "./ui";

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** A grid cell. The hero's tiles arrive once, in sequence: the page's one orchestrated moment. */
function Cell({ area, i, children, className }: { area: string; i: number; children: ReactNode; className?: string }) {
  return (
    <motion.div
      style={{ gridArea: area }}
      className={cx("relative min-w-0", className)}
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", visualDuration: 0.8, bounce: 0.12, delay: 0.05 + i * 0.06 }}
    >
      {children}
    </motion.div>
  );
}

export function HeroBento() {
  return (
    <section aria-label="Santalum Maison" className={cx(s.bento, s.hero)}>
      <Cell area="st" i={0}>
        <StatementTile />
      </Cell>
      <Cell area="gr" i={1}>
        <div className={cx(s.tile, "h-full min-h-[300px]")}>
          <GrainCanvas />
          <span className={cx(s.mono, "pointer-events-none absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[10.5px]")}>
            Bend the grain
          </span>
          <span className="pointer-events-none absolute bottom-2 left-2 right-2 rounded-[20px] bg-white px-3.5 py-2.5">
            <span className="block text-[15px] font-medium leading-tight tracking-[-0.02em]">
              <WT red="Red heartwood" white="White heartwood" />
            </span>
            <span className={cx(s.mono, s.muted, "block truncate text-[10.5px]")}>
              <WT red="Pterocarpus santalinus" white="Santalum album" />
            </span>
          </span>
        </div>
      </Cell>
      <Cell area="ck" i={2}>
        <div className={cx(s.tile, "h-full")}>
          <ClockTile />
        </div>
      </Cell>
      <Cell area="mp" i={3}>
        <div className={cx(s.tile, s.dark, "h-full")}>
          <IndiaMap />
        </div>
      </Cell>
      <Cell area="sw" i={4}>
        <SwitchTile />
      </Cell>
      <Cell area="pl" i={5}>
        <div className={cx(s.tile, "h-full")}>
          <LadderTile />
        </div>
      </Cell>
      <Cell area="pv" i={6}>
        <TickerTile />
      </Cell>
      <Cell area="bg" i={7}>
        <BagTile />
      </Cell>
    </section>
  );
}

/* ---------- statement ---------- */

function StatementTile() {
  const openStory = () => views.open({ kind: "story", id: "house", from: "hero-st", img: true });
  return (
    <motion.div layoutId="hero-st" style={{ borderRadius: 28 }} className={cx(s.tile, "flex h-full flex-col p-6 sm:p-8 lg:p-10")}>
      <h1 className={cx(s.display, "max-w-[10ch] text-[clamp(48px,13.4cqw,124px)]")}>Objects time cannot repeat.</h1>
      <div className="mt-auto grid items-end gap-6 pt-8 @min-[560px]:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div>
          <p className={cx(s.muted, "max-w-[34ch] text-[17px] leading-[1.5]")}>
            Red and white sandalwood, read for its grain, then shaped and finished by hand. Every piece carries its batch record.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" className={s.btn} onClick={() => scrollToId("collection")}>
              See the collection
            </button>
            <button type="button" className={s.ghost} onClick={openStory}>
              About the house
            </button>
          </div>
        </div>
        <div className={cx(s.inner, s.opener, "relative aspect-[4/3] overflow-hidden @min-[560px]:aspect-auto @min-[560px]:h-[min(250px,34cqw)]")}>
          <motion.div layoutId="hero-st-img" className="absolute inset-0" style={{ borderRadius: 20 }}>
            <div className={s.zoom}>
              <Photo p={PHOTOS.carving} priority sizes="(min-width:1024px) 22vw, 90vw" />
            </div>
          </motion.div>
          <Corner icon="expand" />
          <button type="button" className={s.hit} onClick={openStory} aria-label="Read about the house" />
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- the big wood switch ---------- */

const SWITCH: Record<Wood, { photo: typeof PHOTOS.redChip; sa: string; latin: string }> = {
  red: { photo: PHOTOS.redChip, sa: "रक्तचन्दन", latin: "Pterocarpus santalinus" },
  white: { photo: PHOTOS.whiteLog, sa: "श्वेतचन्दन", latin: "Santalum album" },
};

function SwitchTile() {
  const wood = useWood();
  const onKey = (e: KeyboardEvent) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      switchWood(wood === "red" ? "white" : "red");
    }
  };
  return (
    <div className={cx(s.tile, "flex h-full min-h-[280px] flex-col p-2")}>
      <div className="flex items-baseline justify-between gap-2 px-3 pb-3 pt-3">
        <p className="text-[20px] font-medium leading-none tracking-[-0.03em]">Choose the wood</p>
        <p className={cx(s.mono, s.muted, "text-[10.5px]")}>The house follows</p>
      </div>
      <div role="radiogroup" aria-label="Wood" className="flex min-h-0 flex-1 gap-2" onKeyDown={onKey}>
        {(["red", "white"] as const).map((w) => {
          const on = wood === w;
          return (
            <motion.button
              key={w}
              layout
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => !on && switchWood(w)}
              style={{ flexGrow: on ? 1.9 : 1, borderRadius: 20 }}
              className="group relative min-w-0 basis-0 overflow-hidden bg-[#f6f4f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] active:scale-[0.99]"
            >
              <motion.span layout className="absolute inset-0 block">
                <Photo p={SWITCH[w].photo} sizes="(min-width:1024px) 20vw, 60vw" className="transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]" />
              </motion.span>
              <motion.span layout="position" className="absolute bottom-2 left-2 right-2 block rounded-[14px] bg-white px-3 py-2 text-left">
                <span className="flex items-center gap-2">
                  <span
                    className={cx("size-2.5 shrink-0 rounded-full border", on ? "border-transparent bg-accent" : "border-[#141414]/30")}
                    aria-hidden
                  />
                  <span className="truncate text-[14px] font-medium">{on ? WOOD_SHORT[w] : w === "red" ? "Red" : "White"}</span>
                </span>
                {on && (
                  <span className={cx(s.mono, s.muted, "mt-0.5 block truncate text-[10px]")}>
                    {SWITCH[w].latin}, {SWITCH[w].sa}
                  </span>
                )}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- provenance ticker ---------- */

function TickerTile() {
  const [i, setI] = useState(0);
  const r = RECORDS[i];
  const open = () => views.open({ kind: "story", id: "provenance", from: "hero-pv", img: false });
  return (
    <motion.div layoutId="hero-pv" style={{ borderRadius: 28 }} className={cx(s.tile, s.pausable, s.opener, "flex h-full min-h-[210px] flex-col p-5")}>
      <div className="flex items-center gap-2 pr-11">
        <p className="text-[17px] font-medium leading-none tracking-[-0.02em]">Batch records</p>
        <span className={cx(s.mono, "rounded-full bg-accent-soft px-2 py-1 text-[10px]")}>Example</span>
      </div>
      <Corner />
      <div className="relative mt-4 flex-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.dl
            key={r.batch}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -26 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[12px]"
          >
            <dt className={cx(s.mono, s.muted, "text-[10.5px] leading-[18px]")}>Piece</dt>
            <dd className="truncate text-[14px] font-medium leading-[18px]">{r.piece}</dd>
            <dt className={cx(s.mono, s.muted, "text-[10.5px] leading-[18px]")}>Batch</dt>
            <dd className={cx(s.mono, "leading-[18px] text-accent")}>{r.batch}</dd>
            <dt className={cx(s.mono, s.muted, "text-[10.5px] leading-[18px]")}>Wood</dt>
            <dd className="truncate leading-[18px]">{WOOD_SHORT[r.wood]}</dd>
            <dt className={cx(s.mono, s.muted, "hidden text-[10.5px] leading-[18px] @min-[300px]:block")}>Origin</dt>
            <dd className="hidden truncate leading-[18px] @min-[300px]:block">{r.origin}</dd>
            <dt className={cx(s.mono, s.muted, "text-[10.5px] leading-[18px]")}>Finished</dt>
            <dd className={cx(s.mono, "leading-[18px]")}>
              {r.finished}, {r.artisan}
            </dd>
          </motion.dl>
        </AnimatePresence>
      </div>
      <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-[#ebe8e2]">
        <span
          key={i}
          className={cx(s.bar, "block h-full rounded-full bg-[#141414]")}
          style={{ "--dur": "3.8s" } as CSSProperties}
          onAnimationEnd={() => setI((n) => (n + 1) % RECORDS.length)}
        />
      </div>
      <button type="button" className={s.hit} onClick={open} aria-label="How batch records work" />
    </motion.div>
  );
}

/* ---------- the bag, as a tile ---------- */

function BagTile() {
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const bump = useAdded();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => heroBag.set(e.intersectionRatio >= 0.5), { threshold: [0, 0.5, 1] });
    io.observe(el);
    return () => {
      io.disconnect();
      heroBag.set(false);
    };
  }, []);

  const thumbs = lines.slice(-3).map((l) => ({ key: `${l.slug}-${l.wood}-${l.custom ?? ""}`, v: getVariant(l.slug, l.wood), f: getFamily(l.slug) }));

  return (
    <div ref={ref} className="h-full">
      <motion.div layoutId="bag-hero" style={{ borderRadius: 28 }} className={cx(s.tile, s.tint, s.opener, "h-full min-h-[96px]")}>
        <div className="flex h-full flex-col items-start justify-between gap-3 p-3 @min-[260px]:flex-row @min-[260px]:items-center @min-[260px]:justify-start @min-[260px]:pr-14">
        <span className="flex shrink-0 -space-x-4">
          {thumbs.length ? (
            thumbs.map((t) =>
              t.v ? (
                <span key={t.key} className="relative size-14 overflow-hidden rounded-[16px] ring-[3px] ring-accent-soft">
                  <Photo p={t.v.shots[0].photo} tone={t.v.shots[0].tone} sizes="56px" />
                </span>
              ) : null,
            )
          ) : (
            <span className="grid size-14 place-items-center rounded-[16px] bg-white">
              <IconBag size={22} />
            </span>
          )}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="text-[17px] font-medium leading-tight tracking-[-0.02em]">Bag</span>
            <motion.span
              key={bump}
              initial={{ scale: bump ? 1.6 : 1 }}
              animate={{ scale: 1 }}
              className={cx(s.mono, "grid h-5 min-w-5 place-items-center rounded-full bg-[#141414] px-1.5 text-[10px] text-white")}
            >
              {count}
            </motion.span>
          </span>
          <span className={cx(s.mono, s.muted, "block truncate text-[11px]")}>{count ? formatINR(subtotal) : "Nothing yet"}</span>
        </span>
        </div>
        <Corner />
        <button type="button" className={s.hit} onClick={() => bagUI.open("bag-hero")} aria-label={`Open bag, ${count} ${count === 1 ? "piece" : "pieces"}`} />
      </motion.div>
    </div>
  );
}
