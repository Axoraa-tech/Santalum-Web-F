import type { Metadata } from "next";
import { Cormorant_SC, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { A2Toaster } from "./_c/kit";
import "./a2.css";

const serif = Newsreader({ variable: "--a2-serif", subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"] });
const caps = Cormorant_SC({ variable: "--a2-caps", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "Day book · Santalum Maison", template: "%s · Santalum day book" },
  robots: { index: false, follow: false },
};

/** Design 2, "Ledger": the workshop's bound account book. Everything sits inside .a2-root. */
export default function LedgerLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`a2-root ${serif.variable} ${caps.variable}`}>
      {children}
      <A2Toaster />
    </div>
  );
}
