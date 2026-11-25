import type { CSSProperties } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { getProduct, type Product, type Shot } from "@/lib/shop/products";

/** A shot with an optional crop: where to look in the frame, and how far in. */
export type Shot7 = Shot & { pos?: string; zoom?: number };

/**
 * This design's own photo choices where the shared placeholder does not show the piece: the presentation box
 * photo carried another maker's name and a tray of stones, the cuff showed bowls, the roller repeated the
 * Reserve vials, and the red bracelet was pale beads with quartz.
 */
const OVERRIDES: Record<string, Shot7[]> = {
  "r-presentation-box": [{ photo: PHOTOS.boxes }, { photo: PHOTOS.boxCarved }],
  "r-vault-cuff": [{ photo: PHOTOS.bangles, pos: "12% 72%", zoom: 1.6 }, { photo: PHOTOS.redGrain }],
  "r-bead-bracelet": [{ photo: PHOTOS.braceletDark, pos: "30% 35%", zoom: 1.6 }, { photo: PHOTOS.beadStrandsDark }],
  "r-wrist-mala-27": [{ photo: PHOTOS.braceletDark }, { photo: PHOTOS.beadStrands }],
  "w-pulse-roller": [{ photo: PHOTOS.oilHands }, { photo: PHOTOS.oilDrop }],
};

export const shotsOf = (p: Product): Shot7[] => OVERRIDES[p.slug] ?? p.shots;
export const shotOf = (p: Product, i = 0): Shot7 => {
  const s = shotsOf(p);
  return s[i] ?? s[0];
};

/** <Photo> for a Shot7, with its crop applied. */
export function ShotPhoto({
  shot,
  sizes,
  priority,
  className,
  style,
}: {
  shot: Shot7;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const crop: CSSProperties = {};
  if (shot.pos) {
    crop.objectPosition = shot.pos;
    crop.transformOrigin = shot.pos;
  }
  if (shot.zoom) crop.transform = `scale(${shot.zoom})`;
  return <Photo p={shot.photo} tone={shot.tone} sizes={sizes} priority={priority} className={className} style={{ ...crop, ...style }} />;
}

/**
 * An order line's photo. Lines store the shared shot's id when the order is placed, so a piece this design
 * shows with its own photo (the presentation box, the cuff) is looked up again here instead.
 */
export function LinePhoto({ line, sizes }: { line: { slug: string; photoId: string; name: string }; sizes?: string }) {
  const p = getProduct(line.slug);
  if (p && OVERRIDES[p.slug]) return <ShotPhoto shot={shotOf(p)} sizes={sizes} />;
  return <Photo p={{ id: line.photoId, alt: line.name }} sizes={sizes} />;
}
