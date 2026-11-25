import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/shop/products";
import { EditProduct } from "../../../_ui/Editor";
import { Gate } from "../../../_ui/kit";

export const metadata: Metadata = { title: "Edit product" };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

/** The slug is read with use(params) in the browser, once <Gate> renders the body. */
export default function Page({ params }: PageProps<"/admin/v4/products/[slug]">) {
  return (
    <Gate>
      <EditProduct params={params} />
    </Gate>
  );
}
