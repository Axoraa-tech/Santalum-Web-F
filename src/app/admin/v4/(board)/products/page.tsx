import type { Metadata } from "next";
import { Products } from "../../_ui/Products";
import { Gate } from "../../_ui/kit";

export const metadata: Metadata = { title: "Products" };

export default function Page() {
  return (
    <Gate>
      <Products />
    </Gate>
  );
}
