"use client";

import { useScroll } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { FAMILIES } from "@/lib/catalog";
import k from "../k";
import { kinetic } from "./kinetic";
import { clamp, fitSize, onFonts, scrollToTop, splitName, useFinePointer, useReduced } from "./lib";
import { HashLink } from "./Nav";
import { WoodToggle } from "./WoodToggle";

const WORD = "Santalum";
const MAISON = [
  { id: "woods", label: "Two woods" },
  { id: "heartwood", label: "Heartwood" },
  { id: "making", label: "Making" },
  { id: "provenance", label: "Provenance" },
  { id: "vault", label: "The 2011 Vault" },
  { id: "gifting", label: "Gifting" },
  { id: "circle", label: "Santalum Circle" },
];

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
    <footer ref={footRef} className="relative border-t border-[var(--k-line)] bg-[var(--k-bg)]">
      <div className={`${k.gut} grid grid-cols-1 gap-x-8 gap-y-12 pb-12 pt-16 md:grid-cols-12 md:pt-24`}>
        <div className="md:col-span-5 lg:col-span-4">
          <p className={`${k.disp} whitespace-normal text-[length:clamp(30px,3.3vw,50px)] leading-[0.95] [font-variation-settings:'wdth'_78,'wght'_700]`}>
            Made with respect for the material. Designed for the life around it.
          </p>
          <WoodToggle size={34} className="mt-10" />
        </div>
        <nav aria-label="Collection" className="md:col-span-3 lg:col-start-5">
          <p className={`${k.mono} text-[var(--k-grey)]`}>Collection</p>
          <ul className="mt-4 space-y-1.5">
            {FAMILIES.map((f) => (
              <li key={f.slug}>
                <Link href={`/d/10/p/${f.slug}`} className={`${k.monoL} ${k.link}`}>
                  {splitName(f.name).head}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Maison" className="md:col-span-2">
          <p className={`${k.mono} text-[var(--k-grey)]`}>Maison</p>
          <ul className="mt-4 space-y-1.5">
            {MAISON.map((m) => (
              <li key={m.id}>
                <HashLink id={m.id} className={`${k.monoL} ${k.link}`}>
                  {m.label}
                </HashLink>
              </li>
            ))}
            <li>
              <Link href="/d/10/checkout" className={`${k.monoL} ${k.link}`}>
                Checkout
              </Link>
            </li>
          </ul>
        </nav>
        <div className="md:col-span-2 lg:col-span-3 lg:col-start-10">
          <p className={`${k.mono} text-[var(--k-grey)]`}>Delivery and care</p>
          <p className={`${k.monoL} mt-4`}>
            Complimentary delivery across India, dispatched within 3 to 5 working days. Unused pieces can be returned within 14 days
            in their original packaging. Numbered editions are final.
          </p>
          <p className={`${k.monoL} mt-4`}>Keep sandalwood dry and out of direct sun. A drop of natural oil once a season.</p>
        </div>
      </div>

      <div className="relative">
        <div ref={boxRef} className="relative mx-[var(--k-gut)] h-[15vw]">
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
        <p className={`${k.mono} text-[var(--k-grey)]`}>© 2026 Santalum Maison, India</p>
        <p className={`${k.mono} text-[var(--k-grey)]`}>Photographs are placeholders until the Maison&apos;s own</p>
        <button type="button" onClick={scrollToTop} className={`${k.mono} ${k.link}`}>
          Back to the top
        </button>
      </div>
      <div className="h-16 sm:hidden" aria-hidden />
    </footer>
  );
}
