"use client";

import { useEffect, useId, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Photo } from "@/components/Photo";
import type { Tone, Wood } from "@/lib/shop/products";
import { formatINR, STATUS } from "../../_data/format";
import { photoById } from "../../_data/store";
import type { AdminStatus } from "../../_data/types";
import { I } from "./icons";

export const BASE = "/admin/v5";

/* ---------- toast ---------- */
type T = { id: number; text: string };
let list: T[] = [];
let n = 0;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
export function say(text: string) {
  const id = ++n;
  list = [...list, { id, text }].slice(-2);
  emit();
  window.setTimeout(() => {
    list = list.filter((t) => t.id !== id);
    emit();
  }, 3000);
}
const NONE: T[] = [];
export function A5Toaster() {
  const items = useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => list,
    () => NONE,
  );
  return (
    <div className="a5-toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="a5-toast">
          <I n="check" size={16} />
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- sheet: slides up from the bottom, portalled to the root so no transform traps it ---------- */
export function Sheet({ open, onClose, title, children, foot, print, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; foot?: ReactNode; print?: boolean; wide?: boolean }) {
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const target = document.getElementById("a5-portal");
  if (!target) return null;
  return createPortal(
    <div className="a5-sheet-wrap">
      <button type="button" className="a5-scrim" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <div className="a5-sheet" role="dialog" aria-modal="true" aria-labelledby={id} data-print={print ? "" : undefined} data-wide={wide ? "" : undefined}>
        <div className="a5-grab" aria-hidden />
        <div className="a5-sheet-head">
          <h2 id={id}>{title}</h2>
          <button type="button" className="a5-round" aria-label="Close" onClick={onClose}>
            <I n="close" size={18} />
          </button>
        </div>
        <div className="a5-sheet-body">{children}</div>
        {foot && <div className="a5-sheet-foot">{foot}</div>}
      </div>
    </div>,
    target,
  );
}

/* ---------- segmented control ---------- */
export function Seg<V extends string>({ value, onChange, items, label, small }: { value: V; onChange: (v: V) => void; items: { id: V; label: ReactNode; count?: number }[]; label: string; small?: boolean }) {
  return (
    <div className="a5-seg" role="radiogroup" aria-label={label} data-small={small ? "" : undefined}>
      {items.map((it) => (
        <button key={it.id} type="button" role="radio" aria-checked={value === it.id} onClick={() => onChange(it.id)}>
          {it.label}
          {it.count != null && it.count > 0 && <span className="a5-seg-n">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- money: the rupee sign sits small and high, the figure large ---------- */
export function Money({ v, size = "m", minus }: { v: number; size?: "s" | "m" | "l" | "xl"; minus?: boolean }) {
  const s = formatINR(Math.abs(v));
  return (
    <span className="a5-money" data-size={size}>
      {(minus || v < 0) && "−"}
      <span className="a5-rs">₹</span>
      {s.replace(/^₹\s?/, "")}
    </span>
  );
}

export function StatusChip({ s }: { s: AdminStatus }) {
  return (
    <span className="a5-chip" data-s={s}>
      {STATUS[s].label}
    </span>
  );
}
export function Chip({ tone, children }: { tone?: string; children: ReactNode }) {
  return (
    <span className="a5-chip" data-t={tone}>
      {children}
    </span>
  );
}

export function WoodDot({ w, label }: { w: Wood; label?: boolean }) {
  return (
    <span className="a5-wood" data-w={w}>
      <span aria-hidden />
      {label ? (w === "red" ? "Red" : "White") : <span className="a5-sr">{w === "red" ? "Red sandalwood" : "White sandalwood"}</span>}
    </span>
  );
}

export function Thumb({ id, tone, size = 48, wood }: { id: string; tone?: Tone; size?: number; wood?: Wood }) {
  const p = photoById(id);
  return (
    <span className="a5-thumb" style={{ width: size, height: size }}>
      {p.id && <Photo p={p} sizes={`${size}px`} tone={tone ?? (wood === "white" ? "pale" : undefined)} />}
    </span>
  );
}

export function Field({ label, hint, children, error }: { label: string; hint?: ReactNode; error?: string | null; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className="a5-field" data-error={error ? "" : undefined}>
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {error ? <small className="a5-err">{error}</small> : hint ? <small>{hint}</small> : null}
    </div>
  );
}

export function Toggle({ on, set, label, sub }: { on: boolean; set: (v: boolean) => void; label: ReactNode; sub?: ReactNode }) {
  return (
    <button type="button" className="a5-toggle" role="switch" aria-checked={on} onClick={() => set(!on)}>
      <span>
        {label}
        {sub && <small>{sub}</small>}
      </span>
      <span className="a5-knob" aria-hidden />
    </button>
  );
}

export function Stars({ v }: { v: number }) {
  return (
    <span className="a5-stars" aria-label={`${v} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <I key={i} n="star" size={14} data-on={i <= Math.round(v) ? "" : undefined} />
      ))}
    </span>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="a5-empty">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Head({ eyebrow, title, action, back }: { eyebrow?: ReactNode; title: ReactNode; action?: ReactNode; back?: ReactNode }) {
  return (
    <header className="a5-head">
      {back}
      <div className="a5-head-row">
        <div>
          {eyebrow && <div className="a5-eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
        </div>
        {action}
      </div>
    </header>
  );
}

export function Card({ title, action, children, flush }: { title?: ReactNode; action?: ReactNode; children: ReactNode; flush?: boolean }) {
  return (
    <section className="a5-card" data-flush={flush ? "" : undefined}>
      {(title || action) && (
        <div className="a5-card-head">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Search({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="a5-search">
      <I n="search" size={18} />
      <span className="a5-sr">{placeholder}</span>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {value && (
        <button type="button" aria-label="Clear" onClick={() => onChange("")}>
          <I n="close" size={14} />
        </button>
      )}
    </label>
  );
}

export const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "").replace(/^(?!91)(\d{10})$/, "91$1")}`;
