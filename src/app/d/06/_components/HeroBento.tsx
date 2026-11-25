"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import { bagSummary, useBag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { switchWood, useWood } from "@/lib/wood";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { BATCH_WORD, cx, RECORDS, shotsOf } from "./data";
import { ClockTile } from "./hero/ClockTile";
import { GrainCanvas } from "./hero/GrainCanvas";
import { IndiaMap } from "./hero/IndiaMap";
import { LadderTile } from "./hero/LadderTile";
import { bagUI, useAdded, views } from "./store";
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
        <W red={<StatementTile wood="red" />} white={<StatementTile wood="white" />} />
      </Cell>
      <Cell area="gr" i={1}>
        <div className={cx(s.tile, "h-full min-h-[300px]")}>
          <GrainCanvas />
          <span className={cx(s.mono, "pointer-events-none absolute left-3 top-3 rounded-full bg-[var(--b-tile)] px-3 py-1.5 text-[10.5px]")}>
            <WT red="Bend the grain" white="Part the grain" />
          </span>
          <span className="pointer-events-none absolute bottom-2 left-2 right-2 rounded-[20px] bg-[var(--b-tile)] px-3.5 py-2.5">
            <span className="block text-[15px] font-medium leading-tight tracking-[-0.02em]">
              <WT red="Red heartwood, near black at the core" white="White heartwood, where the oil sits" />
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
        <W
          red={
            <div className={cx(s.tile, "h-full")}>
              <LadderTile wood="red" />
            </div>
          }
          white={
            <div className={cx(s.tile, "h-full")}>
              <LadderTile wood="white" />
            </div>
          }
        />
      </Cell>
      <Cell area="pv" i={6}>
        <W red={<TickerTile wood="red" />} white={<TickerTile wood="white" />} />
      </Cell>
      <Cell area="bg" i={7}>
        <BagTile />
      </Cell>
    </section>
  );
}

/* ---------- statement ---------- */

const STATEMENT: Record<Wood, { photo: typeof PHOTOS.carving; size: string; about: string }> = {
  red: { photo: PHOTOS.carving, size: "max-w-[10ch] text-[clamp(48px,13.4cqw,124px)]", about: "About the house" },
  white: { photo: PHOTOS.oilHands, size: "max-w-[11ch] text-[clamp(44px,10.6cqw,100px)]", about: "About the oil" },
};

