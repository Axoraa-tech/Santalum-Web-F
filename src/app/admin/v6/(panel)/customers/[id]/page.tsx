import type { Metadata } from "next";
import { Gate } from "../../../_ui/Shell";
import { CustomerDetail } from "../../../_views/CustomerDetail";

export const metadata: Metadata = { title: "Customer" };

export default function Page({ params }: PageProps<"/admin/v6/customers/[id]">) {
  return (
    <Gate>
      <CustomerDetail params={params} />
    </Gate>
  );
}
