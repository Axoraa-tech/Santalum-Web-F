import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopSkeleton, ShopView } from "@/components/maison/shop/ShopView";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, priceRange, productsFor, formatINR } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood-boot";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Red sandalwood beads, objects, powder, jewellery and gifts; white sandalwood oil, attar, incense, chandan, carving and gifts. Free delivery across India.",
};

const LEAD: Record<Wood, string> = {
  red: "Turned, carved and strung from the dense red heartwood of the Eastern Ghats. No lacquer, no stain; every piece leaves with its batch record.",
  white: "Distilled, rolled and carved from fragrant white heartwood, the way Mysuru has done it for centuries. Every bottle, jar and box carries its lot.",
};

function Header({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  const [lo, hi] = priceRange(wood);
  return (
    <div className="grid gap-8 md:grid-cols-12 md:items-end">
      <div className="md:col-span-7">
        <p className="flex items-baseline gap-3 text-(--mz-accent)">
          <span lang="sa" className="font-deva text-[20px] leading-none">
            {c.sanskrit}
          </span>
          <span className="font-display text-[16px] italic text-(--mz-ink-2)">{c.latin}</span>
        </p>
        <h1 className="mt-4 font-display text-[clamp(3.2rem,8.4vw,8.6rem)] font-[350] leading-[0.9] tracking-[-0.04em]">{c.name}</h1>
      </div>
      <div className="md:col-span-5 md:pb-3">
        <p className="max-w-md text-[17px] leading-relaxed text-(--mz-ink-2)">{LEAD[wood]}</p>
        <p className="mt-4 text-[14px] text-(--mz-ink-3)">
          {productsFor(wood).length} pieces in {CATEGORIES[wood].length} kinds, {formatINR(lo)} to {formatINR(hi)}. Free delivery across India.
        </p>
      </div>
    </div>
  );
}

/** The dedicated shop. Both woods render; CSS shows the current one, so there is no flash and each keeps its own filters. */
export default function Shop() {
  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-8 pt-32 md:px-10 md:pt-40">
      <W red={<Header wood="red" />} white={<Header wood="white" />} />
      <div className="mt-14">
        <Suspense fallback={<ShopSkeleton />}>
          <W red={<ShopView wood="red" />} white={<ShopView wood="white" />} />
        </Suspense>
      </div>
    </div>
  );
}
