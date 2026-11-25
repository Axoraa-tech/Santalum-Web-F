"use client";

import { useMotionValue, useMotionValueEvent } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { W } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import { getProduct } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { word } from "../data";
import { Lines } from "../Lines";
import { Hour, SceneSun } from "../SceneSun";
import { PieceTag } from "../PieceTag";
import { Chapter, Cut, Layer, useScene } from "../Scene";
import { Smoke } from "../Smoke";

/** `n` points around the outline of an arch niche (aspect 3:4), from bottom left, over the top, to bottom right. */
function archPoints(n: number) {
  const H = 4 / 3;
  const R = 0.5 + 0.09;
  const cx = 0.5;
  const cy = 0.5;
  const yb = H * 0.95;
  const side = yb - cy;
  const arc = Math.PI * R;
  const L = side * 2 + arc;
  return Array.from({ length: n }, (_, k) => {
    const d = ((k + 0.5) / n) * L;
    let x: number;
    let y: number;
    if (d < side) {
      x = cx - R;
      y = yb - d;
    } else if (d < side + arc) {
      const a = Math.PI - (d - side) / R;
      x = cx + R * Math.cos(a);
      y = cy - R * Math.sin(a);
    } else {
      x = cx + R;
      y = cy + (d - side - arc);
    }
    return { left: `${(x * 100).toFixed(2)}%`, top: `${((y / H) * 100).toFixed(2)}%` };
  });
}

/** The two dusks. Red: the lathe stops and the Vault opens. White: the lamp is lit, and the Reserve. */
const DUSK = {
  red: {
    lines: ["Dusk, and", "the lathe is still"],
    edition: CONTENT.red.edition,
    arch: PHOTOS.turned,
    pieces: ["r-vault-cuff", "r-heirloom-casket"],
  },
  white: {
    lines: ["Dusk, and", "the lamp is lit"],
    edition: CONTENT.white.edition,
    arch: PHOTOS.diyaHands,
    pieces: ["w-reserve-oil", "w-incense-sticks"],
  },
} as const;

const POINTS = { red: archPoints(21), white: archPoints(50) };

/**
 * The numbers of the edition around the niche. As the scene holds they light one by one,
 * up to the numbers already placed; the ones that stay dark are the ones that remain.
 */
function Lamps({ wood }: { wood: Wood }) {
  const ctx = useScene();
  const fallback = useMotionValue(0);
  const ed = getProduct(DUSK[wood].edition.productSlug)?.edition ?? { size: DUSK[wood].edition.size, left: 0 };
  const placed = ed.size - ed.left;
  const [lit, setLit] = useState(0);
  useMotionValueEvent(ctx?.pin ?? fallback, "change", (v) => {
    const next = Math.round(Math.min(1, Math.max(0, v * 1.4)) * placed);
    setLit((prev) => (prev === next ? prev : next));
  });
  const numbered = ed.size <= 30;
  return (
    <ol aria-hidden className="absolute inset-0">
      {POINTS[wood].map((pos, i) => {
        const on = i < lit;
        return (
          <li
            key={i}
            style={pos}
            className={`${s.tab} absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-[background-color,color,border-color] duration-700 ${
              numbered ? "size-[22px] text-[10px] lg:size-[26px] lg:text-[11px]" : "size-[11px] lg:size-[13px]"
            } ${
              on
                ? "border border-[var(--m-accent)] bg-[var(--m-accent)] text-[var(--paper)]"
                : "border border-[rgb(42_36_32/0.2)] bg-[rgb(251_248_243/0.7)] text-[var(--muted)]"
            }`}
          >
            {numbered ? i + 1 : null}
          </li>
        );
      })}
    </ol>
  );
}

function Niche({ wood }: { wood: Wood }) {
  return (
    <>
      {wood === "white" && <Smoke className="absolute -top-[46%] left-[20%] h-[92%] w-[60%]" originX={0.5} originY={1} strength={1.1} />}
      <Cut photo={DUSK[wood].arch} tone={wood === "red" ? "red" : undefined} shape="arch" className="size-full" sizes="(min-width: 1024px) 30vw, 68vw" />
      <Lamps wood={wood} />
    </>
  );
}

function Words({ wood }: { wood: Wood }) {
  const d = DUSK[wood];
  const ed = getProduct(d.edition.productSlug)?.edition;
  return (
    <>
      <Hour min={1100} />
      <Lines lines={[...d.lines]} className={`${s.display} mt-1 text-[clamp(2.9rem,12.5vw,4.6rem)] leading-[0.94] lg:text-[min(5.4vw,9.8svh)]`} />
      <h3 className={`${s.display} mt-[min(2rem,4svh)] text-[28px] leading-none lg:text-[32px]`}>
        <Link href={`/d/09/p/${d.edition.productSlug}`} className="transition-colors hover:text-[var(--m-accent)]">
          {d.edition.name}
        </Link>
      </h3>
      <p className="mt-3 max-w-[33rem] text-[17px] leading-[1.7] text-[var(--muted)]">
        {d.edition.text}
        {ed && ` ${word(ed.size - ed.left)} are already in hands; ${word(ed.left).toLowerCase()} remain, the dark numbers around the niche.`}
      </p>
      <div className="mt-[min(2rem,4svh)] grid gap-8 sm:grid-cols-2">
        {d.pieces.map((slug, i) => (
          <PieceTag
            key={slug}
            slug={slug}
            shape={i === 0 ? "circle" : "pebble"}
            side="right"
            photoClass={i === 0 ? "size-[34vw] sm:size-40 lg:size-[min(16svh,9.5vw)]" : "size-[30vw] sm:size-32 lg:size-[min(12svh,7.5vw)]"}
            sizes="(min-width: 1024px) 10vw, 34vw"
            nameClass="text-[20px] lg:text-[23px]"
            labelClass="max-w-[12rem]"
          />
        ))}
      </div>
    </>
  );
}

/** 18:20. Dusk: the numbered edition of this wood, lit around a niche as the scene holds. */
export function Dusk() {
  return (
    <Chapter id="dusk" len="230vh" label="Dusk: the edition">
      <div className="relative mx-auto grid h-full max-w-[1600px] gap-16 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[88px] lg:pt-[96px]">
        {/* the sun goes down into the horizon under the words as the edition lights */}
        <SceneSun at={1112} clip className="left-[86%] top-[calc(100%-26px)]" drift={[18, 96]} />
        <div className="relative order-2 lg:order-1 lg:col-span-6 lg:h-full">
          <Layer
            speed={0.14}
            className="relative mx-auto mt-10 aspect-[3/4] w-[68%] lg:absolute lg:left-[12%] lg:top-[7%] lg:mx-0 lg:mt-0 lg:h-[88%] lg:w-auto"
          >
            <W red={<Niche wood="red" />} white={<Niche wood="white" />} />
          </Layer>
        </div>

        <Layer speed={0.08} className="order-1 flex flex-col justify-center lg:order-2 lg:col-span-6 lg:pl-4">
          <W red={<Words wood="red" />} white={<Words wood="white" />} />
        </Layer>
      </div>
    </Chapter>
  );
}
