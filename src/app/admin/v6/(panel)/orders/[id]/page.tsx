import type { Metadata } from "next";
import { Gate } from "../../../_ui/Shell";
import { OrderDetail } from "../../../_views/OrderDetail";

export const metadata: Metadata = { title: "Order" };

/** The id is read with use(params) in the browser, once <Gate> renders the page body. */
export default function Page({ params }: PageProps<"/admin/v6/orders/[id]">) {
  return (
    <Gate>
      <OrderDetail params={params} />
    </Gate>
  );
}
