"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Wood } from "@/lib/shop/products";
import { STATUS } from "../../_data/format";
import type { AdminStatus } from "../../_data/types";

export const BASE = "/admin/v3";

/* ---------- tiny module stores ---------- */
export function mini<T>(init: T) {
  let v = init;
  const subs = new Set<() => void>();
  return {
    get: () => v,
    set(next: T) {
      v = next;
      subs.forEach((f) => f());
    },
    sub(cb: () => void) {
      subs.add(cb);
      return () => {
        subs.delete(cb);
      };
    },
  };
}
export function useMini<T>(s: ReturnType<typeof mini<T>>, server: T) {
  return useSyncExternalStore(s.sub, s.get, () => server);
}

export const paletteStore = mini(false);

/* ---------- toasts ---------- */
type Toast = { id: number; text: string };
const toastStore = mini<Toast[]>([]);
let toastN = 0;
export function say(text: string) {
  const id = ++toastN;
  toastStore.set([...toastStore.get(), { id, text }].slice(-3));
  window.setTimeout(() => toastStore.set(toastStore.get().filter((t) => t.id !== id)), 3200);
}
const NO_TOASTS: Toast[] = [];
export function Toasts() {
  const list = useMini(toastStore, NO_TOASTS);
  return (
    <div className="a3-toasts" role="status" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className="a3-toast">
          <span className="a3-toast-k">ok</span> {t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- second clock (client only; Gate keeps it off the server) ---------- */
const secSub = (cb: () => void) => {
  const t = window.setInterval(cb, 1000);
  return () => window.clearInterval(t);
};
export function useSeconds() {
  return useSyncExternalStore(
    secSub,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => 0,
  );
}

/* ---------- keyboard ---------- */
export function typingIn(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable;
}

/** Time of the last bare "g" press; the next key within 900 ms is a go-to, not a list command. */
export const gKey = { at: 0 };
/** True when a single-key shortcut should be ignored. */
export function keyBlocked(e: KeyboardEvent) {
  return e.metaKey || e.ctrlKey || e.altKey || typingIn(e.target) || paletteStore.get() || (e.key !== "g" && e.timeStamp - gKey.at < 900);
}

/**
 * j/k (and arrows) move a cursor through a list, Enter opens. The row with data-a3-row={i} inside
 * the given container scrolls into view.
 */
export function useListKeys(
  n: number,
  opts: { cursor: number; setCursor: (i: number) => void; onOpen?: (i: number) => void; extra?: (key: string, i: number) => boolean },
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const live = useRef(opts);
  useEffect(() => {
    live.current = opts;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (keyBlocked(e)) return;
      const { cursor, setCursor, onOpen, extra } = live.current;
      let next = cursor;
      if (e.key === "j" || e.key === "ArrowDown") next = Math.min(n - 1, cursor + 1);
      else if (e.key === "k" || e.key === "ArrowUp") next = Math.max(0, cursor - 1);
      else if (e.key === "G" || e.key === "End") next = n - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "Enter" && onOpen && n > 0) {
        e.preventDefault();
        onOpen(cursor);
        return;
      } else {
        if (extra && n > 0 && extra(e.key, cursor)) e.preventDefault();
        return;
      }
      e.preventDefault();
      if (n === 0 || next === cursor) return;
      setCursor(next);
      ref.current?.querySelector(`[data-a3-row="${next}"]`)?.scrollIntoView({ block: "nearest" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);
  return ref;
}

/* ---------- small visual pieces ---------- */
const LED_TONE: Record<AdminStatus, string> = {
  new: "amber",
  confirmed: "amber",
  packed: "sky",
  shipped: "sky",
  delivered: "green",
  cancelled: "off",
  "return-requested": "red",
  returned: "off",
};
export function Led({ tone, pulse, label }: { tone: string; pulse?: boolean; label?: string }) {
  return <i className="a3-led" data-tone={tone} data-pulse={pulse || undefined} aria-label={label} role={label ? "img" : undefined} />;
}
export function StatusLed({ s, text = true }: { s: AdminStatus; text?: boolean }) {
  return (
    <span className="a3-st">
      <Led tone={LED_TONE[s]} pulse={s === "new" || s === "return-requested"} label={text ? undefined : STATUS[s].label} />
      {text && <span>{STATUS[s].label.toLowerCase()}</span>}
    </span>
  );
}
export function WoodTag({ w }: { w: Wood }) {
  return <span className="a3-wood" data-w={w}>{w === "red" ? "RED" : "WHT"}</span>;
}
export function Woods({ ws }: { ws: Wood[] }) {
  return (
    <span className="a3-woods">
      {ws.map((w) => (
        <WoodTag key={w} w={w} />
      ))}
    </span>
  );
}
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="a3-kbd">{children}</kbd>;
}

/** Sparkline: a polyline over the values, last point marked. */
export function Spark({ values, w = 120, h = 28, tone = "amber" }: { values: number[]; w?: number; h?: number; tone?: string }) {
  if (values.length < 2) return <svg className="a3-spark" width={w} height={h} aria-hidden />;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const x = (i: number) => (i / (values.length - 1)) * (w - 4) + 2;
  const y = (v: number) => h - 3 - ((v - min) / (max - min || 1)) * (h - 6);
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = values.length - 1;
  return (
    <svg className="a3-spark" data-tone={tone} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline points={pts} fill="none" strokeWidth="1.25" />
      <circle cx={x(last)} cy={y(values[last])} r="2" />
    </svg>
  );
}

/** Head line of a page: path crumb on the left, actions on the right. */
export function Head({ path, title, meta, children }: { path: string; title: ReactNode; meta?: ReactNode; children?: ReactNode }) {
  return (
    <header className="a3-head">
      <div className="a3-head-l">
        <span className="a3-path">{path}</span>
        <h1 className="a3-h1">{title}</h1>
        {meta && <span className="a3-head-meta">{meta}</span>}
      </div>
      {children && <div className="a3-head-r">{children}</div>}
    </header>
  );
}

export function Btn({ children, onClick, kind, type = "button", disabled, hint, title }: { children: ReactNode; onClick?: () => void; kind?: "primary" | "danger" | "ghost"; type?: "button" | "submit"; disabled?: boolean; hint?: string; title?: string }) {
  return (
    <button type={type} className="a3-btn" data-kind={kind} onClick={onClick} disabled={disabled} title={title}>
      {children}
      {hint && <Kbd>{hint}</Kbd>}
    </button>
  );
}

export function Filter({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="a3-filter">
      <span aria-hidden>/</span>
      <input data-a3-search type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </label>
  );
}

export function Seg<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { id: T; label: string; n?: number }[]; label: string }) {
  return (
    <div className="a3-seg" role="tablist" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} type="button" role="tab" aria-selected={value === it.id} onClick={() => onChange(it.id)}>
          {it.label}
          {it.n !== undefined && <span className="a3-seg-n">{it.n}</span>}
        </button>
      ))}
    </div>
  );
}

