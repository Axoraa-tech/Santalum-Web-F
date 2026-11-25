"use client";

import Link from "next/link";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { getProduct, priceLabel, type Product } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import { AddOrChoose } from "./bits";
import { s } from "./cx";
import { shotsOf } from "./data";
import { DimH } from "./Dim";

/** Each wood's gift assembly: the piece drawn large with callouts, then a short bill of gift pieces. */
const GIFTS: Record<Wood, { title: string; hero: string; list: string[]; cat: string; note: string }> = {
  red: {
    title: "Give something that remains",
    hero: "r-presentation-box",
    list: ["r-presentation-box", "r-mala-box", "r-desk-set", "r-heirloom-casket"],
    cat: "gifting",
    note: "Desk sets from ten for teams and clients, with a card in your words. Ask for engraving in the gift note at checkout.",
  },
  white: {
    title: "A gift that fills the room",
    hero: "w-morning-ritual",
    list: ["w-morning-ritual", "w-boxed-oil", "w-wedding-tray"],
    cat: "w-gifting",
    note: "Wedding trays from ten, packed by hand, with names on the cards if you send them with the order.",
  },
};

export function Gifting() {
  return (
    <section id="gifting" className="relative scroll-mt-14 border-t border-(--hair) px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-[1400px]">
        <W red={<Assembly wood="red" />} white={<Assembly wood="white" />} />
      </div>
    </section>
  );
}

function Assembly({ wood }: { wood: Wood }) {
  const g = GIFTS[wood];
  const hero = getProduct(g.hero)!;
  const shot = shotsOf(hero)[0];
  const size = hero.details.find((d) => d.label === "Size")?.value;
  const callouts = hero.details.filter((d) => d.label !== "Size").slice(0, 3);
  const list = g.list.map((x) => getProduct(x)).filter((x): x is Product => !!x);

  return (
    <>
      <h2 className={`${s.x125} max-w-[14ch] text-[clamp(2.6rem,6.2vw,6.4rem)] font-[600] leading-[0.88] tracking-[-0.03em]`}>{g.title}</h2>

      <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-12">
        {/* Assembly drawing */}
        <figure className="relative lg:col-span-7">
          <div className="relative ml-0 mr-6 mt-10 md:mr-44">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] bg-(--paper-2)">
              <Photo p={shot.photo} tone={shot.tone} sizes="(min-width:1024px) 45vw, 90vw" />
            </div>
            {size ? <DimH label={size} className="-top-8 left-0 right-0" /> : <DimH label={hero.name} className="-top-8 left-0 right-0" />}
            <ol className="mt-6 grid gap-3 md:absolute md:-right-44 md:top-[12%] md:mt-0 md:w-40">
              {callouts.map((d, i) => (
                <li key={d.label} className="relative">
                  <span aria-hidden className="absolute -left-14 top-[9px] hidden h-px w-12 bg-(--ink) md:block" />
                  <span aria-hidden className="absolute -left-[60px] top-[6px] hidden size-[7px] rounded-full border border-(--ink) bg-(--paper) md:block" />
                  <p className={`${s.mono} text-[11px] text-(--steel)`}>
                    {i + 1}. {d.label}
                  </p>
                  <p className="text-[14px] leading-snug">{d.value}</p>
                </li>
              ))}
            </ol>
          </div>
          <figcaption className={`${s.mono} mt-5 text-[11px] text-(--steel)`}>
            {hero.name}, {CONTENT[wood].name.toLowerCase()}. {hero.short}
          </figcaption>
        </figure>

        {/* A short bill of gift pieces */}
        <div className="lg:col-span-5">
          <p className="max-w-[28rem] text-[16px] leading-[1.6] text-(--ink-2)">{CONTENT[wood].gifting.text}</p>
          <div className={`${s.mono} mt-8 grid grid-cols-[1fr_auto] border-b border-(--ink) pb-2 text-[10.5px] text-(--steel)`}>
            <span>Assembly</span>
            <span>Price</span>
          </div>
          <ul>
            {list.map((p) => (
              <li key={p.slug} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-(--hair) py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-(--paper-2)">
                    <Photo p={shotsOf(p)[0].photo} tone={shotsOf(p)[0].tone} sizes="44px" />
                  </span>
                  <div className="min-w-0">
                    <Link href={`/d/01/p/${p.slug}`} className="block truncate text-[15.5px] font-[540] transition-colors hover:text-(--accent)">
                      {p.name}
                    </Link>
                    <p className={`${s.mono} truncate text-[11.5px] text-(--steel)`}>{p.details[0]?.value}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`${s.mono} text-[13px] tabular-nums`}>{priceLabel(p)}</span>
                  <AddOrChoose p={p} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[28rem] text-[14px] leading-[1.55] text-(--steel)">{g.note}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href={`/d/01/shop?c=${g.cat}`} className={s.btnLine}>
              All {wood === "red" ? "red" : "white"} sandalwood gifts
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
