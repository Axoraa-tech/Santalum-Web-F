import type { Metadata } from "next";
import { Suspense } from "react";
import { WT } from "@/components/maison/W";
import { productsFor } from "@/lib/shop/products";
import { sh } from "../_components/cls";
import { Footer } from "../_components/Footer";
import { ShopFallback, ShopFromParams } from "../_components/Shop";

export const metadata: Metadata = {
  title: "The shop — Santalum Maison",
  description: "Every piece in red or white sandalwood, catalogued by department, with prices, options and records.",
};

export default function ShopPage() {
  return (
    <>
      <div className={sh.shop}>
        <header className={sh.head}>
          <h1 className={sh.title}>
            The shop <i><WT red="of the red room" white="of the white room" /></i>
          </h1>
          <div className={sh.lede}>
            <p>
              <WT
                red={`All ${productsFor("red").length} pieces in red sandalwood, catalogued by department. Each is turned or carved by hand from one batch of heartwood, and leaves with its batch record.`}
                white={`All ${productsFor("white").length} pieces in white sandalwood: oil, attar, incense, chandan and Mysuru carving, catalogued by department. Every bottle, jar and box carries its lot.`}
              />
            </p>
            <p className={sh.ledeSmall}>
              <WT
                red="Dense, deep red and almost without scent. Free delivery across India."
                white="Pale gold, fragrant, heartwood only. Free delivery across India."
              />
            </p>
          </div>
        </header>
        <Suspense fallback={<ShopFallback />}>
          <ShopFromParams />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
