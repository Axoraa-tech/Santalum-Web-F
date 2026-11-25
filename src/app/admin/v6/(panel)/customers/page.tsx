import type { Metadata } from "next";
import { Gate } from "../../_ui/Shell";
import { Customers } from "../../_views/Customers";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return (
    <Gate>
      <Customers />
    </Gate>
  );
}
