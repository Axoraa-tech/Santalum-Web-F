"use client";

import Link from "next/link";
import { WOOD_NAMES } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { WoodSplit } from "../Dock";
import { IconArrow } from "../Icons";
import { HOME, inWood, scrollToCard, scrollToY } from "../store";

const HOUSE: [string, string][] = [
  ["Two woods", "woods"],
  ["The pieces", "pieces"],
  ["How it is made", "craft"],
  ["Provenance", "provenance"],
  ["The 2011 Vault", "vault"],
  ["Gifting and the Circle", "gifting"],
];

const HELP: [string, string][] = [
  ["Delivery", "Complimentary across India. Packed by hand."],
  ["Returns", "Unused pieces within 14 days. Numbered editions are final."],
  ["Care", "A care card travels with every piece."],
  ["Payments", "Preview only. Payments are not connected yet."],
];

/** Card 8: the last card in the deck. Nothing slides over it. */
export function FooterCard() {
  const wood = useWood();
  const link = "text-[15px] leading-snug transition hover:text-[var(--m-accent)]";

  return (
    <footer className="flex min-h-[inherit] flex-col overflow-hidden px-5 pb-[150px] pt-8 md:px-8 lg:px-10 lg:pb-[78px] lg:pt-10">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="d2 text-[clamp(2.2rem,min(3.8vw,7vh),4rem)]">
            Made with respect for the material. Designed for the life around it.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <WoodSplit big id="footer" />
          </div>
          <dl className="mt-6 grid gap-3">
            {(["red", "white"] as const).map((w) => (
              <div key={w} className="flex items-center gap-3">
                <span aria-hidden className={`size-9 shrink-0 rounded-full ${w === "red" ? "ring-red" : "ring-white"}`} />
                <div>
                  <dt className="text-[15px] font-medium">{WOOD_NAMES[w].common}</dt>
                  <dd className="text-[13.5px] text-[#3d3731]">
                    {WOOD_NAMES[w].latin}
                    <span lang="sa" className="ml-2 text-[#77706A]">
                      {WOOD_NAMES[w].sa}
                    </span>
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:col-span-8">
          <div>
            <h3 className="text-[13px] text-[#77706A]">Pieces in {wood}</h3>
            <ul className="mt-3 grid gap-1.5">
              {inWood(wood).map((f) => (
                <li key={f.slug}>
                  <Link href={`${HOME}/p/${f.slug}`} className={link}>
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[13px] text-[#77706A]">The house</h3>
            <ul className="mt-3 grid gap-1.5">
              {HOUSE.map(([label, id]) => (
                <li key={id}>
                  <button type="button" onClick={() => scrollToCard(id)} className={`${link} text-left`}>
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <Link href={`${HOME}/checkout`} className={link}>
                  Checkout
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-[13px] text-[#77706A]">Good to know</h3>
            <dl className="mt-3 grid gap-3">
              {HELP.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[15px] font-medium">{k}</dt>
                  <dd className="text-[14px] leading-snug text-[#3d3731]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </nav>
      </div>

      <div className="mt-10 flex flex-1 flex-col justify-end">
        <p aria-hidden className="d1 -mb-[0.08em] select-none whitespace-nowrap text-[17vw] leading-[0.8] lg:text-[18vw] text-[#1B1712]">
          Santalum Maison
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#1B1712]/15 pt-4 text-[13px] text-[#77706A]">
          <p>&copy; 2026 Santalum Maison. A design preview; prices are placeholders.</p>
          <button
            type="button"
            onClick={() => scrollToY(0)}
            className="inline-flex items-center gap-2 font-medium text-[#1B1712] transition hover:text-[var(--m-accent)]"
          >
            Back to the first card
            <IconArrow dir="up" width={16} height={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
