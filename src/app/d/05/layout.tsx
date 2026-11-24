import type { Metadata } from "next";
import { Newsreader, Schibsted_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { BodyBackground } from "@/components/BodyBackground";
import { BagSlip } from "./_components/BagSlip";
import { Colophon } from "./_components/Colophon";
import { Controls } from "./_components/Controls";
import { GridOverlay } from "./_components/GridOverlay";
import { MotionRoot } from "./_components/MotionRoot";
/* Plain global stylesheets: every class is prefixed x5- (CSS modules are compiled as globals in this project). */
import "./x5-shell.css";
import "./x5-home.css";
import "./x5-article.css";
import "./x5-checkout.css";

const sans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--f-sans", display: "swap" });
const serif = Newsreader({
  subsets: ["latin"],
  variable: "--f-serif",
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Index — Santalum Maison",
  description: "Red and white sandalwood, set as a catalogue you read: an essay, every piece in a sortable table, the making, the record and the 2011 Vault.",
};

export default function IndexLayout({ children }: { children: ReactNode }) {
  return (
    <MotionRoot>
      <div id="top" className={`x5-root ${sans.variable} ${serif.variable}`}>
        <BodyBackground color="#fcfcfa" />
        <Controls />
        <BagSlip />
        {children}
        <Colophon />
        <GridOverlay />
      </div>
    </MotionRoot>
  );
}
