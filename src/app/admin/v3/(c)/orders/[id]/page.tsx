import type { Metadata } from "next";
import { OrderRoute } from "../../../_ui/Orders";
import { Gate } from "../../../_ui/Shell";

export const metadata: Metadata = { title: "Order" };

/** The id is read with use(params) in the browser, once <Gate> renders the page body. */
export default function Page({ params }: PageProps<"/admin/v3/orders/[id]">) {
  return (
    <Gate>
      <OrderRoute params={params} />
    </Gate>
  );
}
