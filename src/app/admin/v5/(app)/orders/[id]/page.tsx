import type { Metadata } from "next";
import { OrderDetailRoute } from "../../../_ui/orders";

export const metadata: Metadata = { title: "Order" };

/** The id is read with use(params) in the browser, once the Gate in the layout renders the page. */
export default function Page({ params }: PageProps<"/admin/v5/orders/[id]">) {
  return <OrderDetailRoute params={params} />;
}
