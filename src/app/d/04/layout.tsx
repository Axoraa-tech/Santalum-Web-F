import type { Metadata } from "next";
import { Bodoni_Moda, Karla } from "next/font/google";
import type { ReactNode } from "react";
import { Chrome } from "./_components/Chrome";
import { c } from "./_components/cls";
import { WoodBody } from "./_components/WoodBody";
import "./d04-chrome.css";
import "./d04-corridor.css";
import "./d04-register.css";
import "./d04-shop.css";
import "./d04-desk.css";
import "./d04-book.css";

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
    "A walk through a quiet museum of sandalwood, lit for red or for white: the woods, the gallery, the making, the records, the 2011 editions and the shop.",
};

export default function CorridorLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${bodoni.variable} ${karla.variable} ${c.root}`}>
      <WoodBody />
      <Chrome />
      <main className={c.main}>{children}</main>
    </div>
  );
}
