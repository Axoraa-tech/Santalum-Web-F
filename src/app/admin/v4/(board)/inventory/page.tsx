import type { Metadata } from "next";
import { Inventory } from "../../_ui/Inventory";
import { Gate } from "../../_ui/kit";

export const metadata: Metadata = { title: "Stock shelves" };

export default function Page() {
  return (
    <Gate>
      <Inventory />
    </Gate>
  );
}
