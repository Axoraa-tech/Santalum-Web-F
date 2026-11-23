import type { Metadata } from "next";
import { Alegreya_Sans, Cormorant_Garamond, Tiro_Devanagari_Sanskrit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const alegreya = Alegreya_Sans({
  variable: "--font-alegreya",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const tiro = Tiro_Devanagari_Sanskrit({
  variable: "--font-tiro",
  subsets: ["devanagari", "latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Santalum Maison — Opening Soon",
  description:
    "Contemporary objects, jewellery and gifting shaped from the deep red heartwood of Pterocarpus santalinus. India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${alegreya.variable} ${tiro.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
