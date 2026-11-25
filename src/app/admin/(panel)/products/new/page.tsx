import type { Metadata } from "next";
import { NewProduct } from "../../../_components/ProductEditor";
import { Gate } from "../../../_components/Shell";

export const metadata: Metadata = { title: "New product" };

export default function Page() {
  return (
    <Gate>
      <NewProduct />
    </Gate>
  );
}
