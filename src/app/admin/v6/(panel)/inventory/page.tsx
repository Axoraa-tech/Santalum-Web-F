import type { Metadata } from "next";
import { Gate } from "../../_ui/Shell";
import { Inventory } from "../../_views/Inventory";

export const metadata: Metadata = { title: "Inventory" };

export default function Page() {
  return (
    <Gate>
      <Inventory />
    </Gate>
  );
}
