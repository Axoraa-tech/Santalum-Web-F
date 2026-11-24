import type { Metadata } from "next";
import { Italiana, Mulish } from "next/font/google";
import type { ReactNode } from "react";
import { BodyBackground } from "@/components/BodyBackground";
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
  description: "A day of rituals in red and white sandalwood, from the tilak at first light to the lamp at dusk.",
};

/** Design 09, Dawn: one day, from first light to the evening lamp. */
export default function DawnLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${s.root} ${italiana.variable} ${mulish.variable}`}>
      <BodyBackground color="#f2ebe6" />
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
