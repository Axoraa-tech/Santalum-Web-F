import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Figtree, Gloock } from "next/font/google";
import { BodyBackground } from "@/components/BodyBackground";
import { BagDrop } from "./_components/BagDrop";
import { Footer } from "./_components/Footer";
import { Nav } from "./_components/Nav";
import { ProductOverlay } from "./_components/ProductOverlay";
import { SmoothScroll } from "./_components/SmoothScroll";
import "./strand.css";

const gloock = Gloock({ variable: "--font-gloock", subsets: ["latin"], weight: "400" });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Santalum Maison, the strand", template: "%s, Santalum Maison" },
  description: "Red and white sandalwood from India, turned and carved by hand. Every piece hangs on one strand of 108 beads.",
};

export default function StrandLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${gloock.variable} ${figtree.variable} s3 min-h-svh`}>
      <BodyBackground color="#F6F1E9" />
      <SmoothScroll />
      <Nav />
      <main>{children}</main>
      <Footer />
      <BagDrop />
      <ProductOverlay />
    </div>
  );
}
