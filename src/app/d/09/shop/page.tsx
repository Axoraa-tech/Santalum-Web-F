import type { Metadata } from "next";
import { Suspense } from "react";
import { W, WT } from "@/components/maison/W";
import s from "../styles";
import { HeldSky } from "../_components/Held";
import { ShopFromUrl, ShopView } from "../_components/Shop";

export const metadata: Metadata = {
  title: "Shop",
  description: "Every piece in red and white sandalwood: beads, desk objects, powder and jewellery; oil, attar, incense, chandan and Mysuru carving.",
};

/** The shop, held at noon: the flat light shows each piece as it is. */
export default function ShopPage() {
  return (
    <>
      <HeldSky min={720} />
      <div className={`${s.swap} relative mx-auto max-w-[1600px] px-5 pb-10 pt-28 sm:px-8 lg:px-10 lg:pt-36`}>
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <p className={`${s.num} text-[21px] tracking-[0.04em] text-[var(--muted)] lg:text-[25px]`}>12:00</p>
            <h1 className={`${s.display} mt-1 text-[clamp(2.6rem,10.5vw,7rem)] leading-[0.92]`}>
              <WT
                red={
                  <>
                    Red sandalwood,
                    <br />
                    every piece
                  </>
                }
                white={
                  <>
                    White sandalwood,
                    <br />
                    every piece
                  </>
                }
              />
            </h1>
          </div>
          <p className="max-w-[32rem] text-[17px] leading-[1.7] text-[var(--muted)] lg:col-span-4 lg:col-start-9 lg:pb-3">
            <WT
              red="At noon the light falls straight down and shows each piece as it is: twenty-six in red sandalwood, from the powder at first light to the Vault cuff at dusk."
              white="At noon the light falls straight down and shows each piece as it is: twenty-six in white sandalwood, from the chandan stone before sunrise to the Reserve oil at dusk."
            />
          </p>
        </header>

        <W
          red={
            <Suspense fallback={<ShopView wood="red" />}>
              <ShopFromUrl wood="red" />
            </Suspense>
          }
          white={
            <Suspense fallback={<ShopView wood="white" />}>
              <ShopFromUrl wood="white" />
            </Suspense>
          }
        />
      </div>
    </>
  );
}
