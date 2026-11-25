import type { Metadata } from "next";
import { Gate } from "../../_ui/Shell";
import { Products } from "../../_views/Products";

export const metadata: Metadata = { title: "Products" };

export default function Page() {
  return (
    <Gate>
      <Products />
    </Gate>
  );
}
