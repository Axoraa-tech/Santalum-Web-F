"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useRef, useState, type PointerEvent } from "react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import { IconFlip } from "../Icons";

type Copy = {
  title: string;
  holds: [string, string][];
  photo: PhotoRef;
  photoPos?: string;
  caption: string;
  recordName: string;
  piece: string;
  footer: [string, string];
  back: { title: string; lines: string[]; foot: string };
  buttons: { turn: string; back: string; hint: string };
};

const COPY: Record<Wood, Copy> = {
  red: {
    title: "Know what you hold",
    holds: [
      ["The species, in Latin", "Pterocarpus santalinus, so the two woods are never confused."],
      ["Lot and origin", "As far as the paperwork shows, and no further."],
      ["Batch", "Every piece cut from the same lot shares it."],
      ["Artisan and date", "Initials of the hands that finished it, and the day."],
    ],
    photo: PHOTOS.malaHand,
    caption: "Every piece ships with its batch record and a care card. The one here is an example.",
    recordName: "Batch record",
    piece: "Japa mala, 108 beads",
    footer: ["Inspected and numbered by hand", "K. R."],
    back: {
      title: "Care card",
      lines: [
        "Keep it dry and out of direct sun.",
        "Wipe with a soft, dry cloth. No water, no cleaners.",
        "Once a season, rub in a drop of natural oil.",
        "Take beads off before bathing or swimming.",
      ],
      foot: "Keep this card with the piece. Its number matches the record on the other side.",
    },
    buttons: { turn: "Turn to the care card", back: "Show the record", hint: "or drag the card sideways" },
  },
  white: {
    title: "Know what is in the bottle",
    holds: [
      ["Heartwood, stated", "Santalum album heartwood. No sapwood, no filler."],
      ["Lot and origin", "Where the wood was grown, as the forest papers show."],
      ["Distilled or carved", "The month the oil was drawn or the carving finished."],
      ["Test report", "For every batch of oil, kept with the lot."],
    ],
    // a low, wide frame: two labelled vials read in it; the tall dropper shot cropped to grey wall
    photo: PHOTOS.oilDuo,
    photoPos: "50% 62%",
    caption: "Every bottle carries its lot and its test report. The one here is an example.",
    recordName: "Lot record",
    piece: "Heartwood oil, 10 ml",
    footer: ["Tested, bottled and sealed by hand", "W-26-0188"],
    back: {
      title: "Keeping the scent",
      lines: [
        "Keep the bottle closed and upright.",
        "Store it away from heat and direct sun.",
        "One drop on the wrist. The scent opens over an hour.",
        "Carvings: a soft, dry brush. Never water.",
      ],
      foot: "Keep this card with the bottle. Its lot matches the record on the other side.",
    },
    buttons: { turn: "Turn the record over", back: "Back to the lot record", hint: "or turn it with a drag" },
  },
};

/** Card 5: the example record on a card you can turn over (drag it, or use the button). One per wood. */
export function Provenance() {
  return <W red={<Body wood="red" />} white={<Body wood="white" />} />;
}

