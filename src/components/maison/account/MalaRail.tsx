"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export type Bead = { id: string; label: string; count?: number };

/** Which section is under the reader's eye: the one whose top has passed a line a third of the way down. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join("|");
  useEffect(() => {
    const list = key.split("|");
    let raf = 0;
    const read = () => {
      raf = 0;
      const line = window.innerHeight * 0.34;
      let cur = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) cur = id;
      }
      // at the very bottom, the last section is the one being read
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = list[list.length - 1];
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [key]);
  return [active, setActive] as const;
}

/**
 * The account's sections strung as a mala: the member is the guru bead at the head of the cord,
 * each section a bead below it with its count turned into the wood, and the bead being read
 * becomes a slice of the current wood. A silk tassel ends the string. On phones the string runs
 * across the top instead.
 */
export function MalaRail({ beads, active, onPick, initial }: { beads: Bead[]; active: string; onPick: (id: string) => void; initial: string }) {
  return (
    <nav aria-label="Account" className="lg:sticky lg:top-28 lg:self-start">
      {/* desktop: hanging string */}
      <div className="relative hidden lg:block">
        <span aria-hidden className="absolute bottom-16 left-[1.75rem] top-8 w-px bg-(--mz-ink)/25" />
        <div className="relative flex items-center gap-4 pb-3">
          <span aria-hidden className="relative grid size-14 place-items-center overflow-hidden rounded-full shadow-[0_6px_16px_-8px_rgb(23_19_15/0.5),inset_0_0_0_1px_rgb(0_0_0/0.12)]">
            <span className="w-red">
              <span className="ring-red absolute inset-0" />
            </span>
            <span className="w-white">
              <span className="ring-white absolute inset-0" />
            </span>
            <span className="relative grid size-8 place-items-center rounded-full bg-(--mz-bg) font-display text-[17px]">{initial}</span>
          </span>
          <span className="text-[13px] leading-tight text-(--mz-ink-3)">
            Your string
            <span className="block">{beads.length} beads</span>
          </span>
        </div>
        <ol className="relative">
          {beads.map((b) => {
            const on = b.id === active;
            return (
              <li key={b.id}>
                <a
                  href={`#${b.id}`}
                  onClick={() => onPick(b.id)}
                  aria-current={on ? "location" : undefined}
                  className="group flex items-center gap-4 rounded-full py-2 pl-1.5 pr-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
                >
                  <BeadDot on={on} count={b.count} />
                  <span className={`font-display text-[22px] leading-none tracking-[-0.01em] transition-colors duration-500 ${on ? "text-(--mz-ink)" : "text-(--mz-ink-3) group-hover:text-(--mz-ink-2)"}`}>
                    {b.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
        <Tassel className="ml-[1.2rem] mt-1 h-14 w-5" />
      </div>

      {/* phones and tablets: the same string, running across */}
      <div className="relative -mx-5 lg:hidden">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-(--mz-ink)/20" />
        <ol className="mz-strip relative flex gap-2 overflow-x-auto px-5 py-1">
          {beads.map((b) => {
            const on = b.id === active;
            return (
              <li key={b.id} className="relative shrink-0">
                <a
                  href={`#${b.id}`}
                  onClick={() => onPick(b.id)}
                  aria-current={on ? "location" : undefined}
                  className={`flex items-center gap-2.5 rounded-full py-1 pl-1 pr-4 text-[15px] transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent) ${
                    on ? "bg-(--mz-bg) text-(--mz-ink) shadow-[inset_0_0_0_1px_var(--mz-line)]" : "bg-(--mz-bg) text-(--mz-ink-2)"
                  }`}
                >
                  <BeadDot on={on} count={b.count} small />
                  {b.label}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

/** A bead: pale wood with its count when resting; a slice of the current wood when it is the one being read. */
function BeadDot({ on, count, small = false }: { on: boolean; count?: number; small?: boolean }) {
  return (
    <span className={`relative grid shrink-0 place-items-center ${small ? "size-8" : "size-11"}`}>
      <span
        className={`absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--mz-bg),var(--mz-surface-2)_75%)] shadow-[inset_0_0_0_1px_var(--mz-line),0_3px_8px_-5px_rgb(23_19_15/0.45)] transition-transform duration-500 ease-out-soft ${
          on ? "scale-90" : "group-hover:scale-105"
        }`}
      />
      {on && (
        <motion.span layoutId={small ? "acct-bead-row" : "acct-bead"} className="absolute inset-0 overflow-hidden rounded-full shadow-[0_6px_14px_-6px_rgb(23_19_15/0.55)]" transition={{ duration: 0.6, ease: EASE }}>
          <span className="w-red">
            <span className="ring-red absolute inset-0" />
          </span>
          <span className="w-white">
            <span className="ring-white absolute inset-0" />
          </span>
        </motion.span>
      )}
      <span
        className={`relative grid place-items-center rounded-full tabular-nums transition-colors duration-500 ${small ? "size-5 text-[11px]" : "size-6 text-[12px]"} ${
          on ? "bg-(--mz-bg) text-(--mz-ink)" : "text-(--mz-ink-2)"
        }`}
      >
        {count ?? "·"}
      </span>
    </span>
  );
}

/** A silk tassel, in the wood's accent, at the end of the string. */
function Tassel({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 56" className={className} aria-hidden>
      <circle cx="10" cy="4" r="3.5" style={{ fill: "var(--mz-accent)" }} />
      {[-6, -3.5, -1.2, 1.2, 3.5, 6].map((dx, i) => (
        <path key={dx} d={`M10 7 Q ${10 + dx * 0.4} 30 ${10 + dx} ${50 + (i % 2) * 4}`} fill="none" strokeWidth="1.1" strokeLinecap="round" style={{ stroke: "var(--mz-accent)", opacity: 0.55 + (i % 3) * 0.15 }} />
      ))}
    </svg>
  );
}

/* ---------------- the member's slice ---------------- */

/** A slightly wavy ring, the same every render. */
function ringPath(r: number, i: number) {
  const pts: string[] = [];
  for (let k = 0; k <= 64; k++) {
    const a = (k / 64) * Math.PI * 2;
    const rr = r * (1 + 0.025 * Math.sin(3 * a + i * 1.7) + 0.015 * Math.sin(5 * a + i * 0.9));
    pts.push(`${(50 + rr * Math.cos(a)).toFixed(2)} ${(50 + rr * Math.sin(a) * 0.97).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

/** The member's slice of wood: one growth ring for every order, out from the pith. */
export function MemberSlice({ rings, className = "" }: { rings: number; className?: string }) {
  const n = Math.min(Math.max(rings, 0), 14);
  const step = n ? 36 / (n + 1) : 0;
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={n ? `A slice with ${rings} growth ${rings === 1 ? "ring" : "rings"}, one for each order` : "A young slice, no rings yet"}>
      <path d={ringPath(47, 99)} style={{ fill: "var(--mz-surface-2)" }} />
      <path d={ringPath(42, 98)} style={{ fill: "var(--mz-accent-soft)" }} />
      {Array.from({ length: n }, (_, i) => (
        <motion.path
          key={i}
          d={ringPath(6 + step * (i + 1), i)}
          fill="none"
          strokeWidth={i === n - 1 ? 1.6 : 0.9}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: EASE }}
          style={{ stroke: "var(--mz-accent)" }}
        />
      ))}
      <circle cx="50" cy="50" r="3.2" style={{ fill: "var(--mz-accent-deep)" }} />
    </svg>
  );
}
