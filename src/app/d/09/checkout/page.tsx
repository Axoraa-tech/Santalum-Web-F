import type { Metadata } from "next";
import { CheckoutDawn } from "../_components/Checkout";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return <CheckoutDawn />;
}
