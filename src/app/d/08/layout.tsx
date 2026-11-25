import type { Metadata } from "next";
import { Hanken_Grotesk, Young_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "./_components/Footer";
import { AtlasBody, TopBar } from "./_components/TopBar";
import { s } from "./_components/styles";
import "./_components/atlas.css";

const display = Young_Serif({ weight: "400", subsets: ["latin"], variable: "--font-a8-display" });
const text = Hanken_Grotesk({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-a8-text" });

export const metadata: Metadata = {
  title: { default: "Atlas · Santalum Maison", template: "%s · Santalum Maison" },
  description: "Red and white sandalwood laid out on one board: the wood, where it grows, the pieces from the shop, how each is made and recorded.",
};

export default function AtlasLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} ${text.variable} ${s.root}`}>
      <AtlasBody />
      <TopBar />
      {children}
      <Footer />
    </div>
  );
}
