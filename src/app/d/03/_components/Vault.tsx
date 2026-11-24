"use client";

import { useState } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { AddToBag } from "./bits";
import { ui } from "./store";

const COUNT = 21;
const C = 0.34;
/** a hanging cord: 0 at the ends, 1 at the lowest point */
const sag = (x: number) => 1 - (Math.cosh((x - 0.5) / C) - 1) / (Math.cosh(0.5 / C) - 1);
const BEADS = Array.from({ length: COUNT }, (_, i) => {
  const x = 0.035 + (i / (COUNT - 1)) * 0.93;
  // rounded so server and client agree to the digit
  return { n: i + 1, x: Math.round(x * 10000) / 100, y: Math.round((10 + sag(x) * 70) * 100) / 100 };
});

/** The 2011 Vault: twenty-one numbered beads on a short strand, one for each cuff. */
export function Vault() {
  const wood = useWood();
  const f = getFamily("vault-cuff")!;
  const v = f.variants[wood] ?? f.variants.red!;
  const [sel, setSel] = useState<number | null>(null);
  const shot = v.shots[0];

  return (
    <section id="vault" aria-labelledby="vault-h" className="relative z-[1] px-4 pb-20 pt-24 md:px-10 md:pb-24 md:pt-28">
      <div className="mx-auto grid max-w-[1440px] gap-14 md:grid-cols-12 md:items-center md:gap-10">
        <div className="bg-(--linen) md:col-span-6">
          <h2 id="vault-h" className="s3-serif leading-[0.86]">
            <span className="block text-[clamp(1.8rem,3vw,2.8rem)]">The</span>
            <span className="block text-[clamp(6rem,16vw,15rem)] tracking-[-0.03em] text-(--m-accent)">2011</span>
            <span className="block text-[clamp(1.8rem,3vw,2.8rem)]">Vault</span>
          </h2>
          <p className="s3-lede mt-8 max-w-[32rem]">
            Twenty-one cuffs, turned from aged heartwood sourced in 2011. The wood has waited since then for the right hands and the
            right moment.
          </p>
          <p className="mt-4 max-w-[32rem] text-[15px] leading-[1.7] text-(--ink)/75">
            Each cuff is numbered and entered in our provenance registry with its harvest origin, the artisan&apos;s name and the date it
            left our hands. Made to your measurement, with a registry certificate and a sealed vial of heartwood oil.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <p>
              <span className="s3-serif block text-[34px] leading-none">{formatINR(v.price)}</span>
              <span className="mt-1 block text-[13px] text-(--muted)">{f.edition}, in {wood} sandalwood</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <AddToBag slug="vault-cuff" wood={wood} />
              <button type="button" className="s3-btn s3-btn-line" onClick={() => ui.openProduct("vault-cuff")}>
                View the cuff
              </button>
            </div>
          </div>
        </div>

        <div className="relative md:col-span-5 md:col-start-8">
          <div className="relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-full bg-(--warm)">
            <Photo p={shot.photo} tone={shot.tone} sizes="(min-width: 768px) 40vw, 90vw" />
          </div>
          <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-baseline gap-2 rounded-full bg-(--linen) px-5 py-2 md:left-auto md:right-[4%] md:translate-x-0">
            {sel ? (
              <>
                <span className="text-[13px] text-(--muted)">No.</span>
                <span className="s3-serif text-[30px] leading-none tabular-nums">{String(sel).padStart(2, "0")}</span>
                <span className="text-[13px] text-(--muted)">of {COUNT}</span>
              </>
            ) : (
              <span className="text-[14px]">Twenty-one numbered pieces</span>
            )}
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-16 h-[150px] max-w-[1440px] md:mt-20 md:h-[250px]">
        {/* the page thread comes in from the right and leaves on the left, towards Gifting */}
        {[...BEADS].reverse().map((b) => (
          <span key={b.n} data-knot className="absolute h-px w-px" style={{ left: `${b.x}%`, top: `${b.y}%` }} aria-hidden />
        ))}
        <ul aria-label="The twenty-one cuffs" onMouseLeave={() => setSel(null)}>
          {BEADS.map((b) => (
            <li key={b.n} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
              <button
                type="button"
                onMouseEnter={() => setSel(b.n)}
                onFocus={() => setSel(b.n)}
                onBlur={() => setSel(null)}
                onClick={() => ui.openProduct("vault-cuff")}
                aria-label={`Cuff number ${b.n} of ${COUNT}`}
                className="group relative grid place-items-center"
              >
                <span
                  className={`s3-bead grid h-[15px] w-[15px] place-items-center text-[0px] text-(--warm) transition-transform duration-500 group-hover:scale-[1.18] group-active:scale-95 sm:h-[26px] sm:w-[26px] md:h-[46px] md:w-[46px] md:text-[13px] ${
                    sel === b.n ? "scale-[1.18]" : ""
                  }`}
                >
                  <span className="s3-vnum relative font-medium tabular-nums">{String(b.n).padStart(2, "0")}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
