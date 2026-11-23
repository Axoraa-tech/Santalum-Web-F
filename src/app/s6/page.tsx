import { CircleForm } from "@/components/CircleForm";
import { Mark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";
import { Photo } from "@/components/Photo";
import { PHOTOS, type PhotoRef } from "@/lib/photos";

/** 6 — Hand: a carver at work; the two woods sit beside the text. */
export default function Hand() {
  return (
    <main className="grid min-h-svh bg-linen text-night md:grid-cols-[7fr_5fr]">
      <OptionNav n={6} />

      <section className="relative min-h-[55svh] md:min-h-svh">
        <Photo p={PHOTOS.carving} sizes="(min-width: 768px) 58vw, 100vw" priority />
        <p className="absolute bottom-6 left-6 text-[11px] tracking-[0.28em] text-linen/85 md:left-10">
          HAND-FINISHED IN INDIA
        </p>
      </section>

      <section className="flex flex-col justify-between px-6 py-10 md:px-12 md:py-12 lg:px-16">
        <div className="flex items-center justify-between">
          <Mark />
          <span className="text-[11px] tracking-[0.3em] text-walnut max-lg:hidden">OPENING SOON</span>
        </div>

        <div className="my-14">
          <h1 className="font-serif text-[40px] font-light leading-[1.08] md:text-[50px]">
            Every piece begins as a reading.
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-walnut">
            The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.
          </p>

          <div className="mt-10 grid max-w-md grid-cols-2 gap-4">
            <Swatch p={PHOTOS.redChip} label="Red sandalwood" latin="Pterocarpus santalinus" />
            <Swatch p={PHOTOS.whiteLog} label="White sandalwood" latin="Santalum album" />
          </div>
        </div>

        <CircleForm tone="light" />
      </section>
    </main>
  );
}

function Swatch({ p, label, latin }: { p: PhotoRef; label: string; latin: string }) {
  return (
    <figure>
      <div className="relative aspect-square overflow-hidden bg-pale">
        <Photo p={p} sizes="200px" />
      </div>
      <figcaption className="mt-3">
        <span className="block text-[15px]">{label}</span>
        <span className="block font-serif text-sm italic text-walnut">{latin}</span>
      </figcaption>
    </figure>
  );
}
