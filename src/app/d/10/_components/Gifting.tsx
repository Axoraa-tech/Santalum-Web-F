"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { useWood } from "@/lib/wood";
import k from "../k";
import { announceAdded, fv, splitName } from "./lib";

const SETS = [
  { name: "The box and the mala", slugs: ["presentation-box", "japa-mala"], line: "A japa mala set in the hinged box, its record in the certificate drawer." },
  { name: "The box and the oil", slugs: ["presentation-box", "heartwood-oil"], line: "A sealed vial of heartwood oil, boxed with its batch record." },
  { name: "The box and the powder", slugs: ["presentation-box", "heartwood-powder"], line: "A jar of heartwood powder in the box, for tilak and paste." },
  { name: "Cufflinks and a fob", slugs: ["cufflinks", "key-fob"], line: "A pair for the cuffs and one for the keys, in the same wood." },
];

type Part = { t: string; from: [number, number]; to: [number, number]; italic?: boolean; grey?: boolean } | { p: PhotoRef };

const SENTENCE: Part[] = [
  { t: "Give", from: [50, 300], to: [150, 880] },
  { p: PHOTOS.giftLinen },
  { t: "something", from: [150, 200], to: [58, 320], italic: true, grey: true },
  { t: "that", from: [150, 200], to: [62, 420] },
  { p: PHOTOS.boxCarved },
  { t: "remains", from: [50, 300], to: [128, 880] },
];

function Word({ w, p }: { w: Extract<Part, { t: string }>; p: MotionValue<number> }) {
  const fvs = useTransform(p, (v) => fv(w.from[0] + (w.to[0] - w.from[0]) * v, w.from[1] + (w.to[1] - w.from[1]) * v));
  return (
    <motion.span style={{ fontVariationSettings: fvs }} className={`${w.italic ? "italic" : ""} ${w.grey ? "text-[var(--k-grey)]" : ""}`}>
      {w.t}
    </motion.span>
  );
}

