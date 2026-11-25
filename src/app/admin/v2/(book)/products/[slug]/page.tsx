import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/shop/products";
import { EditCard } from "../../../_c/Card";
import { Gate } from "../../../_c/kit";

export const metadata: Metadata = { title: "Catalogue card" };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

/** The slug is read with use(params) in the browser, once <Gate> renders the card. */
export default function Page({ params }: PageProps<"/admin/v2/products/[slug]">) {
  return (
    <Gate>
      <EditCard params={params} />
    </Gate>
  );
}
