import { CircleForm } from "@/components/CircleForm";
import { Wordmark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";

/** Option 6 — Edition: an open book. Left page: The Lineage. Right page: The 2011 Vault. A temple pillar at the gutter. */
export default function Edition() {
  return (
    <main className="relative grid min-h-svh md:grid-cols-2">
      <OptionNav n={6} />

      {/* left page */}
      <section
        className="relative flex flex-col justify-between bg-linen px-6 py-10 text-night md:px-14 md:py-14 lg:px-20"
        style={{ backgroundImage: "linear-gradient(270deg, rgba(92,67,49,0.16) 0%, rgba(92,67,49,0) 9%)" }}
      >
        <Wordmark className="rise" markClass="text-rakta" />
        <div className="my-16 max-w-lg">
          <p className="rise text-xs tracking-[0.34em] text-rakta" style={{ animationDelay: "0.2s" }}>
            THE LINEAGE
          </p>
          <p className="rise mt-6 font-serif text-3xl font-light leading-snug md:text-4xl" style={{ animationDelay: "0.35s" }}>
            This wood does not grow on a schedule. It forms over decades, in soils that cannot be engineered, accelerated
            or replicated.
          </p>
          <p className="rise mt-8 text-[17px] leading-relaxed text-walnut" style={{ animationDelay: "0.5s" }}>
            What you hold has been waiting in the ground, then in careful hands, for longer than most things in your life
            have existed. We did not make it. We recognised it.
          </p>
        </div>
        <p className="font-serif text-sm italic text-walnut/70">i</p>
      </section>

      {/* gutter pillar */}
      <Pillar className="pointer-events-none absolute left-1/2 top-0 z-10 hidden h-full -translate-x-1/2 md:block" />

      {/* right page */}
      <section
        className="relative flex flex-col justify-between bg-night px-6 py-10 text-linen md:px-14 md:py-14 lg:px-20"
        style={{ backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 9%)" }}
      >
        <p className="rise text-xs tracking-[0.34em] text-dust md:text-right" style={{ animationDelay: "0.3s" }}>
          OPENING SOON
        </p>
        <div className="my-12">
          <p className="rise text-xs tracking-[0.34em] text-pale/60" style={{ animationDelay: "0.45s" }}>
            CURRENT EDITION
          </p>
          <p
            className="rise font-serif text-[clamp(8rem,22vw,17rem)] font-light leading-[0.85] text-dust lining-nums"
            style={{ animationDelay: "0.55s" }}
          >
            21
          </p>
          <h1 className="rise mt-4 font-serif text-3xl tracking-[0.2em] lining-nums md:text-4xl" style={{ animationDelay: "0.7s" }}>
            THE 2011 VAULT
          </h1>
          <p className="rise mt-6 max-w-md text-[17px] leading-relaxed text-pale/75" style={{ animationDelay: "0.85s" }}>
            Twenty-one pieces. Aged heartwood. Each numbered. The wood was sourced in 2011 and has been waiting since
            for the right hands and the right moment.
          </p>
          <CircleForm className="rise mt-10" />
        </div>
        <p className="font-serif text-sm italic text-pale/40 md:text-right">ii</p>
      </section>
    </main>
  );
}

/** Dravidian-style pillar in brass line: base mouldings, banded shaft, bracket capital. */
function Pillar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 1000" preserveAspectRatio="xMidYMid meet" className={className} aria-hidden>
      <g fill="none" stroke="#b08d57" strokeWidth="0.9" opacity="0.9">
        {/* capital: bracket (potika) and abacus */}
        <path d="M4 150H56M8 158H52M14 166H46" />
        <path d="M14 166C14 180 22 186 30 186C38 186 46 180 46 166" />
        <path d="M22 186V196H38V186" />
        <path d="M2 140C10 140 14 146 14 150M58 140C50 140 46 146 46 150" />
        <path d="M2 132H58" opacity="0.6" />
        {/* shaft */}
        <path d="M24 196V804M36 196V804" />
        {[260, 330, 500, 670, 740].map((y) => (
          <g key={y}>
            <path d={`M20 ${y}H40M20 ${y + 8}H40`} />
            <path d={`M20 ${y}V${y + 8}M40 ${y}V${y + 8}`} />
          </g>
        ))}
        <path d="M30 400L36 414L30 428L24 414Z" />
        <path d="M30 572L36 586L30 600L24 586Z" />
        {/* base mouldings */}
        <path d="M18 804H42V820H18Z" />
        <path d="M12 820H48V836H12Z" />
        <path d="M6 836H54V858H6Z" />
        <path d="M2 868H58" opacity="0.6" />
      </g>
    </svg>
  );
}
