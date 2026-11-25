import Link from "next/link";
import type { ReactNode } from "react";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";

const CHARMS: { href: string; label: ReactNode; drop: number }[] = [
  { href: "/d/03/shop", label: "Shop", drop: 64 },
  { href: "/d/03/track", label: "Track your order", drop: 132 },
  { href: "/d/03/account", label: "Your account", drop: 92 },
  { href: "/d/03#woods", label: "Two woods", drop: 168 },
  { href: "/d/03#making", label: "Making", drop: 70 },
  { href: "/d/03#provenance", label: "Provenance", drop: 146 },
  { href: "/d/03#vault", label: <WT red="The 2011 Vault" white="The 2011 Reserve" />, drop: 96 },
  { href: "/d/03#gifting", label: "Gifting", drop: 156 },
  { href: "/d/03#circle", label: "Santalum Circle", drop: 80 },
  { href: "/d/03/checkout", label: "Checkout", drop: 120 },
];

/** y of the sagging thread (an SVG quadratic from 40 → 110 → 40) at a fraction t across */
const sag = (t: number) => 40 + 140 * t * (1 - t);

/** The footer: its links hang like charms from one thread; below them, the plain notes on delivery, returns and care. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-(--line) bg-(--warm) pb-[112px]">
      {/* hanging charms, wide screens */}
      <nav className="relative hidden h-[330px] md:block" aria-label="Footer">
        <svg className="absolute inset-x-0 top-0 h-[120px] w-full" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden>
          <path d="M0 40 Q 500 110 1000 40" fill="none" stroke="var(--thread)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
        </svg>
        <ul>
          {CHARMS.map((c, i) => {
            const t = (i + 0.75) / (CHARMS.length + 0.5);
            return (
              <li key={c.href} className="absolute -translate-x-1/2" style={{ left: `${t * 100}%`, top: sag(t) - 1 }}>
                <Link href={c.href} className="s3-charm group">
                  <span className="s3-hang-thread" style={{ height: c.drop }} aria-hidden />
                  <span className="s3-bead h-3 w-3" aria-hidden />
                  <span className="s3-serif mt-2 whitespace-nowrap text-[clamp(0.95rem,1.4vw,1.3rem)] transition-colors group-hover:text-(--m-accent)">
                    {c.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* strung down one thread, phones */}
      <nav aria-label="Footer" className="px-6 pt-12 md:hidden">
        <ul className="border-l border-(--thread) pl-6">
          {CHARMS.map((c) => (
            <li key={c.href} className="relative">
              <span className="s3-bead absolute -left-[30.5px] top-1/2 h-3 w-3 -translate-y-1/2" aria-hidden />
              <Link href={c.href} className="s3-serif block py-2 text-[22px] transition-colors hover:text-(--m-accent) active:opacity-70">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* the plain notes */}
      <div className="mx-auto mt-12 grid max-w-[1500px] gap-8 px-6 md:mt-2 md:grid-cols-3 md:gap-10 md:px-10">
        <Note title="Delivery">
          Free delivery across India, 3–5 working days. Express in 1–2 working days for ₹350. Every parcel is insured to its full value.
        </Note>
        <Note title="Returns">
          Write to us within seven days of delivery if a piece is not right, and we arrange the pickup. Numbered editions and pieces made to order
          are final.
        </Note>
        <Note title="Care">
          <WT red={CONTENT.red.care} white={CONTENT.white.care} /> Each piece comes with its own care card.
        </Note>
      </div>

      <div className="mx-auto mt-14 grid max-w-[1500px] gap-8 px-6 md:grid-cols-[1.4fr_1fr] md:items-end md:px-10">
        <p className="s3-serif text-[clamp(3.4rem,11vw,10rem)] leading-[0.82] tracking-[-0.02em]">
          Santalum
          <br />
          <span className="text-(--muted)">Maison</span>
        </p>
        <div className="space-y-4 pb-2 text-[15px] leading-[1.6] text-(--ink)/80 md:text-right">
          <p className="s3-serif text-[22px] leading-[1.25] text-(--ink)">{CONTENT.red.closing}</p>
          <p>Red sandalwood, Pterocarpus santalinus. White sandalwood, Santalum album. Turned, carved, distilled and finished by hand in India.</p>
          <p className="text-[13px] text-(--muted)">
            © 2026 Santalum Maison. Prices in Indian rupees. A design preview: accounts and orders are kept in this browser, and payments are not
            connected.
          </p>
        </div>
      </div>
    </footer>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative border-t border-(--thread) pt-5">
      <span className="s3-knot absolute -top-[5px] left-0" aria-hidden />
      <h2 className="s3-serif text-[24px] leading-none">{title}</h2>
      <p className="mt-3 max-w-[26rem] text-[16px] leading-[1.6] text-(--ink)/80">{children}</p>
    </div>
  );
}
