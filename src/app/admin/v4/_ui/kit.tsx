"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useSyncExternalStore, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { useHydrated } from "@/lib/shop/store";
import { getProduct, type Tone, type Wood } from "@/lib/shop/products";
import { STATUS } from "../../_data/format";
import { photoById, useSession } from "../../_data/store";
import type { AdminStatus } from "../../_data/types";

export const BASE = "/admin/v4";

/* ---------- gate ---------- */
/** Renders the page body only in the browser with a session; a signed-out admin goes to the v4 sign-in. */
export function Gate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && !session) router.replace(`${BASE}/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [hydrated, session, router]);
  if (!hydrated || !session) return <Pending />;
  return <>{children}</>;
}

export function Pending() {
  return (
    <div className="a4-pending" aria-busy="true">
      <span className="a4-pending-card" />
      <span className="a4-pending-card" />
      <span className="a4-pending-card" />
    </div>
  );
}

/* ---------- toasts (own store, so the note looks like this design) ---------- */
type Note = { id: number; text: string };
let notes: Note[] = [];
let noteN = 0;
const subs = new Set<() => void>();
const NO_NOTES: Note[] = [];
export function say(text: string) {
  const id = ++noteN;
  notes = [...notes, { id, text }].slice(-3);
  subs.forEach((f) => f());
  window.setTimeout(() => {
    notes = notes.filter((n) => n.id !== id);
    subs.forEach((f) => f());
  }, 3200);
}
export function A4Toaster() {
  const list = useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => notes,
    () => NO_NOTES,
  );
  return (
    <div className="a4-toasts" role="status" aria-live="polite">
      {list.map((n) => (
        <p key={n.id} className="a4-toast">
          {n.text}
        </p>
      ))}
    </div>
  );
}

/* ---------- icons ---------- */
const PATHS = {
  bench: "M3 10h18M5 10v9M19 10v9M7 10V7h10v3M9 14h6",
  board: "M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v7h-4z",
  jar: "M8 3h8M9 3v3l-2 3v11h10V9l-2-3V3M7 13h10",
  people: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M16 5a3 3 0 0 1 0 6M18 15c2 .6 3 2.2 3 5",
  shop: "M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M10 20v-6h4v6",
  out: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  arrow: "M5 12h14M13 6l6 6-6 6",
  back: "M19 12H5M11 6l-6 6 6 6",
  grip: "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
  print: "M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
} as const;
export type IconName = keyof typeof PATHS;
export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg className="a4-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

/* ---------- photos ---------- */
export function toneOf(slug: string): Tone | undefined {
  return getProduct(slug)?.shots[0]?.tone;
}
/** A photo pinned to the board: a small print with a brass pin. */
export function Pinned({ photoId, tone, alt, size = "md", pin = true }: { photoId: string; tone?: Tone; alt?: string; size?: "xs" | "sm" | "md" | "lg" | "fill"; pin?: boolean }) {
  const p = photoById(photoId);
  return (
    <span className={`a4-print a4-print-${size}`} data-pin={pin || undefined}>
      <span className="a4-print-img">
        <Photo p={{ id: p.id, alt: alt ?? p.alt }} tone={tone} sizes={size === "lg" || size === "fill" ? "(max-width: 700px) 50vw, 320px" : "96px"} />
      </span>
    </span>
  );
}

/* ---------- small labels ---------- */
export function WoodTag({ wood, short }: { wood: Wood; short?: boolean }) {
  return (
    <span className="a4-wood" data-wood={wood}>
      <i aria-hidden="true" />
      {short ? (wood === "red" ? "Red" : "White") : wood === "red" ? "Red sandalwood" : "White sandalwood"}
    </span>
  );
}
export function Woods({ woods }: { woods: Wood[] }) {
  return (
    <span className="a4-woods">
      {woods.map((w) => (
        <WoodTag key={w} wood={w} short />
      ))}
    </span>
  );
}
export function Stage({ status }: { status: AdminStatus }) {
  return (
    <span className="a4-stage" data-s={status}>
      {STATUS[status].label}
    </span>
  );
}
export function Stars({ n }: { n: number }) {
  return (
    <span className="a4-stars" aria-label={`${n} of 5`}>
      {"★★★★★".slice(0, n)}
      <span aria-hidden="true">{"★★★★★".slice(n)}</span>
    </span>
  );
}

/* ---------- page head ---------- */
export function Head({ kicker, title, sub, children }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <header className="a4-head">
      <div>
        {kicker && <p className="a4-kicker">{kicker}</p>}
        <h1 className="a4-h1">{title}</h1>
        {sub && <p className="a4-sub">{sub}</p>}
      </div>
      {children && <div className="a4-head-actions">{children}</div>}
    </header>
  );
}

/* ---------- form bits ---------- */
export function Field({ label, hint, children, wide }: { label: ReactNode; hint?: ReactNode; children: (id: string) => ReactNode; wide?: boolean }) {
  const id = useId();
  return (
    <div className="a4-field" data-wide={wide || undefined}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint && <small>{hint}</small>}
    </div>
  );
}
export function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="a4-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}
export function Chips<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { id: T; label: ReactNode; count?: number }[]; label: string }) {
  return (
    <div className="a4-chips" role="group" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} type="button" aria-pressed={value === it.id} onClick={() => onChange(it.id)}>
          {it.label}
          {it.count !== undefined && <span className="a4-chip-n">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <p className="a4-empty">{children}</p>;
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
