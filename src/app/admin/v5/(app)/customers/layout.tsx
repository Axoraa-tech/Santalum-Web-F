import type { ReactNode } from "react";
import { CustomersList } from "../../_ui/customers";
import { RoutedSplit } from "../../_ui/shell";

export default function CustomersLayout({ children }: { children: ReactNode }) {
  return (
    <RoutedSplit base="/admin/v5/customers" list={<CustomersList />}>
      {children}
    </RoutedSplit>
  );
}
