import { PHOTOS } from "@/lib/photos";
import type { Product, Shot } from "@/lib/shop/products";

/**
 * The Maison's own choice of photographs where the shared catalogue doubles up or falls short:
 * the Pulse Roller no longer borrows the Reserve's vials, and the white Japa Mala leads with
 * sharp, pale beads instead of the soft lava-stone strand.
 */
const OVERRIDE: Partial<Record<string, Shot[]>> = {
  "w-pulse-roller": [{ photo: PHOTOS.oilDuo }, { photo: PHOTOS.oilDrop }],
  "w-japa-mala-108": [{ photo: PHOTOS.whiteBeads }, { photo: PHOTOS.beadsSand }],
};

export function shotsOf(p: Product): Shot[] {
  return OVERRIDE[p.slug] ?? p.shots;
}

export function firstShot(p: Product): Shot {
  return shotsOf(p)[0];
}
