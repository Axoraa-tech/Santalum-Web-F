import type { Metadata } from "next";
import { Suspense } from "react";
import "./admin.css";
import "./_switch/switch.css";
import { AdminDesignSwitch } from "./_switch/AdminDesignSwitch";

export const metadata: Metadata = {
  title: { default: "Admin · Santalum Maison", template: "%s · Santalum admin" },
  robots: { index: false, follow: false },
};

/** Everything under /admin shares the adm- stylesheet. The panel itself lives in the (panel) group; sign-in sits outside it. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="adm">
      {children}
      <Suspense fallback={null}>
        <AdminDesignSwitch />
      </Suspense>
    </div>
  );
}
