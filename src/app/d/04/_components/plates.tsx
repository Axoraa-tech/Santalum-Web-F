import { Photo } from "@/components/Photo";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Product, Shot, Tone } from "@/lib/shop/products";

/**
 * Design 04 "Corridor": which photograph hangs for a piece. The catalogue's placeholders are used as they are,
 * with two corrections for this building: the 2011 Vault Cuff is shown as a cuff (a close crop on the wrist,
 * not the turned pots it borrowed), and no frame shows another maker's name engraved on a lid.
 */

/** A crop on the photograph: the point to keep (percent across, percent down) and how far to come in. */
export type Crop = { x: number; y: number; zoom: number };
export type Plate = Shot & { crop?: Crop };

const OPEN_BOX: PhotoRef = { id: "photo-1770816307472-945144576a1f", alt: "A hinged heartwood box with its lid standing open" };

/** The Vault Cuff: the smooth red heartwood cuff and a ring-grained cuff, close on the wrist. */
export const CUFF_PLATE: Plate = {
  photo: { id: PHOTOS.bangles.id, alt: "A smooth red heartwood cuff and a ring-grained turned cuff, worn on the wrist" },
  tone: "red",
  crop: { x: 20, y: 85, zoom: 2 },
};

const PLATES: Record<string, Plate[]> = {
  "r-vault-cuff": [CUFF_PLATE, { photo: PHOTOS.redGrain }],
  "r-presentation-box": [{ photo: OPEN_BOX }, { photo: PHOTOS.boxCarved }],
};

/** Photographs this building never hangs, and what hangs in their place. */
const SWAP: Record<string, PhotoRef> = {
  [PHOTOS.boxRed.id]: OPEN_BOX,
};

export function platesOf(p: Product): Plate[] {
  return PLATES[p.slug] ?? p.shots;
}

/** The first plate of a piece, as props for Pic (thumbnails). */
export function picOf(p: Product) {
  const a = platesOf(p)[0];
  return { p: a.photo, tone: a.tone, crop: a.crop };
}

/** Scale the length at the end of each `sizes` entry, so a cropped photograph is fetched large enough. */
function scaleSizes(sizes: string, k: number) {
  return sizes
    .split(",")
    .map((part) => part.replace(/(\d+(?:\.\d+)?)(vw|vh|px)\s*$/, (_, n: string, u: string) => `${Math.round(Number(n) * k)}${u}`))
    .join(",");
}

/** The site's Photo, with this design's swaps and crops applied. */
export function Pic({
  p,
  tone,
  crop,
  sizes = "100vw",
  priority,
  className,
}: {
  p: PhotoRef;
  tone?: Tone;
  crop?: Crop;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const photo = SWAP[p.id] ? { ...SWAP[p.id], alt: p.alt === "" ? "" : SWAP[p.id].alt } : p;
  const style = crop
    ? {
        objectPosition: `${crop.x}% ${crop.y}%`,
        transformOrigin: `${crop.x}% ${crop.y}%`,
        transform: `scale(${crop.zoom})`,
      }
    : undefined;
  return (
    <Photo
      p={photo}
      tone={tone}
      sizes={crop ? scaleSizes(sizes, crop.zoom) : sizes}
      priority={priority}
      className={className}
      style={style}
    />
  );
}
