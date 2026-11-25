import type { Metadata } from "next";
import { CustomerIndex } from "../../_c/Customers";
import { Gate } from "../../_c/kit";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return (
    <Gate>
      <CustomerIndex />
    </Gate>
  );
}
