import { bag, launchFlight } from "@/lib/shop/bag";
import type { Product } from "@/lib/shop/products";
import { firstShot } from "./shots";

/** Put a piece in the bag and send its photograph flying from `from` to the bag island. */
export function addToBag(from: Element | null, p: Product, opts: { option?: string; qty?: number; note?: string } = {}) {
  bag.add(p.slug, opts);
  const shot = firstShot(p);
  if (from) launchFlight(from.getBoundingClientRect(), shot.photo.id, shot.tone);
}
