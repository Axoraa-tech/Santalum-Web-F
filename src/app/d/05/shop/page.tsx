import type { Metadata } from "next";
import { Suspense } from "react";
import { W, WT } from "@/components/maison/W";
import { categoriesIn, countIn, rangeIn, SHOP_DEK } from "../_components/content";
import { FollowCategory, ShopFilters, ShopIndex, ShopView } from "../_components/Shop";

export const metadata: Metadata = {
  title: "Catalogue — Index — Santalum Maison",
  description: "Every piece in red and white sandalwood, as a catalogue you can sort, search and filter.",
};

function IndexFallback() {
  return (
    <aside className="x5-index" aria-hidden>
      <div className="x5-indexInner" />
    </aside>
  );
}

/** The full catalogue of the current wood. The category lives in ?c=, read inside Suspense. */
export default function ShopPage() {
  return (
    <div className="x5-page">
      <Suspense fallback={<IndexFallback />}>
        <ShopIndex />
        <FollowCategory />
      </Suspense>
      <main className="x5-main">
        <header id="catalogue" className="x5s-head">
          <div className="x5a-meta">
            <p>
              <span>Catalogue</span>
              <br />
              <WT red="Red sandalwood, Pterocarpus santalinus" white="White sandalwood, Santalum album" />
            </p>
            <p>
              <span>Entries</span>
              <br />
              <WT red={`${countIn("red")} in ${categoriesIn("red").length} categories`} white={`${countIn("white")} in ${categoriesIn("white").length} categories`} />
            </p>
            <p>
              <span>Prices</span>
              <br />
              <WT red={rangeIn("red")} white={rangeIn("white")} />
            </p>
            <p>
              <span>Delivery</span>
              <br />
              Free across India; express ₹350
            </p>
          </div>
          <h1 className="x5s-title">
            Catalogue
            <br />
            <span className="x5s-titleWood">
              in <WT red="red" white="white" />
              <span className="x5-heroStop">.</span>
            </span>
          </h1>
          <p className="x5s-dek">
            <WT red={SHOP_DEK.red} white={SHOP_DEK.white} />
          </p>
        </header>
        <Suspense fallback={<div className="x5s-loading">Setting the catalogue…</div>}>
          <ShopFilters>
            <W red={<ShopView wood="red" />} white={<ShopView wood="white" />} />
          </ShopFilters>
        </Suspense>
      </main>
    </div>
  );
}
