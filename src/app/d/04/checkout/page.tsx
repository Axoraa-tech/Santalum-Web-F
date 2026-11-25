import type { Metadata } from "next";
import { Footer } from "../_components/Footer";
import { Register } from "../_components/Register";

export const metadata: Metadata = {
  title: "The register — Santalum Maison",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Register />
      <Footer />
    </>
  );
}
