"use client";

import { AnimatePresence, motion, useDragControls } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { W, WT } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct, priceOf } from "@/lib/shop/products";
import s from "../styles";
import { AddToTray, EditionLamps, Keep, OptionPicker } from "./Buy";
import { EASE, chapterBy, hhmm, hourOf } from "./data";
import { Field } from "./forms";
import { closeSheet, lockScroll, unlockScroll, useSheet } from "./store";

/** Renders whichever bottom sheet is open. Lives in the layout. */
export function SheetHost() {
  const sheet = useSheet();
  return (
    <AnimatePresence>
      {sheet?.kind === "piece" && (
        <Sheet key="piece" label={`${getProduct(sheet.slug)?.name ?? "Piece"}, ritual card`}>
          <RitualCard key={sheet.slug} slug={sheet.slug} />
        </Sheet>
      )}
      {sheet?.kind === "corporate" && (
        <Sheet key="corporate" label="Corporate gifting">
          <Corporate />
        </Sheet>
      )}
    </AnimatePresence>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** A rounded sheet that rises over the scene. Drag the handle down, press Escape or tap outside to close. */
function Sheet({ label, children }: { label: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const controls = useDragControls();

  useEffect(() => {
    lockScroll();
    panel.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
      if (e.key === "Tab" && panel.current) {
        const els = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[150]">
      <motion.div
        role="presentation"
        className="absolute inset-0 bg-[rgb(42_36_32/0.28)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={closeSheet}
      />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        initial={{ y: "105%" }}
        animate={{ y: 0 }}
        exit={{ y: "105%" }}
        transition={{ type: "spring", stiffness: 240, damping: 34 }}
        drag="y"
        dragListener={false}
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 650) closeSheet();
        }}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92svh] w-full max-w-[1180px] flex-col rounded-t-[2.75rem] bg-[var(--paper)] shadow-[0_-30px_80px_-30px_rgb(42_36_32/0.45)] outline-none lg:w-[calc(100%-48px)]"
      >
        <div
          onPointerDown={(e) => controls.start(e)}
          className="relative flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing"
        >
          <span aria-hidden className="h-1.5 w-12 rounded-full bg-[rgb(42_36_32/0.18)]" />
          <button
            type="button"
            onClick={closeSheet}
            aria-label="Close"
            className="absolute right-4 top-3 grid size-11 place-items-center rounded-full border border-[var(--hair)] transition-colors hover:border-[var(--ink)] active:scale-95 lg:right-6 lg:top-4"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={`${s.panelScroll} min-h-0 flex-1 overflow-y-auto overscroll-contain`} data-lenis-prevent>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- the ritual card: one piece, how it is used at its hour, option, tray ---------- */
function RitualCard({ slug }: { slug: string }) {
  const [shot, setShot] = useState(0);
  const [option, setOption] = useState<string | undefined>(undefined);
  const titleId = useId();
  const p = getProduct(slug);
  if (!p) return null;
  const c = CONTENT[p.wood];
  const hour = hourOf(slug);
  const ch = chapterBy(hour.chapter);
  const i = Math.min(shot, p.shots.length - 1);
  const sh = p.shots[i];
  const twin = p.counterpart ? getProduct(p.counterpart) : undefined;

  return (
    <article aria-labelledby={titleId} className="grid gap-8 px-5 pb-10 pt-2 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:pb-14">
      <div className="lg:col-span-5">
        <div className="relative mx-auto w-[min(100%,26rem)] lg:sticky lg:top-0">
          <div className="relative">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className={`${s.mask} ${s.arch} aspect-[4/5] w-full`}
              >
                <Photo p={sh.photo} tone={sh.tone} sizes="(min-width: 1024px) 420px, 90vw" priority />
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-3 right-3">
              <Keep p={p} />
            </div>
          </div>
          {p.shots.length > 1 && (
            <div className="mt-4 flex justify-center gap-3" role="group" aria-label="Photographs">
              {p.shots.map((x, k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setShot(k)}
                  aria-label={`Photograph ${k + 1} of ${p.shots.length}: ${x.photo.alt}`}
                  aria-pressed={k === i}
                  className={`${s.press} ${s.mask} ${s.circle} size-14 ring-offset-2 ring-offset-[var(--paper)] transition-shadow ${
                    k === i ? "ring-1 ring-[var(--ink)]" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Photo p={x.photo} tone={x.tone} sizes="56px" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-7 lg:pt-4">
        <p className="text-[14px] text-[var(--muted)]">
          <span className={s.tab}>{hhmm(hour.min)}</span>, {ch.name.toLowerCase()}. {ch.theme[p.wood]}
        </p>
        <h2 id={titleId} className={`${s.display} mt-3 text-[clamp(2.6rem,6vw,4.4rem)] leading-[0.95]`}>
          {p.name}
        </h2>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[18px]">
          <span className={s.tab}>{formatINR(priceOf(p, option))}</span>
          <span className="text-[14px] text-[var(--muted)]">
            {c.name}, <i>{c.latin}</i>
          </span>
          {p.badge && <span className="text-[14px] text-[var(--m-accent)]">{p.badge}</span>}
        </p>

        {hour.use && (
          <div className="mt-7 border-l-2 border-[var(--m-accent)] pl-5">
            <h3 className="text-[13px] text-[var(--muted)]">In the ritual</h3>
            <p className={`${s.display} mt-1.5 text-[clamp(1.35rem,2.2vw,1.7rem)] leading-[1.25]`}>{hour.use}</p>
          </div>
        )}

        <p className="mt-6 max-w-[38rem] text-[16px] leading-[1.7]">{p.short}</p>
        <p className="mt-2 max-w-[38rem] text-[16px] leading-[1.7] text-[var(--muted)]">{p.story[0]}</p>

        <EditionLamps p={p} className="mt-7" />

        {p.options && (
          <div className="mt-8">
            <OptionPicker p={p} value={option} onChange={setOption} />
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
          <AddToTray p={p} option={option} />
          <Link href={`/d/09/p/${slug}`} onClick={closeSheet} className={s.link}>
            Open the full page
          </Link>
        </div>
        {twin && (
          <p className="mt-5 text-[15px] text-[var(--muted)]">
            Also in {CONTENT[twin.wood].name.toLowerCase()}:{" "}
            <Link href={`/d/09/p/${twin.slug}`} onClick={closeSheet} className={s.link}>
              {twin.name}
            </Link>
          </p>
        )}

        <dl className="mt-10 grid max-w-[40rem] grid-cols-1 gap-x-8 sm:grid-cols-2">
          {p.details.map((d) => (
            <div key={d.label} className="border-t border-[var(--hair)] py-3">
              <dt className="text-[12px] text-[var(--muted)]">{d.label}</dt>
              <dd className="mt-0.5 text-[15px]">{d.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 max-w-[40rem]">
          <h3 className="text-[13px] text-[var(--muted)]">Care</h3>
          <p className="mt-2 text-[15px] leading-[1.65]">{p.care}</p>
        </div>
      </div>
    </article>
  );
}

/* ---------- corporate gifting: a short enquiry, front-end only ---------- */
function Corporate() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };
  return (
    <div className="grid gap-10 px-5 pb-12 pt-2 sm:px-8 lg:grid-cols-12 lg:px-12">
      <div className="lg:col-span-5">
        <h2 className={`${s.display} text-[clamp(2.6rem,6vw,4.2rem)] leading-[0.95]`}>
          <WT red="For teams and clients" white="For weddings and families" />
        </h2>
        <p className="mt-5 max-w-[30rem] text-[16px] leading-[1.7] text-[var(--muted)]">
          <WT
            red="Desk sets from ten, presentation boxes and the mala box, with room for a company card and engraving if you ask. Tell us the occasion, how many and by when, and we reply with pieces and prices."
            white="Wedding trays from ten, ritual sets and oil in a turned box, packed by hand with names on the card. Tell us the occasion, how many and by when, and we reply with pieces and prices."
          />
        </p>
        <div className="relative mt-8 hidden h-56 lg:block">
          <div className={`${s.mask} ${s.arch} absolute left-0 top-0 h-full w-40`}>
            <W red={<Photo p={PHOTOS.penBox} sizes="160px" />} white={<Photo p={PHOTOS.giftLinen} sizes="160px" />} />
          </div>
          <div className={`${s.mask} ${s.circle} absolute left-32 top-20 size-32`}>
            <W red={<Photo p={PHOTOS.boxRed} sizes="128px" />} white={<Photo p={PHOTOS.diyaHands} sizes="128px" />} />
          </div>
        </div>
      </div>
      <div className="lg:col-span-7">
        <p className="inline-flex items-center gap-3 rounded-full bg-[var(--m-accent-soft)] px-4 py-2 text-[14px]">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-[var(--m-accent)]" />
          Preview: enquiries are not sent yet.
        </p>
        {sent ? (
          <div role="status" className="mt-10">
            <p className={`${s.display} text-[2.2rem] leading-tight`}>Thank you.</p>
            <p className="mt-3 max-w-[30rem] text-[16px] leading-[1.7] text-[var(--muted)]">
              In this preview nothing has been sent. Once enquiries are connected, this note will reach the Maison and we will write back.
            </p>
            <button type="button" onClick={closeSheet} className={`${s.ghost} mt-8`}>
              Back to the day
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            <Field label="Your name" name="name" autoComplete="name" required />
            <Field label="Company or occasion" name="org" autoComplete="organization" />
            <Field label="Email" name="email" type="email" autoComplete="email" required />
            <Field label="Phone (optional)" name="phone" type="tel" autoComplete="tel" />
            <Field label="How many pieces" name="qty" type="number" min={1} inputMode="numeric" required />
            <Field label="Needed by" name="date" type="date" />
            <label className={`${s.field} sm:col-span-2`}>
              <span className={s.fieldLabel}>Anything else</span>
              <textarea name="note" rows={3} maxLength={600} />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" className={s.btn}>
                Send the enquiry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