function StatementTile({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  const id = `hero-st-${wood}`;
  const openStory = () => views.open({ kind: "story", id: "house", from: id, img: true });
  return (
    <motion.div layoutId={id} style={{ borderRadius: 28 }} className={cx(s.tile, "flex h-full flex-col p-6 sm:p-8 lg:p-10")}>
      <h1 className={cx(s.display, STATEMENT[wood].size)}>{c.hero.title}</h1>
      <div className="mt-auto grid items-end gap-6 pt-8 @min-[560px]:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div>
          <p className={cx(s.muted, "max-w-[40ch] text-[17px] leading-[1.5]")}>{c.hero.sub}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/d/06/shop" className={s.btn}>
              {c.hero.cta}
            </Link>
            <button type="button" className={s.ghost} onClick={openStory}>
              {STATEMENT[wood].about}
            </button>
          </div>
        </div>
        <div className={cx(s.inner, s.opener, "relative aspect-[4/3] overflow-hidden @min-[560px]:aspect-auto @min-[560px]:h-[min(250px,34cqw)]")}>
          <motion.div layoutId={`${id}-img`} className="absolute inset-0" style={{ borderRadius: 20 }}>
            <div className={s.zoom}>
              <Photo p={STATEMENT[wood].photo} priority={wood === "red"} sizes="(min-width:1024px) 22vw, 90vw" />
            </div>
          </motion.div>
          <Corner icon="expand" />
          <button type="button" className={s.hit} onClick={openStory} aria-label={wood === "red" ? "Read about the house" : "Read about the oil and the house"} />
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- the big wood switch ---------- */

const SWITCH: Record<Wood, { photo: typeof PHOTOS.redChip }> = {
  red: { photo: PHOTOS.redChip },
  white: { photo: PHOTOS.whiteLog },
};

/**
 * One switch for the whole house. The current wood's panel is wider; CSS decides which from
 * <html data-wood>, so it is right before hydration and eases when the wood changes.
 */
function SwitchTile() {
  const wood = useWood();
  const hydrated = useHydrated();
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
        <p className={cx(s.mono, s.muted, "text-[10.5px]")}>
          <WT red="The house is red" white="The house is white" />
        </p>
      </div>
      <div role="radiogroup" aria-label="Wood" className="flex min-h-0 flex-1 gap-2" onKeyDown={onKey}>
        {(["red", "white"] as const).map((w) => {
          const on = hydrated && wood === w;
          const c = CONTENT[w];
          const full = (
            <span className="block">
              <span className="block truncate text-[14px] font-medium">{c.name}</span>
              <span className={cx(s.mono, s.muted, "mt-0.5 block truncate text-[10px]")}>
                {c.latin}, {c.sanskrit}
              </span>
            </span>
          );
          const short = <span className="block truncate text-[14px] font-medium">{c.short}</span>;
          return (
            <button
              key={w}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={!hydrated || on ? 0 : -1}
              onClick={() => wood !== w && switchWood(w)}
              style={{ borderRadius: 20 }}
              className={cx(
                "b6-sw",
                `b6-sw-${w}`,
                "group relative min-w-0 overflow-hidden bg-[var(--b-tile2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--b-ink)] active:scale-[0.99]",
              )}
            >
              <span className="absolute inset-0 block">
                <Photo p={SWITCH[w].photo} sizes="(min-width:1024px) 20vw, 60vw" className="transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]" />
              </span>
              <span className="absolute bottom-2 left-2 right-2 flex items-start gap-2 rounded-[14px] bg-[var(--b-tile)] px-3 py-2 text-left">
                <span className="b6-swdot mt-[5px] size-2.5 shrink-0 rounded-full" aria-hidden />
                <span className="min-w-0 flex-1">
                  {w === "red" ? <WT red={full} white={short} /> : <WT red={short} white={full} />}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- provenance ticker ---------- */

function TickerTile({ wood }: { wood: Wood }) {
  const [i, setI] = useState(0);
  const list = RECORDS[wood];
  const r = list[i];
  const id = `hero-pv-${wood}`;
  const open = () => views.open({ kind: "story", id: "provenance", from: id, img: false });
  return (
    <motion.div layoutId={id} style={{ borderRadius: 28 }} className={cx(s.tile, s.pausable, s.opener, "flex h-full min-h-[210px] flex-col p-5")}>
      <div className="flex items-center gap-2 pr-11">
        <p className="text-[17px] font-medium leading-none tracking-[-0.02em]">{wood === "red" ? "Batch records" : "Lot records"}</p>
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
            <dt className={cx(s.mono, s.muted, "text-[10.5px] leading-[18px]")}>{BATCH_WORD[wood]}</dt>
            <dd className={cx(s.mono, "leading-[18px] text-accent")}>{r.batch}</dd>
            <dt className={cx(s.mono, s.muted, "text-[10.5px] leading-[18px]")}>Origin</dt>
            <dd className="truncate leading-[18px]">{r.origin}</dd>
            <dt className={cx(s.mono, s.muted, "text-[10.5px] leading-[18px]")}>{r.verb}</dt>
            <dd className={cx(s.mono, "truncate leading-[18px]")}>
              {r.date}, {r.by}
            </dd>
          </motion.dl>
        </AnimatePresence>
      </div>
      <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-[var(--b-track)]">
        <span
          key={i}
          className={cx(s.bar, "block h-full rounded-full bg-[var(--b-ink)]")}
          style={{ "--dur": "3.8s" } as CSSProperties}
          onAnimationEnd={() => setI((n) => (n + 1) % list.length)}
        />
      </div>
      <button type="button" className={s.hit} onClick={open} aria-label={wood === "red" ? "How batch records work" : "How lot records work"} />
    </motion.div>
  );
}

/* ---------- the bag, as a tile ---------- */

function BagTile() {
  const lines = useBag();
  const hydrated = useHydrated();
  const { count, subtotal } = bagSummary(hydrated ? lines : []);
  const bump = useAdded();

  const thumbs = (hydrated ? lines : []).slice(-3).map((l) => ({ key: l.key, p: getProduct(l.slug) }));

  return (
    <div className="h-full">
      <motion.div layoutId="bag-hero" style={{ borderRadius: 28 }} className={cx(s.tile, s.tint, s.opener, "h-full min-h-[96px]")}>
        <div className="flex h-full flex-col items-start justify-between gap-3 p-3 @min-[260px]:flex-row @min-[260px]:items-center @min-[260px]:justify-start @min-[260px]:pr-14">
          <span className="flex shrink-0 -space-x-4">
            {thumbs.length ? (
              thumbs.map((t) =>
                t.p ? (
                  <span key={t.key} className="relative size-14 overflow-hidden rounded-[16px] ring-[3px] ring-accent-soft">
                    <Photo p={shotsOf(t.p)[0].photo} tone={shotsOf(t.p)[0].tone} sizes="56px" />
                  </span>
                ) : null,
              )
            ) : (
              <span className="grid size-14 place-items-center rounded-[16px] bg-[var(--b-tile)]">
                <IconBag size={22} />
              </span>
            )}
          </span>
          <span className="w-full min-w-0 @min-[260px]:w-auto">
            <span className="flex items-center gap-2">
              <span className="text-[17px] font-medium leading-tight tracking-[-0.02em]">Bag</span>
              <motion.span
                key={bump}
                initial={{ scale: bump ? 1.6 : 1 }}
                animate={{ scale: 1 }}
                className={cx(s.mono, "grid h-5 min-w-5 place-items-center rounded-full bg-[var(--b-ink)] px-1.5 text-[10px] text-white")}
              >
                {count}
              </motion.span>
            </span>
            <span className={cx(s.mono, s.muted, "mt-0.5 block text-[11px] leading-snug @min-[260px]:truncate")}>
              {count ? formatINR(subtotal) : <WT red="Empty. Most begin with a key fob." white="Empty. Most begin with incense." />}
            </span>
          </span>
        </div>
        <Corner />
        <button type="button" className={s.hit} onClick={() => bagUI.open("bag-hero")} aria-label={`Open bag, ${count} ${count === 1 ? "piece" : "pieces"}`} />
      </motion.div>
    </div>
  );
}
