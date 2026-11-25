import type { Metadata } from "next";
import { ProductEditorRoute } from "../../../_components/ProductEditor";
import { Gate } from "../../../_components/Shell";

export const metadata: Metadata = { title: "Edit product" };

/** The slug is read with use(params) in the browser, once <Gate> renders the page body. */
export default function Page({ params }: PageProps<"/admin/products/[slug]">) {
  return (
    <Gate>
      <ProductEditorRoute params={params} />
    </Gate>
  );
}
