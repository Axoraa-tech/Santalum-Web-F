"use client";

import Link from "next/link";
import { useState } from "react";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import { AddToBag, productHref } from "./bits";
import { capital, inWords } from "./words";
import { ui } from "./store";

const C = 0.34;
/** a hanging cord: 0 at the ends, 1 at the lowest point */
const sag = (x: number) => 1 - (Math.cosh((x - 0.5) / C) - 1) / (Math.cosh(0.5 / C) - 1);
function beadsFor(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const x = 0.035 + (i / (count - 1)) * 0.93;
    // rounded so server and client agree to the digit
    return { n: i + 1, x: Math.round(x * 10000) / 100, y: Math.round((10 + sag(x) * 70) * 100) / 100 };
  });
}

const COPY: Record<Wood, { word: string; unit: string; view: string; label: string }> = {
  red: { word: "Vault", unit: "cuffs", view: "View the cuff", label: "Twenty-one numbered cuffs" },
  white: { word: "Reserve", unit: "vials", view: "View the oil", label: "Fifty numbered vials" },
};

/** The edition: red is the 2011 Vault (21 cuffs), white the 2011 Reserve (50 vials). One numbered bead each. */
export function Vault() {
  return (
    <section id="vault" aria-labelledby="vault-h" className="relative z-[1] px-4 pb-20 pt-24 md:px-10 md:pb-24 md:pt-28">
      <W red={<Edition wood="red" />} white={<Edition wood="white" />} />
    </section>
  );
}

function Edition({ wood }: { wood: Wood }) {
  const e = CONTENT[wood].edition;
  const p = getProduct(e.productSlug)!;
  const t = COPY[wood];
  const beads = beadsFor(e.size);
  const [sel, setSel] = useState<number | null>(null);
  const shot = p.shots[0];
  const left = p.edition?.left ?? 0;
  const dense = e.size > 30;

  return (
    <>
      <div className="mx-auto grid max-w-[1440px] gap-14 md:grid-cols-12 md:items-center md:gap-10">
        <div className="bg-(--linen) md:col-span-6">
          <h2 id={wood === "red" ? "vault-h" : "vault-h-w"} className="s3-serif leading-[0.86]">
            <span className="block text-[clamp(1.8rem,3vw,2.8rem)]">The</span>
            <span className="block text-[clamp(6rem,16vw,15rem)] tracking-[-0.03em] text-(--m-accent)">2011</span>
            <span className="block text-[clamp(1.8rem,3vw,2.8rem)]">{t.word}</span>
          </h2>
          <p className="s3-lede mt-8 max-w-[32rem]">{e.text}</p>
          <p className="mt-4 max-w-[32rem] text-[16px] leading-[1.7] text-(--ink)/75">{p.story[p.story.length - 1]}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <p>
              <span className="s3-serif block text-[34px] leading-none">{formatINR(p.price)}</span>
              <span className="mt-1 block text-[14px] text-(--muted)">
                {capital(inWords(left))} of {e.size} {t.unit} still in the {t.word.toLowerCase()}
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              <AddToBag slug={p.slug} />
              <button type="button" className="s3-btn s3-btn-line" onClick={() => ui.openProduct(p.slug)}>
                {t.view}
              </button>
            </div>
          </div>
          <Link href={productHref(p.slug)} className="s3-link mt-6 inline-block text-[15px]">
            The {t.word.toLowerCase()} page, with the registry details
          </Link>
        </div>

        <div className="relative md:col-span-5 md:col-start-8">
          <div className="relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-full bg-(--warm)">
            <Photo p={shot.photo} tone={shot.tone} sizes="(min-width: 768px) 40vw, 90vw" />
          </div>
          <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-baseline gap-2 whitespace-nowrap rounded-full bg-(--linen) px-5 py-2 md:left-auto md:right-[4%] md:translate-x-0">
            {sel ? (
              <>
                <span className="text-[13px] text-(--muted)">No.</span>
                <span className="s3-serif text-[30px] leading-none tabular-nums">{String(sel).padStart(2, "0")}</span>
                <span className="text-[13px] text-(--muted)">of {e.size}</span>
              </>
            ) : (
              <span className="text-[14px]">{t.label}</span>
            )}
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-16 h-[150px] max-w-[1440px] md:mt-20 md:h-[250px]">
        {/* the page thread comes in from the right and leaves on the left, towards Gifting */}
        {[...beads].reverse().map((b) => (
          <span key={b.n} data-knot className="absolute h-px w-px" style={{ left: `${b.x}%`, top: `${b.y}%` }} aria-hidden />
        ))}
        <ul aria-label={t.label} onMouseLeave={() => setSel(null)}>
          {beads.map((b) => (
            <li key={b.n} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
              <button
                type="button"
                onMouseEnter={() => setSel(b.n)}
                onFocus={() => setSel(b.n)}
                onBlur={() => setSel(null)}
                onClick={() => ui.openProduct(p.slug)}
                aria-label={`${wood === "red" ? "Cuff" : "Vial"} number ${b.n} of ${e.size}`}
                className="group relative grid place-items-center"
              >
                <span
                  className={`s3-bead grid place-items-center text-[0px] transition-transform duration-500 group-hover:scale-[1.18] group-active:scale-95 ${
                    dense ? "h-[6px] w-[6px] sm:h-[13px] sm:w-[13px] md:h-[22px] md:w-[22px] lg:text-[10px]" : "h-[15px] w-[15px] sm:h-[26px] sm:w-[26px] md:h-[46px] md:w-[46px] md:text-[13px]"
                  } ${sel === b.n ? "scale-[1.18]" : ""}`}
                >
                  <span className="s3-vnum relative font-medium tabular-nums">{String(b.n).padStart(2, "0")}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
