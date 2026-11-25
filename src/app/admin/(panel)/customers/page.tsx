import type { Metadata } from "next";
import { CustomersView } from "../../_components/Customers";
import { Gate } from "../../_components/Shell";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return (
    <Gate>
      <CustomersView />
    </Gate>
  );
}
