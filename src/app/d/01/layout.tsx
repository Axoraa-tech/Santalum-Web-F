import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "./_components/Footer";
import { Motion } from "./_components/Motion";
import { Nav } from "./_components/Nav";
import { Paper } from "./_components/Paper";
import { SheetChange } from "./_components/SheetChange";
import { WorkOrder } from "./_components/WorkOrder";
import { s } from "./_components/cx";
import "./lathe.css";

/* Archivo with its width axis: expanded for display, normal for reading. IBM Plex Mono for specs and numbers. */
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--f01-archivo", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f01-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Lathe, Santalum Maison", template: "%s, Santalum Maison" },
  description:
    "One piece of heartwood on the lathe. Red sandalwood turned into beads, coasters, bowls and the 2011 Vault cuffs; white sandalwood into oil, attar, Mysuru carving and the 2011 Reserve.",
};

export default function LatheLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${archivo.variable} ${plex.variable} ${s.root}`}>
      <Paper />
      <Motion>
        <Nav />
        <WorkOrder />
        <SheetChange />
        <main>{children}</main>
        <Footer />
      </Motion>
    </div>
  );
}
