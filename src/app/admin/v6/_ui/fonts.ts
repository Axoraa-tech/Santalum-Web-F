import { Barlow_Condensed, Inter_Tight } from "next/font/google";

/** Design 6 ("Report"): a tight grotesk for text and a condensed face for the large figures. */
export const a6Text = Inter_Tight({ variable: "--a6-font-text", subsets: ["latin"], weight: ["400", "500", "600"] });
export const a6Fig = Barlow_Condensed({ variable: "--a6-font-fig", subsets: ["latin"], weight: ["300", "400", "500"] });
export const a6FontVars = `${a6Text.variable} ${a6Fig.variable}`;
