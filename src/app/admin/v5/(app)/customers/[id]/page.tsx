import type { Metadata } from "next";
import { CustomerRoute } from "../../../_ui/customers";

export const metadata: Metadata = { title: "Customer" };

export default function Page({ params }: PageProps<"/admin/v5/customers/[id]">) {
  return <CustomerRoute params={params} />;
}
