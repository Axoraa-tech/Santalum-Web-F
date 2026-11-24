import Link from "next/link";
import { W } from "@/components/maison/W";
import { CATEGORIES, FAMILIES } from "@/lib/catalog";
import { HOME, NAV_LINKS, productHref, splitName } from "./copy";
import { s } from "./cls";

const BADGE = "Made with respect for the material, designed for the life around it" + " ".repeat(6);

/** One slowly turning circular badge, link columns, and the name set large. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--o-line)] bg-[var(--o-bg)] pt-20 md:pt-28">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 md:grid-cols-12 md:gap-8 md:px-10">
        <div className="flex items-start gap-8 md:col-span-5">
          <div className="relative size-[200px] shrink-0 md:size-[230px]">
            <svg viewBox="0 0 230 230" className={`absolute inset-0 ${s.spin}`} aria-hidden>
              <defs>
                <path id="o2-badge" d="M115,115 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
              </defs>
              <text className={s.syne} fontSize="13" fontWeight="700" fill="var(--o-ink)">
                <textPath href="#o2-badge" textLength="574" lengthAdjust="spacing">
                  {BADGE}
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-[58px] overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]">
              <W red={<span className={`absolute inset-0 ${s.woodRed}`} />} white={<span className={`absolute inset-0 ${s.woodWhite}`} />} />
            </div>
            <p className="sr-only">Made with respect for the material. Designed for the life around it.</p>
          </div>
          <div className="pt-4">
            <p className={`${s.display} text-[34px]`}>From the heartwood.</p>
            <p className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-[var(--o-ink-2)]">
              Santalum Maison is a contemporary Indian house for sandalwood objects, jewellery and gifting, in red and white heartwood.
            </p>
          </div>
        </div>

        <nav aria-label="Pieces" className="md:col-span-3">
          <p className={`${s.syne} text-[15px] font-bold`}>Pieces</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[14px] md:grid-cols-1">
            {FAMILIES.map((f) => (
              <li key={f.slug}>
                <Link href={productHref(f.slug)} className="text-[var(--o-ink-2)] underline-offset-4 transition-colors hover:text-[var(--o-ink)] hover:underline">
                  {splitName(f.name)[0]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="The house" className="md:col-span-2">
          <p className={`${s.syne} text-[15px] font-bold`}>The house</p>
          <ul className="mt-4 space-y-2 text-[14px]">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <Link href={`${HOME}#${l.id}`} className="text-[var(--o-ink-2)] underline-offset-4 transition-colors hover:text-[var(--o-ink)] hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <p className={`${s.syne} text-[15px] font-bold`}>Ranges</p>
          <ul className="mt-4 space-y-3 text-[14px]">
            {CATEGORIES.map((c) => (
              <li key={c.key}>
                <span className="block text-[var(--o-ink)]">{c.label}</span>
                <span className="block text-[13px] leading-snug text-[var(--o-muted)]">{c.line}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/d/02/checkout"
            className="mt-6 inline-flex h-11 items-center rounded-full border border-[var(--o-ink)] px-5 text-[14px] font-semibold transition-colors hover:bg-[var(--o-ink)] hover:text-white"
          >
            Checkout
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-[1440px] px-5 md:px-10">
        <p aria-hidden className={`${s.display} select-none text-[12.4vw] md:whitespace-nowrap md:text-[clamp(2.4rem,7.1vw,8.6rem)] leading-[0.8] tracking-[-0.06em]`}>
          Santalum Maison
        </p>
        <div className="flex flex-col gap-2 border-t border-[var(--o-line)] pb-24 pt-5 text-[13px] text-[var(--o-muted)] md:flex-row md:justify-end md:gap-8 md:pb-8">
          <p>Prices in Indian rupees.</p>
          <p>Design preview. Payments are not connected yet.</p>
          <p>© 2026 Santalum Maison</p>
        </div>
      </div>
    </footer>
  );
}
