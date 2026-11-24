import Link from "next/link";
import { FAMILIES, WOOD_NAMES } from "@/lib/catalog";
import { s } from "./cx";

const LINKS: { href: string; label: string }[] = [
  { href: "/d/01#lathe", label: "The lathe" },
  { href: "/d/01#woods", label: "Two woods" },
  { href: "/d/01#parts", label: "Parts list" },
  { href: "/d/01#making", label: "Making" },
  { href: "/d/01#provenance", label: "Provenance" },
  { href: "/d/01#vault", label: "The 2011 Vault" },
  { href: "/d/01#gifting", label: "Gifting" },
  { href: "/d/01#circle", label: "Santalum Circle" },
  { href: "/d/01/checkout", label: "Checkout" },
];

/** Footer as the machine's spec plate: light brushed steel, engraved, screwed to the page. */
export function Footer() {
  const pieces = FAMILIES.length;
  return (
    <footer className="px-3 pb-[96px] pt-16 md:px-6 md:pb-8 md:pt-24">
      <div className={`${s.plate} mx-auto max-w-[1400px] px-6 py-8 md:px-12 md:py-11`}>
        <span className={`${s.screw} left-3 top-3`} style={{ ["--r" as string]: "22deg" }} />
        <span className={`${s.screw} right-3 top-3`} style={{ ["--r" as string]: "-40deg" }} />
        <span className={`${s.screw} bottom-3 left-3`} style={{ ["--r" as string]: "75deg" }} />
        <span className={`${s.screw} bottom-3 right-3`} style={{ ["--r" as string]: "10deg" }} />

        <div className={`${s.engraved} grid gap-10 md:grid-cols-12`}>
          <div className="md:col-span-5">
            <p className={`${s.x125} text-[clamp(1.9rem,3.4vw,3.1rem)] font-[680] leading-[0.92] tracking-[-0.02em]`}>
              Santalum
              <br />
              Maison
            </p>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed">
              Made with respect for the material. Designed for the life around it.
            </p>
          </div>

          <dl className={`${s.mono} grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 self-start text-[12px] md:col-span-4`}>
            <dt className="opacity-60">Model</dt>
            <dd>Turned and carved heartwood objects</dd>
            <dt className="opacity-60">Woods</dt>
            <dd>
              {WOOD_NAMES.red.latin}
              <br />
              {WOOD_NAMES.white.latin}
            </dd>
            <dt className="opacity-60">Pieces</dt>
            <dd>{pieces} families, two woods</dd>
            <dt className="opacity-60">Edition</dt>
            <dd>The 2011 Vault, 21 cuffs</dd>
            <dt className="opacity-60">Made in</dt>
            <dd>India</dd>
          </dl>

          <nav aria-label="Footer" className="md:col-span-3">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[14px] md:grid-cols-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-block py-0.5 transition-colors hover:text-(--m-accent) active:opacity-70">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          className={`${s.engraved} ${s.mono} mt-10 flex flex-col gap-2 border-t border-[rgb(26_27_29/0.14)] pt-5 text-[11px] shadow-[0_1px_0_rgb(255_255_255/0.6)_inset] md:flex-row md:items-center md:justify-between`}
        >
          <span>Objects time cannot repeat.</span>
          <span>Design 01, Lathe. A review preview; payments are not connected.</span>
          <span>© 2026 Santalum Maison</span>
        </div>
      </div>
    </footer>
  );
}
