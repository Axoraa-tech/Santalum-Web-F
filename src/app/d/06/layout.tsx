import type { Metadata } from "next";
import { Martian_Mono, Onest } from "next/font/google";
import type { ReactNode } from "react";
import "./bento.css";
import { s } from "./_components/cls";
import { FooterBento } from "./_components/FooterBento";
import { Shell } from "./_components/Shell";

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });
const martian = Martian_Mono({ subsets: ["latin"], variable: "--font-martian", axes: ["wdth"] });

export const metadata: Metadata = {
  title: { default: "Santalum Maison", template: "%s, Santalum Maison" },
  description: "Red and white sandalwood objects, jewellery and gifting from India. Every piece carries its batch record.",
};

/** Design 06, Bento: the house as a living board of tiles that open into each piece. */
export default function BentoLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${onest.variable} ${martian.variable} ${s.root}`}>
      <Shell>
        <main>{children}</main>
        <FooterBento />
      </Shell>
    </div>
  );
}
