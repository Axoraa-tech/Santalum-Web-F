import Link from "next/link";
import s from "../styles";
import { CHAPTERS, hhmm } from "./data";

/** The end of the day. Sits on whatever sky the page is showing. */
export function Footer() {
  return (
    <footer className="relative z-10 px-5 pb-28 pt-24 sm:px-8 lg:px-10 lg:pb-32">
      <div className="mx-auto max-w-[1600px] border-t border-[var(--hair)] pt-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className={`${s.display} text-[clamp(3.2rem,9vw,8rem)] leading-[0.86]`}>Santalum Maison</p>
            <p className="mt-6 max-w-[30rem] text-[16px] leading-[1.7] text-[var(--muted)]">
              Made with respect for the material. Designed for the life around it. Red and white sandalwood objects, jewellery and gifts, from India.
            </p>
          </div>
          <nav aria-label="The day" className="lg:col-span-3">
            <p className="text-[13px] text-[var(--muted)]">The day</p>
            <ul className="mt-4 space-y-2.5">
              {CHAPTERS.map((c) => (
                <li key={c.key}>
                  <Link href={`/d/09#ch-${c.key}`} className="group flex items-baseline gap-3 text-[15px] transition-colors hover:text-[var(--m-accent)] active:opacity-70">
                    <span className={`${s.tab} w-11 text-[12px] text-[var(--muted)]`}>{hhmm(c.min)}</span>
                    <span>
                      {c.name}, {c.theme.toLowerCase()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="The house" className="lg:col-span-3">
            <p className="text-[13px] text-[var(--muted)]">The house</p>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              <li>
                <Link href="/d/09#all-pieces" className="transition-colors hover:text-[var(--m-accent)] active:opacity-70">
                  All pieces
                </Link>
              </li>
              <li>
                <Link href="/d/09/p/vault-cuff" className="transition-colors hover:text-[var(--m-accent)] active:opacity-70">
                  The 2011 Vault
                </Link>
              </li>
              <li>
                <Link href="/d/09/p/presentation-box" className="transition-colors hover:text-[var(--m-accent)] active:opacity-70">
                  Gifting
                </Link>
              </li>
              <li>
                <Link href="/d/09/checkout" className="transition-colors hover:text-[var(--m-accent)] active:opacity-70">
                  Checkout
                </Link>
              </li>
            </ul>
            <p className="mt-8 max-w-[18rem] text-[13px] leading-[1.6] text-[var(--muted)]">
              Red sandalwood, Pterocarpus santalinus, is regulated internationally under CITES Appendix II.
            </p>
          </nav>
        </div>
        <div className="mt-16 flex flex-col gap-2 text-[12px] text-[var(--muted)] sm:flex-row sm:justify-end sm:gap-8">
          <p>Preview: payments are not connected yet.</p>
          <p>© 2026 Santalum Maison, India</p>
        </div>
      </div>
    </footer>
  );
}
