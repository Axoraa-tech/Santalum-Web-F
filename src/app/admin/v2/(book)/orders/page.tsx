import type { Metadata } from "next";
import { OrderBook } from "../../_c/Orders";
import { Gate } from "../../_c/kit";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
  return (
    <Gate>
      <OrderBook />
    </Gate>
  );
}
