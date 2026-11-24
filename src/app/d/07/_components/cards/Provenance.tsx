"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useRef, useState, type PointerEvent } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { useWood, type Wood } from "@/lib/wood";
import { IconFlip } from "../Icons";

const RECORD: Record<Wood, { no: string; rows: [string, string][] }> = {
  red: {
    no: "0412",
    rows: [
      ["Piece", "Japa mala, 108 beads"],
      ["Wood", "Pterocarpus santalinus, heartwood"],
      ["Origin", "Eastern Ghats, Andhra Pradesh"],
      ["Batch", "R-26-0412"],
      ["Artisan", "S. R."],
      ["Finished", "14 November 2026"],
    ],
  },
  white: {
    no: "0187",
    rows: [
      ["Piece", "Bead bracelet, 21 beads"],
      ["Wood", "Santalum album, heartwood"],
      ["Origin", "Southern India"],
      ["Batch", "W-26-0187"],
      ["Artisan", "M. K."],
      ["Finished", "21 November 2026"],
    ],
  },
};

const CARE = [
  "Keep it dry and out of direct sun.",
  "Wipe with a soft, dry cloth. No water, no cleaners.",
  "Once a season, rub in a drop of natural oil.",
  "Take beads off before bathing or swimming.",
];

const HOLDS = [
  ["The species, in Latin", "So the two woods are never confused."],
  ["Origin", "As far as the paperwork shows, and no further."],
  ["Batch", "Every piece cut from the same lot shares it."],
  ["Artisan and date", "Initials of the hands that finished it, and the day."],
];

