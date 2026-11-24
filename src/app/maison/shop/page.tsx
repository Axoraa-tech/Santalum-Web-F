import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopGrid } from "@/components/maison/ShopGrid";
import { WT } from "@/components/maison/W";

export const metadata: Metadata = {
  title: "Collection",
  description: "Beads, everyday objects, powders, oils, gifting and jewellery in red and white sandalwood.",
};

export default function Shop() {
  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-16 pt-32 md:px-10 md:pt-40">
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <h1 className="font-display text-[clamp(3.4rem,9vw,9rem)] font-[350] leading-[0.9] tracking-[-0.04em] md:col-span-7">
          Collection
        </h1>
        <p className="max-w-sm text-[16px] leading-relaxed text-ink-2 md:col-span-4 md:col-start-9 md:pb-4">
          <WT
            red={<>Shaped from red sandalwood. Switch to white at the top to see the same pieces in the other wood.</>}
            white={<>Shaped from white sandalwood. Switch to red at the top to see the same pieces in the other wood.</>}
          />
        </p>
      </div>
      <div className="mt-14">
        <Suspense>
          <ShopGrid />
        </Suspense>
      </div>
    </div>
  );
}
