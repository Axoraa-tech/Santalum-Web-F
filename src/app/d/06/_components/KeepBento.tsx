"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { cx } from "./data";
import { PieceTile } from "./PieceTile";
import { views } from "./store";
import { Corner, IconArrow } from "./ui";

const pad = (n: number) => String(n).padStart(2, "0");

const GIFT: Record<Wood, { slug: string; photo: typeof PHOTOS.giftLinen; line: string; corp: [string, string] }> = {
  red: {
    slug: "r-presentation-box",
    photo: PHOTOS.giftLinen,
    line: "Hinged boxes, desk sets for teams, and a casket carved nine times a year. Packed in linen with a written note if you want one.",
    corp: ["Desk sets for teams", "From ten sets. Tell us how many, and by when."],
  },
  white: {
    slug: "w-morning-ritual",
    photo: PHOTOS.diyaHands,
    line: "Ritual sets, oil in a turned box, and trays packed by hand for weddings, housewarmings and pujas.",
    corp: ["Wedding trays", "From ten trays. Tell us how many, and by when."],
  },
};

/** The edition (Vault or Reserve), gifting and the Santalum Circle, for one wood. */
export function KeepBento({ wood }: { wood: Wood }) {
  const ed = getProduct(CONTENT[wood].edition.productSlug)!;
  const gift = getProduct(GIFT[wood].slug)!;
  return (
    <div className={cx(s.bento, s.keep)}>
      <Edition wood={wood} />
      <PieceTile
        product={ed}
        id={`keep-cf-${wood}`}
        style={{ gridArea: "cf" }}
        className="min-h-[320px]"
        sizes="(min-width:1024px) 40vw, 100vw"
        label={`${ed.edition!.left} of ${ed.edition!.size} left`}
      />
      <Gift wood={wood} />
      <PieceTile product={gift} id={`keep-bx-${wood}`} style={{ gridArea: "bx" }} className="min-h-[220px]" sizes="(min-width:1024px) 25vw, 50vw" />
      <Corporate wood={wood} />
      <Circle wood={wood} />
    </div>
  );
}

/**
 * The numbered edition. Red: 21 Vault cuffs. White: 50 Reserve vials. Numbers already placed are
 * shown faint; the ones still to be made (or still in the cellar) are solid.
 */
