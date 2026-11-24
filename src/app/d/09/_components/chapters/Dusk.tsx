"use client";

import { useMotionValue, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { W } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { Lines } from "../Lines";
import { PieceTag } from "../PieceTag";
import { Chapter, Cut, Layer, useScene } from "../Scene";
import { Smoke } from "../Smoke";

/** Twenty-one points around the outline of an arch niche (aspect 3:4), from bottom left, over the top, to bottom right. */
const LAMPS = (() => {
  const H = 4 / 3;
  const R = 0.5 + 0.09;
  const cx = 0.5;
  const cy = 0.5;
  const yb = H * 0.95;
  const side = yb - cy;
  const arc = Math.PI * R;
  const L = side * 2 + arc;
  return Array.from({ length: 21 }, (_, k) => {
    const d = ((k + 0.5) / 21) * L;
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
})();

function Cuff({ wood }: { wood: Wood }) {
  return (
    <PieceTag
      slug="vault-cuff"
      wood={wood}
      shape="circle"
      side="right"
      photoClass="size-[40vw] sm:size-44 lg:size-[min(19svh,11vw)]"
      sizes="(min-width: 1024px) 11vw, 40vw"
      nameClass="text-[22px] lg:text-[26px]"
    />
  );
}

/** The 21 numbers of the Vault, lit one by one around the lamp as the scene holds. */
function Lamps() {
  const ctx = useScene();
  const fallback = useMotionValue(0);
  const [lit, setLit] = useState(0);
  useMotionValueEvent(ctx?.pin ?? fallback, "change", (v) => {
    const next = Math.round(Math.min(1, Math.max(0, v * 1.3)) * 21);
    setLit((prev) => (prev === next ? prev : next));
  });
  return (
    <ol aria-label="The 2011 Vault, numbered 1 to 21" className="absolute inset-0">
      {LAMPS.map((pos, i) => {
        const on = i < lit;
        return (
          <li
            key={i}
            style={pos}
            className={`${s.tab} absolute grid size-[22px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[10px] transition-[background-color,color,border-color] duration-700 lg:size-[26px] lg:text-[11px] ${
              on
                ? "border border-[var(--m-accent)] bg-[var(--m-accent)] text-[var(--paper)]"
                : "border border-[rgb(42_36_32/0.2)] bg-[rgb(251_248_243/0.7)] text-[var(--muted)]"
            }`}
          >
            {i + 1}
          </li>
        );
      })}
    </ol>
  );
}

/** 18:20. Dusk, the lamp: the diya, the 2011 Vault (21 numbered pieces) and the cuff. */
export function Dusk() {
  return (
    <Chapter id="dusk" len="230vh" label="Dusk: the lamp and the 2011 Vault">
      <div className="relative mx-auto grid h-full max-w-[1600px] gap-16 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[88px] lg:pt-[96px]">
        <div className="relative order-2 lg:order-1 lg:col-span-6 lg:h-full">
          <Layer
            speed={0.14}
            className="relative mx-auto mt-10 aspect-[3/4] w-[68%] lg:absolute lg:left-[12%] lg:top-[7%] lg:mx-0 lg:mt-0 lg:h-[88%] lg:w-auto"
          >
            <Smoke className="absolute -top-[46%] left-[20%] h-[92%] w-[60%]" originX={0.5} originY={1} strength={1.1} />
            <Cut photo={PHOTOS.diyaHands} shape="arch" className="size-full" sizes="(min-width: 1024px) 30vw, 68vw" />
            <Lamps />
          </Layer>
        </div>

        <Layer speed={0.08} className="order-1 flex flex-col justify-center lg:order-2 lg:col-span-6 lg:pl-4">
          <p className={`${s.display} ${s.tab} text-[26px] text-[var(--muted)] lg:text-[30px]`}>18:20</p>
          <Lines
            lines={["Dusk, and", "the lamp is lit"]}
            className={`${s.display} mt-1 text-[clamp(2.9rem,12.5vw,4.6rem)] leading-[0.94] lg:text-[min(5.4vw,9.8svh)]`}
          />
          <h3 className={`${s.display} mt-[min(2rem,4svh)] text-[28px] leading-none lg:text-[32px]`}>The 2011 Vault</h3>
          <p className="mt-3 max-w-[33rem] text-[17px] leading-[1.7] text-[var(--muted)]">
            Twenty-one cuffs turned from aged heartwood sourced in 2011. The wood has waited since then. Each cuff is numbered and
            entered in our provenance registry with its number, harvest origin, the artisan&rsquo;s name and the date it left our hands.
          </p>
          <div className="mt-[min(2rem,4svh)]">
            <W red={<Cuff wood="red" />} white={<Cuff wood="white" />} />
          </div>
        </Layer>
      </div>
    </Chapter>
  );
}
