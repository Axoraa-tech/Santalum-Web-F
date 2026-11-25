"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useHydrated } from "@/lib/shop/store";
import type { Wood } from "@/lib/shop/products";
import { formatINR } from "../../_data/format";
import { useSession } from "../../_data/store";
import type { AdminOrder, AdminStatus, PaymentState } from "../../_data/types";

export const BASE = "/admin/v2";

/* ---------- gate ---------- */
export function Gate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && !session) router.replace(`${BASE}/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [hydrated, session, router]);
  if (!hydrated || !session) return <Blank />;
  return <>{children}</>;
}
export function Blank() {
  return (
    <div className="a2-blank" aria-busy="true" aria-label="Opening the book">
      <span />
      <span />
      <span />
    </div>
  );
}

/* ---------- slips (toasts) ---------- */
type Slip = { id: number; text: string };
let slips: Slip[] = [];
let slipN = 0;
const slipSubs = new Set<() => void>();
const EMPTY: Slip[] = [];
export function note(text: string) {
  const id = ++slipN;
  slips = [...slips, { id, text }].slice(-3);
  slipSubs.forEach((f) => f());
  window.setTimeout(() => {
    slips = slips.filter((s) => s.id !== id);
    slipSubs.forEach((f) => f());
  }, 3200);
}
export function A2Toaster() {
  const list = useSyncExternalStore(
    (cb) => {
      slipSubs.add(cb);
      return () => slipSubs.delete(cb);
    },
    () => slips,
    () => EMPTY,
  );
  return (
    <div className="a2-slips" role="status" aria-live="polite">
      {list.map((s) => (
        <p key={s.id} className="a2-slip-note">
          {s.text}
        </p>
      ))}
    </div>
  );
}

/* ---------- ink stamps ---------- */
type Ink = "blue" | "red" | "black";
export const STAMP: Record<AdminStatus, { word: string; ink: Ink }> = {
  new: { word: "Entered", ink: "black" },
  confirmed: { word: "Confirmed", ink: "blue" },
  packed: { word: "Packed", ink: "blue" },
  shipped: { word: "Dispatched", ink: "blue" },
  delivered: { word: "Delivered", ink: "blue" },
  cancelled: { word: "Void", ink: "red" },
  "return-requested": { word: "Return asked", ink: "red" },
  returned: { word: "Returned", ink: "red" },
};
export const PAY_STAMP: Record<PaymentState, { word: string; ink: Ink }> = {
  paid: { word: "Paid", ink: "red" },
  "cod-pending": { word: "Cash due", ink: "black" },
  "cod-collected": { word: "Paid", ink: "red" },
  refunded: { word: "Refunded", ink: "red" },
  "part-refunded": { word: "Part refund", ink: "red" },
};

function tiltOf(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 9) - 4) * 0.9;
}

/** An ink stamp. It presses in (short animation) whenever its word changes after first paint. */
export function Stamp({ word, ink, seed, size = "md" }: { word: string; ink: Ink; seed: string; size?: "sm" | "md" | "lg" }) {
  const [first] = useState(word);
  const press = word !== first;
  return (
    <span key={word} className="a2-stamp" data-ink={ink} data-size={size} data-press={press || undefined} style={{ ["--a2-tilt" as string]: `${tiltOf(seed + word)}deg` }}>
      {word}
    </span>
  );
}
export function StatusStamp({ o, size }: { o: Pick<AdminOrder, "id" | "status">; size?: "sm" | "md" | "lg" }) {
  const s = STAMP[o.status];
  return <Stamp word={s.word} ink={s.ink} seed={o.id} size={size} />;
}

/* ---------- figures ---------- */
export function Fig({ n, cr, blank }: { n: number; cr?: boolean; blank?: boolean }) {
  if (blank && !n) return <span className="a2-fig a2-dim">—</span>;
  return <span className={`a2-fig${cr ? " a2-cr" : ""}`}>{formatINR(n)}</span>;
}
export function WoodMark({ wood, word = true }: { wood: Wood; word?: boolean }) {
  return (
    <span className="a2-wood" data-wood={wood}>
      <i aria-hidden />
      {word ? (wood === "red" ? "Red" : "White") : <span className="a2-sr">{wood === "red" ? "Red sandalwood" : "White sandalwood"}</span>}
    </span>
  );
}

/** Folio numbers: every order gets the next number in the book, oldest first. */
export function folios(orders: AdminOrder[]) {
  const m = new Map<string, number>();
  [...orders].sort((a, b) => a.placedAt - b.placedAt).forEach((o, i) => m.set(o.id, i + 1));
  return m;
}

/* ---------- page furniture ---------- */
export function Head({ kicker, title, aside, children }: { kicker: ReactNode; title: ReactNode; aside?: ReactNode; children?: ReactNode }) {
  return (
    <header className="a2-head">
      <div>
        <p className="a2-kicker">{kicker}</p>
        <h1 className="a2-h1">{title}</h1>
        {children}
      </div>
      {aside ? <div className="a2-head-aside">{aside}</div> : null}
    </header>
  );
}
export function Section({ title, aside, children, className = "" }: { title: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`a2-sec ${className}`}>
      <div className="a2-sec-h">
        <h2>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
export function F({ label, children, wide, hint, group }: { label: ReactNode; children: ReactNode; wide?: boolean; hint?: ReactNode; group?: boolean }) {
  const Tag = group ? "div" : "label";
  return (
    <Tag className="a2-f" data-wide={wide || undefined}>
      <span className="a2-f-l">{label}</span>
      {children}
      {hint ? <span className="a2-f-h">{hint}</span> : null}
    </Tag>
  );
}
export function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="a2-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}
export function Choice<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { id: T; label: ReactNode; n?: number }[]; label: string }) {
  return (
    <div className="a2-choice" role="group" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} type="button" aria-pressed={value === it.id} onClick={() => onChange(it.id)}>
          {it.label}
          {it.n !== undefined ? <sup>{it.n}</sup> : null}
        </button>
      ))}
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <p className="a2-empty">{children}</p>;
}
export function Pages({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <nav className="a2-pages" aria-label="Pages">
      <button type="button" disabled={page === 0} onClick={() => onPage(page - 1)}>
        Previous page
      </button>
      <span>
        page {page + 1} of {pages}
      </span>
      <button type="button" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
        Turn over
      </button>
    </nav>
  );
}
export function Stars({ n }: { n: number }) {
  return (
    <span className="a2-stars" aria-label={`${n} out of 5`}>
      {"●".repeat(n)}
      <span className="a2-dim">{"○".repeat(5 - n)}</span>
    </span>
  );
}
