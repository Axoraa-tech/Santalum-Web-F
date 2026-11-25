"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { bag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct, type CategoryId, type Product } from "@/lib/shop/products";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import { Field } from "../forms";
import { IconArrow } from "../Icons";
import { shotOf, ShotPhoto } from "../shots";
import { EASE, productHref, sheet, shopHref } from "../store";

const COPY: Record<Wood, { lines: [string, string]; note: string; slugs: string[]; cat: CategoryId; all: string; photo: PhotoRef; circleHint: string }> = {
  red: {
    lines: ["A gift", "with weight"],
    note: "For a team, the desk set comes in tens with room for a company card. Put the number and the date in your gift note and we write back before anything is packed.",
    slugs: ["r-mala-box", "r-desk-set", "r-presentation-box"],
    cat: "gifting",
    all: "All red sandalwood gifting",
    photo: PHOTOS.chipsRed,
    circleHint: "Letters when a batch is turned",
  },
  white: {
    lines: ["A gift that", "fills the room"],
    note: "For a wedding, trays are packed by hand from ten, with names on the cards. Put the number and the date in your gift note and we write back before anything is packed.",
    slugs: ["w-morning-ritual", "w-boxed-oil", "w-wedding-tray"],
    cat: "w-gifting",
    all: "All white sandalwood gifting",
    photo: PHOTOS.diyaHands,
    circleHint: "Letters when a batch is distilled",
  },
};

const TILT = [-4, 1.5, 5];

/** Card 7: gifts of the current wood you can add in one go, and the Santalum Circle sign-up. */
export function Gifting() {
  return <W red={<Body wood="red" />} white={<Body wood="white" />} />;
}

function Body({ wood }: { wood: Wood }) {
  const k = COPY[wood];
  const gifts = k.slugs.map((s) => getProduct(s)).filter((p): p is Product => !!p);

  return (
    <div className="grid min-h-[inherit] gap-8 px-5 pb-[150px] pt-6 md:px-8 md:pt-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[84px] lg:pt-9">
      <div className="flex flex-col lg:col-span-7">
        <h2 className="d1 text-[clamp(3.2rem,min(7.2vw,12vh),7.4rem)]">
          {k.lines[0]}
          <br />
          {k.lines[1]}
        </h2>
        <div className="mt-5 grid gap-4 text-[16px] leading-relaxed text-(--s7-body) md:grid-cols-2 md:gap-6">
          <p>{CONTENT[wood].gifting.text}</p>
          <p className="text-(--s7-muted)">{k.note}</p>
        </div>

        <ul className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-auto">
          {gifts.map((p, i) => (
            <GiftCard key={p.slug} product={p} tilt={TILT[i]} />
          ))}
        </ul>
        <Link
          href={shopHref(k.cat)}
          className="group mt-5 inline-flex items-center gap-2 self-start text-[15px] font-medium underline decoration-(--s7-ink)/25 underline-offset-[6px] transition hover:decoration-(--s7-accent)"
        >
          {k.all}
          <IconArrow width={16} height={16} className="transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="lg:col-span-5">
        <Circle wood={wood} />
      </div>
    </div>
  );
}

function GiftCard({ product: p, tilt }: { product: Product; tilt: number }) {
  const [added, setAdded] = useState(false);
  const [a, b] = [shotOf(p), shotOf(p, 1)];

  const add = () => {
    bag.add(p.slug);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
    sheet.open();
  };

  return (
    <motion.li
      initial={false}
      animate={{ rotate: tilt, y: 0 }}
      whileHover={{ rotate: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative flex-1 rounded-[28px] bg-(--s7-clay) p-3 shadow-[0_24px_40px_-28px_rgba(27,23,18,0.55)] ring-1 ring-(--s7-ink)/6 focus-within:z-10 hover:z-10"
    >
      <Link href={productHref(p.slug)} aria-label={p.name} className="relative block h-32 md:h-36 lg:h-[clamp(8.5rem,22vh,13rem)]">
        <span className="absolute left-0 top-0 h-full w-[62%] overflow-hidden rounded-[20px]">
          <ShotPhoto shot={a} sizes="200px" />
        </span>
        <span className="absolute bottom-[-10px] right-0 aspect-square h-[80%] overflow-hidden rounded-full ring-4 ring-(--s7-clay)">
          <ShotPhoto shot={b} sizes="120px" />
        </span>
      </Link>
      <p className="d3 mt-4 text-[20px]">{p.name}</p>
      <p className="mt-1 text-[14px] leading-snug text-(--s7-muted)">{p.short}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="num text-[15px] font-medium">{formatINR(p.price)}</span>
        <button
          type="button"
          onClick={add}
          className="h-9 rounded-full bg-(--s7-ink) px-3.5 text-[13px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-95"
        >
          {added ? "Added" : "Add to bag"}
        </button>
      </div>
    </motion.li>
  );
}

function Circle({ wood }: { wood: Wood }) {
  const [done, setDone] = useState<string | null>(null);
  const [keep, setKeep] = useState<"red" | "white" | "both">(wood);
  const c = CONTENT[wood].circle;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setDone(email);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-(--s7-sand) md:rounded-[34px]">
      <div className="relative h-36 shrink-0 md:h-44">
        <Photo p={COPY[wood].photo} sizes="(min-width: 1024px) 36vw, 100vw" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[12.5px] text-[#1B1712]">{COPY[wood].circleHint}</span>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-7">
        <h3 className="d2 text-[clamp(2.2rem,3.4vw,3.2rem)]">{c.title}</h3>
        <p className="mt-3 text-[16px] leading-relaxed text-(--s7-body)">{c.text}</p>
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mt-6 rounded-[22px] bg-(--s7-surface) p-5"
              role="status"
            >
              <p className="d3 text-[22px]">You are in the Circle.</p>
              <p className="mt-1 text-[15px] text-(--s7-muted)">The next letter goes to {done}.</p>
              <button
                type="button"
                onClick={() => setDone(null)}
                className="mt-3 text-[14px] font-medium underline decoration-(--s7-ink)/30 underline-offset-4 transition hover:decoration-(--s7-ink)"
              >
                Use another email
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mt-5 grid gap-4"
            >
              <Field label="Email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
              <fieldset>
                <legend className="text-[14px] font-medium">Letters about</legend>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-full bg-(--s7-surface) p-1">
                  {(["red", "white", "both"] as const).map((v) => (
                    <label
                      key={v}
                      className={`relative grid h-10 cursor-pointer place-items-center rounded-full text-[14px] font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-(--s7-accent) ${
                        keep === v ? "bg-(--s7-ink) text-(--s7-page)" : "text-(--s7-muted) hover:text-(--s7-ink)"
                      }`}
                    >
                      <input type="radio" name="keep" value={v} checked={keep === v} onChange={() => setKeep(v)} className="sr-only" />
                      {v === "both" ? "Both" : v === "red" ? "Red" : "White"}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button
                type="submit"
                className="h-12 rounded-full bg-(--s7-ink) text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-[0.98]"
              >
                Join the Circle
              </button>
              <p className="text-[13px] text-(--s7-muted)">Preview: sign-up is not connected yet, so nothing is sent.</p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
