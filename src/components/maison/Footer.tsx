import Link from "next/link";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood-boot";
import { BackToTop } from "./BackToTop";
import { CircleSignup } from "./CircleSignup";
import { W, WT } from "./W";

const LINK = "rounded-sm transition-colors hover:text-(--mz-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)";

function ShopLinks({ wood }: { wood: Wood }) {
  return (
    <ul className="mt-4 space-y-2.5 text-[15px]">
      {CATEGORIES[wood].map((c) => (
        <li key={c.id}>
          <Link href={`/maison/shop?c=${c.id}`} className={LINK}>
            {c.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="px-3 pb-3 pt-24 md:px-4 md:pb-4">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-(--mz-surface) px-6 pt-14 text-(--mz-ink) md:rounded-[3.5rem] md:px-14 md:pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="max-w-md font-display text-[34px] leading-[1.05] tracking-[-0.02em] md:text-[46px]">
              <WT red="Hear when the next red batch comes off the lathe" white="Hear when the next oil is distilled" />
            </p>
            <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-(--mz-ink-2)">
              <WT red={CONTENT.red.circle.text} white={CONTENT.white.circle.text} />
            </p>
            <CircleSignup className="mt-8" />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-[13px] text-(--mz-ink-3)">
                <WT red="Shop red sandalwood" white="Shop white sandalwood" />
              </p>
              <W red={<ShopLinks wood="red" />} white={<ShopLinks wood="white" />} />
            </div>
            <div>
              <p className="text-[13px] text-(--mz-ink-3)">Your order</p>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                <li>
                  <Link href="/maison/shop" className={LINK}>
                    Shop everything
                  </Link>
                </li>
                <li>
                  <Link href="/maison/track" className={LINK}>
                    Track your order
                  </Link>
                </li>
                <li>
                  <Link href="/maison/account" className={LINK}>
                    Your account
                  </Link>
                </li>
                <li>
                  <Link href="/maison/checkout" className={LINK}>
                    Checkout
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[13px] text-(--mz-ink-3)">The Maison</p>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                <li>
                  <Link href="/maison#studio" className={LINK}>
                    Grain studio
                  </Link>
                </li>
                <li>
                  <Link href="/maison#material" className={LINK}>
                    The two woods
                  </Link>
                </li>
                <li>
                  <Link href="/maison#provenance" className={LINK}>
                    Provenance
                  </Link>
                </li>
                <li className="w-red">
                  <Link href={`/maison/shop/${CONTENT.red.edition.productSlug}`} className={LINK}>
                    {CONTENT.red.edition.name}
                  </Link>
                </li>
                <li className="w-white">
                  <Link href={`/maison/shop/${CONTENT.white.edition.productSlug}`} className={LINK}>
                    {CONTENT.white.edition.name}
                  </Link>
                </li>
                <li>
                  <Link href="/" className={LINK}>
                    Coming-soon page
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <dl id="care" className="mt-16 grid scroll-mt-28 gap-8 border-t border-(--mz-line) pt-8 sm:grid-cols-3">
          <div>
            <dt className="text-[15px] font-medium">Delivery</dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-(--mz-ink-2)">Free across India in 3–5 working days. Express, 1–2 days, for ₹350.</dd>
          </div>
          <div>
            <dt className="text-[15px] font-medium">Returns</dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-(--mz-ink-2)">
              Unused pieces within 14 days, in their original packaging. <WT red="Numbered Vault pieces" white="Numbered Reserve vials" /> are final.
            </dd>
          </div>
          <div>
            <dt className="text-[15px] font-medium">Care</dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-(--mz-ink-2)">
              <WT red={CONTENT.red.care} white={CONTENT.white.care} />
            </dd>
          </div>
        </dl>

        <WoodWordmark />

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-(--mz-line) py-6 pb-24 text-[13px] text-(--mz-ink-2) sm:pb-6">
          <p>© 2026 Santalum Maison</p>
          <p>
            <WT red="Every red piece leaves with its batch record" white="Every bottle and box carries its lot" />
          </p>
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
        <rect width="1200" height="290" style={{ fill: "var(--mz-accent-soft)" }} />
        <g
          filter="url(#santalum-warp)"
          fill="none"
          className="origin-[46%_62%] transition-transform duration-[1600ms] ease-out-soft group-hover:scale-[1.08]"
          style={{ stroke: "var(--mz-accent)" }}
        >
          {rings.map(({ r, w }) => (
            <circle key={r} cx="560" cy="180" r={r} strokeWidth={w} opacity={w > 2 ? 0.9 : 0.5} />
          ))}
        </g>
      </g>
    </svg>
  );
}
