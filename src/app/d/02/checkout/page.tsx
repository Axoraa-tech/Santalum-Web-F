import type { Metadata } from "next";
import { Checkout } from "../_components/Checkout";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function OrbitCheckoutPage() {
  return <Checkout />;
}
