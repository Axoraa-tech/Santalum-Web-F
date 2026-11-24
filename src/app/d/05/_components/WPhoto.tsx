import { Photo } from "@/components/Photo";
import type { Tone } from "@/lib/catalog";
import type { PhotoRef } from "@/lib/photos";

type Shot = { p: PhotoRef; tone?: Tone };

/**
 * A photograph per wood, each in its own positioned layer (CSS on html[data-wood] shows the current one),
 * so next/image's `fill` always has a positioned parent and the switch has no flash.
 */
export function WPhoto({ red, white, sizes, priority = false }: { red: Shot; white: Shot; sizes: string; priority?: boolean }) {
  return (
    <>
      <span className="x5-wp x5-wpRed">
        <Photo p={red.p} tone={red.tone} sizes={sizes} priority={priority} />
      </span>
      <span className="x5-wp x5-wpWhite">
        <Photo p={white.p} tone={white.tone} sizes={sizes} />
      </span>
    </>
  );
}
