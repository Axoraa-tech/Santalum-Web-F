"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, type Family } from "@/lib/catalog";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { EASE, LEVEL_LINE, WOOD_LABEL, productHref, splitName } from "./copy";
import { lockScroll, unlockScroll, useMedia } from "./store";
import { AddButton, ArrowIcon, CloseIcon, Swatch } from "./ui";
import { s } from "./cls";

/** The piece opened from the ring: a card on the right (a full-screen sheet on phones). */
export function DetailCard({ family, onClose, reduced }: { family: Family; onClose: () => void; reduced: boolean }) {
  const wood = useWood();
  const desktop = useMedia("(min-width: 768px)", true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const v = family.variants[wood] ?? family.variants.white ?? family.variants.red!;
  const [name, sub] = splitName(family.name);
  const longest = Math.max(...name.split(" ").map((w) => w.length));

  useEffect(() => {
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 80);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [onClose]);

  const from = reduced ? { opacity: 0 } : desktop ? { x: "108%" } : { y: "100%" };
  const to = reduced ? { opacity: 1 } : desktop ? { x: "0%" } : { y: "0%" };

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-0 z-[105] bg-[rgb(25_23_20/0.06)] md:bg-transparent"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="o2-detail-title"
        data-lenis-prevent
        className="fixed inset-x-0 bottom-0 top-[5svh] z-[110] overflow-y-auto overscroll-contain rounded-t-[32px] bg-[var(--o-card)] shadow-[0_-20px_60px_-20px_rgb(25_23_20/0.35)] md:inset-y-4 md:left-auto md:right-4 md:top-4 md:w-[min(520px,44vw)] md:rounded-[36px] md:shadow-[0_40px_120px_-30px_rgb(25_23_20/0.45)]"
        initial={from}
        animate={to}
        exit={from}
        transition={{ duration: reduced ? 0.2 : 0.75, ease: EASE }}
      >
        <div className="relative px-6 pb-10 pt-6 md:px-9 md:pt-8">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="sticky top-0 z-10 float-right grid size-12 place-items-center rounded-full bg-[var(--o-ink)] text-white transition-transform duration-300 hover:rotate-90 active:scale-90"
          >
            <CloseIcon />
          </button>

          {/* two overlapping round photos */}
          <div className="relative mb-8 mt-2 h-[250px] w-[300px] max-w-full md:h-[280px] md:w-[340px]">
            <div className="absolute left-0 top-0 size-[230px] overflow-hidden rounded-full bg-[var(--o-floor)] md:size-[260px]">
              <Photo key={v.shots[0].photo.id + wood} p={v.shots[0].photo} tone={v.shots[0].tone} sizes="260px" />
            </div>
            {v.shots[1] && (
              <div className="absolute bottom-0 right-0 size-[124px] overflow-hidden rounded-full border-[5px] border-[var(--o-card)] bg-[var(--o-floor)] md:size-[140px]">
                <Photo p={v.shots[1].photo} tone={v.shots[1].tone} sizes="140px" />
              </div>
            )}
          </div>

          <p className="text-[14px] text-[var(--o-muted)]">{LEVEL_LINE[family.level]}{family.edition ? `, ${family.edition.toLowerCase()}` : ""}</p>
          <h2
            id="o2-detail-title"
            className={`${s.display} mt-2 text-[length:var(--fm)] md:text-[length:var(--fd)]`}
            style={{ "--fm": `min(13vw, ${(86 / (longest * 0.86)).toFixed(2)}vw)`, "--fd": `min(2.9rem, ${Math.round(430 / (longest * 0.86))}px)` } as React.CSSProperties}
          >
            {name}
          </h2>
          {sub && <p className={`${s.syne} mt-2 text-[20px] font-semibold text-[var(--o-ink-2)]`}>{sub}</p>}

          <div className="mt-6 flex items-baseline gap-3">
            <p className={`${s.syne} text-[34px] font-bold tabular-nums tracking-[-0.03em]`}>{formatINR(v.price)}</p>
            <p className="text-[14px] text-[var(--o-muted)]">in {WOOD_LABEL[wood].toLowerCase()}</p>
          </div>
          <p className="mt-1 text-[15px] text-[var(--o-ink-2)]">{v.note}</p>

          <p className="mt-6 text-[17px] leading-relaxed">{family.summary}</p>

          <fieldset className="mt-7">
            <legend className="mb-3 text-[14px] font-semibold">Wood</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["red", "white"] as Wood[]).map((w) => {
                const vv = family.variants[w];
                const on = w === wood;
                return (
                  <button
                    key={w}
                    type="button"
                    disabled={!vv}
                    aria-pressed={on}
                    onClick={() => switchWood(w)}
                    className={`flex items-center gap-3 rounded-full border py-2 pl-2 pr-4 text-left transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${
                      on ? "border-[var(--o-ink)] bg-[var(--o-ink)] text-white" : "border-[var(--o-line)] hover:border-[var(--o-ink)]"
                    }`}
                  >
                    <Swatch wood={w} className="size-9" />
                    <span className="leading-tight">
                      <span className="block text-[14px] font-semibold">{w === "red" ? "Red" : "White"}</span>
                      <span className={`block text-[13px] tabular-nums ${on ? "text-white/70" : "text-[var(--o-muted)]"}`}>{vv ? formatINR(vv.price) : "Not made"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AddButton family={family} className="flex-1" />
            <Link
              href={productHref(family.slug)}
              className="group inline-flex h-14 items-center gap-2 rounded-full border border-[var(--o-line)] px-6 text-[15px] font-semibold transition-colors hover:border-[var(--o-ink)]"
            >
              Full page
              <span className="grid size-7 place-items-center rounded-full bg-[var(--o-floor)] transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowIcon className="size-3.5" />
              </span>
            </Link>
          </div>

          <div className="mt-10 space-y-3 text-[15px] leading-relaxed text-[var(--o-ink-2)]">
            {family.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <dl className="mt-8 divide-y divide-[var(--o-line)] border-y border-[var(--o-line)]">
            {family.details.map((d) => (
              <div key={d.label} className="flex justify-between gap-6 py-3 text-[14px]">
                <dt className="text-[var(--o-muted)]">{d.label}</dt>
                <dd className="text-right font-medium">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.aside>
    </>
  );
}
