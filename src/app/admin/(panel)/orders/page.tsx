import type { Metadata } from "next";
import { OrdersView } from "../../_components/Orders";
import { Gate } from "../../_components/Shell";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
  return (
    <Gate>
      <OrdersView />
    </Gate>
  );
}
