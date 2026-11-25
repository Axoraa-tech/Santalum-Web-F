import type { Metadata } from "next";
import { OrderEntry } from "../../../_c/Entry";
import { Gate } from "../../../_c/kit";

export const metadata: Metadata = { title: "Order entry" };

/** The id is read with use(params) in the browser, once <Gate> renders the page body. */
export default function Page({ params }: PageProps<"/admin/v2/orders/[id]">) {
  return (
    <Gate>
      <OrderEntry params={params} />
    </Gate>
  );
}
