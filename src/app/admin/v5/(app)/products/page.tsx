import type { Metadata } from "next";
import { ProductsIdle } from "../../_ui/products";

export const metadata: Metadata = { title: "Products" };

export default function Page() {
  return <ProductsIdle />;
}
