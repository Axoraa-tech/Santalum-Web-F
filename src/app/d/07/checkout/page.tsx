import type { Metadata } from "next";
import { Checkout } from "../_components/Checkout";
import { PageFooter } from "../_components/PageFooter";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function StackCheckout() {
  return (
    <>
      <Checkout />
      <PageFooter />
    </>
  );
}
