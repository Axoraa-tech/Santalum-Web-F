import { featured, type Product } from "@/lib/shop/products";

/**
 * What hangs on the strand: the featured pieces of each wood (eight each, no overlap).
 * The 3D scene builds a medallion for all sixteen; only the current wood's eight are open,
 * the others are folded into the cord and swap in when the wood changes.
 */
export const STRAND_RED: Product[] = featured("red", 8);
export const STRAND_WHITE: Product[] = featured("white", 8);
export const STRAND: Product[] = [...STRAND_RED, ...STRAND_WHITE];
export const strandFor = (wood: "red" | "white") => (wood === "red" ? STRAND_RED : STRAND_WHITE);
