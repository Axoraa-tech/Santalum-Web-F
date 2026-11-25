"use client";

import Link from "next/link";
import { useId, useSyncExternalStore, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { getProduct, type Tone, type Wood } from "@/lib/shop/products";
import { STATUS } from "../../_data/format";
import { photoById } from "../../_data/store";
import type { AdminStatus } from "../../_data/types";

export const BASE = "/admin/v6";

/* ---------- page head: section number in the margin, title on the grid ---------- */
export function Head({ no, title, lede, actions, back }: { no: string; title: ReactNode; lede?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <header className="a6-head a6-grid">
      <div className="a6-head-no">{no}</div>
      <div className="a6-head-main">
        {back && (
          <Link href={back.href} className="a6-back">
            ← {back.label}
          </Link>
        )}
        <h1 className="a6-h1">{title}</h1>
        {lede && <p className="a6-lede">{lede}</p>}
      </div>
      {actions && <div className="a6-head-actions">{actions}</div>}
    </header>
  );
}

/** A labelled block on the grid with a red hairline above. */
export function Block({ label, no, aside, children, className = "" }: { label: string; no?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`a6-block ${className}`}>
      <div className="a6-block-head">
        <h2 className="a6-h2">
          {no && <span className="a6-block-no">{no}</span>}
          {label}
        </h2>
        {aside && <div className="a6-block-aside">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

/* ---------- figures ---------- */
export function Fig({ value, label, sub, accent, size = "xl" }: { value: ReactNode; label: ReactNode; sub?: ReactNode; accent?: boolean; size?: "xl" | "lg" | "md" }) {
  return (
    <div className="a6-fig" data-size={size} data-accent={accent || undefined}>
      <div className="a6-fig-label">{label}</div>
      <div className="a6-fig-value">{value}</div>
      {sub && <div className="a6-fig-sub">{sub}</div>}
    </div>
  );
}

export function Delta({ now, prev, good = "up" }: { now: number; prev: number; good?: "up" | "down" }) {
  if (!prev) return <span className="a6-muted">no prior figure</span>;
  const d = (now - prev) / prev;
  const up = d >= 0;
  const bad = good === "up" ? !up : up;
  return (
    <span className="a6-delta" data-bad={bad || undefined}>
      {up ? "+" : "−"}
      {Math.abs(d * 100).toFixed(1)}% on the prior period
    </span>
  );
}

/* ---------- wood + status ---------- */
export const WOOD_NAME: Record<Wood, string> = { red: "Red", white: "White" };
export function WoodMark({ wood, label = true }: { wood: Wood; label?: boolean }) {
  return (
    <span className="a6-wood" data-wood={wood}>
      <i aria-hidden />
      {label ? WOOD_NAME[wood] : <span className="a6-sr">{WOOD_NAME[wood]} sandalwood</span>}
    </span>
  );
}
export function Woods({ woods }: { woods: Wood[] }) {
  return (
    <span className="a6-woods">
      {woods.map((w) => (
        <WoodMark key={w} wood={w} label={woods.length === 1} />
      ))}
      {woods.length > 1 && <span>Both</span>}
    </span>
  );
}

const ACT: AdminStatus[] = ["new", "confirmed", "packed", "return-requested"];
export function Status({ status }: { status: AdminStatus }) {
  const tone = ACT.includes(status) ? "act" : status === "cancelled" || status === "returned" ? "off" : "done";
  return (
    <span className="a6-status" data-tone={tone}>
      {STATUS[status].label}
    </span>
  );
}

/* ---------- photos ---------- */
export function Thumb({ photoId, slug, tone, size = 40 }: { photoId: string; slug?: string; tone?: Tone; size?: number }) {
  const p = photoById(photoId);
  const t = tone ?? (slug ? getProduct(slug)?.shots.find((s) => s.photo.id === photoId)?.tone : undefined);
  return (
    <span className="a6-thumb" style={{ width: size, height: size }}>
      <Photo p={p} sizes={`${size}px`} tone={t} />
    </span>
  );
}

/* ---------- controls ---------- */
export function Tabs<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { id: T; label: ReactNode; count?: number }[]; label: string }) {
  return (
    <div className="a6-tabs" role="group" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} type="button" aria-pressed={value === it.id} onClick={() => onChange(it.id)}>
          {it.label}
          {it.count !== undefined && <sup>{it.count}</sup>}
        </button>
      ))}
    </div>
  );
}

