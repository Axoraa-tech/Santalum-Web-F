import { CircleForm } from "@/components/CircleForm";
import { Mark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";

/** 2 — Horizon: white sandalwood above, red below; the name is cut by the line between them. */
export default function Horizon() {
  return (
    <main className="relative h-svh min-h-[640px] overflow-hidden bg-night">
      <OptionNav n={2} />

      <section className="absolute inset-x-0 top-0 h-1/2 bg-[#f1efea]">
        <Photo p={PHOTOS.whiteLog} priority className="object-[50%_45%]" />
        <div className="absolute inset-0 bg-linen/25" />
      </section>
      <section className="absolute inset-x-0 bottom-0 h-1/2">
        <Photo p={PHOTOS.redGrain} priority />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-night/20 to-night/80" />
      </section>

      {/* the name, cut in two by the horizon */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="absolute font-serif text-[24vw] font-light leading-none md:text-[19vw] tracking-[-0.01em] text-night [clip-path:inset(0_0_50%_0)]">
          Santalum
        </span>
        <span className="absolute font-serif text-[24vw] font-light leading-none md:text-[19vw] tracking-[-0.01em] text-linen [clip-path:inset(50%_0_0_0)]">
          Santalum
        </span>
      </div>
      <h1 className="sr-only">Santalum Maison — opening soon</h1>

      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6 text-night md:px-10">
        <Mark />
        <span className="text-[11px] tracking-[0.3em] max-md:hidden">OPENING SOON</span>
      </header>

      <p className="absolute right-6 top-[calc(50%-2.25rem)] text-right text-[11px] tracking-[0.28em] text-night md:right-10">
        WHITE · <span className="font-serif text-sm italic tracking-normal">Santalum album</span>
      </p>
      <p className="absolute left-6 top-[calc(50%+1.25rem)] text-[11px] tracking-[0.28em] text-linen md:left-10">
        RED · <span className="font-serif text-sm italic tracking-normal">Pterocarpus santalinus</span>
      </p>

      <footer className="absolute inset-x-0 bottom-0 flex flex-col gap-8 px-6 pb-16 text-linen md:flex-row md:items-end md:justify-between md:px-10 md:pb-10">
        <p className="max-w-sm text-[16px] leading-relaxed text-pale/85">
          A contemporary Indian house for red and white sandalwood — objects, jewellery and gifts that remain.
        </p>
        <CircleForm />
      </footer>
    </main>
  );
}
