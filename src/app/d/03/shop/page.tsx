import type { Metadata } from "next";
import { Suspense } from "react";
import { WT } from "@/components/maison/W";
import { productsFor } from "@/lib/shop/products";
import { ShopClient } from "../_components/ShopView";
import { capital, inWords } from "../_components/words";

export const metadata: Metadata = {
  title: "The shop",
  description: "Every piece in red and white sandalwood, strung by category: malas, turned objects, powder, oil, attar, incense, carving, gifting and jewellery.",
};

/** The shop. The header is static; the strands read ?c= and so sit behind Suspense. */
export default function ShopPage() {
  const red = capital(inWords(productsFor("red").length));
  const white = capital(inWords(productsFor("white").length));
  return (
    <div className="pb-28 pt-28 md:pt-36">
      <header className="mx-auto max-w-[1440px] px-4 md:px-10">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-[15px] text-(--muted)">
              <WT red={<>Red sandalwood, <i>Pterocarpus santalinus</i></>} white={<>White sandalwood, <i>Santalum album</i></>} />
            </p>
            <h1 className="s3-serif mt-3 text-[clamp(3.2rem,8.4vw,8rem)] leading-[0.88] tracking-[-0.02em]">
              <WT
                red={
                  <>
                    All {red.toLowerCase()},
                    <br />
                    in red
                  </>
                }
                white={
                  <>
                    All {white.toLowerCase()},
                    <br />
                    in white
                  </>
                }
              />
            </h1>
          </div>
          <p className="s3-lede md:col-span-4 md:col-start-9 md:pb-3">
            <WT
              red="Dense red heartwood from the Eastern Ghats, strung by what each piece is for. Every one leaves with its batch record."
              white="Fragrant heartwood from Karnataka: oil, incense, chandan, beads and Mysuru carving. Every bottle and box carries its lot number."
            />
          </p>
        </div>
      </header>
      <div className="mt-10 md:mt-14">
        <Suspense fallback={<ShopWaiting />}>
          <ShopClient />
        </Suspense>
      </div>
    </div>
  );
}

/** While the strands load: the category thread, quietly. */
function ShopWaiting() {
  return (
    <div className="mx-auto min-h-[80svh] max-w-[1440px] px-4 md:px-10" aria-hidden>
      <div className="relative h-[86px]">
        <span className="absolute inset-x-0 top-[26px] h-px bg-(--thread)" />
        <span className="s3-knot absolute left-6 top-[22px]" />
      </div>
    </div>
  );
}
