import type { Metadata } from "next";
import { CustomerDetail } from "../../../_components/CustomerDetail";
import { Gate } from "../../../_components/Shell";

export const metadata: Metadata = { title: "Customer" };

/** The id is read with use(params) in the browser, once <Gate> renders the page body. */
export default function Page({ params }: PageProps<"/admin/customers/[id]">) {
  return (
    <Gate>
      <CustomerDetail params={params} />
    </Gate>
  );
}
