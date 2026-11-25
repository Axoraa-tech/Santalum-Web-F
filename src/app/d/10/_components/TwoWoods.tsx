"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, formatINR, priceRange, productsFor } from "@/lib/shop/products";
import { PHOTOS } from "@/lib/photos";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import k from "../k";
import { measure, onFonts } from "./lib";

const ON = { wdth: 150, wght: 860 };
const OFF = { wdth: 50, wght: 300 };
const GAP = 0.035; // of the row width

/** The comparison table: the shared facts plus the names at home. */
function specs(w: Wood) {
  const c = CONTENT[w];
  return [
    ...c.facts.filter((f) => f.label !== "Family"),
    { label: "Sanskrit", value: c.sanskrit, script: true },
    { label: "Kannada", value: c.kannada, script: true },
  ] as { label: string; value: string; script?: boolean }[];
}

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
    <section id="woods" ref={secRef} aria-labelledby="k10-woods" className={`${k.woods} relative scroll-mt-12 border-t border-[var(--k10-line)] pb-[6vw] pt-10 md:pt-14`}>
      <div className={`${k.gut} grid grid-cols-1 gap-4 md:grid-cols-12`}>
        <h2 id="k10-woods" className={`${k.mono} text-[var(--k10-grey)] md:col-span-3`}>
          <WT red="Two woods, and you are in the red" white="Two woods, and you are in the white" />
        </h2>
        <p className={`${k.disp} whitespace-normal text-[length:clamp(26px,2.6vw,40px)] leading-[0.95] [font-variation-settings:'wdth'_70,'wght'_640] md:col-span-6 md:col-start-7`}>
          <WT
            red="Red is colour and weight, turned at the lathe. Choose white and the house changes: other pieces, other words, another paper."
            white="White is scent and oil, distilled and carved. Choose red and the house changes: other pieces, other words, another paper."
          />
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
          const c = CONTENT[w];
          const n = productsFor(w).length;
          const [from] = priceRange(w);
          return (
            <div key={w} className={`${w === "red" ? k.woodColRed : k.woodColWhite} ${k.woodSpecs} transition-opacity duration-500`}>
              <div className="relative aspect-[16/6] overflow-hidden rounded-full bg-[var(--k10-stone)]">
                <Photo p={w === "red" ? PHOTOS.redPowder : PHOTOS.whitePowder} sizes="(min-width: 640px) 50vw, 100vw" />
              </div>
              <p className={`${k.monoL} mt-5`}>{c.oneLine}</p>
              <dl className="mt-4 grid gap-x-6 xl:grid-cols-2">
                {specs(w).map((row) => (
                  <div key={row.label} className="grid grid-cols-1 border-t border-[var(--k10-line)] py-2 sm:grid-cols-[7.5rem_1fr]">
                    <dt className={`${k.mono} text-[var(--k10-grey)]`}>{row.label}</dt>
                    <dd className={k.monoL}>
                      {row.label === "Species" ? <i>{row.value}</i> : row.script ? <span className="text-[1.1em]">{row.value}</span> : row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className={`${k.mono} mt-3 text-[var(--k10-grey)]`}>{CATEGORIES[w].map((x) => x.label).join(", ")}</p>
              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3 border-t border-[var(--k10-ink)] pt-3">
                <p className={`${k.disp} text-[length:clamp(26px,3vw,46px)] tabular-nums [font-variation-settings:'wdth'_60,'wght'_800]`}>
                  {n} pieces, from {formatINR(from)}
                </p>
                {/* the current wood's column links to its shop, the other offers the switch; CSS picks before hydration */}
                <WT
                  red={
                    w === "red" ? (
                      <Link href="/d/10/shop" className={`${k.mono} ${k.link}`}>
                        Shop {c.name.toLowerCase()}
                      </Link>
                    ) : (
                      <button type="button" onClick={() => go(w)} className={`${k.mono} ${k.link}`}>
                        Switch to {c.name.toLowerCase()}
                      </button>
                    )
                  }
                  white={
                    w === "white" ? (
                      <Link href="/d/10/shop" className={`${k.mono} ${k.link}`}>
                        Shop {c.name.toLowerCase()}
                      </Link>
                    ) : (
                      <button type="button" onClick={() => go(w)} className={`${k.mono} ${k.link}`}>
                        Switch to {c.name.toLowerCase()}
                      </button>
                    )
                  }
                />

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
