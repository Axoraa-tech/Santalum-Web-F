import type { Metadata } from "next";
import { Italiana, Mulish } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "./_components/Footer";
import { Nav } from "./_components/Nav";
import { Providers } from "./_components/Providers";
import { SheetHost } from "./_components/Sheet";
import { Tray } from "./_components/Tray";
import s from "./styles";
import "./d09.css";

const italiana = Italiana({ variable: "--font-italiana", subsets: ["latin"], weight: "400" });
const mulish = Mulish({ variable: "--font-mulish", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Dawn — Santalum Maison", template: "%s — Santalum Maison" },
  description: "Two days of rituals: a red sandalwood day at the desk and the lathe, and a white sandalwood day of the tilak, oil and the lamp.",
};

/** Design 09, Dawn: one day, from first light to the evening lamp. A red day and a white day. */
export default function DawnLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${s.root} ${italiana.variable} ${mulish.variable}`}>
      <Providers>
        <Nav />
        <main className="relative">{children}</main>
        <Footer />
        <Tray />
        <SheetHost />
      </Providers>
    </div>
  );
}
