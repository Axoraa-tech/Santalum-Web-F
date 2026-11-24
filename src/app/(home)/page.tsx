import type { Metadata } from "next";
import { SceneGate } from "@/components/soon/SceneGate";
import { SignupForm } from "@/components/soon/SignupForm";

export const metadata: Metadata = {
  title: "Santalum Aroma — Essence of Luxury Wood · Coming Soon",
  description:
    "Santalum Aroma, Estd. 1985. Sandalwood objects, aromas and gifts, crafted with four decades of care. Our new home opens soon.",
};

const SOCIALS = [
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "YouTube", href: "#" },
];

/** The public coming-soon page. Design options from review live at /options. */
export default function ComingSoon() {
  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-night text-linen">
      {/* Static warm glow: the fallback when 3D is off, and the backdrop under it. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 42%, rgb(139 94 60 / 0.45), transparent 70%), radial-gradient(40% 40% at 50% 100%, rgb(110 42 31 / 0.35), transparent 70%)",
        }}
      />
      {/* Soft vignette keeps the copy readable over the scene. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgb(28 20 16 / 0.55), transparent 30%, transparent 55%, rgb(28 20 16 / 0.9))" }}
      />

      <header className="relative z-10 flex justify-center px-4 pt-8 md:pt-10">
        {/* eslint-disable-next-line @next/next/no-img-element -- local brand asset; next/image uses the Unsplash loader */}
        <img
          src="/brand/logo-mark.png"
          alt="Santalum Aroma"
          width={684}
          height={644}
          className="h-14 w-auto opacity-90 md:h-16"
          fetchPriority="high"
        />
      </header>

      {/* The 3D stage: its own band between logo and copy, so nothing overlaps. */}
      <div className="relative min-h-[34svh] flex-1">
        <SceneGate />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 pb-10 text-center md:pb-12">
        <p className="text-[12px] tracking-[0.42em] text-dust uppercase">Coming soon · Estd. 1985</p>
        <h1 className="mt-5 font-serif text-[44px] leading-[1.02] font-light tracking-[0.06em] md:text-[76px]">
          SANTALUM AROMA
        </h1>
        <p className="mt-3 text-[13px] tracking-[0.36em] text-pale/80 uppercase md:text-[14px]">
          Essence of Luxury Wood
        </p>
        <p className="mt-7 max-w-xl font-serif text-[21px] leading-snug text-pale/90 italic md:text-[24px]">
          Four decades of sandalwood, slow-grown, hand-finished and honest to its scent. Our new home is being
          prepared with the same patience.
        </p>
        <div className="mt-9 flex w-full justify-center">
          <SignupForm />
        </div>
        <nav aria-label="Social" className="mt-6 flex gap-7 text-[13px] tracking-[0.2em] text-pale/60 uppercase">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} className="transition-colors hover:text-dust">
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
