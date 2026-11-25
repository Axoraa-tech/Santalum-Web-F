import type { CategoryId } from "@/lib/shop/products";

/**
 * Each kind of piece has its own silhouette, so a grid never reads as rows of boxes:
 * beads are round, objects are pebbles, powders and jewellery stand in arches,
 * oils stand in tall bottle arches, carvings sit in a temple niche, gifts in a soft box.
 */
export const FRAME: Record<CategoryId, { shape: string; hover: string; aspect: string }> = {
  // red
  beads: { shape: "rounded-full", hover: "", aspect: "aspect-square" },
  objects: {
    shape: "rounded-[48%_52%_44%_56%/56%_46%_54%_44%]",
    hover: "group-hover:rounded-[54%_46%_52%_48%/48%_54%_46%_52%]",
    aspect: "aspect-square",
  },
  powder: { shape: "rounded-t-full rounded-b-[2.5rem]", hover: "", aspect: "aspect-[4/5]" },
  gifting: { shape: "rounded-[3rem]", hover: "group-hover:rounded-[4.5rem]", aspect: "aspect-[5/4]" },
  jewellery: { shape: "rounded-t-full rounded-b-[2.5rem]", hover: "", aspect: "aspect-[3/4]" },
  // white
  oil: { shape: "rounded-t-full rounded-b-[3rem]", hover: "", aspect: "aspect-[3/4]" },
  incense: {
    shape: "rounded-[52%_48%_56%_44%/46%_56%_44%_54%]",
    hover: "group-hover:rounded-[46%_54%_48%_52%/54%_46%_52%_48%]",
    aspect: "aspect-square",
  },
  skin: { shape: "rounded-t-full rounded-b-[2.5rem]", hover: "", aspect: "aspect-[4/5]" },
  "w-beads": { shape: "rounded-full", hover: "", aspect: "aspect-square" },
  carvings: { shape: "rounded-t-[42%] rounded-b-[2rem]", hover: "group-hover:rounded-t-[50%]", aspect: "aspect-[4/5]" },
  "w-gifting": { shape: "rounded-[3rem]", hover: "group-hover:rounded-[4.5rem]", aspect: "aspect-[5/4]" },
};
