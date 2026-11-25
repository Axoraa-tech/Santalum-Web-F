import type { Metadata } from "next";
import { CustomerRoute } from "../../../_ui/Customers";
import { Gate } from "../../../_ui/Shell";

export const metadata: Metadata = { title: "Customer" };

/** The id is read with use(params) in the browser, once <Gate> renders the page body. */
export default function Page({ params }: PageProps<"/admin/v3/customers/[id]">) {
  return (
    <Gate>
      <CustomerRoute params={params} />
    </Gate>
  );
}
