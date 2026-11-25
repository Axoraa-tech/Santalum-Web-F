import type { Metadata } from "next";
import { Orders } from "../../_ui/Orders";
import { Gate } from "../../_ui/kit";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
  return (
    <Gate>
      <Orders />
    </Gate>
  );
}
