"use client";

import Link from "next/link";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, WOOD_NAMES } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { switchWood, useWood } from "@/lib/wood";
import { s } from "./cx";
import { DimH } from "./Dim";
import { sheet } from "./store";

const FILLS = ["japa-mala", "heartwood-powder", "heartwood-oil"];

/** Gifting: the presentation box as an assembly drawing, and three ways to fill it. */
export function Gifting() {
  const wood = useWood();
  const box = getFamily("presentation-box")!;
  const bv = box.variants[wood]!;
  const shot = bv.shots[0];
  const callouts = box.details.filter((d) => d.label !== "Size");
  const size = box.details.find((d) => d.label === "Size")?.value ?? "";

  return (
    <section id="gifting" className="relative scroll-mt-14 border-t border-(--hair) px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-[1400px]">
        <h2 className={`${s.x125} max-w-[14ch] text-[clamp(2.6rem,6.2vw,6.4rem)] font-[600] leading-[0.88] tracking-[-0.03em]`}>
          Give something that remains
        </h2>

        <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-12">
          {/* Assembly drawing */}
          <figure className="relative lg:col-span-7">
            <div className="relative ml-0 mr-6 mt-10 md:mr-44">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] bg-(--paper-2)">
                <Photo p={shot.photo} tone={shot.tone} sizes="(min-width:1024px) 45vw, 90vw" />
              </div>
              <DimH label={size} className="-top-8 left-0 right-0" />
              {/* Callouts from the catalogue details */}
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
              {box.name}, {WOOD_NAMES[wood].common.toLowerCase()}. {box.summary}
            </figcaption>
          </figure>

          {/* Fill it: a small bill of materials */}
          <div className="lg:col-span-5">
            <p className="max-w-[28rem] text-[16px] leading-[1.6] text-(--ink-2)">
              The box is the gift as much as what goes in it. Choose it empty, or fill it with one of these. For teams, clients
              and occasions we fill boxes in numbers and add a card in your words.
            </p>
            <div className={`${s.mono} mt-8 grid grid-cols-[1fr_auto] border-b border-(--ink) pb-2 text-[10.5px] text-(--steel)`}>
              <span>Assembly</span>
              <span>Total</span>
            </div>
            <ul>
              <li className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-(--hair) py-4">
                <div>
                  <p className="text-[15.5px] font-[540]">The box, empty</p>
                  <p className={`${s.mono} text-[11.5px] text-(--steel)`}>For what you choose to put in it</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`${s.mono} text-[13px] tabular-nums`}>{formatINR(bv.price)}</span>
                  <AddButton slugs={["presentation-box"]} label="Add the box" />
                </div>
              </li>
              {FILLS.map((slug) => {
                const f = getFamily(slug)!;
                const fv = f.variants[wood];
                const fshot = (fv ?? f.variants.white ?? f.variants.red)!.shots[0];
                return (
                  <li key={slug} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-(--hair) py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex shrink-0 items-center">
                        <span className="relative size-11 overflow-hidden rounded-full bg-(--paper-2) shadow-[0_0_0_2px_var(--paper)]">
                          <Photo p={shot.photo} tone={shot.tone} sizes="44px" />
                        </span>
                        <span className="relative -ml-3 size-11 overflow-hidden rounded-full bg-(--paper-2) shadow-[0_0_0_2px_var(--paper)]">
                          <Photo p={fshot.photo} tone={fshot.tone} sizes="44px" />
                        </span>
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[15.5px] font-[540]">Box with {f.name.replace(/, .*/, "").toLowerCase()}</p>
                        <p className={`${s.mono} truncate text-[11.5px] text-(--steel)`}>
                          {fv ? `${formatINR(bv.price)} + ${formatINR(fv.price)}` : "Made in white sandalwood only"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {fv ? (
                        <>
                          <span className={`${s.mono} text-[13px] tabular-nums`}>{formatINR(bv.price + fv.price)}</span>
                          <AddButton slugs={["presentation-box", slug]} label="Add both" />
                        </>
                      ) : (
                        <button type="button" onClick={() => switchWood("white")} className={s.link}>
                          Switch to Santalum
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/d/01/p/presentation-box" className={s.btnLine}>
                View the box
              </Link>
              <span className="text-[13.5px] text-(--steel)">Gift presentation and a handwritten card can be added at checkout.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AddButton({ slugs, label }: { slugs: string[]; label: string }) {
  const wood = useWood();
  return (
    <button
      type="button"
      onClick={() => {
        slugs.forEach((x) => bag.add(x, wood));
        sheet.open();
      }}
      className={`${s.mono} grid h-8 place-items-center whitespace-nowrap rounded-full border border-(--hair-2) px-3 text-[12px] transition-colors hover:border-(--ink) hover:bg-(--ink) hover:text-(--paper) active:scale-95`}
    >
      {label}
    </button>
  );
}
