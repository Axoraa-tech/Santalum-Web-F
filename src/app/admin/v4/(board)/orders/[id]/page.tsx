import type { Metadata } from "next";
import { OrderSheet } from "../../../_ui/OrderSheet";
import { Gate } from "../../../_ui/kit";

export const metadata: Metadata = { title: "Order" };

/** The id is read with use(params) in the browser, once <Gate> renders the body. */
export default function Page({ params }: PageProps<"/admin/v4/orders/[id]">) {
  return (
    <Gate>
      <OrderSheet params={params} />
    </Gate>
  );
}
