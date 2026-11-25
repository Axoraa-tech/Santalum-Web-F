import Link from "next/link";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import s from "../styles";
import { CHAPTERS, hhmm } from "./data";

const L = "transition-colors hover:text-[var(--m-accent)] active:opacity-70";

/** The end of the day. Sits on whatever sky the page is showing. */
export function Footer() {
  return (
    <footer className={`${s.swap} relative z-10 px-5 pb-28 pt-24 sm:px-8 lg:px-10 lg:pb-32`}>
      <div className="mx-auto max-w-[1600px] border-t border-[var(--hair)] pt-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className={`${s.display} text-[clamp(3.2rem,9vw,8rem)] leading-[0.86]`}>Santalum Maison</p>
            <p className="mt-6 max-w-[30rem] text-[16px] leading-[1.7] text-[var(--muted)]">
              <WT
                red="Made with respect for the material. Designed for the life around it. Red sandalwood beads, objects and jewellery, turned in India from documented lots."
                white="Made with respect for the material. Designed for the life around it. White sandalwood oil, chandan and Mysuru carving from documented lots in Karnataka."
              />
            </p>
          </div>

          <nav aria-label="The day" className="lg:col-span-3">
            <p className="text-[13px] text-[var(--muted)]">
              <WT red="The red day" white="The white day" />
            </p>
            <ul className="mt-4 space-y-2.5">
              {CHAPTERS.map((c) => (
                <li key={c.key}>
                  <Link href={`/d/09#ch-${c.key}`} className={`group flex items-baseline gap-3 text-[15px] ${L}`}>
                    <span className={`${s.tab} w-11 shrink-0 text-[12px] text-[var(--muted)]`}>{hhmm(c.min)}</span>
                    <span>
                      {c.name}, <WT red={c.theme.red.toLowerCase()} white={c.theme.white.toLowerCase()} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1 xl:grid-cols-2">
            <nav aria-label="The house">
              <p className="text-[13px] text-[var(--muted)]">The house</p>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                <li>
                  <Link href="/d/09/shop" className={L}>
                    <WT red="Shop red sandalwood" white="Shop white sandalwood" />
                  </Link>
                </li>
                <li>
                  <Link href="/d/09/track" className={L}>
                    Track your order
                  </Link>
                </li>
                <li>
                  <Link href="/d/09/account" className={L}>
                    Your account
                  </Link>
                </li>
                <li>
                  <WT
                    red={
                      <Link href={`/d/09/p/${CONTENT.red.edition.productSlug}`} className={L}>
                        {CONTENT.red.edition.name}
                      </Link>
                    }
                    white={
                      <Link href={`/d/09/p/${CONTENT.white.edition.productSlug}`} className={L}>
                        {CONTENT.white.edition.name}
                      </Link>
                    }
                  />
                </li>
                <li>
                  <WT
                    red={
                      <Link href="/d/09/shop?c=gifting" className={L}>
                        Gifting
                      </Link>
                    }
                    white={
                      <Link href="/d/09/shop?c=w-gifting" className={L}>
                        Gifting
                      </Link>
                    }
                  />
                </li>
              </ul>
            </nav>
            <dl className="space-y-4 text-[14px] leading-[1.55]">
              <div>
                <dt className="text-[13px] text-[var(--muted)]">Delivery</dt>
                <dd className="mt-1">Free across India in 3–5 working days. Express in 1–2, ₹350.</dd>
              </div>
              <div>
                <dt className="text-[13px] text-[var(--muted)]">Returns</dt>
                <dd className="mt-1">Unused pieces in their packing, within 7 days of delivery. Write to us first.</dd>
              </div>
              <div>
                <dt className="text-[13px] text-[var(--muted)]">Care</dt>
                <dd className="mt-1">
                  <WT red={CONTENT.red.care} white={CONTENT.white.care} />
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 text-[12px] leading-[1.6] text-[var(--muted)] lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <p className="max-w-[44rem]">
            <WT red={CONTENT.red.regulation} white={CONTENT.white.regulation} />
          </p>
          <p className="shrink-0">© 2026 Santalum Maison, India</p>
        </div>
      </div>
    </footer>
  );
}
