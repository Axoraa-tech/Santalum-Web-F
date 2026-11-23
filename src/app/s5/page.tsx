import { CircleForm } from "@/components/CircleForm";
import { Mark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";

/** 5 — Triptych: red powder, a lit diya held in two hands, white powder. */
export default function Triptych() {
  return (
    <main className="grid min-h-svh grid-rows-[16svh_1fr_16svh] bg-night text-linen md:grid-cols-[1fr_2fr_1fr] md:grid-rows-1">
      <OptionNav n={5} />

      <section className="relative">
        <Photo p={PHOTOS.redPowder} sizes="(min-width: 768px) 25vw, 100vw" priority />
        <p className="absolute bottom-3 left-4 text-[11px] tracking-[0.28em] md:bottom-8 md:left-8">RED</p>
      </section>

      <section className="relative min-h-[68svh] md:min-h-svh">
        <Photo p={PHOTOS.diyaHands} sizes="(min-width: 768px) 50vw, 100vw" priority className="object-[50%_70%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/50" />
        <div className="absolute inset-x-0 top-0 flex justify-center pt-8">
          <Mark />
        </div>
        <div className="absolute inset-x-0 bottom-0 px-6 pb-10 md:px-12 md:pb-14">
          <p className="text-[11px] tracking-[0.3em] text-dust">OBJECTS FOR EVERYDAY RITUALS</p>
          <h1 className="mt-4 font-serif text-[44px] font-light leading-[1.05] md:text-[64px]">Opening soon.</h1>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-pale/80">
            Powders, beads and small objects in red and white sandalwood — for the morning lamp, the desk and the gift.
          </p>
          <CircleForm className="mt-8" />
        </div>
      </section>

      <section className="relative bg-[#f1efea]">
        <Photo p={PHOTOS.whitePowder} sizes="(min-width: 768px) 25vw, 100vw" priority className="scale-125" />
        <p className="absolute bottom-3 right-4 text-[11px] tracking-[0.28em] text-night md:bottom-8 md:right-8">WHITE</p>
      </section>
    </main>
  );
}
