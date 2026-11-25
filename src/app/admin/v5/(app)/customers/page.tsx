import type { Metadata } from "next";
import { CustomersIdle } from "../../_ui/customers";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return <CustomersIdle />;
}
