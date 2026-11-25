import type { Metadata } from "next";
import { OrdersIdle } from "../../_ui/orders";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
  return <OrdersIdle />;
}
