import type { Metadata } from "next";
import { CustomerSheet } from "../../../_ui/Customers";
import { Gate } from "../../../_ui/kit";

export const metadata: Metadata = { title: "Customer" };

/** The id is read with use(params) in the browser, once <Gate> renders the body. */
export default function Page({ params }: PageProps<"/admin/v4/customers/[id]">) {
  return (
    <Gate>
      <CustomerSheet params={params} />
    </Gate>
  );
}