export function Search({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="a6-search">
      <span className="a6-sr">{label}</span>
      <input type="search" value={value} placeholder={label} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/** A numbered form field: the number in red, the label in small caps, a hairline under the input. */
export function Field({ no, label, hint, error, children, wide }: { no?: string; label: string; hint?: ReactNode; error?: string | null; children: (id: string) => ReactNode; wide?: boolean }) {
  const id = useId();
  return (
    <div className="a6-field" data-wide={wide || undefined} data-error={error ? true : undefined}>
      <label htmlFor={id} className="a6-field-label">
        {no && <span className="a6-field-no">{no}</span>}
        {label}
      </label>
      {children(id)}
      {error ? <div className="a6-field-error">{error}</div> : hint ? <div className="a6-field-hint">{hint}</div> : null}
    </div>
  );
}

export function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="a6-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

export function Pager({ page, pages, total, onPage, noun }: { page: number; pages: number; total: number; onPage: (p: number) => void; noun: string }) {
  if (pages <= 1) return <p className="a6-pager a6-muted">{total} {noun}</p>;
  return (
    <nav className="a6-pager" aria-label="Pages">
      <button type="button" className="a6-link" disabled={page === 0} onClick={() => onPage(page - 1)}>
        ← Previous
      </button>
      <span className="a6-num">
        Page {page + 1} of {pages} · {total} {noun}
      </span>
      <button type="button" className="a6-link" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
        Next →
      </button>
    </nav>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="a6-empty">{children}</p>;
}

/* ---------- toasts: a single line in the foot of the page ---------- */
type Note = { id: number; text: string };
let notes: Note[] = [];
let noteN = 0;
const subs = new Set<() => void>();
const NONE: Note[] = [];
export function say(text: string) {
  const id = ++noteN;
  notes = [...notes, { id, text }].slice(-2);
  subs.forEach((f) => f());
  window.setTimeout(() => {
    notes = notes.filter((n) => n.id !== id);
    subs.forEach((f) => f());
  }, 3200);
}
export function Notes() {
  const list = useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => notes,
    () => NONE,
  );
  return (
    <div className="a6-notes" role="status" aria-live="polite">
      {list.map((n) => (
        <div key={n.id} className="a6-note">
          {n.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- thin-line chart ---------- */
export type Series = { label: string; color: string; values: number[]; dash?: boolean };
export function LineChart({ series, xLabels, height = 220, format }: { series: Series[]; xLabels: string[]; height?: number; format: (n: number) => string }) {
  const n = Math.max(...series.map((s) => s.values.length));
  const raw = Math.max(1, ...series.flatMap((s) => s.values));
  const step = niceStep(raw / 4);
  const max = step * 4;
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * 100);
  const y = (v: number) => 100 - (v / max) * 100;
  return (
    <figure className="a6-chart">
      <div className="a6-chart-plot" style={{ height }}>
        {[0, 1, 2, 3, 4].map((k) => (
          <div key={k} className="a6-chart-grid" style={{ top: `${100 - k * 25}%` }}>
            <span>{format(step * k)}</span>
          </div>
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {series.map((s) => (
            <polyline
              key={s.label}
              fill="none"
              stroke={s.color}
              strokeWidth={s.dash ? 1 : 1.25}
              strokeDasharray={s.dash ? "3 3" : undefined}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
            />
          ))}
        </svg>
      </div>
      <div className="a6-chart-x">
        {xLabels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
      <figcaption className="a6-chart-key">
        {series.map((s) => (
          <span key={s.label}>
            <i style={{ borderTopColor: s.color, borderTopStyle: s.dash ? "dashed" : "solid" }} aria-hidden />
            {s.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
function niceStep(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v || 1)));
  const m = v / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}

/** A single proportional hairline split, e.g. red vs white revenue. */
export function Split({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div className="a6-split" aria-hidden>
      {parts.map((p) => (
        <span key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />
      ))}
    </div>
  );
}

export const RED = "#9b3520";
export const WHITE = "#a07330";
