import type { Metadata } from "next";
import { a6FontVars } from "./_ui/fonts";
import "./a6.css";

export const metadata: Metadata = {
  title: { default: "Report · Santalum admin", template: "%s · Santalum report" },
};

/** Design 6: the admin set as a printed annual report. Everything sits inside .a6-root. */
export default function Layout({ children }: LayoutProps<"/admin/v6">) {
  return (
    <div className={`a6-root ${a6FontVars}`}>
      {children}
    </div>
  );
}
