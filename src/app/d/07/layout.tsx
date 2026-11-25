import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import type { ReactNode } from "react";
import { BodyBackground } from "@/components/BodyBackground";
import { BagSheet } from "./_components/BagSheet";
import { Dock } from "./_components/Dock";
import { Smooth } from "./_components/Smooth";
import "./s7.css";

const brico = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-brico",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Santalum Maison — Stack", template: "%s — Santalum Maison" },
  description: "Red and white sandalwood objects, beads and jewellery, shaped by hand in India. Every piece numbered and recorded.",
};

/** Design 07 "Stack": the house as a deck of cards you scroll through. */
export default function StackLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${brico.variable} s7 min-h-svh`}>
      <BodyBackground color="var(--s7-page)" />
      <Smooth />
      {children}
      <Dock />
      <BagSheet />
    </div>
  );
}
