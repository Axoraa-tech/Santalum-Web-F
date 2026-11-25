"use client";

import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { W } from "@/components/maison/W";
import { bag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct } from "@/lib/shop/products";
import { EditionTicks } from "./bits";
import { CUFFS, KINDS, ProfileDetail, RackProfile } from "./cuffs";
import { s } from "./cx";
import { EASE, mulberry32 } from "./data";
import { sheet } from "./store";

/**
 * The edition, per wood. Red: the 2011 Vault, 21 turned cuff profiles with the selected one drawn large.
 * White: the 2011 Reserve, 50 numbered vials, the tray drawn to the count that remains.
 */
export function Vault() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  return (
    <section ref={ref} id="vault" className="relative scroll-mt-14 border-t border-(--hair) bg-(--paper-2) px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-[1400px]">
        <W red={<VaultCuffs />} white={<Reserve progress={scrollYProgress} />} />
      </div>
    </section>
  );
}

function EditionHead({ title, text, price, note, size, left }: { title: [string, string]; text: string; price: number; note: string; size: number; left: number }) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
      <h2 className={`${s.x125} text-[clamp(3rem,8.4vw,8.8rem)] font-[620] leading-[0.84] tracking-[-0.035em] lg:col-span-8`}>
        {title[0]}
        <br />
        {title[1]}
      </h2>
      <div className="lg:col-span-4 lg:pb-3">
        <p className="text-[16px] leading-[1.6] text-(--ink-2)">{text}</p>
        <p className={`${s.mono} mt-5 flex items-baseline gap-4 text-[13px]`}>
          <span className="text-[22px] tabular-nums text-(--ink)">{formatINR(price)}</span>
          <span className="text-(--steel)">{note}</span>
        </p>
        <EditionTicks size={size} left={left} className="mt-4" />
      </div>
    </div>
  );
}

