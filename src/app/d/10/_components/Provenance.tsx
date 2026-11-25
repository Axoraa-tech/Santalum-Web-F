"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import k from "../k";
import { fitSize, fv, isReduced, measure, onFonts, wdthFor } from "./lib";

type Rec = { batch: string; label: string; lines: [string, string][] };

/** The example records, built from the shared content plus the lines this design prints. */
function record(w: Wood): Rec {
  const c = CONTENT[w];
  const r = c.provenance.record;
  const batch = r[0].value;
  return w === "red"
    ? {
        batch,
        label: "Batch number",
        lines: [
          ["Record", "Example, for illustration"],
          ["Piece", "Japa Mala, 108 beads"],
          ...r.map((x): [string, string] => [x.label, x.value]),
          ["Inspected", "S. N."],
          ["Trade", "CITES Appendix II, papers on file"],
        ],
      }
    : {
        batch,
        label: "Lot number",
        lines: [
          ["Record", "Example, for illustration"],
          ["Piece", "Heartwood Oil, 10 ml"],
          ...r.map((x): [string, string] => [x.label, x.value]),
          ["Bottled", "Amber glass, lot on label"],
        ],
      };
}

const COPY: Record<Wood, { big: [string, string, string]; evidence: string; a: string; b: string; photo: PhotoRef; caption: string }> = {
  red: {
    big: ["Know", "what you", "hold"],
    evidence: "If there is evidence, we show it. If there isn't, we don't invent it.",
    a: CONTENT.red.provenance.text.split(". If")[0] + ".",
    b: `${CONTENT.red.regulation} The cuffs of the 2011 Vault are entered in our registry by number.`,
    photo: PHOTOS.malaHand,
    caption: "The record goes where the piece goes.",
  },
  white: {
    big: ["Know", "what is in", "the bottle"],
    evidence: "If there is a test report, it travels with the lot. If there isn't, we say so.",
    a: CONTENT.white.provenance.text.split(". If")[0] + ".",
    b: `${CONTENT.white.regulation} The fifty vials of the 2011 Reserve are numbered by hand.`,
    photo: PHOTOS.apothecary,
    caption: "The lot goes on the label.",
  },
};

const PAD = 13;

/** [wdth, wght] of the three headline lines: wide, hairline-condensed, wide. */
const AXES: [number, number][] = [
  [150, 900],
  [50, 260],
  [150, 900],
];

/**
 * The three-line headline. A wide line that would run out of its column gives up width on the wdth axis
 * (and only then size), so "the bottle" condenses to fit where "hold" stays fully stretched.
 */
function BigLines({ lines }: { lines: [string, string, string] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const avail = el.clientWidth * 0.995;
      if (!avail) return;
      const size = parseFloat(getComputedStyle(el).fontSize);
      el.querySelectorAll<HTMLElement>("[data-line]").forEach((line, i) => {
        const [wd, wg] = AXES[i];
        const text = line.textContent ?? "";
        const w = Math.min(wd, wdthFor(text, avail, size, wg));
        const at = measure(text, w, wg, size);
        line.style.fontVariationSettings = fv(w, wg);
        line.style.fontSize = at > avail ? `${((size * avail) / at).toFixed(2)}px` : "";
        // Check what the browser actually set, not the probe: shrink again if the line still runs past its column.
        const r = document.createRange();
        r.selectNodeContents(line);
        const real = r.getBoundingClientRect().width;
        if (real > avail) {
          const now = parseFloat(getComputedStyle(line).fontSize);
          line.style.fontSize = `${((now * avail) / real).toFixed(2)}px`;
        }
      });
    };
    const off = onFonts(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => {
      off();
      ro.disconnect();
    };
  }, [lines]);
  return (
    <p ref={ref} aria-label={lines.join(" ")} className={`${k.disp} mt-4 text-[17vw] leading-[0.8] md:text-[length:clamp(64px,8.6vw,164px)]`}>
      {lines.map((t, i) => (
        <span
          key={t}
          data-line
          aria-hidden
          className={`block ${i === 1 ? "text-[var(--k10-grey)]" : ""}`}
          style={{ fontVariationSettings: fv(AXES[i][0], AXES[i][1]) }}
        >
          {t}
        </span>
      ))}
    </p>
  );
}

/** Provenance: the example record of the current wood prints itself, line by line, when it comes into view. */
export function Provenance() {
  return (
    <section id="provenance" className="relative scroll-mt-12 border-t border-[var(--k10-line)] pb-[7vw] pt-10 md:pt-14">
      <W red={<Body w="red" />} white={<Body w="white" />} />
    </section>
  );
}

function Body({ w }: { w: Wood }) {
  const c = COPY[w];
  return (
    <div className={`${k.gut} grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8`}>
      <div className="min-w-0 md:col-span-6">
        <h2 className={`${k.mono} text-[var(--k10-grey)]`}>{w === "red" ? "Provenance, by batch" : "Provenance, by lot"}</h2>
        <BigLines lines={c.big} />
        <p className={`${k.disp} mt-10 max-w-[22ch] whitespace-normal text-[length:clamp(28px,2.8vw,44px)] leading-[0.98] [font-variation-settings:'wdth'_80,'wght'_620]`}>
          {c.evidence}
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <p className={k.monoL}>{c.a}</p>
          <p className={`${k.monoL} text-[var(--k10-grey)]`}>{c.b}</p>
        </div>
      </div>
      <div className="md:col-span-6 md:pl-6 lg:pl-12">
        <Printer rec={record(w)} />
        <figure className="mt-8 grid grid-cols-[1fr_auto] items-end gap-5">
          <div className="relative aspect-[16/7] overflow-hidden rounded-full bg-[var(--k10-stone)]">
            <Photo p={c.photo} sizes="(min-width: 768px) 40vw, 80vw" />
          </div>
          <figcaption className={`${k.mono} max-w-[16ch] pb-2 text-[var(--k10-grey)]`}>{c.caption}</figcaption>
        </figure>
      </div>
    </div>
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
      if (box.clientWidth) num.style.fontSize = `${fitSize(rec.batch, box.clientWidth * 0.99, 150, 860, 0, true)}px`;
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
      <p className={`${k.mono} mt-3 flex justify-between text-[var(--k10-grey)]`}>
        <span>{rec.label}</span>
        <span className="tabular-nums">{Math.round(prog * 100)} / 100 printed</span>
      </p>

      <div className={`${k.slip} mt-6 rounded-[22px] px-5 pb-6 pt-5 md:px-8 md:pb-8 md:pt-6`}>
        <div className="flex items-center justify-between border-b border-dashed border-[var(--k10-line)] pb-4">
          <p className={`${k.disp} text-[22px] [font-variation-settings:'wdth'_130,'wght'_820]`}>Santalum</p>
          <p className={`${k.mono} rounded-full bg-[var(--k10-accent)] px-3 py-1 text-[var(--k10-bg)]`}>Example record</p>
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
              <span className="text-[var(--k10-grey)]">{line.slice(0, Math.min(shown, PAD))}</span>
              <span>{shown > PAD ? line.slice(PAD, shown) : ""}</span>
              {printing && <span className={k.cursor} />}
              <span className="opacity-0">{line.slice(shown)}</span>
            </div>
          ))}
          {n >= total && (
            <div>
              <span className="text-[var(--k10-grey)]">{"".padEnd(PAD, " ")}</span>
              <span className={k.cursor} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
