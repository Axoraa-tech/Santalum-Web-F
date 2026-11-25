import { Photo } from "../../Photo";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct, type Product } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood-boot";
import { Pill } from "../Pill";
import { W } from "../W";

const EDITION: Record<Wood, Product> = {
  red: getProduct(CONTENT.red.edition.productSlug)!,
  white: getProduct(CONTENT.white.edition.productSlug)!,
};

const GIFT_CATEGORY: Record<Wood, string> = { red: "gifting", white: "w-gifting" };

/**
 * The edition of each wood. Red: the 2011 Vault, twenty-one numbered cuffs shown as twenty-one slices.
 * White: the 2011 Reserve, fifty numbered vials. Numbers already placed are drawn hollow.
 * Then gifting, which differs as much as the woods do.
 */
export function Vault() {
  return (
    <section className="px-5 pb-6 pt-16 md:px-10 md:pb-8 md:pt-20">
      <W red={<Edition wood="red" />} white={<Edition wood="white" />} />
      <W red={<Gifting wood="red" />} white={<Gifting wood="white" />} />
    </section>
  );
}

function Edition({ wood }: { wood: Wood }) {
  const e = CONTENT[wood].edition;
  const p = EDITION[wood];
  const size = p.edition?.size ?? e.size;
  const left = p.edition?.left ?? size;
  const placed = size - left;
  const red = wood === "red";
  return (
    // top-aligned, the words ride beside the taller grid of fifty vials instead of floating in its middle
    <div className="mx-auto grid max-w-[1500px] items-center gap-14 lg:grid-cols-2 lg:items-start">
      <div className="lg:sticky lg:top-28 lg:pt-4">
        <h2 className="font-display text-[clamp(2.6rem,5.2vw,5.2rem)] font-[350] leading-[0.95] tracking-[-0.03em]">{e.name}</h2>
        <p className="mt-6 max-w-md text-[17px] leading-relaxed text-(--mz-ink-2)">{e.text}</p>
        <dl className="mt-8 grid max-w-md grid-cols-3 border-y border-(--mz-line) py-4 text-[15px]">
          <div>
            <dt className="text-[13px] text-(--mz-ink-3)">{red ? "Cuffs" : "Vials"}</dt>
            <dd className="mt-1 font-display text-[26px] tabular-nums">{size}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-(--mz-ink-3)">Still to place</dt>
            <dd className="mt-1 font-display text-[26px] tabular-nums text-(--mz-accent)">{left}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-(--mz-ink-3)">{red ? "Each" : "3 ml"}</dt>
            <dd className="mt-1 font-display text-[26px] tabular-nums">{formatINR(p.price)}</dd>
          </div>
        </dl>
        <div className="mt-10">
          <Pill href={`/maison/shop/${p.slug}`} size="lg">
            {red ? "See the Vault cuff" : "See the Reserve oil"}
          </Pill>
        </div>
      </div>
      <figure>
        <ol
          className={`grid rounded-[2.5rem] border border-(--mz-line) p-4 sm:p-6 ${red ? "grid-cols-7 gap-2.5 sm:gap-3.5" : "grid-cols-10 gap-x-1.5 gap-y-3 sm:gap-x-2.5 sm:gap-y-4"}`}
          aria-label={`${size} numbered ${red ? "cuffs" : "vials"}, ${left} still to be placed`}
        >
          {Array.from({ length: size }, (_, i) => {
            const gone = i < placed;
            return (
              <li key={i} className={`group relative ${red ? "aspect-square" : "aspect-[1/2]"}`}>
                <span
                  className={`absolute inset-0 overflow-hidden transition-transform duration-700 ease-out-soft group-hover:-translate-y-1 ${
                    red ? "rounded-full group-hover:rotate-90" : "rounded-t-full rounded-b-[30%]"
                  } ${gone ? "opacity-30 grayscale" : "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]"}`}
                >
                  <span className={`absolute inset-0 ${red ? "ring-red" : "ring-white"}`} />
                </span>
                <span className="pointer-events-none absolute inset-0 grid place-items-center">
                  <span className={`rounded-full px-1 text-[10px] tabular-nums sm:text-[12px] ${gone ? "text-(--mz-ink-3)" : "bg-(--mz-bg)/85 text-(--mz-ink)"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        <figcaption className="mt-4 px-2 text-[14px] text-(--mz-ink-3)">
          {red ? `Numbers 01 to ${String(placed).padStart(2, "0")} are with their keepers; each sale is entered in the registry.` : `Vials 01 to ${String(placed).padStart(2, "0")} have been placed; the lot and date of each are in the registry.`}
        </figcaption>
      </figure>
    </div>
  );
}

function Gifting({ wood }: { wood: Wood }) {
  const g = CONTENT[wood].gifting;
  const photo = wood === "red" ? getProduct("r-desk-set")!.shots[0] : getProduct("w-morning-ritual")!.shots[0];
  return (
    <div className="mx-auto mt-24 grid max-w-[1500px] items-center gap-8 rounded-[2.5rem] bg-(--mz-surface) p-4 md:mt-32 md:grid-cols-[auto_1fr_auto] md:gap-10 md:rounded-full md:p-4 md:pr-10">
      <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] md:w-44 md:rounded-full">
        <Photo p={photo.photo} tone={photo.tone} sizes="(min-width: 768px) 176px, 100vw" />
      </div>
      <div className="px-3 md:px-0">
        <h3 className="font-display text-[clamp(1.9rem,3vw,2.6rem)] leading-[1] tracking-[-0.02em]">{g.title}</h3>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-(--mz-ink-2)">{g.text}</p>
      </div>
      <div className="px-3 pb-3 md:px-0 md:pb-0">
        <Pill href={`/maison/shop?c=${GIFT_CATEGORY[wood]}`} variant="line" size="lg">
          {wood === "red" ? "Red sandalwood gifts" : "White sandalwood gifts"}
        </Pill>
      </div>
    </div>
  );
}
