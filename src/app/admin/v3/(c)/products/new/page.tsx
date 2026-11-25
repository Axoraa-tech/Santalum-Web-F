import type { Metadata } from "next";
import { NewProduct } from "../../../_ui/ProductEditor";
import { Gate } from "../../../_ui/Shell";

export const metadata: Metadata = { title: "New product" };

export default function Page() {
  return (
    <Gate>
      <NewProduct />
    </Gate>
  );
}