/** Card 5: the example record on a card you can turn over (drag it, or use the button) to read the care card. */
export function Provenance() {
  const wood = useWood();
  const reduce = useReducedMotion();
  const rot = useMotionValue(0);
  const [back, setBack] = useState(false);
  const drag = useRef<{ x: number; base: number; moved: boolean } | null>(null);

  const settle = (target: number) => {
    const snapped = Math.round(target / 180) * 180;
    setBack(Math.abs(Math.round(snapped / 180)) % 2 === 1);
    animate(rot, snapped, reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 16, mass: 0.9 });
  };
  const flip = () => settle(Math.round(rot.get() / 180) * 180 + 180);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, base: rot.get(), moved: false };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) d.moved = true;
    if (d.moved) rot.set(d.base + dx * 0.6);
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) flip();
    else settle(rot.get());
  };

  const shadow = useTransform(rot, (r) => 1 - 0.45 * Math.abs(Math.sin((r * Math.PI) / 180)));
  const rec = RECORD[wood];

  return (
    <div className="grid min-h-[inherit] gap-10 px-5 pb-[150px] pt-6 md:px-8 md:pt-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[84px] lg:pt-9">
      <div className="flex flex-col lg:col-span-5">
        <h2 className="d1 text-[clamp(3.4rem,min(6.4vw,11vh),7rem)]">Know what you hold</h2>
        <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-[#3d3731] md:text-[17px]">
          For a material with a complicated history, trust starts with where it came from. If there is evidence, we show it.
          If there isn&rsquo;t, we don&rsquo;t invent it.
        </p>
        <dl className="mt-7 grid gap-x-6 gap-y-4 pb-6 sm:grid-cols-2">
          {HOLDS.map(([k, v]) => (
            <div key={k} className="border-t border-[#1B1712]/15 pt-3">
              <dt className="text-[15px] font-medium">{k}</dt>
              <dd className="mt-1 text-[14px] leading-snug text-[#77706A]">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="relative mt-8 h-44 overflow-hidden rounded-[28px] lg:mt-auto lg:h-auto lg:min-h-[150px] lg:flex-1 lg:max-h-[260px]">
          <Photo p={PHOTOS.malaHand} sizes="(min-width: 1024px) 34vw, 100vw" />
          <p className="absolute bottom-3 left-3 max-w-[34ch] rounded-[16px] bg-white/90 px-3.5 py-2 text-[13px] leading-snug text-[#1B1712] md:bottom-4 md:left-4">
            Every piece ships with its own record and a care card. The one here is an example.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center lg:col-span-7">
        <div className="relative w-full max-w-[660px] [perspective:1600px]">
          <motion.div
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{ rotateY: rot, transformStyle: "preserve-3d" }}
            className="s7-grab relative aspect-[4/5] w-full touch-pan-y sm:aspect-[1.42]"
          >
            {/* front: the record */}
            <div
              aria-hidden={back}
              className="s7-face absolute inset-0 flex flex-col rounded-[28px] bg-white p-5 shadow-[0_30px_60px_-34px_rgba(27,23,18,0.5)] ring-1 ring-[#1B1712]/8 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="d3 text-[17px]">Santalum Maison</p>
                  <p className="text-[13px] text-[#77706A]">Provenance record</p>
                </div>
                <span className="rounded-full bg-[var(--m-accent-soft)] px-3 py-1.5 text-[12px] font-medium text-[var(--m-accent)]">
                  Example
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-4 sm:mt-3">
                <p className="d1 num text-[56px] sm:text-[72px]">
                  <span className="text-[0.45em] text-[#77706A]">No. </span>
                  {rec.no}
                </p>
                <span aria-hidden className={`size-14 shrink-0 rounded-full sm:size-16 ${wood === "red" ? "ring-red" : "ring-white"}`} />
              </div>
              <dl className="mt-4 grid flex-1 content-start gap-x-6 gap-y-2.5 border-t border-[#1B1712]/12 pt-4 sm:grid-cols-2 sm:gap-y-3">
                {rec.rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[76px_1fr] gap-2 sm:block">
                    <dt className="text-[12.5px] text-[#77706A]">{k}</dt>
                    <dd className="text-[14px] leading-snug sm:text-[15px]">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 flex items-center justify-between border-t border-dashed border-[#1B1712]/20 pt-3 text-[12.5px] text-[#77706A]">
                <span>Inspected and numbered by hand</span>
                <span className="d3 text-[15px] text-[#1B1712]">{rec.rows[4][1]}</span>
              </p>
            </div>

            {/* back: the care card */}
            <div
              aria-hidden={!back}
              className="s7-face absolute inset-0 flex flex-col rounded-[28px] bg-[#1B1712] p-5 text-[#F8F6F2] shadow-[0_30px_60px_-34px_rgba(27,23,18,0.5)] [transform:rotateY(180deg)] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="d2 text-[40px] sm:text-[52px]">Care card</p>
                <span className="num rounded-full bg-white/10 px-3 py-1.5 text-[12px]">No. {rec.no}</span>
              </div>
              <ol className="mt-4 grid flex-1 content-start gap-3 sm:mt-5">
                {CARE.map((c, i) => (
                  <li key={c} className="flex gap-3 text-[14.5px] leading-snug sm:text-[16px]">
                    <span className="num mt-[1px] grid size-6 shrink-0 place-items-center rounded-full bg-white/12 text-[12px]">{i + 1}</span>
                    {c}
                  </li>
                ))}
              </ol>
              <p className="mt-3 border-t border-white/15 pt-3 text-[12.5px] leading-snug text-white/65">
                Keep this card with the piece. Its number matches the record on the other side.
              </p>
            </div>
          </motion.div>
          <motion.div
            aria-hidden
            style={{ scaleX: shadow }}
            className="mx-auto mt-4 h-4 w-[80%] rounded-[50%] bg-[#1B1712]/15 blur-md"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={flip}
            className="inline-flex h-12 items-center gap-2.5 rounded-full bg-[#1B1712] px-5 text-[15px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-[0.97]"
          >
            <IconFlip width={18} height={18} />
            {back ? "Show the record" : "Turn to the care card"}
          </button>
          <span className="text-[14px] text-[#77706A]">or drag the card sideways</span>
        </div>
      </div>
    </div>
  );
}
