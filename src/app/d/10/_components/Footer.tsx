"use client";

import { useScroll } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, formatINR, productsFor } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import k from "../k";
import { kinetic } from "./kinetic";
import { clamp, fitSize, onFonts, scrollToTop, useFinePointer, useReduced } from "./lib";
import { HashLink } from "./Nav";
import { WoodToggle } from "./WoodToggle";

const WORD = "Santalum";
const MAISON: Record<Wood, { id: string; label: string }[]> = {
  red: [
    { id: "collection", label: "Turned in red" },
    { id: "heartwood", label: "Colour" },
    { id: "making", label: "At the lathe" },
    { id: "provenance", label: "Batch records" },
    { id: "vault", label: "The 2011 Vault" },
    { id: "gifting", label: "Gifting" },
    { id: "circle", label: "Santalum Circle" },
  ],
  white: [
    { id: "collection", label: "Chosen in white" },
    { id: "heartwood", label: "Fragrance" },
    { id: "making", label: "At the still" },
    { id: "provenance", label: "Lot records" },
    { id: "vault", label: "The 2011 Reserve" },
    { id: "gifting", label: "Gifting" },
    { id: "circle", label: "Santalum Circle" },
  ],
};

const HELP = [
  { href: "/d/10/shop", label: "Shop" },
  { href: "/d/10/track", label: "Track your order" },
  { href: "/d/10/account", label: "Your account" },
  { href: "/d/10/checkout", label: "Checkout" },
];

function Shelves({ w }: { w: Wood }) {
  return (
    <ul className="mt-4 space-y-1.5">
      {CATEGORIES[w].map((c) => (
        <li key={c.id}>
          <Link href={`/d/10/shop?c=${c.id}`} className={`${k.monoL} ${k.link}`}>
            {c.label}
          </Link>
        </li>
      ))}
      <li>
        <Link href="/d/10/shop" className={`${k.monoL} ${k.link} text-[var(--k10-accent)]`}>
          All {productsFor(w).length} pieces
        </Link>
      </li>
    </ul>
  );
}

function Sections({ w }: { w: Wood }) {
  return (
    <ul className="mt-4 space-y-1.5">
      {MAISON[w].map((m) => (
        <li key={m.id}>
          <HashLink id={m.id} className={`${k.monoL} ${k.link}`}>
            {m.label}
          </HashLink>
        </li>
      ))}
    </ul>
  );
}

/** Footer: mono links, and a wordmark whose letters swell toward the cursor and gain weight as you arrive. */
export function Footer() {
  const fine = useFinePointer();
  const reduced = useReduced();
  const footRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: footRef, offset: ["start end", "end end"] });

  useEffect(() => {
    const box = boxRef.current;
    const word = wordRef.current;
    if (!box || !word) return;
    // the box keeps a fixed height, so the moving word never changes the page length
    const size = () => {
      box.style.height = `${fitSize(WORD, box.clientWidth, 140, 180) * 0.86}px`;
    };
    const eng = kinetic({
      text: WORD,
      copies: [word],
      target: () => box.clientWidth,
      base: () => {
        const p = reduced ? 1 : clamp((scrollYProgress.get() - 0.15) / 0.85, 0, 1);
        return { wdth: 140, wght: 260 + 600 * p };
      },
      pointer: fine && !reduced,
      intro: false,
      amp: 0,
    });
    const offFonts = onFonts(() => {
      size();
      eng.wake();
    });
    const ro = new ResizeObserver(() => {
      size();
      eng.wake();
    });
    ro.observe(box);
    const unsub = scrollYProgress.on("change", eng.wake);
    return () => {
      eng.destroy();
      offFonts();
      ro.disconnect();
      unsub();
    };
  }, [fine, reduced, scrollYProgress]);

  return (
    <footer ref={footRef} className="relative border-t border-[var(--k10-line)] bg-[var(--k10-bg)]">
      <div className={`${k.gut} grid grid-cols-2 gap-x-8 gap-y-12 pb-12 pt-16 md:grid-cols-12 md:pt-24`}>
        <div className="col-span-2 md:col-span-4">
          <p className={`${k.disp} whitespace-normal text-[length:clamp(30px,3.3vw,50px)] leading-[0.95] [font-variation-settings:'wdth'_78,'wght'_700]`}>
            <WT red={CONTENT.red.closing} white="From the heartwood, for the rituals around it. Kept closed and cool, it keeps its scent for years." />
          </p>
          <WoodToggle size={34} className="mt-10" />
        </div>
        <nav aria-label="Shop by shelf" className="md:col-span-2 md:col-start-6">
          <p className={`${k.mono} text-[var(--k10-grey)]`}>
            <WT red="Red sandalwood" white="White sandalwood" />
          </p>
          <W red={<Shelves w="red" />} white={<Shelves w="white" />} />
        </nav>
        <nav aria-label="Orders and account" className="md:col-span-2">
          <p className={`${k.mono} text-[var(--k10-grey)]`}>Orders</p>
          <ul className="mt-4 space-y-1.5">
            {HELP.map((h) => (
              <li key={h.href}>
                <Link href={h.href} className={`${k.monoL} ${k.link}`}>
                  {h.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className={`${k.mono} mt-8 text-[var(--k10-grey)]`}>The Maison</p>
          <W red={<Sections w="red" />} white={<Sections w="white" />} />
        </nav>
        <div className="col-span-2 space-y-5 md:col-span-3 md:col-start-10">
          <div>
            <p className={`${k.mono} text-[var(--k10-grey)]`}>Delivery</p>
            <p className={`${k.monoL} mt-2`}>
              Free across India, 3–5 working days. Express in 1–2 working days, {formatINR(350)}. Every parcel is insured to its full value.
            </p>
          </div>
          <div>
            <p className={`${k.mono} text-[var(--k10-grey)]`}>Returns</p>
            <p className={`${k.monoL} mt-2`}>Unused pieces within 14 days, in their original packaging. Numbered editions are final.</p>
          </div>
          <div>
            <p className={`${k.mono} text-[var(--k10-grey)]`}>Care</p>
            <p className={`${k.monoL} mt-2`}>
              <WT red={CONTENT.red.care} white={CONTENT.white.care} />
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div ref={boxRef} className="relative mx-[var(--k10-gut)] h-[15vw]">
          <span className="sr-only">Santalum</span>
          <span ref={wordRef} aria-hidden className={`${k.footWord} absolute bottom-0 left-0`}>
            {WORD.split("").map((c, i) => (
              <span key={i} data-l>
                {c}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div className={`${k.gut} flex flex-wrap items-center justify-end gap-x-6 gap-y-2 pb-6 pt-6 sm:pl-[320px]`}>
        <p className={`${k.mono} text-[var(--k10-grey)]`}>© 2026 Santalum Maison, India</p>
        <p className={`${k.mono} text-[var(--k10-grey)]`}>Photographs are placeholders until the Maison&apos;s own</p>
        <button type="button" onClick={scrollToTop} className={`${k.mono} ${k.link}`}>
          Back to the top
        </button>
      </div>
      <div className="h-16 sm:hidden" aria-hidden />
    </footer>
  );
}
