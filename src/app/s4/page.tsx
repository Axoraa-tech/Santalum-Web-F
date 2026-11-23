import { CircleForm } from "@/components/CircleForm";
import { Mark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";

/** 4 — Temple: one Hoysala corridor, toned red sandalwood on the left and white sandalwood on the right. */
export default function Temple() {
  return (
    <main className="relative h-svh min-h-[640px] overflow-hidden bg-night text-linen">
      <OptionNav n={4} />

      {/* left half: red */}
      <div className="absolute inset-0 [clip-path:inset(0_50%_0_0)]">
        <Photo p={PHOTOS.temple} priority style={{ filter: "grayscale(1) contrast(1.15) brightness(0.9)" }} />
        <div className="absolute inset-0 bg-[#7a2a1c] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[#c0573a]/25 mix-blend-screen" />
      </div>
      {/* right half: white */}
      <div className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
        <Photo p={PHOTOS.temple} priority style={{ filter: "grayscale(1) contrast(0.8) brightness(1.75)" }} />
        <div className="absolute inset-0 bg-[#e6d5b5] mix-blend-multiply" />
      </div>
      <div className="absolute inset-y-0 left-1/2 w-px bg-linen/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-night/10 to-night/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_42%,rgba(28,20,16,0.45),transparent)]" />

      <header className="absolute inset-x-0 top-0 flex justify-center pt-8">
        <Mark className="text-linen" />
      </header>

      <div className="absolute inset-x-0 top-[30%] px-6 text-center">
        <h1 className="font-serif text-[44px] font-light leading-[1.05] md:text-[84px]">
          <span className="text-[#f0b9a4]">Red</span> and <span className="text-pale">white.</span>
          <br />
          Both sacred.
        </h1>
      </div>

      <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 px-6 pb-16 md:px-10 md:pb-10">
        <p className="text-[11px] tracking-[0.28em] text-pale/90">
          RAKTA CHANDANA
          <span className="mt-1 block font-serif text-base italic tracking-normal">Pterocarpus santalinus</span>
        </p>
        <p className="text-right text-[11px] tracking-[0.28em] text-pale/90">
          SHVETA CHANDANA
          <span className="mt-1 block font-serif text-base italic tracking-normal">Santalum album</span>
        </p>
      </div>
      <div className="absolute bottom-[9rem] left-1/2 w-[min(88vw,360px)] -translate-x-1/2 md:bottom-12">
        <CircleForm />
      </div>
    </main>
  );
}
