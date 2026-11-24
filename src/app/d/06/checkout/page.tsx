import type { Metadata } from "next";
import { s } from "../_components/cls";
import { CheckoutBento } from "./CheckoutBento";

export const metadata: Metadata = { title: "Checkout" };

/** Checkout as a bento form: contact, delivery, gift and a summary that stays in view. */
export default function CheckoutPage() {
  return (
    <div className={s.page}>
      <CheckoutBento />
    </div>
  );
}
