"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import type { Wood } from "@/lib/wood";
import { Mark } from "./Mark";
import { PinGlyph } from "./Pins";
import { s } from "./styles";

/**
 * Pieces used on the board, in the list view and on the other pages. They are sized in em,
 * so the board sets a large font-size (world px) and the pages a normal one.
 */

/** W for photos: each wood's image gets its own positioned box (next/image fill needs one). */
export function WPhoto({ red, white }: { red: ReactNode; white: ReactNode }) {
  return <W red={<div className="absolute inset-0">{red}</div>} white={<div className="absolute inset-0">{white}</div>} />;
}

/** The example provenance entry for one wood: a batch (red) or a lot (white). */
export function RecordCard({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  const red = wood === "red";
  return (
    <div className="relative border border-(--a-line-2) bg-(--a-card) p-[1.3em] shadow-[0_1.2em_2.6em_-1.8em_rgba(31,29,26,0.5)]">
      <div className="flex items-start justify-between gap-[1em] border-b border-(--a-line-2) pb-[0.8em]">
        <div>
          <p className={`${s.serif} text-[1.5em] leading-tight`}>{red ? "Batch record" : "Lot record"}</p>
          <p className="mt-[0.2em] text-[0.8em] text-(--a-muted)">{red ? "Santalum Maison register, entry for one piece" : "Santalum Maison register, entry for one lot of oil"}</p>
        </div>
        <span className="shrink-0 rotate-[-6deg] border-2 border-(--a-accent) px-[0.55em] py-[0.25em] text-[0.78em] font-semibold text-(--a-accent) outline outline-1 outline-offset-2 outline-(--a-accent)">
          Example
        </span>
      </div>
      <dl className="mt-[0.4em] grid grid-cols-[auto_1fr] gap-x-[1.2em]">
        {c.provenance.record.map((r) => (
          <div key={r.label} className="col-span-2 grid grid-cols-subgrid border-b border-dashed border-(--a-line-2) py-[0.55em]">
            <dt className="text-[0.82em] text-(--a-muted)">{r.label}</dt>
            <dd className={`text-[0.95em] ${/^[RW]-\d/.test(r.value) ? "font-semibold tracking-[0.06em] tabular-nums" : r.label === "Species" ? "italic" : ""}`}>{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-[0.9em] text-[0.82em] leading-snug text-(--a-ink-2)">If there is evidence, we show it. If there isn&rsquo;t, we don&rsquo;t invent it.</p>
    </div>
  );
}

/** The facts as a herbarium field label. */
export function FactsSheet({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  return (
    <div className="relative border border-(--a-ink) bg-(--a-card) p-[1.2em]">
      <div className="flex items-baseline justify-between gap-[1em] border-b-2 border-(--a-ink) pb-[0.6em]">
        <p className={`${s.serif} text-[1.45em] leading-none`}>Field label</p>
        <p className={`${s.deva} text-[0.95em] text-(--a-muted)`} lang="sa">
          {c.sanskrit}
        </p>
      </div>
      <p className="mt-[0.6em] text-[1.15em] italic">{c.latin}</p>
      <dl className="mt-[0.4em]">
        {c.facts.slice(1).map((f) => (
          <div key={f.label} className="flex justify-between gap-[1em] border-b border-dashed border-(--a-line-2) py-[0.4em]">
            <dt className="shrink-0 text-[0.8em] text-(--a-muted)">{f.label}</dt>
            <dd className="text-right text-[0.88em]">{f.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-[0.7em] flex flex-wrap items-baseline gap-x-[0.9em] gap-y-[0.2em] text-[0.86em] text-(--a-ink-2)">
        <span lang="kn">{c.kannada}</span>
        <span className="italic">{c.localName}</span>
      </p>
    </div>
  );
}

/** Numbered tokens in a ring, like the edition they stand for. Taken numbers are filled; open ones wait in the accent. */
export function EditionRing({ size, count, left, token, label }: { size: number; count: number; left: number; token: number; label: string }) {
  const r = size / 2 - token / 2 - 4;
  const firstOpen = count - left;
  return (
    <span className="relative block" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--a-ink)" strokeOpacity="0.35" strokeDasharray="2 6" />
        <circle cx={size / 2} cy={size / 2} r={r - token * 0.95} fill="none" stroke="var(--a-accent)" strokeOpacity="0.5" />
      </svg>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = Math.round(size / 2 + Math.cos(a) * r - token / 2);
        const y = Math.round(size / 2 + Math.sin(a) * r - token / 2);
        const open = i >= firstOpen;
        return (
          <span
            key={i}
            className={`${s.token} ${s.serif} absolute grid place-items-center rounded-full border ${
              open ? "border-(--a-accent) bg-(--a-card) text-(--a-accent-deep)" : "border-(--a-ink) bg-(--a-ink) text-(--a-paper)"
            }`}
            style={{ left: x, top: y, width: token, height: token, fontSize: Math.round(token * (count > 30 ? 0.42 : 0.4)) }}
          >
            {i + 1}
          </span>
        );
      })}
      <span className="absolute inset-0 grid place-items-center text-center">
        <span>
          <span className={`${s.serif} block leading-none text-(--a-ink)`} style={{ fontSize: Math.round(size * 0.2) }}>
            2011
          </span>
          <span className="mt-[0.3em] block text-(--a-muted)" style={{ fontSize: Math.round(size * 0.045) }}>
            {label}
          </span>
          <span className="mt-[0.25em] block text-(--a-accent-deep)" style={{ fontSize: Math.round(size * 0.042) }}>
            {left} of {count} remain
          </span>
        </span>
      </span>
    </span>
  );
}

/** A row of small tokens for an edition counter (product page, shop cards). */
export function EditionTokens({ size, left, className = "" }: { size: number; left: number; className?: string }) {
  return (
    <span className={`flex flex-wrap gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: size }, (_, i) => (
        <span key={i} className={`size-[7px] rounded-full border ${i >= size - left ? "border-(--a-accent) bg-transparent" : "border-(--a-ink) bg-(--a-ink)"}`} />
      ))}
    </span>
  );
}

/**
 * Santalum Circle sign-up, drawn as a route: the house's mark, a dashed line, and the address the
 * letters travel to as the last stop. Sized in em so it works on the board and on the pages. Front end only.
 */
export function CircleForm({ cta = "Draw the route" }: { cta?: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(email.trim());
  };
  const house = (
    <span className="grid size-[2.3em] shrink-0 place-items-center rounded-full border border-(--a-ink) bg-(--a-card)" aria-hidden>
      <Mark className="size-[1.55em] text-(--a-ink)" />
    </span>
  );
  if (done) {
    return (
      <div role="status">
        <div className="flex items-center gap-[0.5em]">
          {house}
          <span className="h-[0.16em] w-[3.5em] shrink-0 rounded-full bg-(--a-accent)" aria-hidden />
          <PinGlyph color="var(--a-accent)" className="h-[1.9em] w-[1.4em] shrink-0" />
          <span className="min-w-0 truncate font-semibold">{done}</span>
        </div>
        <p className={`${s.serif} mt-[0.8em] text-[1.3em]`}>The route is drawn.</p>
        <p className="mt-[0.3em] text-[0.9em] text-(--a-ink-2)">The next letter from the house will travel to that address.</p>
        <p className="mt-[0.5em] text-[0.75em] text-(--a-muted)">Preview: sign-up is not connected yet, so nothing has been sent.</p>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="w-full">
      <label htmlFor={id} className="block text-[0.82em] text-(--a-ink-2)">
        Where should the letters go?
      </label>
      <div className="mt-[0.5em] flex items-end gap-[0.5em]">
        {house}
        <span className={`${s.hroute} mb-[1.05em] h-[3px] w-[2.2em] shrink-0 sm:w-[3.6em]`} aria-hidden />
        <span className="relative min-w-0 flex-1">
          <input
            id={id}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`${s.selectable} peer w-full border-0 border-b-2 border-(--a-ink) bg-transparent py-[0.45em] pl-[0.1em] pr-[1.7em] text-[1em] text-(--a-ink) transition-colors placeholder:text-(--a-muted) hover:border-(--a-accent-deep) focus:border-(--a-accent) focus:outline-none focus-visible:outline-none`}
          />
          <svg viewBox="0 0 24 32" className="pointer-events-none absolute bottom-[0.55em] right-[0.1em] h-[1.35em] w-[1em] transition-transform duration-300 peer-focus:-translate-y-[0.2em]" aria-hidden>
            <path d="M12 31C10.6 26.4 2.5 19.6 2.5 12.2a9.5 9.5 0 1 1 19 0c0 7.4-8.1 14.2-9.5 18.8z" fill="var(--a-card)" stroke="var(--a-accent)" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="3.6" fill="var(--a-accent)" />
          </svg>
        </span>
      </div>
      <div className="mt-[0.9em] flex flex-wrap items-center gap-x-[1em] gap-y-[0.5em]">
        <button type="submit" className={`${s.btn} ${s.btnInk} h-[2.75em] px-[1.25em] text-[0.92em] font-medium`}>
          {cta}
        </button>
        <span className="text-[0.75em] text-(--a-muted)">A few letters a year. Leave whenever you like.</span>
      </div>
    </form>
  );
}
