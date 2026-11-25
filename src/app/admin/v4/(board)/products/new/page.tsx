import type { Metadata } from "next";
import { NewProduct } from "../../../_ui/Editor";
import { Gate } from "../../../_ui/kit";

export const metadata: Metadata = { title: "New product" };

export default function Page() {
  return (
    <Gate>
      <NewProduct />
    </Gate>
  );
}
