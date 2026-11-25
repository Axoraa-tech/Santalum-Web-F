import type { Metadata } from "next";
import { InventoryView } from "../../_components/Inventory";
import { Gate } from "../../_components/Shell";

export const metadata: Metadata = { title: "Inventory" };

export default function Page() {
  return (
    <Gate>
      <InventoryView />
    </Gate>
  );
}
