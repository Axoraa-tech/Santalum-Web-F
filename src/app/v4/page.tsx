import { CircleForm } from "@/components/CircleForm";
import { MalaRing } from "@/components/MalaRing";
import { Wordmark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";

/** Option 4 — Mala: 108 sandalwood beads, counted one at a time toward the opening. */
export default function Mala() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-charcoal text-linen">
      <OptionNav n={4} />
      <div className="mx-auto grid min-h-svh max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1.1fr_1fr] md:gap-16 md:px-12">
        <MalaRing className="fade mx-auto w-[min(88vw,560px)]" />

        <div>
          <Wordmark className="rise text-pale" markClass="text-dust" />
          <p className="rise mt-12 text-xs tracking-[0.34em] text-dust" style={{ animationDelay: "0.2s" }}>
            OBJECTS FOR EVERYDAY RITUALS
          </p>
          <h1 className="rise mt-5 font-serif text-5xl font-light leading-[1.04] md:text-7xl" style={{ animationDelay: "0.35s" }}>
            Counted,
            <br />
            unhurried.
          </h1>
          <p className="rise mt-8 max-w-md text-[17px] leading-relaxed text-pale/75" style={{ animationDelay: "0.5s" }}>
            A mala is never rushed. Neither is the Maison. Beads, malas and quiet objects for personal ritual — shaped
            from red sandalwood, and opening soon.
          </p>
          <CircleForm className="rise mt-12" />
        </div>
      </div>
    </main>
  );
}
