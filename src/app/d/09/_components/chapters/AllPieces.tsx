"use client";

import { motion, transform } from "motion/react";
import { useState } from "react";
import { WT, W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { formatINR, type Family } from "@/lib/catalog";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { BY_HOUR, SUN, T, hhmm, hourOf } from "../data";
import { Lines } from "../Lines";
import { openPiece } from "../store";

const SHAPES = ["circle", "arch", "pebble", "egg"] as const;
const sunAt = transform(T, SUN);
const WORDS = ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

function Item({ f, wood, i, top, active, onActive }: { f: Family; wood: Wood; i: number; top: boolean; active: boolean; onActive: () => void }) {
  const v = f.variants[wood]!;
  const sh = v.shots[0];
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
        onClick={() => openPiece(f.slug)}
        aria-label={`Open ${f.name}`}
        className={`${s.press} ${s.mask} ${s[shape]} aspect-square w-[clamp(104px,9vw,148px)] transition-shadow duration-500 ${
          active ? "shadow-[0_24px_40px_-22px_rgb(42_36_32/0.6)]" : ""
        }`}
      >
        <span className={`${s.zoom} absolute inset-0`}>
          <Photo p={sh.photo} tone={sh.tone} sizes="150px" />
        </span>
      </button>
      <div className={top ? "mb-4" : "mt-4"}>
        <p className={`${s.display} text-[19px] leading-[1.05] xl:text-[21px]`}>{f.name}</p>
        <p className={`${s.tab} mt-1 text-[13px] text-[var(--muted)]`}>{formatINR(v.price)}</p>
        <button type="button" onClick={() => openPiece(f.slug)} className={`${s.link} mt-1.5`}>
          Open
        </button>
      </div>
    </div>
  );
}

function Strip({ wood }: { wood: Wood }) {
  const list = BY_HOUR.filter((f) => f.variants[wood]);
  const n = list.length;
  const [active, setActive] = useState(0);
  const activeMin = hourOf(list[active]?.slug ?? "").min;

  return (
    <>
      {/* wide screens: a strip of the day, pieces above and below the line at their hours */}
      <div
        className="relative mt-16 hidden lg:grid"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gridTemplateRows: "auto 92px auto" }}
      >
        {list.map((f, i) => (
          <Item key={f.slug} f={f} wood={wood} i={i} top={i % 2 === 0} active={i === active} onActive={() => setActive(i)} />
        ))}
        <div aria-hidden className="relative" style={{ gridColumn: "1 / -1", gridRow: 2 }}>
          <span className="absolute inset-x-0 top-1/2 h-px bg-[rgb(42_36_32/0.2)]" />
          {list.map((f, i) => {
            const m = hourOf(f.slug).min;
            const on = i === active;
            return (
              <span key={f.slug} className="absolute top-1/2" style={{ left: `${((i + 0.5) / n) * 100}%` }}>
                <span className="absolute left-0 top-0 h-3 w-px -translate-y-1/2 bg-[rgb(42_36_32/0.35)]" />
                <span
                  className={`${s.tab} absolute left-0 -translate-x-1/2 whitespace-nowrap text-[12px] transition-colors duration-300 ${
                    i % 2 === 0 ? "top-4" : "bottom-4"
                  } ${on ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}
                >
                  {hhmm(m)}
                </span>
              </span>
            );
          })}
          <motion.span
            className="absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_5px_rgb(251_248_243/0.7)]"
            initial={false}
            animate={{ left: `${((active + 0.5) / n) * 100}%`, backgroundColor: sunAt(activeMin) }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
          />
        </div>
      </div>

      {/* phones and tablets: the same day as a list along a line */}
      <ol className="relative mt-12 border-l border-[rgb(42_36_32/0.2)] pl-5 lg:hidden">
        {list.map((f, i) => {
          const v = f.variants[wood]!;
          const sh = v.shots[0];
          return (
            <li key={f.slug} className="relative flex items-center gap-4 py-3.5">
              <span aria-hidden className="absolute -left-[25px] top-1/2 size-[9px] -translate-y-1/2 rounded-full border border-[rgb(42_36_32/0.35)] bg-[var(--paper)]" />
              <button
                type="button"
                onClick={() => openPiece(f.slug)}
                aria-label={`Open ${f.name}`}
                className={`${s.press} ${s.mask} ${s[SHAPES[i % SHAPES.length]]} size-[76px] shrink-0 sm:size-24`}
              >
                <Photo p={sh.photo} tone={sh.tone} sizes="96px" />
              </button>
              <div className="min-w-0 flex-1">
                <p className={`${s.tab} text-[12px] text-[var(--muted)]`}>{hhmm(hourOf(f.slug).min)}</p>
                <p className={`${s.display} text-[21px] leading-[1.05]`}>{f.name}</p>
                <p className={`${s.tab} mt-0.5 text-[13px] text-[var(--muted)]`}>{formatINR(v.price)}</p>
              </div>
              <button type="button" onClick={() => openPiece(f.slug)} className={`${s.link} shrink-0`}>
                Open
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/** Every family made in the current wood, laid along the day at the hour each one is used. */
export function AllPieces() {
  const red = BY_HOUR.filter((f) => f.variants.red).length;
  const white = BY_HOUR.filter((f) => f.variants.white).length;
  return (
    <div id="all-pieces" className="scroll-mt-24">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="lg:col-span-6">
          <p className={`${s.display} ${s.tab} text-[26px] text-[var(--muted)] lg:text-[30px]`}>19:05</p>
          <Lines lines={["All pieces,", "by the hour"]} className={`${s.display} mt-1 text-[clamp(3rem,13vw,4.6rem)] leading-[0.92] lg:text-[min(6vw,6.6rem)]`} />
        </div>
        <p className="max-w-[32rem] text-[17px] leading-[1.7] text-[var(--muted)] lg:col-span-5 lg:col-start-8 lg:pb-2">
          <WT
            red={`${WORDS[red] ?? red} pieces are made in red sandalwood.`}
            white={`${WORDS[white] ?? white} pieces are made in white sandalwood.`}
          />{" "}
          Each sits at the hour it is used, from the powder at first light to the cuff at dusk.
          <span className="hidden lg:inline"> Point at one to move the sun to its hour; open it to read its ritual card.</span>
        </p>
      </div>
      <W red={<Strip wood="red" />} white={<Strip wood="white" />} />
    </div>
  );
}
