import type { Metadata } from "next";
import { CustomerLeaf } from "../../../_c/Customers";
import { Gate } from "../../../_c/kit";

export const metadata: Metadata = { title: "Customer" };

export default function Page({ params }: PageProps<"/admin/v2/customers/[id]">) {
  return (
    <Gate>
      <CustomerLeaf params={params} />
    </Gate>
  );
}
