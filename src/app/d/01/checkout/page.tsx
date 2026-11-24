import type { Metadata } from "next";
import { Checkout } from "../_components/Checkout";

export const metadata: Metadata = {
  title: "Work order",
  robots: { index: false },
};

export default function LatheCheckoutPage() {
  return <Checkout />;
}
