"use client";

import { Photo } from "../../Photo";
import { PHOTOS } from "@/lib/photos";
import { switchWood, useWood } from "@/lib/wood";
import type { Wood } from "@/lib/wood-boot";

const SPECS: Record<Wood, [string, string][]> = {
  red: [
    ["Botanical name", "Pterocarpus santalinus"],
    ["Grows in", "The Eastern Ghats, mainly Andhra Pradesh"],
    ["Heartwood", "Deep red, dense, fine-grained"],
    ["Scent", "Almost none"],
    ["We make", "Beads, objects, powder, jewellery"],
    ["Trade", "CITES Appendix II"],
  ],
  white: [
    ["Botanical name", "Santalum album"],
    ["Grows in", "The dry forests of southern India"],
    ["Heartwood", "Pale gold, close-grained"],
    ["Scent", "Warm and long-lasting; the oil is in the heartwood"],
    ["We make", "Beads, oil, powder, objects, jewellery"],
    ["Trade", "Regulated by the states where it grows"],
  ],
};

/** The two woods side by side. The one you are viewing comes forward; tap the other to switch. */
export function TwoWoods() {
  const wood = useWood();
  return (
    <section id="material" className="scroll-mt-24 px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1500px]">
        <h2 className="max-w-3xl font-display text-[clamp(2.6rem,5.6vw,5.5rem)] font-[350] leading-[0.95] tracking-[-0.03em]">
          Two sandalwoods, one house
        </h2>
        <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-2">
          They share a name and almost nothing else. One is prized for its colour, the other for its scent.
        </p>

        <div className="mt-16 grid gap-14 md:grid-cols-2 md:gap-10">
          {(["red", "white"] as Wood[]).map((w) => {
            const on = wood === w;
            return (
              <article key={w}>
                <button
                  type="button"
                  onClick={() => !on && switchWood(w)}
                  aria-pressed={on}
                  aria-label={on ? `Viewing ${w} sandalwood` : `Switch to ${w} sandalwood`}
                  className={`group relative block aspect-square w-full max-w-[34rem] overflow-hidden rounded-full transition-[transform,filter,opacity] duration-[900ms] ease-out-soft ${
                    on ? "scale-100" : "scale-[0.86] opacity-70 grayscale-[35%] hover:scale-[0.9] hover:opacity-100"
                  }`}
                >
                  <Photo
                    p={w === "red" ? PHOTOS.redChip : PHOTOS.whiteLog}
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="transition-transform duration-[1400ms] ease-out-soft group-hover:scale-105"
                  />
                  {!on && (
                    <span className="absolute inset-x-0 bottom-[12%] mx-auto w-fit rounded-full bg-paper/85 px-4 py-2 text-[14px] backdrop-blur">
                      View {w} sandalwood
                    </span>
                  )}
                </button>
                <h3 className="mt-8 font-display text-[34px] leading-none tracking-[-0.02em]">
                  {w === "red" ? "Red sandalwood" : "White sandalwood"}
                </h3>
                <dl className="mt-6 max-w-[34rem] border-t border-hair">
                  {SPECS[w].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-hair py-3 text-[15px]">
                      <dt className="text-ink-3">{k}</dt>
                      <dd className={k === "Botanical name" ? "font-display italic" : ""}>{v}</dd>
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
