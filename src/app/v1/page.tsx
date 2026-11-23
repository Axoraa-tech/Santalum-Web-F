import { CircleForm } from "@/components/CircleForm";
import { Wordmark } from "@/components/Lotus";
import { OptionNav } from "@/components/OptionNav";

/** Option 1 — Sanctum: a temple doorway (garbhagriha) drawn in brass line, a diya burning inside. */
export default function Sanctum() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-night text-linen">
      <OptionNav n={1} />
      <div
        className="glow pointer-events-none absolute left-1/2 top-[55%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full md:left-[30%]"
        style={{ background: "radial-gradient(circle, rgba(196,151,90,0.16) 0%, rgba(196,151,90,0) 65%)" }}
      />
      <div className="relative mx-auto grid min-h-svh max-w-6xl items-center gap-14 px-6 py-24 md:grid-cols-2 md:gap-20 md:px-12">
        <Doorway className="fade mx-auto w-[min(70vw,340px)]" />

        <div>
          <Wordmark className="rise text-pale" markClass="text-dust" />
          <p className="rise mt-14 text-xs tracking-[0.34em] text-dust" style={{ animationDelay: "0.2s" }}>
            RED SANDALWOOD · INDIA
          </p>
          <h1
            className="rise mt-5 font-serif text-5xl leading-[1.04] font-light md:text-7xl"
            style={{ animationDelay: "0.35s" }}
          >
            Objects Time
            <br />
            Cannot Repeat.
          </h1>
          <p
            className="rise mt-8 max-w-md text-[17px] leading-relaxed text-pale/75"
            style={{ animationDelay: "0.5s" }}
          >
            The Maison opens its doors soon. Our first edition — twenty-one numbered pieces of aged heartwood — is being
            finished by hand.
          </p>
          <CircleForm className="rise mt-12" />
          <p className="rise mt-16 text-sm text-pale/40" style={{ animationDelay: "0.9s" }}>
            Made with respect for the material.
          </p>
        </div>
      </div>
    </main>
  );
}

function Doorway({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 470" className={className} aria-hidden>
      <defs>
        <radialGradient id="inner" cx="50%" cy="88%" r="75%">
          <stop offset="0" stopColor="#8b5e3c" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#3a2419" stopOpacity="0.6" />
          <stop offset="1" stopColor="#1c1410" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flameG" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#c4975a" />
          <stop offset="0.45" stopColor="#f0c47a" />
          <stop offset="1" stopColor="#f5f0e8" />
        </linearGradient>
        <radialGradient id="halo">
          <stop offset="0" stopColor="#f0c47a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f0c47a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b5a2b" />
          <stop offset="1" stopColor="#4a2a1a" />
        </linearGradient>
      </defs>

      <g fill="none" stroke="#b08d57" strokeWidth="1.1">
        {/* shikhara: tiers and curved crown */}
        <path d="M150 22v12" />
        <circle cx="150" cy="40" r="6" />
        <path d="M112 132C118 92 136 62 150 46C164 62 182 92 188 132" />
        <path d="M124 132C128 100 140 76 150 62C160 76 172 100 176 132" opacity="0.6" />
        <path d="M96 132H204V152H96Z" />
        <path d="M78 152H222V174H78Z" />
        <path d="M58 174H242V198H58Z" />
        {/* lintel */}
        <path d="M40 198H260V214H40Z" />
        <path d="M40 206H260" opacity="0.5" />
        {/* jambs */}
        <path d="M56 214V462M244 214V462" />
        <path d="M68 214V462M232 214V462" opacity="0.55" />
        {/* jamb bands */}
        {[250, 300, 350, 400].map((y) => (
          <path key={y} d={`M56 ${y}h12M232 ${y}h12`} opacity="0.7" />
        ))}
        {/* threshold steps */}
        <path d="M30 462H270M18 470H282" />
      </g>

      {/* the opening */}
      <path d="M92 462V282Q92 238 150 228Q208 238 208 282V462Z" fill="url(#inner)" />
      <path d="M92 462V282Q92 238 150 228Q208 238 208 282V462" fill="none" stroke="#b08d57" strokeWidth="1.1" />
      <path d="M102 462V286Q102 248 150 240Q198 248 198 286V462" fill="none" stroke="#b08d57" strokeWidth="0.6" opacity="0.5" />

      {/* diya */}
      <circle className="glow" cx="150" cy="404" r="46" fill="url(#halo)" />
      <path className="flame" d="M150 372C156 382 158 392 155 400C153 405 147 405 145 400C142 392 144 382 150 372Z" fill="url(#flameG)" />
      <path d="M150 401v6" stroke="#2a1a12" strokeWidth="1.4" />
      <path d="M118 408Q150 404 182 408Q178 428 150 430Q122 428 118 408Z" fill="url(#clay)" />
      <path d="M118 408Q150 404 182 408" fill="none" stroke="#c4975a" strokeWidth="0.8" opacity="0.6" />
      <path d="M140 430h20l4 8h-28Z" fill="#4a2a1a" />
    </svg>
  );
}
