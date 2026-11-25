import Link from "next/link";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { productsFor } from "@/lib/shop/products";
import { s } from "./cx";

const SHOP: { href: string; label: string }[] = [
  { href: "/d/01/shop", label: "Shop" },
  { href: "/d/01/track", label: "Track your order" },
  { href: "/d/01/account", label: "Your account" },
  { href: "/d/01/checkout", label: "Checkout" },
];

const PAGE: { href: string; red: string; white: string }[] = [
  { href: "/d/01#lathe", red: "The lathe", white: "The lathe" },
  { href: "/d/01#woods", red: "Two woods", white: "Two woods" },
  { href: "/d/01#making", red: "Turning", white: "Distilling" },
  { href: "/d/01#provenance", red: "Batch records", white: "Lot records" },
  { href: "/d/01#vault", red: "The 2011 Vault", white: "The 2011 Reserve" },
  { href: "/d/01#gifting", red: "Gifting", white: "Gifting" },
  { href: "/d/01#circle", red: "Santalum Circle", white: "Santalum Circle" },
];

const NOTES: { k: string; red: string; white: string }[] = [
  {
    k: "Delivery",
    red: "Free across India in 3–5 working days, insured to the full value. Express, 1–2 days, ₹350.",
    white: "Free across India in 3–5 working days, insured to the full value. Express, 1–2 days, ₹350.",
  },
  {
    k: "Returns",
    red: "Write to us within 7 days of delivery to return an unused piece. Made-to-order and numbered Vault pieces are final.",
    white: "Write to us within 7 days of delivery to return an unopened piece. Opened oils and numbered Reserve vials are final.",
  },
  { k: "Care", red: CONTENT.red.care, white: CONTENT.white.care },
];

/** Footer as the machine's spec plate: brushed steel for red sandalwood, brushed brass for white. */
export function Footer() {
  const red = CONTENT.red;
  const white = CONTENT.white;
  return (
    <footer className="px-3 pb-[96px] pt-16 md:px-6 md:pb-8 md:pt-24">
      <div className={`${s.plate} mx-auto max-w-[1400px] px-6 py-8 md:px-12 md:py-11`}>
        <span className={`${s.screw} left-3 top-3`} style={{ ["--r" as string]: "22deg" }} />
        <span className={`${s.screw} right-3 top-3`} style={{ ["--r" as string]: "-40deg" }} />
        <span className={`${s.screw} bottom-3 left-3`} style={{ ["--r" as string]: "75deg" }} />
        <span className={`${s.screw} bottom-3 right-3`} style={{ ["--r" as string]: "10deg" }} />

        <div className={`${s.engraved} grid gap-10 md:grid-cols-12`}>
          <div className="md:col-span-4">
            <p className={`${s.x125} text-[clamp(1.9rem,3.4vw,3.1rem)] font-[680] leading-[0.92] tracking-[-0.02em]`}>
              Santalum
              <br />
              Maison
            </p>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed">
              <WT red={red.closing} white="The fragrance is in the heartwood. We say plainly what is in every bottle, jar and box." />
            </p>
            <dl className={`${s.mono} mt-7 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[12px]`}>
              <dt className="opacity-60">Model</dt>
              <dd>
                <WT red="Turned and carved red heartwood" white="Distilled, rolled and carved white heartwood" />
              </dd>
              <dt className="opacity-60">Wood</dt>
              <dd>
                <WT red={`${red.latin}, ${red.localName}`} white={`${white.latin}, ${white.localName}`} />
              </dd>
              <dt className="opacity-60">Pieces</dt>
              <dd>
                <WT red={`${productsFor("red").length} in red sandalwood`} white={`${productsFor("white").length} in white sandalwood`} />
              </dd>
              <dt className="opacity-60">Edition</dt>
              <dd>
                <WT red={`${red.edition.name}, ${red.edition.size} cuffs`} white={`${white.edition.name}, ${white.edition.size} vials`} />
              </dd>
              <dt className="opacity-60">From</dt>
              <dd>
                <WT red={red.origin.region} white={white.origin.region} />
              </dd>
            </dl>
          </div>

          <dl className="grid gap-5 self-start text-[14px] leading-[1.5] md:col-span-5">
            {NOTES.map((n) => (
              <div key={n.k} className="grid gap-1 border-t border-[color-mix(in_srgb,var(--ink)_16%,transparent)] pt-3 sm:grid-cols-[6.5rem_1fr]">
                <dt className={`${s.mono} text-[11.5px] opacity-60`}>{n.k}</dt>
                <dd>
                  <WT red={n.red} white={n.white} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="grid grid-cols-2 gap-6 md:col-span-3 md:grid-cols-1">
            <nav aria-label="Shop and orders">
              <ul className="grid gap-y-1.5 text-[15px]">
                {SHOP.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-block py-0.5 font-[560] transition-colors hover:text-(--accent) active:opacity-70">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="On the home page">
              <ul className="grid gap-y-1.5 text-[14px]">
                {PAGE.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-block py-0.5 transition-colors hover:text-(--accent) active:opacity-70">
                      <WT red={l.red} white={l.white} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div
          className={`${s.engraved} ${s.mono} mt-10 flex flex-col gap-2 border-t border-[color-mix(in_srgb,var(--ink)_16%,transparent)] pt-5 text-[11px] shadow-[0_1px_0_rgb(255_255_255/0.6)_inset] md:flex-row md:items-center md:justify-between`}
        >
          <span>
            <WT red="Objects time cannot repeat." white="From the heartwood." />
          </span>
          <span>Preview: accounts and orders are saved in this browser until our store opens.</span>
          <span>© 2026 Santalum Maison</span>
        </div>
      </div>
    </footer>
  );
}
