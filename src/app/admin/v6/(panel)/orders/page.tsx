import type { Metadata } from "next";
import { Gate } from "../../_ui/Shell";
import { Orders } from "../../_views/Orders";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
  return (
    <Gate>
      <Orders />
    </Gate>
  );
}
