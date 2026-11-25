import type { Metadata } from "next";
import { Anybody, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { BagSheet } from "./_components/BagSheet";
import { BodyTint } from "./_components/BodyTint";
import { Footer } from "./_components/Footer";
import { MotionPrefs } from "./_components/MotionPrefs";
import { Nav } from "./_components/Nav";
import { SmoothScroll } from "./_components/SmoothScroll";
import k from "./k";
import "./k10.css";

/* Kinetic: one variable display face whose width and weight axes move, and one mono for the small print. */
const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jbm",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Santalum Maison, Kinetic", template: "%s, Santalum Maison" },
  description: "Red and white sandalwood objects, jewellery and gifting from India. Every piece numbered and documented.",
};

export default function KineticLayout({ children }: { children: ReactNode }) {
  return (
    <div data-k10 className={`${anybody.variable} ${mono.variable} ${k.root}`}>
      <BodyTint />
      <SmoothScroll />
      <MotionPrefs>
        <Nav />
        <main>{children}</main>
        <Footer />
        <BagSheet />
      </MotionPrefs>
    </div>
  );
}
