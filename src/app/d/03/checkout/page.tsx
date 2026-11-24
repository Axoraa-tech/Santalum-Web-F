import type { Metadata } from "next";
import { Checkout } from "../_components/Checkout";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

/** Checkout preview: payments are not connected; placing an order shows the confirmation and empties the bag. */
export default function CheckoutPage() {
  return <Checkout />;
}
