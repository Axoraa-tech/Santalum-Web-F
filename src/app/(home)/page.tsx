import type { Metadata } from "next";
import { SceneGate } from "@/components/soon/SceneGate";
import { SignupForm } from "@/components/soon/SignupForm";
import "./soon.css";

export const metadata: Metadata = {
  title: "Santalum Aroma — Website coming soon",
  description: "Santalum Aroma, Essence of Luxury Wood. Estd. 1985. Our website is coming soon.",
};

const SOCIALS = ["Instagram", "Facebook", "YouTube"];

/** The public coming-soon page: one cinematic shot and a single line. Earlier design options live at /options. */
export default function ComingSoon() {
  return (
    <main className="soon relative h-svh min-h-[560px] overflow-hidden bg-[#0b0806] text-linen">
      {/* Static backdrop: what shows before the film loads, and instead of it without WebGL. */}
      <div aria-hidden className="soon-backdrop absolute inset-0" />
      <SceneGate />
      <div aria-hidden className="soon-shade pointer-events-none absolute inset-0" />
      <div aria-hidden className="soon-grain pointer-events-none absolute inset-[-50%]" />
      <div aria-hidden className="soon-letterbox" />

      <header className="soon-in soon-d1 absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-6 md:px-12 md:py-9">
        {/* eslint-disable-next-line @next/next/no-img-element -- local brand asset; next/image uses the Unsplash loader */}
        <img src="/brand/logo-mark.png" alt="Santalum Aroma" width={684} height={644} className="h-10 w-auto opacity-90 md:h-12" />
        <p className="text-[10px] tracking-[0.42em] text-pale/60 uppercase md:text-[11px]">Estd. 1985</p>
      </header>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-5 pb-8 text-center md:pb-12">
        <h1 className="soon-in soon-d2 font-serif text-[34px] leading-none font-light tracking-[0.2em] md:text-[58px] md:tracking-[0.24em]">
          SANTALUM AROMA
        </h1>
        <p className="soon-in soon-d3 mt-4 text-[10px] tracking-[0.5em] text-dust uppercase md:text-[11px]">
          Essence of Luxury Wood
        </p>
        <p className="soon-in soon-d4 mt-8 font-serif text-[22px] font-light text-pale/90 italic md:text-[26px]">
          Our website is coming soon.
        </p>
        <div className="soon-in soon-d5 mt-7 flex w-full justify-center">
          <SignupForm />
        </div>
        <nav aria-label="Social" className="soon-in soon-d5 mt-3 flex gap-7 text-[10px] tracking-[0.3em] text-pale/45 uppercase md:text-[11px]">
          {SOCIALS.map((s) => (
            <a key={s} href="#" className="transition-colors hover:text-dust">
              {s}
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
