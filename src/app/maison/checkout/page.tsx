import type { Metadata } from "next";
import { Checkout } from "@/components/maison/Checkout";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return <Checkout />;
}
