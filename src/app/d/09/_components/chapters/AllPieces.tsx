"use client";

import { motion, transform } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, featured, priceLabel, productsFor, type Product } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { CATEGORY_MIN, SKIES, T, hhmm, hourOf, word } from "../data";
import { Lines } from "../Lines";
import { Hour } from "../SceneSun";
import { openPiece } from "../store";
import { CardRating } from "../Stars";

const SHAPES = ["circle", "arch", "pebble", "egg"] as const;
const SUN_AT = { red: transform(T, SKIES.red.sun), white: transform(T, SKIES.white.sun) };

/** A few of the wood's pieces, laid along its day. The rest are in the shop. */
function picks(wood: Wood) {
  return [...featured(wood)].sort((a, b) => hourOf(a.slug).min - hourOf(b.slug).min);
}

const COPY = {
  red: {
    lead: "from the powder at first light to the cuff at dusk",
    shopLine: "Beads, desk objects, powder, jewellery and gifts, each with its batch record.",
  },
  white: {
    lead: "from the chandan stone before sunrise to the Reserve at dusk",
    shopLine: "Oil and attar, incense, chandan, beads and Mysuru carving, each with its lot.",
  },
} as const;

function Item({ p, i, top, active, onActive }: { p: Product; i: number; top: boolean; active: boolean; onActive: () => void }) {
  const sh = p.shots[0];
  const shape = SHAPES[i % SHAPES.length];
  return (
    <div
      style={{ gridColumn: i + 1, gridRow: top ? 1 : 3 }}
      onMouseEnter={onActive}
      onFocus={onActive}
      className={`flex w-[clamp(150px,12vw,190px)] flex-col items-center justify-self-center text-center ${top ? "flex-col-reverse self-end" : "self-start"}`}
    >
      <button
        type="button"
        onClick={() => openPiece(p.slug)}
        aria-label={`Open ${p.name}`}
        className={`${s.press} ${s.mask} ${s[shape]} aspect-square w-[clamp(104px,9vw,148px)] transition-shadow duration-500 ${
          active ? "shadow-[0_24px_40px_-22px_rgb(42_36_32/0.6)]" : ""
        }`}
      >
        <span className={`${s.zoom} absolute inset-0`}>
          <Photo p={sh.photo} tone={sh.tone} sizes="150px" />
        </span>
      </button>
      <div className={top ? "mb-4" : "mt-4"}>
        <p className={`${s.display} text-[19px] leading-[1.05] xl:text-[21px]`}>{p.name}</p>
        <p className={`${s.tab} mt-1 text-[13px] text-[var(--muted)]`}>{priceLabel(p)}</p>
        <CardRating slug={p.slug} className="mt-1 justify-center" />
        <br />
        <Link href={`/d/09/p/${p.slug}`} className={`${s.link} mt-1.5`}>
          View
        </Link>
      </div>
    </div>
  );
}

