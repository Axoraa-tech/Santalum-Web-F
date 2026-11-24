"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { useWood, type Wood } from "@/lib/wood";
import k from "../k";
import { fitSize, fv, isReduced, onFonts } from "./lib";

type Rec = { batch: string; lines: [string, string][] };

const RECORDS: Record<Wood, Rec> = {
  red: {
    batch: "R-26-0412",
    lines: [
      ["Record", "Example, for illustration"],
      ["Piece", "Japa Mala, 108 beads"],
      ["Wood", "Red sandalwood"],
      ["Species", "Pterocarpus santalinus"],
      ["Origin", "Eastern Ghats, Andhra Pradesh"],
      ["Batch", "R-26-0412"],
      ["Artisan", "K. R."],
      ["Inspected", "S. N."],
      ["Finished", "18 November 2026"],
      ["Trade", "CITES Appendix II"],
    ],
  },
  white: {
    batch: "W-26-0187",
    lines: [
      ["Record", "Example, for illustration"],
      ["Piece", "Bead Bracelet, 21 beads"],
      ["Wood", "White sandalwood"],
      ["Species", "Santalum album"],
      ["Origin", "Southern India"],
      ["Batch", "W-26-0187"],
      ["Artisan", "M. S."],
      ["Inspected", "A. P."],
      ["Finished", "12 November 2026"],
      ["Note", "Fragrant; the oil is in the heartwood"],
    ],
  },
};

const PAD = 11;

/** Provenance: the example record prints itself, line by line, when it comes into view. */
export function Provenance() {
  const wood = useWood();
  return (
    <section id="provenance" aria-labelledby="k10-provenance" className="relative scroll-mt-12 border-t border-[var(--k-line)] pb-[7vw] pt-10 md:pt-14">
      <div className={`${k.gut} grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8`}>
        <div className="md:col-span-6">
          <h2 id="k10-provenance" className={`${k.mono} text-[var(--k-grey)]`}>
            Provenance
          </h2>
          <p aria-label="Know what you hold" className={`${k.disp} mt-4 text-[19vw] leading-[0.8] md:text-[length:clamp(72px,9.6vw,176px)]`}>
            <span aria-hidden className="block [font-variation-settings:'wdth'_150,'wght'_900]">Know</span>
            <span aria-hidden className="block text-[var(--k-grey)] [font-variation-settings:'wdth'_50,'wght'_260]">what you</span>
            <span aria-hidden className="block [font-variation-settings:'wdth'_150,'wght'_900]">hold</span>
          </p>
          <p className={`${k.disp} mt-10 max-w-[22ch] whitespace-normal text-[length:clamp(28px,2.8vw,44px)] leading-[0.98] [font-variation-settings:'wdth'_80,'wght'_620]`}>
            If there is evidence, we show it. If there isn&apos;t, we don&apos;t invent it.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <p className={k.monoL}>
              Every piece leaves with a record: the wood, where it grew, the batch, the initials of the hands that made and checked it,
              and the day it was finished.
            </p>
            <p className={`${k.monoL} text-[var(--k-grey)]`}>
              The cuffs of the 2011 Vault are also entered in our provenance registry, by number. Where a lab report exists for an oil,
              it travels with the batch.
            </p>
          </div>
        </div>
        <div className="md:col-span-6 md:pl-6 lg:pl-12">
          <Printer key={wood} rec={RECORDS[wood]} />
          <figure className="mt-8 grid grid-cols-[1fr_auto] items-end gap-5">
            <div className="relative aspect-[16/7] overflow-hidden rounded-full bg-[var(--k-stone)]">
              <Photo p={PHOTOS.malaHand} sizes="(min-width: 768px) 40vw, 80vw" />
            </div>
            <figcaption className={`${k.mono} max-w-[16ch] pb-2 text-[var(--k-grey)]`}>The record goes where the piece goes.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function Printer({ rec }: { rec: Rec }) {
  const ref = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const total = rec.lines.reduce((s, [, v]) => s + PAD + v.length, 0);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (isReduced()) {
      const id = requestAnimationFrame(() => setN(total));
      return () => cancelAnimationFrame(id);
    }
    let c = 0;
    const id = window.setInterval(() => {
      c = Math.min(total, c + 2);
      setN(c);
      if (c >= total) window.clearInterval(id);
    }, 24);
    return () => window.clearInterval(id);
  }, [inView, total]);

  useEffect(() => {
    const box = boxRef.current;
    const num = numRef.current;
    if (!box || !num) return;
    const fit = () => {
      num.style.fontSize = `${fitSize(rec.batch, box.clientWidth, 150, 860)}px`;
    };
    const off = onFonts(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => {
      off();
      ro.disconnect();
    };
  }, [rec.batch]);

  const prog = total ? n / total : 0;
  const rows: { key: string; line: string; shown: number; printing: boolean }[] = [];
  let left = n;
  for (const [a, b] of rec.lines) {
    const line = a.padEnd(PAD, " ") + b;
    const shown = Math.max(0, Math.min(line.length, left));
    rows.push({ key: a, line, shown, printing: left > 0 && left < line.length });
    left -= line.length;
  }

  return (
    <div ref={ref}>
      <div ref={boxRef}>
        <p
          ref={numRef}
          aria-hidden
          className={`${k.disp} w-max text-[12vw] leading-[0.8] tabular-nums`}
          style={{ fontVariationSettings: fv(50 + 100 * prog, 260 + 600 * prog) }}
        >
          {rec.batch}
        </p>
      </div>
      <p className={`${k.mono} mt-3 flex justify-between text-[var(--k-grey)]`}>
        <span>Batch number</span>
        <span className="tabular-nums">
          {Math.round(prog * 100)} / 100 printed
        </span>
      </p>

      <div className={`${k.slip} mt-6 rounded-[22px] px-5 pb-6 pt-5 md:px-8 md:pb-8 md:pt-6`}>
        <div className="flex items-center justify-between border-b border-dashed border-[var(--k-line)] pb-4">
          <p className={`${k.disp} text-[22px] [font-variation-settings:'wdth'_130,'wght'_820]`}>Santalum</p>
          <p className={`${k.mono} rounded-full bg-[var(--m-accent)] px-3 py-1 text-[var(--k-bg)]`}>Example record</p>
        </div>
        <dl className="sr-only">
          {rec.lines.map(([a, b]) => (
            <div key={a}>
              <dt>{a}</dt>
              <dd>{b}</dd>
            </div>
          ))}
        </dl>
        <div aria-hidden className={`${k.monoL} mt-4 space-y-0 leading-[32px] md:text-[15px]`}>
          {rows.map(({ key, line, shown, printing }) => (
            <div key={key} className="whitespace-pre-wrap">
              <span className="text-[var(--k-grey)]">{line.slice(0, Math.min(shown, PAD))}</span>
              <span>{shown > PAD ? line.slice(PAD, shown) : ""}</span>
              {printing && <span className={k.cursor} />}
              <span className="opacity-0">{line.slice(shown)}</span>
            </div>
          ))}
          {n >= total && (
            <div>
              <span className="text-[var(--k-grey)]">{"".padEnd(PAD, " ")}</span>
              <span className={k.cursor} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
