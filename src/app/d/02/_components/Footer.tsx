import Link from "next/link";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, type Wood } from "@/lib/shop/products";
import { ACCOUNT, ANCHORS, DELIVERY_LINE, HOME, PREVIEW_ACCOUNTS, SHOP, TRACK, shopHref } from "./copy";
import { s } from "./cls";

const BADGE = "Made with respect for the material, designed for the life around it";
const linkCls = "text-[var(--o-ink-2)] underline-offset-4 transition-colors hover:text-[var(--o-ink)] hover:underline";

function Ranges({ wood }: { wood: Wood }) {
  return (
    <ul className="mt-4 space-y-2 text-[15px]">
      {CATEGORIES[wood].map((c) => (
        <li key={c.id}>
          <Link href={shopHref(c.id)} className={linkCls}>
            {c.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** One slowly turning circular badge, the shop and order links, short notes, and the name set large. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--o-line)] bg-[var(--o-bg)] pt-20 md:pt-28">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 md:grid-cols-12 md:gap-8 md:px-10">
        {/* the badge sits beside its words on tablets, above them in the narrower desktop column */}
        <div className="flex flex-col items-start gap-8 sm:flex-row md:col-span-12 lg:col-span-4 lg:flex-col lg:gap-7">
          <div className="relative size-[200px] shrink-0 overflow-hidden rounded-full md:size-[220px]">
            <svg viewBox="0 0 230 230" className={`absolute inset-0 ${s.spin}`} aria-hidden>
              <defs>
                <path id="o2-badge" d="M115,115 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
              </defs>
              <text className={s.syne} fontSize="13" fontWeight="700" fill="var(--o-ink)">
                <textPath href="#o2-badge" textLength="574" lengthAdjust="spacing">
                  {BADGE}
                  {/* where the sentence meets its own start: a small wood-coloured bead, so the words never run together */}
                  <tspan fill="var(--m-accent)"> ● </tspan>
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-[56px] overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]">
              <W red={<span className={`absolute inset-0 ${s.woodRed}`} />} white={<span className={`absolute inset-0 ${s.woodWhite}`} />} />
            </div>
            <p className="sr-only">{CONTENT.red.closing}</p>
          </div>
          <div className="min-w-0 sm:pt-4 lg:pt-0">
            <p className={`${s.display} text-[34px]`}>From the heartwood.</p>
            <p className="mt-4 max-w-[340px] text-[15px] leading-relaxed text-[var(--o-ink-2)]">
              <WT
                red="Red sandalwood from the Eastern Ghats: dense, deep red and almost without scent. Turned, carved and sent with its batch record."
                white="White sandalwood from the dry forests of the south: oil, attar, incense and Mysuru carving, each with its lot on the label."
              />
            </p>
          </div>
        </div>

        <nav aria-label="Shop by range" className="md:col-span-3 lg:col-span-2">
          <p className={`${s.syne} text-[15px] font-bold`}>
            <WT red="Red sandalwood" white="White sandalwood" />
          </p>
          <W red={<Ranges wood="red" />} white={<Ranges wood="white" />} />
        </nav>

        <nav aria-label="Your order" className="md:col-span-3 lg:col-span-2">
          <p className={`${s.syne} text-[15px] font-bold`}>Your order</p>
          <ul className="mt-4 space-y-2 text-[15px]">
            <li>
              <Link href={SHOP} className={linkCls}>
                Shop
              </Link>
            </li>
            <li>
              <Link href={TRACK} className={linkCls}>
                Track your order
              </Link>
            </li>
            <li>
              <Link href={ACCOUNT} className={linkCls}>
                Your account
              </Link>
            </li>
          </ul>
          <p className={`${s.syne} mt-8 text-[15px] font-bold`}>The house</p>
          <ul className="mt-4 space-y-2 text-[15px]">
            {ANCHORS.map((a) => (
              <li key={a.id}>
                <Link href={`${HOME}#${a.id}`} className={linkCls}>
                  <WT red={a.red} white={a.white} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-6 lg:col-span-4">
          <dl className="divide-y divide-[var(--o-line)] border-y border-[var(--o-line)] text-[15px]">
            <div className="grid grid-cols-[96px_1fr] gap-4 py-4">
              <dt className={`${s.syne} font-bold`}>Delivery</dt>
              <dd className="text-[var(--o-ink-2)]">{DELIVERY_LINE} Insured to the full value.</dd>
            </div>
            <div className="grid grid-cols-[96px_1fr] gap-4 py-4">
              <dt className={`${s.syne} font-bold`}>Returns</dt>
              <dd className="text-[var(--o-ink-2)]">If a piece arrives damaged or is not what you ordered, write to us with the order number and we will put it right.</dd>
            </div>
            <div className="grid grid-cols-[96px_1fr] gap-4 py-4">
              <dt className={`${s.syne} font-bold`}>Care</dt>
              <dd className="text-[var(--o-ink-2)]">
                <WT red={CONTENT.red.care} white={CONTENT.white.care} />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-[1440px] px-5 md:px-10">
        <p aria-hidden className={`${s.display} select-none text-[12.4vw] leading-[0.8] tracking-[-0.06em] md:whitespace-nowrap md:text-[clamp(2.4rem,7.1vw,8.6rem)]`}>
          Santalum Maison
        </p>
        <div className="flex flex-col gap-2 border-t border-[var(--o-line)] pb-24 pt-5 text-[13px] text-[var(--o-muted)] md:flex-row md:justify-end md:gap-8 md:pb-8">
          <p>Prices in Indian rupees.</p>
          <p>{PREVIEW_ACCOUNTS}</p>
          <p>© 2026 Santalum Maison</p>
        </div>
      </div>
    </footer>
  );
}