export function Split({ focus, list, detail }: { focus: "list" | "detail"; list: ReactNode; detail: ReactNode }) {
  return (
    <div className="a3-split" data-focus={focus}>
      <section className="a3-pane a3-pane-list">{list}</section>
      <section className="a3-pane a3-pane-detail">{detail}</section>
    </div>
  );
}

export function Box({ title, meta, children, flush }: { title: ReactNode; meta?: ReactNode; children: ReactNode; flush?: boolean }) {
  return (
    <section className="a3-box">
      <div className="a3-box-h">
        <span>{title}</span>
        {meta && <span className="a3-box-meta">{meta}</span>}
      </div>
      <div className={flush ? "" : "a3-box-b"}>{children}</div>
    </section>
  );
}

export function F({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className="a3-f" data-wide={wide || undefined}>
      <span className="a3-f-l">{label}</span>
      {children}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="a3-tog">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="a3-tog-box" aria-hidden>
        {checked ? "on" : "off"}
      </span>
      <span>{label}</span>
    </label>
  );
}

/** Narrow-screen check, client only. */
const mqSub = (cb: () => void) => {
  const m = window.matchMedia("(max-width: 899px)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
export function useNarrow() {
  return useSyncExternalStore(
    mqSub,
    () => window.matchMedia("(max-width: 899px)").matches,
    () => false,
  );
}

/** Controlled draft that resets when its source key changes. */
export function useDraft<T>(key: string, init: () => T) {
  const [st, setSt] = useState(() => ({ key, v: init() }));
  if (st.key !== key) {
    const next = { key, v: init() };
    setSt(next);
    return [next.v, (v: T) => setSt({ key, v })] as const;
  }
  return [st.v, (v: T) => setSt({ key, v })] as const;
}