function Edition({ wood }: { wood: Wood }) {
  const c = CONTENT[wood].edition;
  const p = getProduct(c.productSlug)!;
  const size = p.edition!.size;
  const left = p.edition!.left;
  const placed = size - left;
  const [n, setN] = useState<number | null>(null);
  const id = `keep-vt-${wood}`;
  const thing = wood === "red" ? "Cuff" : "Vial";
  const openPiece = () => views.open({ kind: "product", slug: p.slug, from: `keep-cf-${wood}`, img: true });

  return (
    <motion.div layoutId={id} style={{ gridArea: "vt", borderRadius: 28 }} className={cx(s.tile, s.t2)}>
      <div className="grid h-full gap-8 p-6 sm:p-8 @min-[640px]:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="flex flex-col">
          <h2 className={cx(s.display, "max-w-[8ch] text-[clamp(40px,8.4cqw,88px)]")}>{c.name}</h2>
          <p className={cx(s.muted, "mt-5 max-w-[36ch] text-[17px] leading-[1.5]")}>{c.text}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-7">
            <button type="button" className={s.btn} onClick={openPiece}>
              {wood === "red" ? "See the cuff" : "See the oil"}, {formatINR(p.price)}
            </button>
            <button type="button" className={cx(s.ghost, s.onWhite)} onClick={() => views.open({ kind: "story", id: "vault", from: id, img: false })}>
              The story
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className={cx("grid gap-1.5", size > 30 ? "grid-cols-10" : "grid-cols-7")} onMouseLeave={() => setN(null)}>
            {Array.from({ length: size }, (_, i) => {
              const k = i + 1;
              const on = n === k;
              const done = k <= placed;
              return (
                <button
                  key={k}
                  type="button"
                  onMouseEnter={() => setN(k)}
                  onFocus={() => setN(k)}
                  onBlur={() => setN(null)}
                  onClick={openPiece}
                  aria-label={`${thing} ${k} of ${size}, ${done ? "placed" : "still available"}`}
                  className={cx(
                    s.mono,
                    "grid aspect-square w-full place-items-center rounded-full transition-[background-color,color,scale,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-90",
                    size > 30 ? "text-[8.5px]" : "text-[10px]",
                    on
                      ? "scale-110 bg-[var(--b-ink)] text-white"
                      : done
                        ? "bg-transparent text-[var(--b-ink)]/30 shadow-[inset_0_0_0_1px_var(--b-line)] hover:text-[var(--b-ink)]"
                        : "bg-[var(--b-tile)] text-[var(--b-ink)] shadow-[inset_0_0_0_1px_var(--b-line)]",
                  )}
                >
                  {pad(k)}
                </button>
              );
            })}
          </div>
          <div className="min-h-[92px] w-full rounded-[20px] bg-[var(--b-tile)] p-4" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={n ?? 0} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                {n ? (
                  <div className="flex items-center gap-4">
                    <p className={cx(s.monoWide, "text-[40px] leading-none text-accent")}>{pad(n)}</p>
                    <div>
                      <p className="text-[15px] font-medium">
                        {thing} {n} of {size}
                      </p>
                      <p className={cx(s.mono, s.muted, "mt-0.5 text-[10.5px] leading-[1.5]")}>
                        {n <= placed ? "Placed, in the registry" : wood === "red" ? "Still to be turned, to your measure" : "Still in the cellar"}
                        <br />
                        {formatINR(p.price)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <p className={cx(s.monoWide, "text-[40px] leading-none")}>{left}</p>
                    <p className={cx(s.muted, "text-[14px] leading-[1.4]")}>
                      {wood === "red"
                        ? `of ${size} cuffs are left. When the twenty-first is made, the edition closes.`
                        : `of ${size} vials are left. When they are gone, the Reserve is closed.`}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Gift({ wood }: { wood: Wood }) {
  const c = CONTENT[wood].gifting;
  const id = `keep-gf-${wood}`;
  return (
    <motion.div layoutId={id} id={`gifting-${wood}`} style={{ gridArea: "gf", borderRadius: 28 }} className={cx(s.tile, s.t2, s.section, s.opener, "min-h-[340px]")}>
      <motion.div layoutId={`${id}-img`} className="absolute inset-0 overflow-hidden" style={{ borderRadius: 28 }}>
        <div className={s.zoom}>
          <Photo p={GIFT[wood].photo} sizes="(min-width:1024px) 42vw, 100vw" />
        </div>
      </motion.div>
      <Corner icon="expand" />
      <button type="button" className={s.hit} onClick={() => views.open({ kind: "story", id: "gifting", from: id, img: true })} aria-label="Read about gifting" />
      <div className="pointer-events-none absolute bottom-2 left-2 z-[3] w-[min(440px,calc(100%-16px))] rounded-[20px] bg-[var(--b-tile)] p-5">
        <h2 className="text-[clamp(24px,6cqw,36px)] font-medium leading-none tracking-[-0.04em]">{c.title}</h2>
        <p className={cx(s.muted, "mt-3 text-[15px] leading-[1.45]")}>{GIFT[wood].line}</p>
      </div>
    </motion.div>
  );
}

function Corporate({ wood }: { wood: Wood }) {
  const id = `keep-co-${wood}`;
  const [title, line] = GIFT[wood].corp;
  return (
    <motion.div layoutId={id} style={{ gridArea: "co", borderRadius: 28 }} className={cx(s.tile, s.dark, s.opener, "group flex items-center justify-between gap-3 p-5")}>
      <div className="min-w-0">
        <p className="text-[17px] font-medium leading-tight tracking-[-0.02em]">{title}</p>
        <p className="mt-1 text-[13px] leading-snug text-white/60">{line}</p>
      </div>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--b-tile)] text-[var(--b-ink)] transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
        <IconArrow size={16} />
      </span>
      <button type="button" className={s.hit} onClick={() => views.open({ kind: "story", id: "gifting", from: id, img: false })} aria-label={`${title}: enquiry`} />
    </motion.div>
  );
}

function Circle({ wood }: { wood: Wood }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const c = CONTENT[wood].circle;
  const inputId = `b6-circle-${wood}`;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(true);
  };
  return (
    <div id={`circle-${wood}`} style={{ gridArea: "ci" }} className={cx(s.tile, s.tint, s.section, "flex min-h-[340px] flex-col p-6 sm:p-7")}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
        {Array.from({ length: 21 }, (_, i) => {
          const a = (i / 21) * Math.PI * 2 - Math.PI / 2;
          return (
            <circle
              key={i}
              cx={Math.round((28 + Math.cos(a) * 22) * 100) / 100}
              cy={Math.round((28 + Math.sin(a) * 22) * 100) / 100}
              r={2.4}
              fill="var(--m-accent)"
              opacity={0.35 + (i % 3) * 0.25}
            />
          );
        })}
        <circle cx="28" cy="28" r="6" fill="var(--b-ink)" />
      </svg>
      <h2 className={cx(s.display, "mt-5 text-[clamp(30px,8cqw,48px)]")}>{c.title}</h2>
      <p className="mt-3 max-w-[40ch] text-[16px] leading-[1.5]">{c.text}</p>
      <div className="mt-auto pt-5">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="done" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[20px] bg-[var(--b-tile)] p-4">
              <p className="text-[16px] font-medium">You are in the Circle.</p>
              <p className={cx(s.muted, "mt-1 break-words text-[13px] leading-[1.45]")}>
                The next letter goes to {email}. Preview: sign-ups are not stored yet.
              </p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -8 }}>
              <label htmlFor={inputId} className={s.label}>
                Email address
              </label>
              <div className="flex gap-2">
                <input
                  id={inputId}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cx(s.field, s.fieldWhite, "min-w-0")}
                  placeholder="you@example.com"
                />
                <button type="submit" className={cx(s.btn, "shrink-0")}>
                  Join
                </button>
              </div>
              <p className={cx(s.muted, "mt-2 text-[12.5px]")}>
                {wood === "red" ? "A few letters a year, when a batch is turned." : "A few letters a year, when a batch is distilled."}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
