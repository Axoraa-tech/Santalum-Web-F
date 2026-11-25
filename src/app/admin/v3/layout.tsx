import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./a3.css";

const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--a3-mono", display: "swap" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--a3-sans", display: "swap" });

/** Design 3, "Console": a dense, keyboard-first operations console. */
export default function V3Layout({ children }: { children: ReactNode }) {
  return <div className={`a3-root ${mono.variable} ${sans.variable}`}>{children}</div>;
}
