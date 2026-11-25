"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { priceLabel, productsFor } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import k from "../k";
import { AddOrChoose, Field } from "./bits";
import { fv, splitName } from "./lib";

type Part = { t: string; from: [number, number]; to: [number, number]; italic?: boolean; grey?: boolean } | { p: PhotoRef };

/** Red gives weight, white fills the room: each wood has its own sentence, and its axes settle as you scroll. */
const SENTENCE: Record<Wood, Part[]> = {
  red: [
    { t: "Give", from: [50, 300], to: [150, 880] },
    { p: PHOTOS.boxRed },
    { t: "something", from: [150, 200], to: [58, 320], italic: true, grey: true },
    { t: "that", from: [150, 200], to: [62, 420] },
    { p: PHOTOS.penBox },
    { t: "remains", from: [50, 300], to: [128, 880] },
  ],
  white: [
    { t: "A gift", from: [50, 300], to: [150, 880] },
    { p: PHOTOS.giftLinen },
    { t: "that fills", from: [150, 200], to: [58, 320], italic: true, grey: true },
    { t: "the", from: [150, 200], to: [62, 420] },
    { p: PHOTOS.diyaHands },
    { t: "room", from: [50, 300], to: [150, 880] },
  ],
};

const GIFT_CAT: Record<Wood, string> = { red: "gifting", white: "w-gifting" };

const COPY: Record<Wood, { corp: string; ask: string; fig: PhotoRef; caption: string; side: PhotoRef }> = {
  red: {
    corp: "Desk sets for teams, boxes for clients",
    ask: "Tell us how many pieces, for when, and roughly the budget. Desk sets start at ten; every piece still leaves with its own batch record.",
    fig: PHOTOS.boxes,
    caption: "For Diwali, for teams, and for the days that matter.",
    side: PHOTOS.cufflinks,
  },
  white: {
    corp: "Trays for weddings, sets for teams",
    ask: "Tell us how many trays or sets, for when, and roughly the budget. Wedding trays start at ten; every bottle still carries its lot.",
    fig: PHOTOS.whiteRitual,
    caption: "For pujas, housewarmings and weddings.",
    side: PHOTOS.oilStand,
  },
};

function Word({ w, p }: { w: Extract<Part, { t: string }>; p: MotionValue<number> }) {
  const fvs = useTransform(p, (v) => fv(w.from[0] + (w.to[0] - w.from[0]) * v, w.from[1] + (w.to[1] - w.from[1]) * v));
  return (
    <motion.span style={{ fontVariationSettings: fvs }} className={`${w.italic ? "italic" : ""} ${w.grey ? "text-[var(--k10-grey)]" : ""}`}>
      {w.t}
    </motion.span>
  );
}

/** Gifting: the wood's gifting line settles its axes as you scroll; its gift pieces and a corporate enquiry below. */
export function Gifting() {
  const secRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: secRef, offset: ["start end", "start 0.2"] });
  const p = useTransform(scrollYProgress, [0, 1], [0, 1], { clamp: true });

  const sentence = (w: Wood) => (
    <p
      aria-label={SENTENCE[w].map((x) => ("t" in x ? x.t : "")).filter(Boolean).join(" ")}
      className={`${k.disp} mt-5 flex flex-wrap items-center gap-x-[0.16em] gap-y-[0.06em] text-[14vw] leading-[0.86] md:text-[length:clamp(64px,10.4vw,186px)]`}
    >
      {SENTENCE[w].map((x, i) =>
        "t" in x ? (
          <Word key={i} w={x} p={p} />
        ) : (
          <span key={i} aria-hidden className="relative inline-block h-[0.74em] w-[1.5em] overflow-hidden rounded-full bg-[var(--k10-stone)]">
            <Photo p={x.p} sizes="320px" />
          </span>
        ),
      )}
    </p>
  );

  return (
    <section id="gifting" ref={secRef} aria-labelledby="k10-gifting" className="relative scroll-mt-12 border-t border-[var(--k10-line)] pb-[7vw] pt-10 md:pt-14">
      <div className={k.gut}>
        <h2 id="k10-gifting" className={`${k.mono} text-[var(--k10-grey)]`}>
          <WT red="Gifting, in red sandalwood" white="Gifting, in white sandalwood" />
        </h2>
        <W red={sentence("red")} white={sentence("white")} />
      </div>

      <div className={`${k.gut} mt-12 grid grid-cols-1 gap-14 md:mt-16 md:grid-cols-12 md:gap-8`}>
        <div className="md:col-span-7">
          <W red={<GiftList wood="red" />} white={<GiftList wood="white" />} />
        </div>
        <div className="md:col-span-5 md:pl-6 lg:pl-12">
          <W red={<Enquiry wood="red" />} white={<Enquiry wood="white" />} />
        </div>
      </div>
    </section>
  );
}

