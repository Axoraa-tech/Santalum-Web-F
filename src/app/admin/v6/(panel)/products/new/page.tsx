import type { Metadata } from "next";
import { Gate } from "../../../_ui/Shell";
import { NewProduct } from "../../../_views/ProductEditor";

export const metadata: Metadata = { title: "New product" };

export default function Page() {
  return (
    <Gate>
      <NewProduct />
    </Gate>
  );
}
