import type { Metadata } from "next";
import { Suspense } from "react";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { productsFor } from "@/lib/shop/products";
import { PageFooter } from "../_components/PageFooter";
import { ShopView } from "../_components/shop/ShopView";

export const metadata: Metadata = {
  title: "Shop",
  description: "Every piece in red and white sandalwood: beads, objects, oil, attar, incense, carving and gifts. Free delivery across India.",
};

/** The shop reads ?c= (a category), so the listing waits behind Suspense; the fallback is the header card in both woods. */
export default function StackShop() {
  return (
    <main>
      <Suspense fallback={<Fallback />}>
        <ShopView />
      </Suspense>
      <PageFooter />
    </main>
  );
}

function Fallback() {
  return (
    <div className="px-2 pt-2 md:px-3 md:pt-3 lg:px-[14px] lg:pt-[14px]">
      <div className="min-h-[70svh] rounded-[28px] bg-(--s7-sand) px-4 pb-8 pt-16 md:rounded-[40px] md:px-8 md:pt-20 lg:rounded-[48px] lg:px-10">
        <W
          red={<h1 className="d1 text-[clamp(3.4rem,12vw,9.5rem)]">{CONTENT.red.name}</h1>}
          white={<h1 className="d1 text-[clamp(3.4rem,12vw,9.5rem)]">{CONTENT.white.name}</h1>}
        />
        <p className="mt-4 text-[16px] text-(--s7-muted)">
          {productsFor("red").length} pieces in each wood. Laying out the cards.
        </p>
      </div>
    </div>
  );
}
