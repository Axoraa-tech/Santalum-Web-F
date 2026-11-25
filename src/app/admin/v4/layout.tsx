import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { A4Toaster } from "./_ui/kit";
import "./a4.css";

const serif = Instrument_Serif({ variable: "--a4-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const sans = Manrope({ variable: "--a4-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "Atelier board", template: "%s · Atelier board" },
};

/** Design 4, "Atelier board": the workshop's pinboard. Everything sits inside .a4-root. */
export default function V4Layout({ children }: { children: ReactNode }) {
  return (
    <div className={`a4-root ${serif.variable} ${sans.variable}`}>
      {children}
      <A4Toaster />
    </div>
  );
}
