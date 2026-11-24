import type { Metadata } from "next";
import { Checkout } from "../_components/Checkout";

export const metadata: Metadata = { title: "Checkout" };

export default function KineticCheckoutPage() {
  return <Checkout />;
}
