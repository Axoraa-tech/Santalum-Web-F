import type { Metadata } from "next";
import { CustomersList } from "../../_ui/Customers";
import { Gate } from "../../_ui/Shell";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return (
    <Gate>
      <CustomersList />
    </Gate>
  );
}
