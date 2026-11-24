"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Photo } from "@/components/Photo";
import { WOOD_NAMES } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { useWood, type Wood } from "@/lib/wood";
import { useMedia } from "./bits";

type Row = { label: string; value: string; note?: string };

const RECORD: Record<Wood, Row[]> = {
  red: [
    { label: "Piece", value: "Japa mala, 108 beads" },
    { label: "Wood", value: "Red sandalwood", note: WOOD_NAMES.red.latin },
    { label: "Origin", value: "Eastern Ghats, Andhra Pradesh" },
    { label: "Batch", value: "R-26-0412" },
    { label: "Artisan", value: "S. R.", note: "initials, with their consent" },
    { label: "Finished", value: "18 November 2026" },
    { label: "Lab report", value: "Not available for this batch", note: "so we say so" },
  ],
  white: [
    { label: "Piece", value: "Bead bracelet, 21 beads" },
    { label: "Wood", value: "White sandalwood", note: WOOD_NAMES.white.latin },
    { label: "Origin", value: "Karnataka, southern India" },
    { label: "Batch", value: "W-26-0187" },
    { label: "Artisan", value: "K. M.", note: "initials, with their consent" },
    { label: "Finished", value: "12 November 2026" },
    { label: "Lab report", value: "Not available for this batch", note: "so we say so" },
  ],
};

/** Provenance: an example record as a knotted cord. Each knot ties as it reaches you. */
export function Provenance() {
  const wood = useWood();
  const rows = RECORD[wood];
  return (
    <section id="provenance" aria-labelledby="prov-h" className="relative z-[1] px-4 py-24 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <div className="bg-(--linen)">
            <h2 id="prov-h" className="s3-h2">
              Know what
              <br />
              you hold
            </h2>
            <p className="s3-serif mt-8 max-w-[26rem] text-[clamp(1.4rem,2vw,1.9rem)] leading-[1.2]">
              If there is evidence, we show it. If there isn&apos;t, we don&apos;t invent it.
            </p>
            <p className="mt-6 max-w-[30rem] text-[16px] leading-[1.7] text-(--ink)/80">
              Every piece leaves with a record: what it is, which wood, where the wood came from, the batch it was cut in, who made it
              and when. Where a document doesn&apos;t exist, the record says that too.
            </p>
          </div>
          <figure className="mt-12 flex items-end gap-5">
            <div className="relative aspect-square w-[min(240px,52vw)] shrink-0 overflow-hidden rounded-full">
              <Photo p={PHOTOS.diyaHands} sizes="240px" />
            </div>
            <figcaption className="bg-(--linen) pb-4 text-[14px] leading-[1.55] text-(--muted)">
              Hands before faces. The record names the artisan by initials; the photographs show the work.
            </figcaption>
          </figure>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <div className="rounded-[28px] bg-(--warm) px-6 pb-8 pt-7 md:px-10 md:pb-10 md:pt-9">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="s3-serif text-[28px] leading-none md:text-[34px]">An example record</h3>
              <p className="rounded-full border border-(--line) px-3 py-1 text-[13px] text-(--muted)">Example, not a real piece</p>
            </div>
            <ol className="relative mt-8">
              <span className="absolute bottom-[30px] left-[8.5px] top-[18px] w-px bg-(--thread)" aria-hidden />
              {rows.map((r, i) => (
                <Knot key={r.label} row={r} last={i === rows.length - 1} />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
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
          <span className="s3-serif block text-[clamp(1.4rem,2.2vw,2rem)] leading-[1.15]">{row.value}</span>
          {row.note && <span className="mt-1 block text-[13px] italic text-(--muted)">{row.note}</span>}
        </span>
      </div>
    </li>
  );
}
