import type { Metadata } from "next";
import { NewProduct } from "../../../_ui/products";

export const metadata: Metadata = { title: "New product" };

export default function Page() {
  return <NewProduct />;
}
