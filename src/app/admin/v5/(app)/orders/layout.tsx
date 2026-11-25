import { Suspense, type ReactNode } from "react";
import { OrdersList } from "../../_ui/orders";
import { RoutedSplit } from "../../_ui/shell";

/** The list stays mounted while orders open beside it (desktop) or over it (phone). */
export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <RoutedSplit
      base="/admin/v5/orders"
      list={
        <Suspense fallback={null}>
          <OrdersList />
        </Suspense>
      }
    >
      {children}
    </RoutedSplit>
  );
}
