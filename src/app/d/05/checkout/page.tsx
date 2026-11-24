import type { Metadata } from "next";
import { CheckoutForm } from "../_components/CheckoutForm";
import type { IndexItem } from "../_components/content";
import { SideIndex } from "../_components/SideIndex";

export const metadata: Metadata = { title: "Checkout — Index — Santalum Maison" };

const SECTIONS: IndexItem[] = [
  { id: "checkout", label: "Checkout" },
  { id: "order", label: "Your order" },
  { id: "contact", label: "Contact" },
  { id: "delivery", label: "Delivery" },
  { id: "gift", label: "Gift" },
  { id: "review", label: "Review and place" },
];

export default function CheckoutPage() {
  return (
    <div className="x5-page">
      <SideIndex items={SECTIONS} back heading="Order form" />
      <main className="x5-main">
        <CheckoutForm />
      </main>
    </div>
  );
}
