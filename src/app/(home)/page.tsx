import type { Metadata } from "next";
import { SceneGate } from "@/components/soon/SceneGate";
import { SignupForm } from "@/components/soon/SignupForm";
import { SoundToggle } from "@/components/soon/SoundToggle";
import "./soon.css";

export const metadata: Metadata = {
  title: "Santalum Aroma — Website coming soon",
  description: "Santalum Aroma, Essence of Luxury Wood. Estd. 1985. Our website is coming soon.",
};

const SOCIALS = ["Instagram", "Facebook", "YouTube"];

/** The public coming-soon page: one calm cinematic shot and a single line. Earlier design options live at /options. */
export default function ComingSoon() {
  return (
    <main className="soon relative h-svh min-h-[560px] overflow-hidden bg-[#e9dfd0] text-night">
      {/* Static backdrop: what shows before the film loads, and instead of it without WebGL. */}
      <div aria-hidden className="soon-backdrop absolute inset-0" />
      <SceneGate />
      <div aria-hidden className="soon-shade pointer-events-none absolute inset-0" />
      <div aria-hidden className="soon-grain pointer-events-none absolute inset-[-50%]" />
      <div aria-hidden className="soon-letterbox" />

      <header className="soon-in soon-d1 pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-5 py-6 md:px-12 md:py-9">
        {/* eslint-disable-next-line @next/next/no-img-element -- local brand asset; next/image uses the Unsplash loader */}
        <img src="/brand/logo-mark-ink.png" alt="Santalum Aroma" width={684} height={644} className="h-10 w-auto opacity-85 md:h-12" />
        {/* The loader: counts beads as the needle strings them. */}
        <p className="soon-count text-center text-[10px] tracking-[0.42em] text-walnut/80 uppercase md:text-[11px]" aria-hidden>
          <span id="bead-count" className="font-serif text-[15px] tracking-[0.18em] text-night md:text-[17px]">
            000
          </span>
          <span className="mx-2 text-walnut/50">/</span>108
          <span className="soon-count-label mt-2 block">Stringing the mala</span>
        </p>
        <p className="text-[10px] tracking-[0.42em] text-walnut/70 uppercase md:text-[11px]">Estd. 1985</p>
      </header>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-5 pb-7 text-center md:pb-10">
        <h1 className="soon-in soon-d2 soon-late font-serif text-[34px] leading-none font-light tracking-[0.2em] md:text-[56px] md:tracking-[0.24em]">
          SANTALUM AROMA
        </h1>
        <p className="soon-in soon-d3 soon-late mt-4 text-[10px] tracking-[0.5em] text-amber uppercase md:text-[11px]">
          Essence of Luxury Wood
        </p>
        <p className="soon-in soon-d4 soon-late mt-7 font-serif text-[22px] font-light text-walnut italic md:text-[26px]">
          Our website is coming soon.
        </p>
        <div className="soon-in soon-d5 soon-late pointer-events-auto mt-6 flex w-full justify-center">
          <SignupForm tone="light" />
        </div>
        <div className="soon-in soon-d6 soon-late pointer-events-auto mt-2 flex w-full max-w-md items-center justify-between gap-6">
          <nav aria-label="Social" className="flex gap-6 text-[10px] tracking-[0.3em] text-walnut/70 uppercase md:text-[11px]">
            {SOCIALS.map((s) => (
              <a key={s} href="#" className="transition-colors hover:text-rakta">
                {s}
              </a>
            ))}
          </nav>
          <SoundToggle />
        </div>
      </div>

    </main>
  );
}
