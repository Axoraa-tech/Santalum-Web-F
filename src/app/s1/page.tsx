import { CircleForm } from "@/components/CircleForm";
import { Mark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";

/** 1 — Diptych: red and white sandalwood powder side by side; the Maison sits on the seam. */
export default function Diptych() {
  return (
    <main className="relative grid min-h-svh grid-rows-2 bg-night md:grid-cols-2 md:grid-rows-1">
      <OptionNav n={1} />

      <section className="relative min-h-[50svh]">
        <Photo p={PHOTOS.redPowder} sizes="(min-width: 768px) 50vw, 100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
        <Caption className="text-linen" name="Rakta chandana" latin="Pterocarpus santalinus" common="Red sandalwood" />
      </section>

      <section className="relative min-h-[50svh]">
        <Photo p={PHOTOS.whitePowder} sizes="(min-width: 768px) 50vw, 100vw" priority className="scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-sand/60 via-transparent to-transparent" />
        <Caption className="text-night md:text-right" name="Shveta chandana" latin="Santalum album" common="White sandalwood" right />
      </section>

      <div className="absolute left-1/2 top-1/2 z-10 w-[min(88vw,380px)] -translate-x-1/2 -translate-y-1/2 bg-linen px-8 py-10 text-night shadow-[0_30px_80px_-20px_rgba(28,20,16,0.55)] md:px-10 md:py-12">
        <Mark className="text-night" />
        <div className="mt-6 h-px w-10 bg-rakta" />
        <h1 className="mt-6 font-serif text-[34px] font-light leading-[1.1]">
          Two sandalwoods.
          <br />
          One house.
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-walnut">Opening soon, from India.</p>
        <CircleForm tone="light" className="mt-8" />
      </div>
    </main>
  );
}

function Caption({
  name,
  latin,
  common,
  className = "",
  right = false,
}: {
  name: string;
  latin: string;
  common: string;
  className?: string;
  right?: boolean;
}) {
  return (
    <div className={`absolute bottom-6 px-6 md:bottom-10 md:px-10 ${right ? "right-0" : "left-0"} ${className}`}>
      <p className="font-serif text-2xl italic md:text-3xl">{name}</p>
      <p className="mt-1 text-[11px] tracking-[0.28em] opacity-80">
        {common.toUpperCase()} · <span className="font-serif text-sm italic tracking-normal">{latin}</span>
      </p>
    </div>
  );
}
