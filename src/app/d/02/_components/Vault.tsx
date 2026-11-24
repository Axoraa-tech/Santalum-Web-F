"use client";

import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { WOOD_LABEL, productHref } from "./copy";
import { s } from "./cls";
import { mulberry32 } from "./store";
import { AddButton, ArrowIcon } from "./ui";

const COUNT = 21;
const rand = mulberry32(2011);
/** Each disc gets its own pith position, so no two discs show the same rings. */
const DISCS = Array.from({ length: COUNT }, (_, i) => {
  const a = (i / COUNT) * Math.PI * 2;
  return {
    n: i + 1,
    left: (50 + Math.sin(a) * 41).toFixed(2),
    top: (50 - Math.cos(a) * 41).toFixed(2),
    dx: (Math.sin(a) * 12).toFixed(2),
    dy: (-Math.cos(a) * 12).toFixed(2),
    gx: (30 + rand() * 40).toFixed(1),
    gy: (30 + rand() * 40).toFixed(1),
    rot: Math.round(rand() * 360),
  };
});
const pad = (n: number) => String(n).padStart(2, "0");

/** The 2011 Vault: twenty-one numbered discs around the number itself. */
export function Vault() {
  const wood = useWood();
  const fam = getFamily("vault-cuff")!;
  const v = fam.variants[wood]!;
  const [chosen, setChosen] = useState<number | null>(null);

  return (
    <section id="vault" className="relative overflow-hidden bg-[var(--o-bg)] px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1440px] items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="relative mx-auto aspect-square w-[min(92vw,600px)] lg:col-span-7 lg:mx-0 lg:w-full lg:max-w-[640px]">
          {/* faint clock ticks */}
          <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
            <circle cx="200" cy="200" r="196" fill="none" stroke="var(--o-line)" />
            <circle cx="200" cy="200" r="124" fill="none" stroke="var(--o-line)" strokeDasharray="2 6" />
            {Array.from({ length: 84 }, (_, i) => (
              <line key={i} x1="200" y1="6" x2="200" y2={i % 4 === 0 ? 16 : 11} stroke="rgb(25 23 20 / 0.25)" transform={`rotate(${(i * 360) / 84} 200 200)`} />
            ))}
          </svg>

          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className={`${s.display} text-[clamp(7rem,22vw,15rem)] leading-[0.78] tracking-[-0.07em]`}>21</p>
              <p className="mt-3 text-[13px] text-[var(--o-muted)] md:text-[14px]">
                {chosen ? (
                  <>
                    You chose <span className="font-semibold text-[var(--o-ink)]">No. {pad(chosen)}</span>
                  </>
                ) : (
                  "Aged heartwood, sourced in 2011"
                )}
              </p>
            </div>
          </div>

          <ul aria-label="Choose a number from the edition">
            {DISCS.map((d) => {
              const on = chosen === d.n;
              return (
                <li key={d.n}>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={`Number ${d.n} of ${COUNT}`}
                    onClick={() => setChosen(on ? null : d.n)}
                    className={`${s.vbtn} absolute aspect-square w-[11%] rounded-full`}
                    style={
                      {
                        left: `${d.left}%`,
                        top: `${d.top}%`,
                        "--dx": `${d.dx}px`,
                        "--dy": `${d.dy}px`,
                      } as React.CSSProperties
                    }
                  >
                    <span
                      className={`${s.vdisc} absolute inset-0 rounded-full`}
                      style={{ "--gx": `${d.gx}%`, "--gy": `${d.gy}%`, transform: `rotate(${d.rot}deg)` } as React.CSSProperties}
                    />
                    {on && <span aria-hidden className="absolute -inset-[5px] rounded-full border-2 border-[var(--m-accent)]" />}
                    <span
                      className={`${s.vnum} ${s.syne} pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 whitespace-nowrap rounded-full bg-[var(--o-ink)] px-2.5 py-1 text-[12px] font-bold text-white`}
                    >
                      No. {pad(d.n)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <p className="text-[14px] font-semibold text-[var(--m-accent)]">{fam.edition}</p>
          <h2 className={`${s.display} mt-3 text-[clamp(3rem,5.2vw,5.6rem)]`}>The 2011 Vault</h2>
          <div className="mt-6 space-y-3 text-[17px] leading-relaxed text-[var(--o-ink-2)]">
            {fam.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-5">
            <span className="relative size-[110px] shrink-0 overflow-hidden rounded-full bg-[var(--o-floor)]">
              <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="110px" />
            </span>
            <div>
              <p className={`${s.syne} text-[30px] font-bold tabular-nums tracking-[-0.03em]`}>{formatINR(v.price)}</p>
              <p className="text-[14px] text-[var(--o-muted)]">{WOOD_LABEL[wood]}, made to your measurement</p>
              <p className="mt-1 text-[14px] text-[var(--o-ink-2)]">{v.note}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AddButton
              family={fam}
              custom={chosen ? `Requested number ${pad(chosen)} of 21` : undefined}
              label={chosen ? `Add No. ${pad(chosen)} to bag` : "Add to bag"}
            />
            <Link
              href={productHref(fam.slug)}
              className="group inline-flex h-14 items-center gap-2 rounded-full border border-[var(--o-line)] px-6 text-[15px] font-semibold transition-colors hover:border-[var(--o-ink)]"
            >
              About the cuff
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-4 max-w-[420px] text-[13px] leading-relaxed text-[var(--o-muted)]">
            Choose a number on the dial if one matters to you. We confirm it is still free when we reply to your order.
          </p>
        </div>
      </div>
    </section>
  );
}
