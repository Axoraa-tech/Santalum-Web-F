import type { Metadata } from "next";
import { OrderDetail } from "../../../_components/OrderDetail";
import { Gate } from "../../../_components/Shell";

export const metadata: Metadata = { title: "Order" };

/** The id is read with use(params) in the browser, once <Gate> renders the page body. */
export default function Page({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <Gate>
      <OrderDetail params={params} />
    </Gate>
  );
}
