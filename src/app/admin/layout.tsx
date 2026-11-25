import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Admin · Santalum Maison", template: "%s · Santalum admin" },
  robots: { index: false, follow: false },
};

/** Everything under /admin shares the adm- stylesheet. The panel itself lives in the (panel) group; sign-in sits outside it. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="adm">{children}</div>;
}
