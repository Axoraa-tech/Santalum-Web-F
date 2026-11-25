import type { ReactNode } from "react";
import { ProductsList } from "../../_ui/products";
import { RoutedSplit } from "../../_ui/shell";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <RoutedSplit base="/admin/v5/products" list={<ProductsList />}>
      {children}
    </RoutedSplit>
  );
}
