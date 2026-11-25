"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { COPY, NOTES } from "../_lib/copy";
import { setMode } from "../_lib/view";
import { Mark } from "./Mark";
import { PinGlyph } from "./Pins";
import { s } from "./styles";

const EDGE = "ABCDEFGHJKLM";

/** One ruled cell of the title block, with its small caption in the corner, as on a drawn sheet. */
function Cell({ label, children, className = "", term = false }: { label: string; children: ReactNode; className?: string; term?: boolean }) {
  const cap = "absolute left-4 top-2 text-[12px] tracking-[0.04em] text-(--a-muted) md:left-6";
  return (
    <div className={`relative px-4 pb-5 pt-7 md:px-6 ${className}`}>
      {term ? <dt className={cap}>{label}</dt> : <span className={cap}>{label}</span>}
      {children}
    </div>
  );
}

function Sym({ k }: { k: "shop" | "track" | "account" | "board" }) {
  if (k === "shop") return <PinGlyph color="var(--a-accent)" className="h-5 w-[15px]" />;
  if (k === "track")
    return (
      <svg viewBox="0 0 28 10" className="h-2.5 w-6" aria-hidden>
        <path d="M2 5h24" stroke="var(--a-accent)" strokeWidth="2.5" strokeDasharray="5 4" />
      </svg>
    );
  if (k === "account") return <span className="block size-3 rounded-full border-2 border-(--a-accent)" aria-hidden />;
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" fill="none" stroke="var(--a-ink)" strokeWidth="1.3" />
      <circle cx="5.5" cy="6" r="1.4" fill="var(--a-accent)" />
      <circle cx="10.5" cy="10" r="1.4" fill="var(--a-accent)" />
    </svg>
  );
}

/**
 * The foot of every page is the sheet's title block: a ruled box of captioned cells (the house,
 * the index, the bearing, then the shop notes), with grid letters along its top edge. The board carries its own.
 */
export function Footer({ force = false }: { force?: boolean }) {
  const pathname = usePathname();
  if (pathname === "/d/08" && !force) return null;
  const index = [
    { href: "/d/08/shop", label: "Shop", k: "shop" as const },
    { href: "/d/08/track", label: "Track your order", k: "track" as const },
    { href: "/d/08/account", label: "Your account", k: "account" as const },
  ];
  return (
    <footer className="mx-auto w-full max-w-[1320px] px-4 pb-28 pt-20 md:px-8 md:pb-10">
      {/* grid letters along the edge of the sheet */}
      <div aria-hidden className="grid grid-cols-6 text-center text-[12px] tabular-nums text-(--a-muted) md:grid-cols-12">
        {EDGE.split("").map((l, i) => (
          <span key={l} className={`relative pb-1.5 ${i >= 6 ? "hidden md:block" : ""}`}>
            {l}
            <span className="absolute bottom-0 left-0 h-1.5 w-px bg-(--a-ink)/50" />
          </span>
        ))}
      </div>
      <div className="border-2 border-(--a-ink) p-[3px]">
        <div className="border border-(--a-ink)">
          <div className="grid md:grid-cols-[1.35fr_1fr_1fr]">
            <Cell label="The house" className="border-b border-(--a-ink) md:border-b-0 md:border-r">
              <p className="flex items-center gap-2.5">
                <Mark className="size-8" />
                <span className={`${s.serif} text-[28px] leading-none`}>Santalum Maison</span>
              </p>
              <p className="mt-4 max-w-[400px] text-[16px] leading-relaxed text-(--a-ink-2)">{CONTENT.red.closing}</p>
            </Cell>
            <Cell label="Index of this atlas" className="border-b border-(--a-ink) md:border-b-0 md:border-r">
              <nav aria-label="The house">
                <ul className="text-[16px]">
                  {index.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="group flex items-center gap-3 border-b border-dashed border-(--a-line-2) py-2">
                        <span className="grid w-6 shrink-0 place-items-center">
                          <Sym k={l.k} />
                        </span>
                        <span className={`${s.link} group-hover:decoration-(--a-accent)`}>{l.label}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/d/08" onClick={() => setMode("canvas")} className="group flex items-center gap-3 py-2">
                      <span className="grid w-6 shrink-0 place-items-center">
                        <Sym k="board" />
                      </span>
                      <span className={`${s.link} group-hover:decoration-(--a-accent)`}>The board</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </Cell>
            <Cell label="Bearing" className="border-b border-(--a-ink) md:border-b-0">
              <div className="flex items-start gap-4">
                <svg viewBox="0 0 40 56" className="h-14 w-10 shrink-0" aria-hidden>
                  <text x="20" y="11" textAnchor="middle" fontSize="11" fill="var(--a-ink)" className={s.serif}>
                    N
                  </text>
                  <path d="M20 16l7 30-7-6-7 6z" fill="var(--a-card)" stroke="var(--a-ink)" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M20 16l7 30-7-6z" fill="var(--a-accent)" />
                </svg>
                <p className="text-[15px] leading-relaxed text-(--a-ink-2)">
                  <WT red={COPY.red.footerPlace} white={COPY.white.footerPlace} />
                  <span className="mt-1 block text-[14px] text-(--a-muted)">Where this side of the house begins.</span>
                </p>
              </div>
            </Cell>
          </div>
          <dl className="grid border-t border-(--a-ink) md:grid-cols-3">
            <Cell term label="Delivery" className="border-b border-(--a-line-2) md:border-b-0 md:border-r">
              <dd className="text-[15px] leading-relaxed text-(--a-ink-2)">{NOTES.delivery}</dd>
            </Cell>
            <Cell term label="Returns" className="border-b border-(--a-line-2) md:border-b-0 md:border-r">
              <dd className="text-[15px] leading-relaxed text-(--a-ink-2)">{NOTES.returns}</dd>
            </Cell>
            <Cell term label="Care">
              <dd className="text-[15px] leading-relaxed text-(--a-ink-2)">
                <WT red={CONTENT.red.care} white={CONTENT.white.care} />
              </dd>
            </Cell>
          </dl>
          <p className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-(--a-ink) px-4 py-2.5 text-[13px] text-(--a-muted) md:px-6">
            <span>&copy; 2026 Santalum Maison, India. Photographs are placeholders.</span>
            <span>{NOTES.preview}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
