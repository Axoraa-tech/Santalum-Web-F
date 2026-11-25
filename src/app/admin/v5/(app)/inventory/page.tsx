import type { Metadata } from "next";
import { Inventory } from "../../_ui/inventory";

export const metadata: Metadata = { title: "Stock" };

export default function Page() {
  return <Inventory />;
}
