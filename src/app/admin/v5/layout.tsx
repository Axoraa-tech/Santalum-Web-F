import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import type { ReactNode } from "react";
import { A5Toaster } from "./_ui/kit";
import "./a5.css";

const sans = Figtree({ variable: "--a5-sans", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "Pocket · Santalum Maison", template: "%s · Santalum pocket" },
  robots: { index: false, follow: false },
};

/** Design 5, "Pocket": the owner's app. Phone first; on a desktop the app column sits beside a detail panel. */
export default function PocketLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`a5-root ${sans.variable}`}>
      {children}
      <div id="a5-portal" />
      <A5Toaster />
    </div>
  );
}
