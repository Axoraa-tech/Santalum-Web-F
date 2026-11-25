"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import { useMedia } from "./bits";

type Row = { label: string; value: string; note?: string };

type Copy = {
  h: [string, string];
  quote: string;
  card: string;
  badge: string;
  piece: string;
  photo: PhotoRef;
  caption: string;
};

const COPY: Record<Wood, Copy> = {
  red: {
    h: ["Know what", "you hold"],
    quote: "If there is evidence, we show it. If there isn't, we don't invent it.",
    card: "An example batch record",
    badge: "Example, not a real piece",
    piece: "Japa mala, 108 beads",
    photo: PHOTOS.carving,
    caption: "Hands before faces. The record names the turner by initials; the photographs show the work.",
  },
  white: {
    h: ["Know what is", "in the bottle"],
    quote: "If there is a test report, it travels with the bottle. If there isn't, we say so.",
    card: "An example lot record",
    badge: "Example, not a real lot",
    piece: "Heartwood oil, 5 ml",
    photo: PHOTOS.oilHands,
    caption: "Hands before faces. The lot record gives the place and the month of distillation; the photographs show the work.",
  },
};

function rows(wood: Wood): Row[] {
  const c = CONTENT[wood];
  return [
    { label: "Piece", value: COPY[wood].piece },
    ...c.provenance.record.map((r) => (r.label === "Species" ? { ...r, note: wood === "red" ? "red sandalwood" : "white sandalwood" } : r)),
  ];
}

/** Provenance: an example record as a knotted cord. Each knot ties as it reaches you. */
export function Provenance() {
  return (
    <section id="provenance" aria-labelledby="prov-h" className="relative z-[1] px-4 py-24 md:px-10 md:py-28">
      <W red={<Body wood="red" />} white={<Body wood="white" />} />
    </section>
  );
}

function Body({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  const t = COPY[wood];
  const list = rows(wood);
  return (
    <div className="mx-auto grid max-w-[1440px] gap-16 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-5">
        <div className="bg-(--linen)">
          <h2 id={wood === "red" ? "prov-h" : "prov-h-w"} className="s3-h2">
            {t.h[0]}
            <br />
            {t.h[1]}
          </h2>
          <p className="s3-serif mt-8 max-w-[26rem] text-[clamp(1.4rem,2vw,1.9rem)] leading-[1.2]">{t.quote}</p>
          <p className="mt-6 max-w-[30rem] text-[16px] leading-[1.7] text-(--ink)/80">{c.provenance.text}</p>
          <p className="mt-4 max-w-[30rem] text-[15px] leading-[1.65] text-(--muted)">{c.regulation}</p>
        </div>
        <figure className="mt-12 flex items-end gap-5">
          <div className="relative aspect-square w-[min(240px,52vw)] shrink-0 overflow-hidden rounded-full">
            <Photo p={t.photo} sizes="240px" />
          </div>
          <figcaption className="bg-(--linen) pb-4 text-[14px] leading-[1.55] text-(--muted)">{t.caption}</figcaption>
        </figure>
      </div>

      <div className="md:col-span-6 md:col-start-7">
        <div className="rounded-[28px] bg-(--warm) px-6 pb-8 pt-7 md:px-10 md:pb-10 md:pt-9">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="s3-serif text-[28px] leading-none md:text-[34px]">{t.card}</h3>
            <p className="rounded-full border border-(--line) px-3 py-1 text-[13px] text-(--muted)">{t.badge}</p>
          </div>
          <ol className="relative mt-8">
            <span className="absolute bottom-[30px] left-[8.5px] top-[18px] w-px bg-(--thread)" aria-hidden />
            {list.map((r, i) => (
              <Knot key={r.label} row={r} last={i === list.length - 1} />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Knot({ row, last }: { row: Row; last: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "start 58%"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [0.35, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-120, 0]);
  return (
    <li ref={ref} className={`relative grid grid-cols-[2.25rem_1fr] items-start ${last ? "" : "pb-6"}`}>
      <span data-knot className="relative mt-[9px] grid h-[18px] w-[18px] place-items-center justify-self-start" aria-hidden>
        <motion.span
          style={{ scale, rotate }}
          className="block h-[18px] w-[18px] rounded-[45%_55%_50%_50%] bg-[radial-gradient(circle_at_35%_30%,#dcc092,#94713f_65%)] shadow-[0_2px_4px_rgba(34,24,15,0.25)]"
        />
      </span>
      <div className="grid gap-1 border-b border-(--line) pb-5 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
        <span className="pt-[7px] text-[13px] text-(--muted)">{row.label}</span>
        <span>
          <span className={`s3-serif block text-[clamp(1.4rem,2.2vw,2rem)] leading-[1.15] ${row.label === "Species" ? "italic" : ""}`}>{row.value}</span>
          {row.note && <span className="mt-1 block text-[13px] text-(--muted)">{row.note}</span>}
        </span>
      </div>
    </li>
  );
}
