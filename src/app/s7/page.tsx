import { CircleForm } from "@/components/CircleForm";
import { Mark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";
import { Photo } from "@/components/Photo";
import { PHOTOS, type PhotoRef } from "@/lib/photos";

/** 7 — Two Woods: hover a side and it opens wider. Sanskrit names for both. */
export default function TwoWoods() {
  return (
    <main className="relative flex min-h-svh flex-col bg-night md:h-svh md:flex-row">
      <OptionNav n={7} />

      <Side
        p={PHOTOS.redGrain}
        sa="रक्तचन्दन"
        name="Red sandalwood"
        latin="Pterocarpus santalinus"
        line="Dense, deep red heartwood. Valued for its colour and for carving."
        tone="dark"
      />
      <Side
        p={PHOTOS.whiteLog}
        sa="श्वेतचन्दन"
        name="White sandalwood"
        latin="Santalum album"
        line="Pale, fragrant heartwood. Valued for its oil and its scent."
        tone="light"
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-7">
        <span className="bg-linen px-5 py-2 text-night">
          <Mark />
        </span>
      </header>

      <div className="relative bg-linen px-6 py-8 md:absolute md:bottom-0 md:left-1/2 md:w-[400px] md:-translate-x-1/2 md:px-8">
        <p className="mb-5 font-serif text-2xl font-light text-night">Opening soon.</p>
        <CircleForm tone="light" />
      </div>
    </main>
  );
}

function Side({
  p,
  sa,
  name,
  latin,
  line,
  tone,
}: {
  p: PhotoRef;
  sa: string;
  name: string;
  latin: string;
  line: string;
  tone: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <section className="group relative min-h-[60svh] flex-1 overflow-hidden transition-[flex-grow] duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:grow-[1.8] md:min-h-0">
      <Photo
        p={p}
        sizes="(min-width: 768px) 65vw, 100vw"
        priority
        className="transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
      />
      <div
        className={`absolute inset-0 ${dark ? "bg-gradient-to-t from-night/85 via-night/20 to-night/30" : "bg-gradient-to-t from-linen/90 via-linen/10 to-transparent"}`}
      />
      <div className={`absolute bottom-0 left-0 px-6 pb-10 md:px-12 md:pb-40 ${dark ? "text-linen" : "text-night"}`}>
        <p lang="sa" className="font-deva text-5xl md:text-6xl">
          {sa}
        </p>
        <h2 className="mt-3 font-serif text-3xl font-light">{name}</h2>
        <p className={`font-serif text-base italic ${dark ? "text-pale/75" : "text-walnut"}`}>{latin}</p>
        <p
          className={`mt-4 max-w-xs text-[16px] leading-relaxed transition-opacity duration-700 md:opacity-0 md:group-hover:opacity-100 ${dark ? "text-pale/85" : "text-walnut"}`}
        >
          {line}
        </p>
      </div>
    </section>
  );
}