function Body({ wood }: { wood: Wood }) {
  const reduce = useReducedMotion();
  const rot = useMotionValue(0);
  const [back, setBack] = useState(false);
  const drag = useRef<{ x: number; base: number; moved: boolean } | null>(null);
  const c = CONTENT[wood];
  const k = COPY[wood];
  const rows: [string, string][] = [["Piece", k.piece], ...c.provenance.record.map((r) => [r.label, r.value] as [string, string])];
  const no = c.provenance.record[0].value.split("-").pop() ?? "";

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

  return (
    <div className="grid min-h-[inherit] gap-10 px-5 pb-[150px] pt-6 md:px-8 md:pt-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[84px] lg:pt-9">
      <div className="flex flex-col lg:col-span-5">
        <h2 className="d1 text-[clamp(3.4rem,min(6.4vw,11vh),7rem)]">{k.title}</h2>
        <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-(--s7-body) md:text-[17px]">{c.provenance.text}</p>
        <dl className="mt-7 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {k.holds.map(([t, d]) => (
            <div key={t} className="border-t border-(--s7-ink)/15 pt-3">
              <dt className="text-[15px] font-medium">{t}</dt>
              <dd className="mt-1 text-[14.5px] leading-snug text-(--s7-muted)">{d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 flex gap-3 rounded-[20px] bg-(--s7-surface)/70 p-3.5 text-[14px] leading-snug text-(--s7-body)">
          <span aria-hidden className={`mt-0.5 size-5 shrink-0 rounded-full ${wood === "red" ? "ring-red" : "ring-white"}`} />
          {c.regulation}
        </p>
        {/* the photo takes what height is left, but always keeps a gap above it and enough height to read */}
        <div className="mt-6 flex flex-col lg:mt-5 lg:flex-1 lg:justify-end">
          <div className="relative h-44 overflow-hidden rounded-[28px] lg:h-auto lg:max-h-[220px] lg:min-h-[150px] lg:flex-1">
            <Photo p={k.photo} sizes="(min-width: 1024px) 34vw, 100vw" style={{ objectPosition: k.photoPos }} />
            <p className="absolute bottom-3 left-3 max-w-[36ch] rounded-[16px] bg-white/90 px-3.5 py-2 text-[13px] leading-snug text-[#1B1712] md:bottom-4 md:left-4">
              {k.caption}
            </p>
          </div>
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
              className="s7-face absolute inset-0 flex flex-col rounded-[28px] bg-(--s7-surface) p-5 shadow-[0_30px_60px_-34px_rgba(27,23,18,0.5)] ring-1 ring-(--s7-ink)/8 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="d3 text-[17px]">Santalum Maison</p>
                  <p className="text-[13px] text-(--s7-muted)">{k.recordName}</p>
                </div>
                <span className="rounded-full bg-(--s7-accent-soft) px-3 py-1.5 text-[12px] font-medium text-(--s7-accent-deep)">Example</span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-4 sm:mt-3">
                <p className="d1 num text-[56px] sm:text-[72px]">
                  <span className="text-[0.45em] text-(--s7-muted)">No. </span>
                  {no}
                </p>
                <span aria-hidden className={`size-14 shrink-0 rounded-full sm:size-16 ${wood === "red" ? "ring-red" : "ring-white"}`} />
              </div>
              <dl className="mt-4 grid flex-1 content-start gap-x-6 gap-y-2.5 border-t border-(--s7-ink)/12 pt-4 sm:grid-cols-2 sm:gap-y-3">
                {rows.map(([t, v]) => (
                  <div key={t} className="grid grid-cols-[84px_1fr] gap-2 sm:block">
                    <dt className="text-[12.5px] text-(--s7-muted)">{t}</dt>
                    <dd className="text-[14px] leading-snug sm:text-[15px]">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 flex items-center justify-between border-t border-dashed border-(--s7-ink)/20 pt-3 text-[12.5px] text-(--s7-muted)">
                <span>{k.footer[0]}</span>
                <span className="d3 text-[15px] text-(--s7-ink)">{k.footer[1]}</span>
              </p>
            </div>

            {/* back: the care card */}
            <div
              aria-hidden={!back}
              className="s7-face absolute inset-0 flex flex-col rounded-[28px] bg-(--s7-ink) p-5 text-(--s7-page) shadow-[0_30px_60px_-34px_rgba(27,23,18,0.5)] [transform:rotateY(180deg)] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="d2 text-[40px] sm:text-[52px]">{k.back.title}</p>
                <span className="num shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[12px]">No. {no}</span>
              </div>
              <ol className="mt-4 grid flex-1 content-start gap-3 sm:mt-5">
                {k.back.lines.map((line, i) => (
                  <li key={line} className="flex gap-3 text-[15px] leading-snug sm:text-[16px]">
                    <span className="num mt-[1px] grid size-6 shrink-0 place-items-center rounded-full bg-white/12 text-[12px]">{i + 1}</span>
                    {line}
                  </li>
                ))}
              </ol>
              <p className="mt-3 border-t border-white/15 pt-3 text-[13px] leading-snug text-white/65">{k.back.foot}</p>
            </div>
          </motion.div>
          <motion.div aria-hidden style={{ scaleX: shadow }} className="mx-auto mt-4 h-4 w-[80%] rounded-[50%] bg-(--s7-ink)/15 blur-md" />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={flip}
            className="inline-flex h-12 items-center gap-2.5 rounded-full bg-(--s7-ink) px-5 text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-[0.97]"
          >
            <IconFlip width={18} height={18} />
            {back ? k.buttons.back : k.buttons.turn}
          </button>
          <span className="text-[14px] text-(--s7-muted)">{k.buttons.hint}</span>
        </div>
      </div>
    </div>
  );
}
