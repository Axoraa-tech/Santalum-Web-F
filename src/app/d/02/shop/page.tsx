import type { Metadata } from "next";
import { Suspense } from "react";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, productsFor, type Wood } from "@/lib/shop/products";
import { ShopView, ShopWoodFromQuery } from "../_components/ShopView";
import { s } from "../_components/cls";

export const metadata: Metadata = {
  title: "Shop",
  description: "Red sandalwood beads, objects and jewellery; white sandalwood oil, attar, incense and Mysuru carving. Two shops, one house.",
};

const RING: Record<Wood, string> = {
  red: "Pterocarpus santalinus   Eastern Ghats   dense, deep red   ".repeat(2),
  white: "Santalum album   Mysuru, Karnataka   pale gold, fragrant   ".repeat(2),
};

function Header({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  const n = productsFor(wood).length;
  const ranges = CATEGORIES[wood].length;
  return (
    <div className="grid items-end gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
      {/* the title is sized to its own column (container units), so "sandalwood" always fits beside the disc */}
      <div className="@container min-w-0">
        <p className="text-[15px] text-[var(--o-muted)]">
          {n} pieces in {ranges} ranges. <span className={s.deva}>{c.sanskrit}</span>, <span className={s.deva}>{c.kannada}</span>
        </p>
        <h1 className={`${s.display} mt-4 text-[length:min(9rem,10cqi)]`}>{c.name}</h1>
        <p className="mt-6 max-w-[620px] text-[17px] leading-relaxed text-[var(--o-ink-2)]">{c.intro[0]}</p>
      </div>
      {/* the wood itself, with its name running round the edge */}
      <div className="relative hidden size-[220px] shrink-0 overflow-hidden rounded-full md:block lg:size-[260px]">
        <svg viewBox="0 0 260 260" className={`absolute inset-0 ${s.spinSlow}`} aria-hidden>
          <defs>
            <path id={`o2-shopring-${wood}`} d="M130,130 m-112,0 a112,112 0 1,1 224,0 a112,112 0 1,1 -224,0" />
          </defs>
          <text className={s.syne} fontSize="13" fontWeight="700" fill="var(--o-ink)">
            <textPath href={`#o2-shopring-${wood}`} textLength="700" lengthAdjust="spacing">
              {RING[wood]}
            </textPath>
          </text>
        </svg>
        <span className={`absolute inset-[34px] rounded-full shadow-[0_30px_60px_-30px_rgb(25_23_20/0.6)] ${wood === "red" ? s.woodRed : s.woodWhite}`} />
      </div>
    </div>
  );
}

/** A quiet ring while the shop (which reads the URL) arrives in the browser. */
function Waiting() {
  return (
    <div className="flex gap-5 overflow-hidden" aria-hidden>
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} className="size-[76px] shrink-0 rounded-full bg-[var(--o-floor)] md:size-[96px]" />
      ))}
    </div>
  );
}

/** The shop: both woods are rendered, CSS shows the current one, each keeps its own filters. */
export default function OrbitShopPage() {
  return (
    <div className="px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="mx-auto max-w-[1440px]">
        <W red={<Header wood="red" />} white={<Header wood="white" />} />
        <div className="mt-12 md:mt-16">
          <Suspense fallback={<Waiting />}>
            <ShopWoodFromQuery />
            <W red={<ShopView wood="red" />} white={<ShopView wood="white" />} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
