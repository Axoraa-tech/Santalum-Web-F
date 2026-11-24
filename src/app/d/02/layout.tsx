import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Syne } from "next/font/google";
import { BodyBackground } from "@/components/BodyBackground";
import { BagPanel } from "./_components/BagPanel";
import { Footer } from "./_components/Footer";
import { Nav } from "./_components/Nav";
import { SmoothScroll } from "./_components/SmoothScroll";
import { s } from "./_components/cls";
import "./orbit.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Santalum Maison, Orbit", template: "%s, Santalum Maison" },
  description: "Red and white sandalwood objects, jewellery and gifts, shown as a ring of wooden discs you turn.",
};

export default function OrbitLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${syne.variable} ${manrope.variable} ${s.root}`}>
      <BodyBackground color="#f7f6f3" />
      <SmoothScroll />
      <Nav />
      <main>{children}</main>
      <Footer />
      <BagPanel />
    </div>
  );
}
