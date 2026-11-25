import type { Metadata } from "next";
import { Customers } from "../../_ui/Customers";
import { Gate } from "../../_ui/kit";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return (
    <Gate>
      <Customers />
    </Gate>
  );
}