/** Gifting: the line "Give something that remains" settles its axes as you scroll; boxed sets and a corporate enquiry below. */
export function Gifting() {
  const wood = useWood();
  const secRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: secRef, offset: ["start end", "start 0.2"] });
  const p = useTransform(scrollYProgress, [0, 1], [0, 1], { clamp: true });
  const [sent, setSent] = useState(false);

  const sets = SETS.map((s) => {
    const parts = s.slugs.map((slug) => {
      const f = getFamily(slug)!;
      return { f, v: f.variants[wood] };
    });
    return { ...s, parts, ok: parts.every((x) => x.v), total: parts.reduce((t, x) => t + (x.v?.price ?? 0), 0) };
  }).filter((s) => s.ok);

  const addSet = (s: (typeof sets)[number]) => {
    s.parts.forEach(({ f }) => bag.add(f.slug, wood));
    announceAdded(s.name.toLowerCase(), wood);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="gifting" ref={secRef} aria-labelledby="k10-gifting" className="relative scroll-mt-12 border-t border-[var(--k-line)] pb-[7vw] pt-10 md:pt-14">
      <div className={k.gut}>
        <h2 id="k10-gifting" className={`${k.mono} text-[var(--k-grey)]`}>
          Gifting
        </h2>
        <p aria-label="Give something that remains" className={`${k.disp} mt-5 flex flex-wrap items-center gap-x-[0.16em] gap-y-[0.06em] text-[14vw] leading-[0.86] md:text-[length:clamp(64px,10.4vw,186px)]`}>
          {SENTENCE.map((w, i) =>
            "t" in w ? (
              <Word key={i} w={w} p={p} />
            ) : (
              <span key={i} aria-hidden className="relative inline-block h-[0.74em] w-[1.5em] overflow-hidden rounded-full bg-[var(--k-stone)]">
                <Photo p={w.p} sizes="320px" />
              </span>
            ),
          )}
        </p>
      </div>

      <div className={`${k.gut} mt-12 grid grid-cols-1 gap-14 md:mt-16 md:grid-cols-12 md:gap-8`}>
        <div className="md:col-span-7">
          <p className={`${k.monoL} max-w-[52ch]`}>
            The presentation box is the gift as much as what goes in it: dovetailed, hand-finished and lined in raw cotton, with a drawer
            for the certificate. Choose it empty, or filled.
          </p>
          <ul className="mt-8 border-t border-[var(--k-ink)]">
            {sets.map((s) => (
              <li key={s.name} className="group grid grid-cols-1 gap-x-6 gap-y-2 border-b border-[var(--k-line)] py-5 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className={`${k.disp} text-[length:clamp(34px,4.2vw,66px)] leading-[0.86] transition-[font-variation-settings] duration-700 [font-variation-settings:'wdth'_58,'wght'_760] group-hover:[font-variation-settings:'wdth'_118,'wght'_820]`}>
                    {s.name}
                  </p>
                  <p className={`${k.mono} mt-2 text-[var(--k-grey)]`}>
                    {s.parts.map(({ f, v }) => `${splitName(f.name).head} ${formatINR(v!.price)}`).join(", ")}. {s.line}
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:justify-end">
                  <p className={`${k.monoL} tabular-nums`}>{formatINR(s.total)}</p>
                  <button type="button" onClick={() => addSet(s)} className={k.chip}>
                    Add both to bag
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <figure className="mt-10 grid grid-cols-[auto_1fr] items-end gap-5">
            <figcaption className={`${k.mono} max-w-[18ch] pb-2 text-[var(--k-grey)]`}>For Diwali, weddings, and the days that matter.</figcaption>
            <div className="relative aspect-[16/6] overflow-hidden rounded-full bg-[var(--k-stone)]">
              <Photo p={PHOTOS.diyaHands} sizes="(min-width: 768px) 45vw, 70vw" />
            </div>
          </figure>
        </div>

        <div className="md:col-span-5 md:pl-6 lg:pl-12">
          <div className="grid grid-cols-[1fr_auto] items-end gap-6">
            <p className={`${k.disp} whitespace-normal text-[length:clamp(34px,3.6vw,58px)] leading-[0.9] [font-variation-settings:'wdth'_70,'wght'_780]`}>
              For teams, clients and occasions
            </p>
            <div className="relative h-[120px] w-[84px] overflow-hidden rounded-full md:h-[150px] md:w-[104px]">
              <Photo p={PHOTOS.boxes} sizes="104px" />
            </div>
          </div>
          {sent ? (
            <div role="status" className="mt-8 border-t border-[var(--k-ink)] pt-6">
              <p className={`${k.disp} text-[length:clamp(40px,4.4vw,72px)] leading-[0.86] [font-variation-settings:'wdth'_130,'wght'_840]`}>Noted.</p>
              <p className={`${k.monoL} mt-4`}>
                Preview: corporate enquiries are not connected yet, so nothing was sent. When they are, the Maison will reply by email.
              </p>
              <button type="button" onClick={() => setSent(false)} className={`${k.mono} ${k.link} mt-4`}>
                Write another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-6 border-t border-[var(--k-ink)] pt-6">
              <p className={k.monoL}>Tell us how many pieces, for when, and roughly the budget. Every piece still leaves with its own record.</p>
              <Field label="Your name" name="name" autoComplete="name" required />
              <Field label="Organisation" name="org" autoComplete="organization" />
              <Field label="Email" name="email" type="email" autoComplete="email" required />
              <div className="grid grid-cols-2 gap-6">
                <Field label="Pieces" name="pieces" type="number" min={1} inputMode="numeric" required />
                <Field label="Needed by" name="date" type="date" />
              </div>
              <button type="submit" className={`${k.btn} w-full`}>
                <span className={k.btnLabel}>Send the enquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, ...rest }: { label: string; name: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = `k10-g-${name}`;
  return (
    <div>
      <label htmlFor={id} className={`${k.mono} text-[var(--k-grey)]`}>
        {label}
      </label>
      <input id={id} name={name} className={`${k.field} !text-[length:clamp(22px,2.2vw,32px)]`} {...rest} />
    </div>
  );
}
