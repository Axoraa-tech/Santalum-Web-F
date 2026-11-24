import type { Metadata } from "next";
import { Bodoni_Moda, Karla } from "next/font/google";
import type { ReactNode } from "react";
import { BodyBackground } from "@/components/BodyBackground";
import { Chrome } from "./_components/Chrome";
import { c } from "./_components/cls";
import "./d04-chrome.css";
import "./d04-corridor.css";
import "./d04-register.css";

/* Bodoni Moda with its optical-size axis: hairline contrast at wall scale, sturdier on labels. */
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Santalum Maison — Corridor",
  description:
    "A walk through a quiet museum of sandalwood: the two woods, the collection, the making, the provenance archive and the 2011 Vault.",
};

export default function CorridorLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${bodoni.variable} ${karla.variable} ${c.root}`}>
      <BodyBackground color="#fafaf7" />
      <Chrome />
      <main className={c.main}>{children}</main>
    </div>
  );
}
