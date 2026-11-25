import { Suspense, type ReactNode } from "react";
import { Gate, Loading } from "../_ui/shell";

/** Every screen renders in the browser only, behind a session. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
