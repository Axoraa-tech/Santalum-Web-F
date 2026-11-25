import type { Metadata } from "next";
import { ProductsView } from "../../_components/Products";
import { Gate } from "../../_components/Shell";

export const metadata: Metadata = { title: "Products" };

export default function Page() {
  return (
    <Gate>
      <ProductsView />
    </Gate>
  );
}
