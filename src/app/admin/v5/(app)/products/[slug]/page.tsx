import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/shop/products";
import { ProductRoute } from "../../../_ui/products";

export const metadata: Metadata = { title: "Edit product" };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

/** The slug is read with use(params) in the browser, once the Gate in the layout renders the page. */
export default function Page({ params }: PageProps<"/admin/v5/products/[slug]">) {
  return <ProductRoute params={params} />;
}
