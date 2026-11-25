"use client";

import Link from "next/link";
import { useState } from "react";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct, type Wood } from "@/lib/shop/products";
import { productHref } from "./copy";
import { s } from "./cls";
import { mulberry32 } from "./store";
import { AddButton, ArrowIcon } from "./ui";

type Disc = { n: number; left: string; top: string; dx: string; dy: string; gx: string; gy: string; rot: number; w: number };

/** Lay the numbered discs on one ring (21 cuffs) or two staggered rings (50 vials). Seeded, so server and client agree. */
function layout(count: number, seed: number): Disc[] {
  const rand = mulberry32(seed);
  const rings = count > 30 ? [{ k: Math.ceil(count / 2), r: 43, w: 7.6, off: 0 }, { k: Math.floor(count / 2), r: 33, w: 6.6, off: 0.5 }] : [{ k: count, r: 41, w: 11, off: 0 }];
  const out: Disc[] = [];
  let n = 1;
  for (const ring of rings) {
    for (let i = 0; i < ring.k; i++) {
      const a = ((i + ring.off) / ring.k) * Math.PI * 2;
      out.push({
        n: n++,
        left: (50 + Math.sin(a) * ring.r).toFixed(2),
        top: (50 - Math.cos(a) * ring.r).toFixed(2),
        dx: (Math.sin(a) * 10).toFixed(2),
        dy: (-Math.cos(a) * 10).toFixed(2),
        gx: (30 + rand() * 40).toFixed(1),
        gy: (30 + rand() * 40).toFixed(1),
        rot: Math.round(rand() * 360),
        w: ring.w,
      });
    }
  }
  return out;
}

const COPY: Record<Wood, { unit: string; noun: string; line: string; about: string; pick: string; seed: number }> = {
  red: {
    unit: "cuffs",
    noun: "cuff",
    line: "Aged heartwood, sourced in 2011",
    about: "About the cuff",
    pick: "Choose a number on the dial if one matters to you. We confirm it is still free when we reply to your order.",
    seed: 2011,
  },
  white: {
    unit: "vials",
    noun: "vial",
    line: "One lot, harvested in 2011, distilled and aged",
    about: "About the Reserve",
    pick: "Choose a vial number if one matters to you. We confirm it is still free when we reply to your order; the number is written on the vial by hand.",
    seed: 1120,
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

/** One wood's edition: its numbered discs around the edition size. */
function Edition({ wood }: { wood: Wood }) {
  const ed = CONTENT[wood].edition;
  const product = getProduct(ed.productSlug)!;
  const copy = COPY[wood];
  const discs = layout(ed.size, copy.seed);
  const left = product.edition?.left ?? ed.size;
  const [chosen, setChosen] = useState<number | null>(null);

  return (
    <div className="mx-auto grid max-w-[1440px] items-center gap-14 lg:grid-cols-12 lg:gap-10">
      <div className="relative mx-auto aspect-square w-[min(92vw,600px)] lg:col-span-7 lg:mx-0 lg:w-full lg:max-w-[640px]">
        {/* faint clock ticks */}
        <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
          <circle cx="200" cy="200" r="196" fill="none" stroke="var(--o-line)" />
          <circle cx="200" cy="200" r={ed.size > 30 ? 104 : 124} fill="none" stroke="var(--o-line)" strokeDasharray="2 6" />
          {Array.from({ length: 84 }, (_, i) => (
            <line key={i} x1="200" y1="6" x2="200" y2={i % 4 === 0 ? 16 : 11} stroke="var(--o-line)" strokeWidth="1.4" transform={`rotate(${(i * 360) / 84} 200 200)`} />
          ))}
        </svg>

        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className={`${s.display} leading-[0.78] tracking-[-0.07em] ${ed.size > 30 ? "text-[clamp(5rem,15vw,10rem)]" : "text-[clamp(7rem,22vw,15rem)]"}`}>{ed.size}</p>
            <p className="mx-auto mt-3 max-w-[180px] text-[13px] leading-snug text-[var(--o-muted)] md:max-w-[220px] md:text-[14px]">
              {chosen ? (
                <>
                  You chose <span className="font-semibold text-[var(--o-ink)]">No. {pad(chosen)}</span>
                </>
              ) : (
                copy.line
              )}
            </p>
          </div>
        </div>

        <ul aria-label={`Choose a number from the edition of ${ed.size}`}>
          {discs.map((d) => {
            const on = chosen === d.n;
            return (
              <li key={d.n}>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`Number ${d.n} of ${ed.size}`}
                  onClick={() => setChosen(on ? null : d.n)}
                  className={`${s.vbtn} absolute aspect-square rounded-full`}
                  style={
                    {
                      width: `${d.w}%`,
                      left: `${d.left}%`,
                      top: `${d.top}%`,
                      "--dx": `${d.dx}px`,
                      "--dy": `${d.dy}px`,
                    } as React.CSSProperties
                  }
                >
                  <span
                    className={`${s.vdisc} absolute inset-0 rounded-full`}
                    style={{ "--gx": `${d.gx}%`, "--gy": `${d.gy}%`, transform: `rotate(${d.rot}deg)` } as React.CSSProperties}
                  />
                  {on && <span aria-hidden className="absolute -inset-[5px] rounded-full border-2 border-[var(--m-accent)]" />}
                  <span className={`${s.vnum} ${s.syne} pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 whitespace-nowrap rounded-full bg-[var(--o-ink)] px-2.5 py-1 text-[12px] font-bold text-white`}>
                    No. {pad(d.n)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="lg:col-span-5">
        <p className="text-[14px] font-semibold text-[var(--m-accent)]">
          Edition of {ed.size} {copy.unit}. {left} still to be placed.
        </p>
        <h2 className={`${s.display} mt-3 text-[clamp(3rem,5.2vw,5.6rem)]`}>{ed.name}</h2>
        <div className="mt-6 space-y-3 text-[17px] leading-relaxed text-[var(--o-ink-2)]">
          {product.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-5">
          <span className="relative size-[110px] shrink-0 overflow-hidden rounded-full bg-[var(--o-floor)]">
            <Photo p={product.shots[0].photo} tone={product.shots[0].tone} sizes="110px" />
          </span>
          <div>
            <p className={`${s.syne} text-[30px] font-bold tabular-nums tracking-[-0.03em]`}>{formatINR(product.price)}</p>
            <p className="text-[14px] text-[var(--o-muted)]">
              {product.name}, one {copy.noun}
            </p>
            <p className="mt-1 text-[14px] text-[var(--o-ink-2)]">{product.short}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <AddButton
            product={product}
            note={chosen ? `Requested number ${pad(chosen)} of ${ed.size}` : undefined}
            label={chosen ? `Add No. ${pad(chosen)} to bag` : "Add to bag"}
          />
          <Link
            href={productHref(product.slug)}
            className="group inline-flex h-14 items-center gap-2 rounded-full border border-[var(--o-line)] px-6 text-[15px] font-semibold transition-colors hover:border-[var(--o-ink)]"
          >
            {copy.about}
            <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <p className="mt-4 max-w-[420px] text-[14px] leading-relaxed text-[var(--o-muted)]">{copy.pick}</p>
      </div>
    </div>
  );
}

/** The edition of the current wood: the 2011 Vault (21 cuffs) or the 2011 Reserve (50 vials). */
export function Vault() {
  return (
    <section id="vault" className="relative overflow-hidden bg-[var(--o-bg)] px-5 py-24 md:px-10 md:py-32">
      <W red={<Edition wood="red" />} white={<Edition wood="white" />} />
    </section>
  );
}
