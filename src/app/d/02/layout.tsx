import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Syne } from "next/font/google";
import { BagPanel } from "./_components/BagPanel";
import { BodyTint } from "./_components/BodyTint";
import { Footer } from "./_components/Footer";
import { Nav } from "./_components/Nav";
import { SmoothScroll } from "./_components/SmoothScroll";
import { s } from "./_components/cls";
import "./orbit.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Santalum Maison, Orbit", template: "%s, Santalum Maison" },
  description: "Red and white sandalwood: two shops in one house, shown as a ring of wooden discs you turn.",
};

export default function OrbitLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${syne.variable} ${manrope.variable} ${s.root}`}>
      <BodyTint />
      <SmoothScroll />
      <Nav />
      <main>{children}</main>
      <Footer />
      <BagPanel />
    </div>
  );
}
