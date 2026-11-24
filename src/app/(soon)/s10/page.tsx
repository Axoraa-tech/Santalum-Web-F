import { CircleForm } from "@/components/CircleForm";
import { Mark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";
import { Photo } from "@/components/Photo";
import { PHOTOS, type PhotoRef } from "@/lib/photos";

/** 10 — Lookbook: three red materials over three white ones, on linen. */
export default function Lookbook() {
  return (
    <main className="min-h-svh bg-linen px-6 pb-24 pt-8 text-night md:px-12 md:pt-10">
      <OptionNav n={10} />
      <header className="flex items-center justify-between">
        <Mark />
        <span className="text-[11px] tracking-[0.3em] text-walnut">OPENING SOON</span>
      </header>

      <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-2 md:items-end">
        <h1 className="font-serif text-[64px] font-light leading-[0.95] md:text-[112px]">
          <span className="text-rakta">Red,</span>
          <br />
          and white.
        </h1>
        <div className="md:justify-self-end">
          <p className="max-w-sm text-[17px] leading-relaxed text-walnut">
            Two sandalwoods, worked into objects, beads, powders and gifts. The first collection is being finished by
            hand.
          </p>
          <CircleForm tone="light" className="mt-10" />
        </div>
      </div>

      <Row
        label="Red sandalwood"
        latin="Pterocarpus santalinus"
        items={[
          [PHOTOS.redChip, "Heartwood"],
          [PHOTOS.redPowder, "Powder"],
          [PHOTOS.redGrain, "Grain"],
        ]}
      />
      <Row
        label="White sandalwood"
        latin="Santalum album"
        items={[
          [PHOTOS.whiteLog, "Heartwood"],
          [PHOTOS.whitePowder, "Powder"],
          [PHOTOS.whiteBeads, "Beads"],
        ]}
      />

      <p className="mt-20 border-t border-night/15 pt-6 text-sm text-walnut">
        Made with respect for the material. Designed for the life around it.
      </p>
    </main>
  );
}

function Row({ label, latin, items }: { label: string; latin: string; items: [PhotoRef, string][] }) {
  return (
    <section className="mt-20">
      <div className="flex items-baseline justify-between border-b border-night/15 pb-3">
        <h2 className="font-serif text-2xl">{label}</h2>
        <span className="font-serif text-base italic text-walnut">{latin}</span>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3 md:gap-6">
        {items.map(([p, name], i) => (
          <figure key={name}>
            <div className="relative aspect-[3/4] overflow-hidden bg-pale">
              <Photo p={p} sizes="33vw" priority={i === 0} />
            </div>
            <figcaption className="mt-3 flex justify-between text-[13px] text-walnut">
              <span>{name}</span>
              <span className="font-serif">0{i + 1}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
