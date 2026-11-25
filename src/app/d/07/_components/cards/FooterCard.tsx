"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { W, WT } from "@/components/maison/W";
import { DELIVERY } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, formatINR, productsFor } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import { WoodSplit } from "../Dock";
import { IconArrow } from "../Icons";
import { ACCOUNT, CHECKOUT, HOME, scrollToCard, scrollToY, sheet, SHOP, shopHref, TRACK, WOODS } from "../store";

const HOUSE: Record<Wood, [string, string][]> = {
  red: [
    ["Two woods", "woods"],
    ["Heavy in the hand", "pieces"],
    ["How it is turned", "craft"],
    ["The batch record", "provenance"],
    ["The 2011 Vault", "vault"],
    ["Gifting and the Circle", "gifting"],
  ],
  white: [
    ["Two woods", "woods"],
    ["Scent you can hold", "pieces"],
    ["How it is distilled", "craft"],
    ["The lot record", "provenance"],
    ["The 2011 Reserve", "vault"],
    ["Gifting and the Circle", "gifting"],
  ],
};

const CLOSING: Record<Wood, string> = {
  red: "Made with respect for the material. Designed for the life around it.",
  white: "From the heartwood, for the rituals around it. Made to be kept, and given.",
};

const link = "text-[15px] leading-snug transition hover:text-(--s7-accent)";

/** The last card in the deck. On the home page nothing slides over it; on every other page it closes the column. */
export function FooterCard() {
  const onHome = usePathname() === HOME;

  return (
    <footer className="flex min-h-[inherit] flex-col overflow-hidden px-5 pb-[150px] pt-8 md:px-8 lg:px-10 lg:pb-[78px] lg:pt-10">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="d2 text-[clamp(2.2rem,min(3.8vw,7vh),4rem)]">
            <WT red={CLOSING.red} white={CLOSING.white} />
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <WoodSplit big id="footer" />
          </div>
          <dl className="mt-6 grid gap-3">
            {WOODS.map((w) => (
              <div key={w} className="flex items-center gap-3">
                <span aria-hidden className={`size-9 shrink-0 rounded-full ${w === "red" ? "ring-red" : "ring-white"}`} />
                <div>
                  <dt className="text-[15px] font-medium">{CONTENT[w].name}</dt>
                  <dd className="text-[14px] text-(--s7-body)">
                    <i>{CONTENT[w].latin}</i>
                    <span lang="sa" className="ml-2 text-(--s7-muted)">
                      {CONTENT[w].sanskrit}
                    </span>
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:col-span-8">
          <div>
            <h3 className="text-[13px] text-(--s7-muted)">
              <WT red="Shop red sandalwood" white="Shop white sandalwood" />
            </h3>
            <W red={<CategoryLinks wood="red" />} white={<CategoryLinks wood="white" />} />
          </div>
          <div>
            <h3 className="text-[13px] text-(--s7-muted)">Your orders</h3>
            <ul className="mt-3 grid gap-1.5">
              <li>
                <Link href={SHOP} className={link}>
                  Shop
                </Link>
              </li>
              <li>
                <Link href={TRACK} className={link}>
                  Track your order
                </Link>
              </li>
              <li>
                <Link href={ACCOUNT} className={link}>
                  Your account
                </Link>
              </li>
              <li>
                <button type="button" onClick={() => sheet.open()} className={`${link} text-left`}>
                  Your bag
                </button>
              </li>
              <li>
                <Link href={CHECKOUT} className={link}>
                  Checkout
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[13px] text-(--s7-muted)">The house</h3>
            <W red={<HouseLinks wood="red" onHome={onHome} />} white={<HouseLinks wood="white" onHome={onHome} />} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-[13px] text-(--s7-muted)">Good to know</h3>
            <dl className="mt-3 grid gap-3">
              <div>
                <dt className="text-[15px] font-medium">Delivery</dt>
                <dd className="text-[14px] leading-snug text-(--s7-body)">
                  Free across India, 3–5 working days. Express {formatINR(DELIVERY.express.price)}, 1–2 days.
                </dd>
              </div>
              <div>
                <dt className="text-[15px] font-medium">Returns</dt>
                <dd className="text-[14px] leading-snug text-(--s7-body)">Unused pieces within 14 days. Numbered editions are final.</dd>
              </div>
              <div>
                <dt className="text-[15px] font-medium">Care</dt>
                <dd className="text-[14px] leading-snug text-(--s7-body)">
                  <WT red={CONTENT.red.care} white={CONTENT.white.care} />
                </dd>
              </div>
              <div>
                <dt className="text-[15px] font-medium">Payments</dt>
                <dd className="text-[14px] leading-snug text-(--s7-body)">Preview only. Payments are not connected yet.</dd>
              </div>
            </dl>
          </div>
        </nav>
      </div>

      <div className="mt-10 flex flex-1 flex-col justify-end">
        <p aria-hidden className="d1 -mb-[0.08em] select-none whitespace-nowrap text-[17vw] leading-[0.8] text-(--s7-ink) lg:text-[18vw]">
          Santalum Maison
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-(--s7-ink)/15 pt-4 text-[13px] text-(--s7-muted)">
          <p>&copy; 2026 Santalum Maison. A design preview; prices are placeholders.</p>
          <button
            type="button"
            onClick={() => scrollToY(0)}
            className="inline-flex items-center gap-2 font-medium text-(--s7-ink) transition hover:text-(--s7-accent)"
          >
            {onHome ? "Back to the first card" : "Back to the top"}
            <IconArrow dir="up" width={16} height={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}

function CategoryLinks({ wood }: { wood: Wood }) {
  return (
    <ul className="mt-3 grid gap-1.5">
      {CATEGORIES[wood].map((c) => (
        <li key={c.id}>
          <Link href={shopHref(c.id)} className={link}>
            {c.label}
          </Link>
        </li>
      ))}
      <li>
        <Link href={SHOP} className={`${link} font-medium`}>
          All {productsFor(wood).length} pieces
        </Link>
      </li>
    </ul>
  );
}

function HouseLinks({ wood, onHome }: { wood: Wood; onHome: boolean }) {
  return (
    <ul className="mt-3 grid gap-1.5">
      {HOUSE[wood].map(([label, id]) => (
        <li key={id}>
          {onHome ? (
            <button type="button" onClick={() => scrollToCard(id)} className={`${link} text-left`}>
              {label}
            </button>
          ) : (
            <Link href={`${HOME}#${id}`} className={link}>
              {label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
