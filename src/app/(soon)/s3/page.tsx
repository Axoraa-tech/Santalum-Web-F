import { CircleForm } from "@/components/CircleForm";
import { Mark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";
import { Photo } from "@/components/Photo";
import { PHOTOS, type PhotoRef } from "@/lib/photos";

/** 3 — Specimens: two plates, catalogued like a museum collection. */
export default function Specimens() {
  return (
    <main className="min-h-svh bg-linen px-6 pb-20 pt-8 text-night md:px-12 md:pt-10">
      <OptionNav n={3} />
      <header className="flex items-center justify-between border-b border-night/15 pb-6">
        <Mark />
        <span className="text-[11px] tracking-[0.3em] text-walnut">OPENING SOON</span>
      </header>

      <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4 lg:pt-4">
          <p className="text-[11px] tracking-[0.3em] text-rakta">THE COLLECTION · I</p>
          <h1 className="mt-6 font-serif text-[40px] font-light leading-[1.08] md:text-[52px]">
            Two woods India has kept for four thousand years.
          </h1>
          <p className="mt-6 max-w-sm text-[17px] leading-relaxed text-walnut">
            One deep red and dense. One pale and fragrant. Santalum Maison works with both — and documents where every
            piece comes from.
          </p>
          <CircleForm tone="light" className="mt-12" />
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:gap-8">
          <Plate
            no="01"
            p={PHOTOS.redChip}
            name="Red sandalwood"
            latin="Pterocarpus santalinus"
            origin="Eastern Ghats, Andhra Pradesh"
          />
          <Plate
            no="02"
            p={PHOTOS.whiteRitual}
            name="White sandalwood"
            latin="Santalum album"
            origin="Mysuru, Karnataka"
            className="sm:mt-24"
          />
        </div>
      </div>
    </main>
  );
}

function Plate({
  no,
  p,
  name,
  latin,
  origin,
  className = "",
}: {
  no: string;
  p: PhotoRef;
  name: string;
  latin: string;
  origin: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="relative aspect-[4/5] overflow-hidden bg-pale">
        <Photo p={p} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" priority />
      </div>
      <figcaption className="mt-5 grid grid-cols-[3rem_1fr] border-t border-night/15 pt-4">
        <span className="font-serif text-lg text-rakta">{no}</span>
        <span>
          <span className="block font-serif text-2xl">{name}</span>
          <span className="block font-serif text-base italic text-walnut">{latin}</span>
          <span className="mt-2 block text-[11px] tracking-[0.26em] text-walnut/80">{origin.toUpperCase()}</span>
        </span>
      </figcaption>
    </figure>
  );
}
