import { Suspense, type ReactNode } from "react";
import { AdminFrame, LiveSidebar, StaticSidebar, Topbar } from "../_components/Shell";
import { PageSkeleton } from "../_components/ui";

/**
 * The admin shell. The sidebar reads the pathname, so it sits behind Suspense. Each page wraps its
 * body in <Gate>, which renders a skeleton until the browser (and the admin session) is available.
 */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <AdminFrame>
      <Suspense fallback={<StaticSidebar />}>
        <LiveSidebar />
      </Suspense>
      <div className="adm-main">
        <Topbar />
        <main id="main">
          <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
        </main>
      </div>
    </AdminFrame>
  );
}
