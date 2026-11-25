import type { Metadata } from "next";
import { Suspense } from "react";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, priceRange, productsFor } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import { s } from "../_components/cx";
import { ShopSkeleton, ShopView } from "../_components/Shop";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Every piece in red sandalwood and white sandalwood, as a parts catalogue: beads, objects, oil, attar, chandan, Mysuru carving and gifting.",
};

/** The shop as a catalogue sheet: a title block, then the drawers, the filters and the parts. */
export default function LatheShopPage() {
  return (
    <div className="px-4 pb-10 pt-[84px] md:px-8 md:pt-[104px]">
      <div className="mx-auto max-w-[1400px]">
        <W red={<TitleBlock wood="red" />} white={<TitleBlock wood="white" />} />
        <div className="mt-8 md:mt-10">
          <Suspense fallback={<ShopSkeleton />}>
            <W red={<ShopView wood="red" />} white={<ShopView wood="white" />} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function TitleBlock({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  const [lo, hi] = priceRange(wood);
  return (
    <header className="grid border border-(--ink) bg-(--sheet) md:grid-cols-[1fr_auto_auto_auto]">
      <div className="px-5 py-5 md:px-7 md:py-6">
        <h1 className={`${s.x125} text-[clamp(2.4rem,5.6vw,5rem)] font-[600] leading-[0.9] tracking-[-0.03em]`}>
          {wood === "red" ? "Parts catalogue" : "Lot catalogue"}
        </h1>
        <p className="mt-3 max-w-[40rem] text-[16px] leading-[1.55] text-(--ink-2)">
          {wood === "red" ? (
            <>
              Every piece we turn and carve in red sandalwood, <em className="not-italic text-(--ink)">{c.latin}</em>. Dense, deep red and almost
              without scent; each leaves with its batch record.
            </>
          ) : (
            <>
              Every bottle, jar, bead and carving we make in white sandalwood, <em className="not-italic text-(--ink)">{c.latin}</em>. Heartwood only;
              each carries its lot number.
            </>
          )}
        </p>
      </div>
      <div className="grid grid-cols-[auto_auto_1fr] md:contents">
        <Cell k="Sheet" v={wood === "red" ? "A, red" : "B, white"} />
        <Cell k={wood === "red" ? "Parts" : "Lots"} v={String(productsFor(wood).length)} />
        <Cell k="Range" v={`${formatINR(lo)} to ${formatINR(hi)}`} />
      </div>
    </header>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div className={`${s.mono} border-t border-(--hair-2) px-4 py-2.5 text-[12px] not-first:border-l md:border-t-0 md:border-l md:px-6 md:py-6`}>
      <span className="block text-[10.5px] text-(--steel)">{k}</span>
      <span className="mt-1 block tabular-nums md:mt-2 md:text-[15px]">{v}</span>
    </div>
  );
}
