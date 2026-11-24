"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { W, WT } from "@/components/maison/W";
import { RECORD_EXAMPLE } from "../_lib/board";
import { s } from "./styles";

/**
 * Pieces used both on the board and in the list view. They are sized in em,
 * so the board sets a large font-size (world px) and the list a normal one.
 */

/** W for photos: each wood's image gets its own positioned box (next/image fill needs one). */
export function WPhoto({ red, white }: { red: ReactNode; white: ReactNode }) {
  return <W red={<div className="absolute inset-0">{red}</div>} white={<div className="absolute inset-0">{white}</div>} />;
}

const R = RECORD_EXAMPLE.red;
const Wh = RECORD_EXAMPLE.white;

export function RecordCard() {
  const rows: { k: string; red: string; white: string; mono?: boolean }[] = [
    { k: "Piece", red: R.piece, white: Wh.piece },
    { k: "Wood", red: R.wood, white: Wh.wood },
    { k: "Origin", red: R.origin, white: Wh.origin },
    { k: "Batch", red: R.batch, white: Wh.batch, mono: true },
    { k: "Artisan", red: R.artisan, white: Wh.artisan },
    { k: "Finished", red: R.finished, white: Wh.finished },
  ];
  return (
    <div className="relative border border-(--a-line-2) bg-(--a-card) p-[1.3em] shadow-[0_1.2em_2.6em_-1.8em_rgba(31,29,26,0.5)]">
      <div className="flex items-start justify-between gap-[1em] border-b border-(--a-line-2) pb-[0.8em]">
        <div>
          <p className={`${s.serif} text-[1.5em] leading-tight`}>Provenance record</p>
          <p className="mt-[0.2em] text-[0.8em] text-(--a-muted)">
            Santalum Maison register, entry for one piece
          </p>
        </div>
        <span className="shrink-0 rotate-[-6deg] border-2 border-(--m-accent) px-[0.55em] py-[0.25em] text-[0.78em] font-semibold text-(--m-accent) outline outline-1 outline-offset-2 outline-(--m-accent)">
          Example
        </span>
      </div>
      <dl className="mt-[0.4em] grid grid-cols-[auto_1fr] gap-x-[1.2em]">
        {rows.map((r) => (
          <div key={r.k} className="col-span-2 grid grid-cols-subgrid border-b border-dashed border-(--a-line-2) py-[0.55em]">
            <dt className="text-[0.82em] text-(--a-muted)">{r.k}</dt>
            <dd className={`text-[0.95em] ${r.mono ? "font-semibold tracking-[0.06em] tabular-nums" : ""}`}>
              <WT red={r.red} white={r.white} />
              {r.k === "Wood" && (
                <span className="block text-[0.86em] italic text-(--a-ink-2)">
                  <WT red={R.latin} white={Wh.latin} />
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-[0.9em] text-[0.82em] leading-snug text-(--a-ink-2)">
        If there is evidence, we show it. If there isn&rsquo;t, we don&rsquo;t invent it.
      </p>
    </div>
  );
}

/** Twenty-one numbered tokens in a ring, like the cuff they stand for. Decorative; wrap it in a button. */
export function VaultRing({ size, token }: { size: number; token: number }) {
  const r = size / 2 - token / 2 - 4;
  return (
    <span className="relative block" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--a-ink)" strokeOpacity="0.35" strokeDasharray="2 6" />
        <circle cx={size / 2} cy={size / 2} r={r - token * 0.9} fill="none" stroke="var(--m-accent)" strokeOpacity="0.5" />
      </svg>
      {Array.from({ length: 21 }, (_, i) => {
        const a = (i / 21) * Math.PI * 2 - Math.PI / 2;
        const x = Math.round(size / 2 + Math.cos(a) * r - token / 2);
        const y = Math.round(size / 2 + Math.sin(a) * r - token / 2);
        return (
          <span
            key={i}
            className={`${s.token} ${s.serif} absolute grid place-items-center rounded-full border border-(--a-ink) bg-(--a-card) text-(--a-ink) hover:border-(--m-accent) hover:bg-(--m-accent) hover:text-white`}
            style={{ left: x, top: y, width: token, height: token, fontSize: Math.round(token * 0.4) }}
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
            Twenty-one cuffs, numbered
          </span>
        </span>
      </span>
    </span>
  );
}

/** Santalum Circle sign-up. Front end only. */
export function CircleForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(email.trim());
  };
  if (done) {
    return (
      <div role="status" className="border-l-2 border-(--m-accent) py-[0.3em] pl-[0.9em]">
        <p className={`${s.serif} text-[1.3em]`}>Thank you.</p>
        <p className="mt-[0.3em] text-[0.9em] text-(--a-ink-2)">
          The next letter from the house will go to <span className="font-semibold">{done}</span>.
        </p>
        <p className="mt-[0.5em] text-[0.75em] text-(--a-muted)">Preview: sign-up is not connected yet, so nothing has been sent.</p>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="w-full">
      <label htmlFor={id} className="block text-[0.82em] text-(--a-ink-2)">
        Email address
      </label>
      <div className="mt-[0.4em] flex flex-wrap gap-[0.5em]">
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`${s.field} ${s.selectable} min-w-0 flex-[1_1_12em] !text-[1em]`}
        />
        <button type="submit" className={`${s.btn} ${s.btnInk} h-[2.9em] flex-[0_0_auto] px-[1.3em] text-[0.95em] font-medium`}>
          Join the Circle
        </button>
      </div>
      <p className="mt-[0.6em] text-[0.75em] text-(--a-muted)">Occasional letters. Leave whenever you like.</p>
    </form>
  );
}
