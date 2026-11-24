import type { Metadata } from "next";
import { Alegreya_Sans, Cormorant_Garamond, Fraunces, Instrument_Sans, Tiro_Devanagari_Sanskrit } from "next/font/google";
import { WOOD_BOOT_SCRIPT } from "@/lib/wood-boot";
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

/* The Maison website: a soft, curved display serif and one clean sans. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
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
      suppressHydrationWarning /* the Maison sets data-wood before hydration */
      className={`${cormorant.variable} ${alegreya.variable} ${tiro.variable} ${fraunces.variable} ${instrument.variable} h-full antialiased`}
    >
      <head>
        {/* Sets <html data-wood> before first paint so the Maison shows the remembered wood with no flash. */}
        <script dangerouslySetInnerHTML={{ __html: WOOD_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
