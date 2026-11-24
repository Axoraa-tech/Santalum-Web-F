"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { FAMILIES, formatINR } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import k from "../k";
import { measure, onFonts } from "./lib";
import { HashLink } from "./Nav";

const ON = { wdth: 150, wght: 860 };
const OFF = { wdth: 50, wght: 300 };
const GAP = 0.035; // of the row width

function stats(w: Wood) {
  const fams = FAMILIES.filter((f) => f.variants[w]);
  return { n: fams.length, from: Math.min(...fams.map((f) => f.variants[w]!.price)) };
}

const SPECS: Record<Wood, { label: string; value: ReactNode }[]> = {
  red: [
    { label: "Species", value: <i>Pterocarpus santalinus</i> },
    { label: "Sanskrit", value: <span className="font-[family-name:var(--font-tiro)] text-[1.15em]">रक्तचन्दन</span> },
    { label: "Grows", value: "Eastern Ghats, mainly Andhra Pradesh" },
    { label: "Colour", value: "Deep red, darker toward the centre" },
    { label: "Scent", value: "Almost none" },
    { label: "Character", value: "Dense and fine-grained" },
    { label: "Oil", value: "Carries none" },
    { label: "Trade", value: "Regulated internationally, CITES Appendix II" },
  ],
  white: [
    { label: "Species", value: <i>Santalum album</i> },
    { label: "Sanskrit", value: <span className="font-[family-name:var(--font-tiro)] text-[1.15em]">श्वेतचन्दन</span> },
    { label: "Grows", value: "Dry forests of southern India" },
    { label: "Colour", value: "Pale gold" },
    { label: "Scent", value: "Fragrant, warmer as it is handled" },
    { label: "Craft centre", value: "Mysuru, Karnataka" },
    { label: "Oil", value: "Held in the heartwood" },
    { label: "Made here", value: "Beads, objects, powder, oil, jewellery" },
  ],
};

/**
 * Two woods: "Red" and "White" side by side, as large as the row allows. The current wood is set wide,
 * the other condensed; the sizes for both states are measured once so the pair always fills the row exactly.
 */
export function TwoWoods() {
  const wood = useWood();
  const rowRef = useRef<HTMLDivElement>(null);
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    const sec = secRef.current;
    if (!row || !sec) return;
    const calc = () => {
      const cs = getComputedStyle(row);
      const inner = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const avail = inner * (1 - GAP);
      const rOn = measure("Red", ON.wdth, ON.wght);
      const rOff = measure("Red", OFF.wdth, OFF.wght);
      const wOn = measure("White", ON.wdth, ON.wght);
      const wOff = measure("White", OFF.wdth, OFF.wght);
      if (!rOn || !wOn) return;
      const s = sec.style;
      s.setProperty("--fs-r", `${(avail * 100) / (rOn + wOff)}px`);
      s.setProperty("--fs-w", `${(avail * 100) / (rOff + wOn)}px`);
      s.setProperty("--g-rr", String(rOn));
      s.setProperty("--g-wr", String(wOff));
      s.setProperty("--g-rw", String(rOff));
      s.setProperty("--g-ww", String(wOn));
    };
    const off = onFonts(calc);
    const ro = new ResizeObserver(calc);
    ro.observe(row);
    return () => {
      off();
      ro.disconnect();
    };
  }, []);

  const go = (w: Wood) => {
    if (w !== wood) switchWood(w);
  };

  return (
    <section id="woods" ref={secRef} aria-labelledby="k10-woods" className={`${k.woods} relative scroll-mt-12 border-t border-[var(--k-line)] pb-[6vw] pt-10 md:pt-14`}>
      <div className={`${k.gut} grid grid-cols-1 gap-4 md:grid-cols-12`}>
        <h2 id="k10-woods" className={`${k.mono} text-[var(--k-grey)] md:col-span-3`}>
          Two woods
        </h2>
        <p className={`${k.disp} whitespace-normal text-[length:clamp(26px,2.6vw,40px)] leading-[0.95] [font-variation-settings:'wdth'_70,'wght'_640] md:col-span-6 md:col-start-7`}>
          Choose one. The whole house follows it: the photographs, the prices and the pieces on offer.
        </p>
      </div>

      <div ref={rowRef} className={`${k.gut} mt-8 flex items-end gap-[3.5%] md:mt-12`}>
        {(["red", "white"] as const).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => go(w)}
            aria-pressed={wood === w}
            aria-label={`${w === "red" ? "Red" : "White"} sandalwood`}
            className={`${k.woodBtn} ${k.woodCol} ${w === "red" ? k.woodColRed : k.woodColWhite} overflow-visible text-left`}
          >
            <span className={`${k.wood} ${w === "red" ? k.woodRed : k.woodWhite} block`}>{w === "red" ? "Red" : "White"}</span>
          </button>
        ))}
      </div>

      <div className={`${k.gut} mt-10 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 md:mt-14 lg:gap-x-16`}>
        {(["red", "white"] as const).map((w) => {
          const s = stats(w);
          return (
            <div key={w} className={`${w === "red" ? k.woodColRed : k.woodColWhite} ${k.woodSpecs} transition-opacity duration-500`}>
              <div className="relative aspect-[16/6] overflow-hidden rounded-full bg-[var(--k-stone)]">
                <Photo p={w === "red" ? PHOTOS.redPowder : PHOTOS.whitePowder} sizes="(min-width: 768px) 50vw, 50vw" />
              </div>
              <dl className="mt-6 grid gap-x-6 xl:grid-cols-2">
                {SPECS[w].map((row) => (
                  <div key={row.label} className="grid grid-cols-1 border-t border-[var(--k-line)] py-2 sm:grid-cols-[7.5rem_1fr]">
                    <dt className={`${k.mono} text-[var(--k-grey)]`}>{row.label}</dt>
                    <dd className={k.monoL}>{row.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-t border-[var(--k-ink)] pt-3">
                <p className={`${k.disp} text-[length:clamp(26px,3vw,46px)] tabular-nums [font-variation-settings:'wdth'_60,'wght'_800]`}>
                  {s.n} pieces, from {formatINR(s.from)}
                </p>
                {wood === w ? (
                  <HashLink id="collection" className={`${k.mono} ${k.link}`}>
                    See them below
                  </HashLink>
                ) : (
                  <button type="button" onClick={() => go(w)} className={`${k.mono} ${k.link}`}>
                    Switch to {w} sandalwood
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