function GiftList({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  const copy = COPY[wood];
  const gifts = productsFor(wood).filter((x) => x.category === GIFT_CAT[wood]);
  return (
    <>
      <p className={`${k.disp} whitespace-normal text-[length:clamp(28px,2.8vw,44px)] leading-[0.95] [font-variation-settings:'wdth'_78,'wght'_700]`}>{c.gifting.title}</p>
      <p className={`${k.monoL} mt-4 max-w-[56ch]`}>{c.gifting.text}</p>
      <ul className="mt-8 border-t border-[var(--k10-ink)]">
        {gifts.map((g) => (
          <li key={g.slug} className="group grid grid-cols-1 gap-x-6 gap-y-3 border-b border-[var(--k10-line)] py-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="min-w-0">
              <Link
                href={`/d/10/p/${g.slug}`}
                className={`${k.disp} block whitespace-normal text-[length:clamp(34px,4.2vw,66px)] leading-[0.86] transition-[font-variation-settings] duration-700 [font-variation-settings:'wdth'_58,'wght'_760] hover:text-[var(--k10-accent)] group-hover:[font-variation-settings:'wdth'_112,'wght'_820]`}
              >
                {splitName(g.name).head}
              </Link>
              <p className={`${k.mono} mt-2 text-[var(--k10-grey)]`}>{g.short}</p>
            </div>
            <div className="flex items-center gap-4 sm:justify-end">
              <p className={`${k.monoL} tabular-nums`}>{priceLabel(g)}</p>
              <AddOrChoose p={g} />
            </div>
          </li>
        ))}
      </ul>
      <figure className="mt-10 grid grid-cols-[auto_1fr] items-end gap-5">
        <figcaption className={`${k.mono} max-w-[18ch] pb-2 text-[var(--k10-grey)]`}>{copy.caption}</figcaption>
        <div className="relative aspect-[16/6] overflow-hidden rounded-full bg-[var(--k10-paper)]">
          <Photo p={copy.fig} sizes="(min-width: 768px) 45vw, 70vw" />
        </div>
      </figure>
    </>
  );
}

function Enquiry({ wood }: { wood: Wood }) {
  const copy = COPY[wood];
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };
  return (
    <>
      <div className="grid grid-cols-[1fr_auto] items-end gap-6">
        <p className={`${k.disp} whitespace-normal text-[length:clamp(34px,3.6vw,58px)] leading-[0.9] [font-variation-settings:'wdth'_70,'wght'_780]`}>{copy.corp}</p>
        <div className="relative h-[120px] w-[84px] overflow-hidden rounded-full md:h-[150px] md:w-[104px]">
          <Photo p={copy.side} sizes="104px" />
        </div>
      </div>
      {sent ? (
        <div role="status" className="mt-8 border-t border-[var(--k10-ink)] pt-6">
          <p className={`${k.disp} text-[length:clamp(40px,4.4vw,72px)] leading-[0.86] [font-variation-settings:'wdth'_130,'wght'_840]`}>Noted.</p>
          <p className={`${k.monoL} mt-4`}>
            Preview: corporate enquiries are not connected yet, so nothing was sent. When they are, the Maison will reply by email.
          </p>
          <button type="button" onClick={() => setSent(false)} className={`${k.mono} ${k.link} mt-4`}>
            Write another
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-6 border-t border-[var(--k10-ink)] pt-6">
          <p className={k.monoL}>{copy.ask}</p>
          <Field small label="Your name" name="name" autoComplete="name" required />
          <Field small label="Organisation" name="org" autoComplete="organization" />
          <Field small label="Email" name="email" type="email" autoComplete="email" required />
          <Field small label={wood === "red" ? "Pieces" : "Trays or sets"} name="pieces" type="number" min={1} inputMode="numeric" required />
          <NeededBy wood={wood} />
          <button type="submit" className={`${k.btn} w-full`}>
            <span className={k.btnLabel}>Send the enquiry</span>
          </button>
        </form>
      )}
    </>
  );
}

const MONTH = new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "Asia/Kolkata" });
const MONTH_LONG = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

/** This month and the five after it, from the visitor's clock (so only after hydration). */
function nextMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 15);
    const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const newYear = i > 0 && d.getMonth() === 0;
    return { id, label: MONTH.format(d), long: MONTH_LONG.format(d), note: newYear ? String(d.getFullYear()) : "" };
  });
}

/**
 * "Needed by" as the next six months set as words: the chosen month stretches wide, the rest stay condensed,
 * the same way the wood toggle and the tabs choose. No calendar: the Maison plans gifting by the month.
 */
function NeededBy({ wood }: { wood: Wood }) {
  const hydrated = useHydrated();
  const months = useMemo(() => (hydrated ? nextMonths() : []), [hydrated]);
  const [v, setV] = useState("");
  const chosen = months.find((m) => m.id === v);
  return (
    <fieldset>
      <legend className={`${k.mono} text-[var(--k10-grey)]`}>Needed by</legend>
      <input type="hidden" name="date" value={v} />
      <div className="mt-1 flex min-h-[1.2em] flex-wrap items-baseline gap-x-[0.36em] gap-y-1 border-b-[1.5px] border-[var(--k10-ink)] pb-2 text-[length:clamp(26px,2.6vw,40px)]">
        {months.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={v === m.id}
            aria-label={m.long}
            onClick={() => setV(v === m.id ? "" : m.id)}
            className={`${k.tab} rounded-sm`}
          >
            {m.label}
            {m.note && <span className={`${k.mono} ml-1 align-top text-[var(--k10-grey)]`}>{m.note}</span>}
          </button>
        ))}
      </div>
      <p className={`${k.mono} mt-2 text-[var(--k10-grey)]`} aria-live="polite">
        {chosen
          ? `By ${chosen.long}. The reply will say whether the ${wood === "red" ? "pieces" : "trays"} can be ready in time.`
          : "Choose the month, or leave it if the date is not fixed yet."}
      </p>
    </fieldset>
  );
}
