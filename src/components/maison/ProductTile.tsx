import Link from "next/link";
import { formatINR, type CategoryKey, type Family } from "@/lib/catalog";
import type { Wood } from "@/lib/wood-boot";
import { Photo } from "../Photo";

/** Each kind of object gets its own silhouette: beads are round, objects are pebbles, powders and jewellery are arches. */
export const FRAME: Record<CategoryKey, { shape: string; hover: string; aspect: string }> = {
  beads: { shape: "rounded-full", hover: "", aspect: "aspect-square" },
  objects: {
    shape: "rounded-[48%_52%_44%_56%/56%_46%_54%_44%]",
    hover: "group-hover:rounded-[54%_46%_52%_48%/48%_54%_46%_52%]",
    aspect: "aspect-square",
  },
  powder: { shape: "rounded-t-full rounded-b-[2.5rem]", hover: "", aspect: "aspect-[4/5]" },
  gifting: { shape: "rounded-[3rem]", hover: "group-hover:rounded-[4.5rem]", aspect: "aspect-[5/4]" },
  jewellery: { shape: "rounded-t-full rounded-b-[2.5rem]", hover: "", aspect: "aspect-[3/4]" },
};

export function ProductTile({ family, wood, sizes = "(min-width: 768px) 33vw, 50vw" }: { family: Family; wood: Wood; sizes?: string }) {
  const v = family.variants[wood];
  if (!v) return null;
  const [a, b] = v.shots;
  const f = FRAME[family.category];
  return (
    <Link href={`/maison/shop/${family.slug}`} className="group block">
      <div
        className={`relative overflow-hidden bg-paper-2 transition-[border-radius] duration-700 ease-out-soft ${f.shape} ${f.hover} ${f.aspect}`}
      >
        <Photo p={a.photo} tone={a.tone} sizes={sizes} className="transition-transform duration-[1400ms] ease-out-soft group-hover:scale-[1.05]" />
        {b && <Photo p={b.photo} tone={b.tone} sizes={sizes} className="opacity-0 transition-opacity duration-700 group-hover:opacity-100" />}
        {family.edition && (
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-paper/85 px-3 py-1 text-[12px] backdrop-blur">
            {family.edition}
          </span>
        )}
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-[22px] leading-tight tracking-[-0.01em] md:text-[26px]">{family.name}</h3>
        <span className="shrink-0 text-[15px] tabular-nums text-ink-2">{formatINR(v.price)}</span>
      </div>
      <p className="mt-1 text-[14px] text-ink-3">{v.note}</p>
    </Link>
  );
}
