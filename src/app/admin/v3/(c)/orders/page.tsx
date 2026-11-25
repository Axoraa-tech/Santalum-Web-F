import type { Metadata } from "next";
import { OrdersList } from "../../_ui/Orders";
import { Gate } from "../../_ui/Shell";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
  return (
    <Gate>
      <OrdersList />
    </Gate>
  );
}
