import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/shop/products";
import { Gate } from "../../../_ui/Shell";
import { EditProduct } from "../../../_views/ProductEditor";

export const metadata: Metadata = { title: "Edit product" };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default function Page({ params }: PageProps<"/admin/v6/products/[slug]">) {
  return (
    <Gate>
      <EditProduct params={params} />
    </Gate>
  );
}
