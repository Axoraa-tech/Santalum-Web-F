import type { Metadata } from "next";
import { CheckoutForm } from "../_components/CheckoutForm";
import type { IndexItem } from "../_components/content";
import { SideIndex } from "../_components/SideIndex";

export const metadata: Metadata = { title: "Checkout — Index — Santalum Maison" };

const SECTIONS: IndexItem[] = [
  { id: "checkout", label: "Checkout" },
  { id: "account", label: "Account" },
  { id: "address", label: "Delivery address" },
  { id: "payment", label: "Delivery and payment" },
  { id: "review", label: "Review and place" },
  // after the order is placed the form gives way to its confirmation; the index lists whichever is on the page
  { id: "thanks", label: "Order placed" },
  { id: "slip", label: "The order slip" },
  { id: "next", label: "What happens next" },
];

export default function CheckoutPage() {
  return (
    <div className="x5-page">
      <SideIndex items={SECTIONS} back={{ href: "/d/05/shop", label: "Back to the catalogue" }} heading="Order form" />
      <main className="x5-main">
        <CheckoutForm />
      </main>
    </div>
  );
}
