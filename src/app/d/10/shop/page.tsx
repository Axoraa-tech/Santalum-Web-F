import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopBoth, ShopRoute } from "../_components/Shop";

export const metadata: Metadata = {
  title: "Shop",
  description: "Red and white sandalwood: 26 pieces in each wood, by category, price and edition.",
};

/** The shop. `?c=` (a category of the current wood) is read on the client, inside Suspense; the fallback is the unfiltered shop. */
export default function KineticShopPage() {
  return (
    <Suspense fallback={<ShopBoth c={null} />}>
      <ShopRoute />
    </Suspense>
  );
}
