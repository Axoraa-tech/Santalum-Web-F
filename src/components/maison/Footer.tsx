import Link from "next/link";
import { BackToTop } from "./BackToTop";
import { CircleSignup } from "./CircleSignup";

const COLS: { title: string; links: [string, string][] }[] = [
  {
    title: "Collection",
    links: [
      ["Beads and malas", "/maison/shop?c=beads"],
      ["Everyday objects", "/maison/shop?c=objects"],
      ["Powder and oil", "/maison/shop?c=powder"],
      ["Jewellery", "/maison/shop?c=jewellery"],
      ["Gifting", "/maison/shop?c=gifting"],
    ],
  },
  {
    title: "The Maison",
    links: [
      ["Grain studio", "/maison#studio"],
      ["The two woods", "/maison#material"],
      ["Provenance", "/maison#provenance"],
      ["The 2011 Vault", "/maison/shop/vault-cuff"],
    ],
  },
  {
    title: "Care",
    links: [
      ["Delivery and returns", "/maison/checkout"],
      ["Material and sourcing", "/maison#provenance"],
      ["CITES compliance", "/maison#provenance"],
      ["Coming-soon page", "/"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="px-3 pb-3 pt-24 md:px-4 md:pb-4">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-paper-2 px-6 pt-14 md:rounded-[3.5rem] md:px-14 md:pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="max-w-md font-display text-[34px] leading-[1.05] tracking-[-0.02em] md:text-[46px]">
              Hear about new pieces before anyone else
            </p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-2">
              The Santalum Circle gets new collections, studio notes and private previews. A few letters a year.
            </p>
            <CircleSignup className="mt-8" />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="text-[13px] text-ink-3">{c.title}</p>
                <ul className="mt-4 space-y-2.5 text-[15px]">
                  {c.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="transition-colors hover:text-accent">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <WoodWordmark />

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-hair py-6 text-[13px] text-ink-2">
          <p>© 2026 Santalum Maison</p>
          <p>Every piece numbered and documented</p>
          <p>Made in India</p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}

/** The name, cut from a log: warped growth rings clipped to the letters, in the current wood's colour. */
function WoodWordmark() {
  // Ring widths vary like real growth years; the pith sits inside the "t".
  const rings = Array.from({ length: 96 }, (_, i) => ({ r: 6 + i * 6.6 + (i % 3) * 1.4, w: i % 7 === 0 ? 3.4 : i % 3 === 0 ? 2 : 1.1 }));
  return (
    <svg viewBox="0 0 1200 290" className="group mt-16 block w-full md:mt-24" role="img" aria-label="Santalum">
      <defs>
        <clipPath id="santalum-wordmark">
          <text
            x="600"
            y="238"
            textAnchor="middle"
            textLength="1176"
            lengthAdjust="spacingAndGlyphs"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: 310, fontVariationSettings: '"SOFT" 100, "opsz" 144', letterSpacing: "-0.04em" }}
          >
            santalum
          </text>
        </clipPath>
        <filter id="santalum-warp" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="11" />
          <feDisplacementMap in="SourceGraphic" scale="22" />
        </filter>
      </defs>
      <g clipPath="url(#santalum-wordmark)">
        <rect width="1200" height="290" style={{ fill: "var(--m-accent-soft)" }} />
        <g
          filter="url(#santalum-warp)"
          fill="none"
          className="origin-[46%_62%] transition-transform duration-[1600ms] ease-out-soft group-hover:scale-[1.08]"
          style={{ stroke: "var(--m-accent)" }}
        >
          {rings.map(({ r, w }) => (
            <circle key={r} cx="560" cy="180" r={r} strokeWidth={w} opacity={w > 2 ? 0.9 : 0.5} />
          ))}
        </g>
      </g>
    </svg>
  );
}
