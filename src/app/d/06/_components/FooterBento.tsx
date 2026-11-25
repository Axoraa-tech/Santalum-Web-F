"use client";

import Link from "next/link";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { DELIVERY } from "@/lib/shop/bag";
import { formatINR } from "@/lib/shop/products";
import { s } from "./cls";
import { cx } from "./data";
import { IconUp, Mark, Swatch } from "./ui";

const LINK = "group flex items-center justify-between rounded-[12px] py-1.5 text-[15px] transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent";

/** The footer is the last bento row: wordmark, the shop's own links, short notes, and the two woods. */
export function FooterBento() {
  const top = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <footer className="mx-auto max-w-[1560px] px-3 pt-3">
      <div className={cx(s.bento, s.foot)}>
        <div style={{ gridArea: "wm" }} className={cx(s.tile, "flex min-h-[260px] flex-col justify-between gap-10 p-6 sm:p-8")}>
          <p className="flex items-start gap-3">
            <span className="mt-[0.12em] shrink-0">
              <Mark size={34} />
            </span>
            <span className={cx(s.display, "text-[clamp(44px,10.5cqw,118px)]")}>Santalum Maison</span>
          </p>
          <p className={cx(s.muted, "max-w-[46ch] text-[16px] leading-[1.5]")}>
            <WT
              red="Red sandalwood from documented lots in the Eastern Ghats, turned and finished by hand. Made with respect for the material."
              white="White sandalwood heartwood from Karnataka, distilled and carved, with the lot on every label. Made with respect for the material."
            />
          </p>
        </div>

        <nav aria-label="Footer" style={{ gridArea: "ln" }} className={cx(s.tile, "grid grid-cols-2 gap-x-6 p-5 sm:p-6")}>
          <ul className="flex flex-col">
            {[
              ["Shop", "/d/06/shop"],
              ["Track your order", "/d/06/track"],
              ["Your account", "/d/06/account"],
              ["Checkout", "/d/06/checkout"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className={LINK}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col">
            {[
              ["The two woods", "/d/06#woods"],
              ["Provenance", "/d/06#provenance"],
              ["The edition", "/d/06#edition"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className={LINK}>
                  {label === "The edition" ? <WT red="The 2011 Vault" white="The 2011 Reserve" /> : label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/d/06#craft" className={LINK}>
                <WT red="How it is turned" white="How it is distilled" />
              </Link>
            </li>
          </ul>
        </nav>

        <dl style={{ gridArea: "wd" }} className={cx(s.tile, s.tint, "flex flex-col gap-3 p-5 sm:p-6")}>
          <div>
            <dt className="text-[15px] font-medium">Delivery</dt>
            <dd className="mt-0.5 text-[14px] leading-[1.45] opacity-80">
              Free across India, 3–5 working days. Express {formatINR(DELIVERY.express.price)}, 1–2 days.
            </dd>
          </div>
          <div>
            <dt className="text-[15px] font-medium">Returns</dt>
            <dd className="mt-0.5 text-[14px] leading-[1.45] opacity-80">Unused pieces within 14 days, in their original packaging. Numbered editions are final.</dd>
          </div>
          <div>
            <dt className="text-[15px] font-medium">Care</dt>
            <dd className="mt-0.5 text-[14px] leading-[1.45] opacity-80">
              <WT red={CONTENT.red.care} white={CONTENT.white.care} />
            </dd>
          </div>
        </dl>

        <div style={{ gridArea: "tp" }} className={cx(s.tile, s.t2, "flex items-end justify-between gap-4 p-5 sm:p-6")}>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {(["red", "white"] as const).map((w) => (
                <span key={w} className="flex items-center gap-1.5 text-[13px]">
                  <Swatch wood={w} size={16} />
                  <span className={cx(s.mono, "text-[10.5px] opacity-70")}>{CONTENT[w].latin}</span>
                </span>
              ))}
            </div>
            <p className={cx(s.mono, s.muted, "text-[10.5px] leading-[1.6]")}>
              Santalum Maison, India, 2026
              <br />
              Preview build. Photographs are placeholders.
            </p>
          </div>
          <button type="button" onClick={top} className={cx(s.icon, s.onWhite, "shrink-0")} aria-label="Back to top">
            <IconUp />
          </button>
        </div>
      </div>
    </footer>
  );
}