function VaultCuffs() {
  const p = getProduct(CONTENT.red.edition.productSlug)!;
  const ed = p.edition!;
  const [sel, setSel] = useState(7);
  const c = CUFFS[sel - 1];

  return (
    <>
      <EditionHead
        title={["The 2011", "Vault"]}
        text="Twenty-one cuffs, turned from red heartwood sourced in 2011 and aged since. The wood waited for the right hands. Each cuff is numbered and entered in our registry with its documented lot, the artisan’s name and the date it left our hands."
        price={p.price}
        note={`Edition of ${ed.size}, numbered`}
        size={ed.size}
        left={ed.left}
      />

      <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-14">
        {/* Selected cuff, dimensioned */}
        <div className="lg:col-span-5">
          <div className="relative aspect-[5/4] border border-(--hair-2) bg-(--sheet) px-6 py-8">
            <span className={`${s.mono} absolute left-4 top-3 text-[10.5px] text-(--steel)`}>Lathe profile, enlarged</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={sel}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="absolute inset-x-6 inset-y-8 text-(--ink)"
              >
                <ProfileDetail c={c} />
              </motion.div>
            </AnimatePresence>
          </div>
          <p className={`${s.x125} mt-7 text-[clamp(2rem,3.6vw,3.3rem)] font-[620] leading-none tracking-[-0.02em]`}>
            <span className="tabular-nums">No. {String(c.n).padStart(2, "0")}</span>
            <span className="text-(--steel)"> of 21</span>
          </p>
          <dl className={`${s.mono} mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-(--ink) pt-4 text-[12.5px]`}>
            <dt className="text-(--steel)">Profile</dt>
            <dd>{KINDS[c.kind]}</dd>
            <dt className="text-(--steel)">Width</dt>
            <dd className="tabular-nums">{c.w} mm</dd>
            <dt className="text-(--steel)">Wall</dt>
            <dd className="tabular-nums">{c.t} mm</dd>
            <dt className="text-(--steel)">Bore</dt>
            <dd>Made to your measurement</dd>
            <dt className="text-(--steel)">Comes with</dt>
            <dd>{p.details.find((d) => d.label === "Comes with")?.value ?? "Registry certificate"}</dd>
          </dl>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className={s.btn}
              onClick={() => {
                bag.add(p.slug);
                sheet.open();
              }}
            >
              Add a cuff, {formatINR(p.price)}
            </button>
            <Link href={`/d/01/p/${p.slug}`} className={s.btnLine}>
              View the cuff
            </Link>
          </div>
        </div>

        {/* The board: 21 profiles */}
        <div className="lg:col-span-7">
          <div className={`${s.mono} mb-3 flex items-center justify-between text-[11px] text-(--steel)`}>
            <span>Profiles, numbered 01 to 21</span>
            <span className="hidden md:inline">Point at a number to draw it</span>
          </div>
          <div role="group" aria-label="Vault cuffs, 1 to 21" className="grid grid-cols-3 border-l border-t border-(--hair-2) sm:grid-cols-7">
            {CUFFS.map((cf) => {
              const on = cf.n === sel;
              return (
                <button
                  key={cf.n}
                  type="button"
                  aria-pressed={on}
                  aria-label={`Cuff ${cf.n} of 21, ${KINDS[cf.kind].toLowerCase()} profile`}
                  onClick={() => setSel(cf.n)}
                  onPointerEnter={() => setSel(cf.n)}
                  className={`group relative flex flex-col items-stretch gap-2 border-b border-r border-(--hair-2) px-3 pb-3 pt-4 text-left transition-colors ${
                    on ? "bg-(--sheet) text-(--accent)" : "text-(--ink) hover:bg-[color-mix(in_srgb,var(--sheet)_60%,transparent)] active:bg-(--sheet)"
                  }`}
                >
                  <span className="block transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5">
                    <RackProfile c={cf} />
                  </span>
                  <span className={`${s.mono} flex items-baseline justify-between text-[11px] tabular-nums`}>
                    <span className={on ? "" : "text-(--ink)"}>{String(cf.n).padStart(2, "0")}</span>
                    <span className="text-[10px] text-(--steel)">
                      {cf.w}×{cf.t}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-5 max-w-[34rem] text-[14px] leading-[1.55] text-(--steel)">
            Profiles are drawn for illustration, to scale with one another. Each cuff is turned to the wearer&rsquo;s measurement.
          </p>
        </div>
      </div>
    </>
  );
}

/* ---------- White: the 2011 Reserve ---------- */

const SOCKETS = 50;

/** Which sockets in the drawing hold a vial: as many as remain, scattered (seeded, so the same on server and client). */
function filledSockets(left: number) {
  const r = mulberry32(201150);
  const idx = Array.from({ length: SOCKETS }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return new Set(idx.slice(0, left));
}

function Reserve({ progress }: { progress: MotionValue<number> }) {
  const p = getProduct(CONTENT.white.edition.productSlug)!;
  const ed = p.edition!;
  const filled = filledSockets(ed.left);
  const level = useTransform(progress, [0.2, 0.95], [0.08, 1]);
  const vol = p.details.find((d) => d.label === "Volume")?.value ?? "3 ml";

  return (
    <>
      <EditionHead
        title={["The 2011", "Reserve"]}
        text="Fifty vials of oil distilled from one lot of white heartwood harvested in 2011 and aged since. Each vial is numbered by hand and entered in the registry with its lot and date."
        price={p.price}
        note={`Edition of ${ed.size}, ${vol} each`}
        size={ed.size}
        left={ed.left}
      />

      <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-14">
        {/* One vial, in section */}
        <div className="lg:col-span-5">
          <div className="relative grid aspect-[5/4] place-items-center border border-(--hair-2) bg-(--sheet) px-4 py-8">
            <span className={`${s.mono} absolute left-4 top-3 text-[10.5px] text-(--steel)`}>One vial, in section</span>
            <svg viewBox="0 0 200 160" className="size-full overflow-visible text-(--ink)" aria-hidden>
              <defs>
                <pattern id="l01-res-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
                </pattern>
                <clipPath id="l01-res-clip">
                  <path d="M88 58 H112 V138 Q112 146 104 146 H96 Q88 146 88 138 Z" />
                </clipPath>
              </defs>
              <path d="M100 6 V156" stroke="currentColor" strokeWidth="0.6" strokeDasharray="8 2 1.5 2" opacity="0.5" />
              {/* Oil, rising as the section comes up the page */}
              <g clipPath="url(#l01-res-clip)">
                <motion.rect x="86" y="58" width="28" height="90" fill="var(--accent)" opacity="0.5" style={{ scaleY: level, originY: 1 }} />
              </g>
              {/* Glass */}
              <path d="M86 56 H114 V138 Q114 148 104 148 H96 Q86 148 86 138 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M88 58 H112 V138 Q112 146 104 146 H96 Q88 146 88 138 Z" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
              {/* Turned cap, cut in section */}
              <path d="M84 22 H116 V56 H84 Z" fill="url(#l01-res-hatch)" stroke="currentColor" strokeWidth="1.4" />
              <path d="M84 34 H116 M84 38 H116" stroke="currentColor" strokeWidth="0.8" />
              <path d="M90 22 Q90 14 100 14 Q110 14 110 22" fill="none" stroke="currentColor" strokeWidth="1.4" />
              {/* Hand-numbered label */}
              <rect x="88" y="92" width="24" height="26" fill="var(--sheet)" stroke="currentColor" strokeWidth="0.8" />
              <text x="100" y="103" textAnchor="middle" className={s.mono} fontSize="6" fill="currentColor">
                No.
              </text>
              <path d="M92 111 H108" stroke="currentColor" strokeWidth="0.6" />
              <text x="100" y="116.5" textAnchor="middle" className={s.mono} fontSize="4.6" fill="currentColor" opacity="0.7">
                of 50
              </text>
              {/* Callouts */}
              <path d="M114 100 L134 84 H192" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="114" cy="100" r="1.6" fill="currentColor" />
              <text x="136" y="80" className={s.mono} fontSize="7.5" fill="currentColor">
                <tspan x="136" dy="-9">
                  {vol},
                </tspan>
                <tspan x="136" dy="9">
                  heartwood oil
                </tspan>
              </text>
              <path d="M84 30 L60 20 H8" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="84" cy="30" r="1.6" fill="currentColor" />
              <text x="8" y="16" className={s.mono} fontSize="7.5" fill="currentColor">
                Turned cap
              </text>
              <path d="M88 108 L62 124 H8" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="88" cy="108" r="1.6" fill="currentColor" />
              <text x="8" y="120" className={s.mono} fontSize="7.5" fill="currentColor">
                Numbered by hand
              </text>
            </svg>
          </div>
          <dl className={`${s.mono} mt-7 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-(--ink) pt-4 text-[12.5px]`}>
            <dt className="text-(--steel)">Lot</dt>
            <dd>One lot, harvested 2011</dd>
            {p.details.map((d) => (
              <div key={d.label} className="contents">
                <dt className="text-(--steel)">{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
            <dt className="text-(--steel)">Registry</dt>
            <dd>Number, lot and date</dd>
          </dl>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className={s.btn}
              onClick={() => {
                bag.add(p.slug);
                sheet.open();
              }}
            >
              Add a vial, {formatINR(p.price)}
            </button>
            <Link href={`/d/01/p/${p.slug}`} className={s.btnLine}>
              View the Reserve
            </Link>
          </div>
        </div>

        {/* The tray */}
        <div className="lg:col-span-7">
          <div className={`${s.mono} mb-3 flex items-center justify-between text-[11px] text-(--steel)`}>
            <span>Tray, plan view, {SOCKETS} sockets</span>
            <span>{ed.left} vials in the tray</span>
          </div>
          <div className="border border-(--hair-2) bg-(--sheet) p-3 sm:p-5">
            <div role="img" aria-label={`${ed.left} of ${ed.size} vials remain`} className="grid grid-cols-10 gap-1.5 sm:gap-2.5">
              {Array.from({ length: SOCKETS }, (_, i) => {
                const on = filled.has(i);
                return (
                  <span key={i} className="relative block aspect-square">
                    <span className={`absolute inset-0 rounded-full border ${on ? "border-(--ink)" : "border-dashed border-(--hair-2)"}`} />
                    {on && (
                      <>
                        <span className="absolute inset-[18%] rounded-full bg-(--accent) opacity-60" />
                        <span className="absolute inset-[38%] rounded-full bg-(--sheet) shadow-[0_0_0_1px_var(--ink)]" />
                      </>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
          <p className="mt-5 max-w-[34rem] text-[14px] leading-[1.55] text-(--steel)">
            The tray is drawn to the count that remains, {ed.left} of {ed.size}, not to their numbers. Your vial&rsquo;s number is written on its label and
            entered in the registry when it leaves us.
          </p>
        </div>
      </div>
    </>
  );
}
