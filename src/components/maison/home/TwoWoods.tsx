"use client";

import { Photo } from "../../Photo";
import { CONTENT } from "@/lib/shop/content";
import { productsFor } from "@/lib/shop/products";
import { switchWood, useWood } from "@/lib/wood";
import type { Wood } from "@/lib/wood-boot";
import { WT } from "../W";

const DISC: Record<Wood, (typeof CONTENT)["red"]["hero"]["photo"]> = {
  red: CONTENT.red.hero.photoAlt,
  white: CONTENT.white.hero.photo,
};

/**
 * The two woods side by side. The one you are viewing comes forward (CSS reads <html data-wood>,
 * so there is no flash on reload); tap the other to switch the whole house over.
 */
export function TwoWoods() {
  const wood = useWood();
  return (
    <section id="material" className="scroll-mt-24 px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="font-display text-[clamp(2.6rem,5.6vw,5.5rem)] font-[350] leading-[0.95] tracking-[-0.03em] lg:col-span-7">
            <WT red="Two sandalwoods. This is the dense one." white="Two sandalwoods. This is the fragrant one." />
          </h2>
          <p className="max-w-lg text-[17px] leading-relaxed text-(--mz-ink-2) lg:col-span-5 lg:pb-2">
            <WT red={CONTENT.red.intro[0]} white={CONTENT.white.intro[0]} />
          </p>
        </div>

        <div className="mt-16 grid gap-14 md:grid-cols-2 md:gap-10">
          {(["red", "white"] as Wood[]).map((w) => {
            const on = wood === w;
            const c = CONTENT[w];
            return (
              <article key={w} className="mz-disc-text" data-w={w}>
                <button
                  type="button"
                  onClick={() => !on && switchWood(w)}
                  aria-pressed={on}
                  aria-label={on ? `Viewing ${c.name.toLowerCase()}` : `Switch the house to ${c.name.toLowerCase()}`}
                  data-w={w}
                  className="mz-disc group relative block aspect-square w-full max-w-[34rem] overflow-hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent)"
                >
                  <Photo p={DISC[w]} sizes="(min-width: 768px) 45vw, 100vw" className="transition-transform duration-[1400ms] ease-out-soft group-hover:scale-105" />
                  <span className="mz-disc-chip absolute inset-x-0 bottom-[12%] mx-auto w-fit rounded-full bg-(--mz-bg)/85 px-4 py-2 text-[14px] text-(--mz-ink) backdrop-blur">
                    {w === "red" ? "See the red house" : "See the white house"}
                  </span>
                </button>
                <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <h3 className="font-display text-[34px] leading-none tracking-[-0.02em]">{c.name}</h3>
                  <p className="text-[14px] text-(--mz-ink-3)">
                    {productsFor(w).length} pieces in the shop
                  </p>
                </div>
                <p className="mt-3 max-w-[34rem] text-[16px] leading-relaxed text-(--mz-ink-2)">{c.oneLine}</p>
                <dl className="mt-6 max-w-[34rem] border-t border-(--mz-line)">
                  {c.facts.map((f) => (
                    <div key={f.label} className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-(--mz-line) py-3 text-[15px]">
                      <dt className="text-(--mz-ink-3)">{f.label}</dt>
                      <dd className={f.label === "Species" ? "font-display italic" : ""}>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