function Strip({ wood }: { wood: Wood }) {
  const list = picks(wood);
  const n = list.length;
  const [active, setActive] = useState(0);
  const activeMin = hourOf(list[active]?.slug ?? "").min;

  return (
    <>
      {/* wide screens: a strip of the day, pieces above and below the line at their hours */}
      <div className="relative mt-16 hidden lg:grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gridTemplateRows: "auto 92px auto" }}>
        {list.map((p, i) => (
          <Item key={p.slug} p={p} i={i} top={i % 2 === 0} active={i === active} onActive={() => setActive(i)} />
        ))}
        <div aria-hidden className="relative" style={{ gridColumn: "1 / -1", gridRow: 2 }}>
          <span className="absolute inset-x-0 top-1/2 h-px bg-[rgb(42_36_32/0.2)]" />
          {list.map((p, i) => {
            const on = i === active;
            return (
              <span key={p.slug} className="absolute top-1/2" style={{ left: `${((i + 0.5) / n) * 100}%` }}>
                <span className="absolute left-0 top-0 h-3 w-px -translate-y-1/2 bg-[rgb(42_36_32/0.35)]" />
                <span
                  className={`${s.tab} absolute left-0 -translate-x-1/2 whitespace-nowrap text-[12px] transition-colors duration-300 ${
                    i % 2 === 0 ? "top-4" : "bottom-4"
                  } ${on ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}
                >
                  {hhmm(hourOf(p.slug).min)}
                </span>
              </span>
            );
          })}
          <motion.span
            className="absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_5px_rgb(251_248_243/0.7)]"
            initial={false}
            animate={{ left: `${((active + 0.5) / n) * 100}%`, backgroundColor: SUN_AT[wood](activeMin) }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
          />
        </div>
      </div>

      {/* phones and tablets: the same day as a list along a line */}
      <ol className="relative mt-12 border-l border-[rgb(42_36_32/0.2)] pl-5 lg:hidden">
        {list.map((p, i) => {
          const sh = p.shots[0];
          return (
            <li key={p.slug} className="relative flex items-center gap-4 py-3.5">
              <span aria-hidden className="absolute -left-[25px] top-1/2 size-[9px] -translate-y-1/2 rounded-full border border-[rgb(42_36_32/0.35)] bg-[var(--paper)]" />
              <button
                type="button"
                onClick={() => openPiece(p.slug)}
                aria-label={`Open ${p.name}`}
                className={`${s.press} ${s.mask} ${s[SHAPES[i % SHAPES.length]]} size-[76px] shrink-0 sm:size-24`}
              >
                <Photo p={sh.photo} tone={sh.tone} sizes="96px" />
              </button>
              <div className="min-w-0 flex-1">
                <p className={`${s.tab} text-[12px] text-[var(--muted)]`}>{hhmm(hourOf(p.slug).min)}</p>
                <p className={`${s.display} text-[21px] leading-[1.05]`}>{p.name}</p>
                <p className={`${s.tab} mt-0.5 text-[13px] text-[var(--muted)]`}>{priceLabel(p)}</p>
                <CardRating slug={p.slug} className="mt-0.5" />
              </div>
              <Link href={`/d/09/p/${p.slug}`} className={`${s.link} shrink-0`}>
                View
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/** The way into the shop: every category of this wood at the hour its day reaches it, and the full count. */
function ToShop({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  const total = productsFor(wood).length;
  const cats = [...CATEGORIES[wood]].sort((a, b) => CATEGORY_MIN[a.id] - CATEGORY_MIN[b.id]);
  return (
    <div className="mt-16 grid gap-10 border-t border-[var(--hair)] pt-10 lg:mt-20 lg:grid-cols-12 lg:gap-8">
      <Link href="/d/09/shop" className="group block lg:col-span-5">
        <span className="block text-[14px] text-[var(--muted)]">The rest of the {c.short.toLowerCase()} day</span>
        <span className={`${s.display} mt-2 block text-[clamp(2.4rem,6vw,4.2rem)] leading-[0.95] transition-colors duration-300 group-hover:text-[var(--m-accent)]`}>
          All {total} {c.name.toLowerCase()} pieces
        </span>
        <span className="mt-4 flex items-center gap-4">
          <span className="relative h-px flex-1 overflow-hidden bg-[var(--hair)]">
            <span className="absolute inset-y-0 left-0 w-full origin-left scale-x-[0.18] bg-[var(--ink)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100" />
          </span>
          <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--hair)] transition-colors duration-300 group-hover:border-[var(--ink)] group-hover:bg-[var(--m-accent-soft)]">
            <span className="size-3 rounded-full bg-[var(--m-accent)] transition-transform duration-500 group-hover:scale-125" />
          </span>
        </span>
        <span className="mt-4 block max-w-[28rem] text-[16px] leading-[1.65] text-[var(--muted)]">{COPY[wood].shopLine}</span>
      </Link>
      <nav aria-label={`${c.name} by category`} className="lg:col-span-6 lg:col-start-7">
        <p className="text-[14px] text-[var(--muted)]">Or start at an hour</p>
        <ul className="mt-4 border-t border-[var(--hair)]">
          {cats.map((cat) => (
            <li key={cat.id} className="border-b border-[var(--hair)]">
              <Link
                href={`/d/09/shop?c=${cat.id}`}
                className="group grid grid-cols-[3.6rem_1fr_auto] items-baseline gap-x-4 py-3.5 transition-colors hover:text-[var(--m-accent)] active:opacity-70"
              >
                <span className={`${s.tab} text-[13px] text-[var(--muted)]`}>{hhmm(CATEGORY_MIN[cat.id])}</span>
                <span>
                  <span className={`${s.display} block text-[23px] leading-tight lg:text-[26px]`}>{cat.label}</span>
                  <span className="mt-0.5 block text-[14px] leading-snug text-[var(--muted)]">{cat.line}</span>
                </span>
                <span className={`${s.tab} text-[13px] text-[var(--muted)]`}>{productsFor(wood).filter((p) => p.category === cat.id).length}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function Head({ wood }: { wood: Wood }) {
  const n = picks(wood).length;
  const total = productsFor(wood).length;
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
      <div className="lg:col-span-6">
        <Hour min={1145} />
        <Lines
          lines={[`${word(n)} pieces,`, "by the hour"]}
          className={`${s.display} mt-1 text-[clamp(3rem,13vw,4.6rem)] leading-[0.92] lg:text-[min(6vw,6.6rem)]`}
        />
      </div>
      <p className="max-w-[32rem] text-[17px] leading-[1.7] text-[var(--muted)] lg:col-span-5 lg:col-start-8 lg:pb-2">
        {word(n)} of the {word(total).toLowerCase()} {CONTENT[wood].name.toLowerCase()} pieces, each at the hour it is used, {COPY[wood].lead}.
        <span className="hidden lg:inline"> Point at one to move the sun to its hour.</span>
      </p>
    </div>
  );
}

/** Evening: the day's chosen pieces in order, then the door to the shop. */
export function AllPieces() {
  return (
    <div id="all-pieces" className="scroll-mt-24">
      <W red={<Head wood="red" />} white={<Head wood="white" />} />
      <W red={<Strip wood="red" />} white={<Strip wood="white" />} />
      <W red={<ToShop wood="red" />} white={<ToShop wood="white" />} />
    </div>
  );
}
