"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CATEGORIES, formatINR, getFamily, WOOD_NAMES } from "@/lib/catalog";
import { switchWood, useWood } from "@/lib/wood";
import type { Wood } from "@/lib/wood-boot";
import { Photo } from "../Photo";
import { AddToBag } from "./AddToBag";
import { WoodDisc } from "./Logo";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Product detail: arched gallery on the left, everything you need to decide on the right. */
export function ProductView({ slug }: { slug: string }) {
  const family = getFamily(slug)!;
  const wood = useWood();
  const shown: Wood = family.variants[wood] ? wood : wood === "red" ? "white" : "red";
  const v = family.variants[shown]!;
  const available = !!family.variants[wood];
  const [i, setI] = useState(0);
  const idx = Math.min(i, v.shots.length - 1);
  const shot = v.shots[idx];
  const category = CATEGORIES.find((c) => c.key === family.category)!;

  return (
    <div className="mx-auto grid max-w-[1500px] gap-12 px-5 pt-28 md:px-10 md:pt-32 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[3rem] bg-paper-2 lg:sticky lg:top-28">
          <AnimatePresence initial={false}>
            <motion.div
              key={`${shown}-${shot.photo.id}-${idx}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: available ? 1 : 0.55, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="absolute inset-0"
            >
              <Photo p={shot.photo} tone={shot.tone} priority sizes="(min-width: 1024px) 58vw, 100vw" />
            </motion.div>
          </AnimatePresence>
          {v.shots.length > 1 && (
            <div className="absolute bottom-6 left-6 flex gap-2 rounded-full bg-paper/80 p-1.5 backdrop-blur-xl">
              {v.shots.map((s, n) => (
                <button
                  key={s.photo.id + n}
                  type="button"
                  onClick={() => setI(n)}
                  aria-label={`Photograph ${n + 1}`}
                  aria-pressed={n === idx}
                  className={`relative size-12 overflow-hidden rounded-full transition-[box-shadow,opacity] ${n === idx ? "opacity-100 ring-2 ring-ink ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100"}`}
                >
                  <Photo p={s.photo} tone={s.tone} sizes="56px" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 lg:pt-10">
        <nav className="flex gap-2 text-[14px] text-ink-3">
          <Link href="/maison/shop" className="hover:text-ink">
            Collection
          </Link>
          <span aria-hidden>/</span>
          <Link href={`/maison/shop?c=${category.key}`} className="hover:text-ink">
            {category.label}
          </Link>
        </nav>

        <h1 className="mt-6 font-display text-[clamp(2.8rem,5vw,4.8rem)] font-[350] leading-[0.95] tracking-[-0.03em]">{family.name}</h1>
        {family.edition && <p className="mt-3 inline-block rounded-full bg-accent-soft px-3 py-1 text-[13px] text-accent">{family.edition}</p>}

        <p className="mt-6 font-display text-[30px] tabular-nums tracking-[-0.01em]">{available ? formatINR(v.price) : "—"}</p>
        <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink-2">{family.summary}</p>

        <div className="mt-8">
          <p className="mb-3 text-[14px] font-medium">Wood</p>
          <div className="flex gap-2">
            {(["red", "white"] as Wood[]).map((w) => {
              const has = !!family.variants[w];
              const on = wood === w;
              return (
                <button
                  key={w}
                  type="button"
                  disabled={!has}
                  onClick={() => !on && switchWood(w)}
                  aria-pressed={on}
                  className={`flex h-14 flex-1 items-center gap-3 rounded-full border pl-2 pr-4 text-left transition-colors ${
                    on ? "border-ink" : "border-hair hover:border-ink/30"
                  } ${has ? "" : "cursor-not-allowed opacity-40"}`}
                >
                  <span className="relative size-10 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]">
                    <span className={`absolute inset-0 ${w === "red" ? "ring-red" : "ring-white"}`} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[14px]">{WOOD_NAMES[w].common}</span>
                    <span className="block text-[12px] text-ink-3">
                      {has ? formatINR(family.variants[w]!.price) : "Not made in this wood"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <AddToBag slug={family.slug} />
        </div>
        <p className="mt-4 flex items-center gap-2 text-[13px] text-ink-3">
          <WoodDisc className="size-4" />
          Arrives with its batch record. Delivery across India is complimentary.
        </p>

        <div className="mt-12 border-t border-hair">
          <Accordion title="About this piece" open>
            <div className="space-y-3">
              {family.story.map((s) => (
                <p key={s}>{s}</p>
              ))}
              <p>{v.note}</p>
            </div>
          </Accordion>
          <Accordion title="Details">
            <dl>
              <div className="grid grid-cols-[8rem_1fr] gap-4 py-1.5">
                <dt className="text-ink-3">Material</dt>
                <dd>
                  {WOOD_NAMES[shown].common} heartwood, <span className="font-display italic">{WOOD_NAMES[shown].latin}</span>
                </dd>
              </div>
              {family.details.map((d) => (
                <div key={d.label} className="grid grid-cols-[8rem_1fr] gap-4 py-1.5">
                  <dt className="text-ink-3">{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          </Accordion>
          <Accordion title="Care">
            <p>
              Keep dry and out of direct sun. Wipe with a soft cloth. A drop of natural oil once a season keeps the surface
              alive. Sandalwood changes with handling; that is intended.
            </p>
          </Accordion>
          <Accordion title="Delivery and returns">
            <p>
              Complimentary across India, dispatched within 3 to 5 working days. Unused pieces can be returned within 14
              days in their original packaging. Numbered editions are final.
            </p>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  const [on, setOn] = useState(open);
  return (
    <div className="border-b border-hair">
      <button type="button" onClick={() => setOn((o) => !o)} aria-expanded={on} className="flex w-full items-center justify-between py-5 text-left text-[16px]">
        {title}
        <span className="relative grid size-8 place-items-center rounded-full border border-hair">
          <span className="absolute h-px w-3 bg-ink" />
          <motion.span className="absolute h-3 w-px bg-ink" animate={{ scaleY: on ? 0 : 1 }} transition={{ duration: 0.3 }} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {on && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-[15px] leading-relaxed text-ink-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
