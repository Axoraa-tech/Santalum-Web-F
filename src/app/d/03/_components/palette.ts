import type { Wood } from "@/lib/wood";

/**
 * Design 03's two page palettes. The CSS in strand.css holds the same values; the 3D strand
 * reads these so the canvas background and fog match the page in each wood.
 */
export const BG: Record<Wood, string> = { red: "#f6ece6", white: "#f8f2e3" };

/** Bead colour on the strand for each wood. */
export const BEAD: Record<Wood, string> = { red: "#7a2a1d", white: "#d4b383" };
