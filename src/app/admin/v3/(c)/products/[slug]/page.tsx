import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/shop/products";
import { ProductRoute } from "../../../_ui/ProductEditor";
import { Gate } from "../../../_ui/Shell";

export const metadata: Metadata = { title: "Edit product" };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

/** The slug is read with use(params) in the browser, once <Gate> renders the page body. */
export default function Page({ params }: PageProps<"/admin/v3/products/[slug]">) {
  return (
    <Gate>
      <ProductRoute params={params} />
    </Gate>
  );
}
