import type { Metadata } from "next";
import { Suspense } from "react";
import { W } from "@/components/maison/W";
import { ShopView } from "../_components/Shop";
import { s } from "../_components/styles";

export const metadata: Metadata = {
  title: "Shop",
  description: "Every red and white sandalwood piece of the Maison: beads, objects, powder, jewellery, oil, attar, incense and Mysuru carving.",
};

/** The full shop, a scrollable page; the wood decides which of the two shops shows. */
export default function AtlasShopPage() {
  return (
    <main className={`${s.paper} min-h-svh pt-24 md:pt-28`}>
      <Suspense fallback={<div className="min-h-svh" />}>
        <W red={<ShopView wood="red" />} white={<ShopView wood="white" />} />
      </Suspense>
    </main>
  );
}
