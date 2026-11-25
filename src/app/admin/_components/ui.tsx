"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { getProduct, TONE_FILTER, type Tone, type Wood } from "@/lib/shop/products";
import { photoById } from "../_data/store";
import { STATUS } from "../_data/format";
import type { AdminStatus } from "../_data/types";
import { Icon, Star, type IconName } from "./icons";

/* ---------- page head with breadcrumbs ---------- */
export type Crumb = { label: string; href?: string };
export function PageHead({ crumbs, title, sub, actions }: { crumbs: Crumb[]; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="adm-crumbs">
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: "contents" }}>
            {i > 0 && <span aria-hidden>/</span>}
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </span>
        ))}
      </nav>
      <header className="adm-head">
        <div style={{ minWidth: 0 }}>
          <h1 className="adm-h1">{title}</h1>
          {sub && <div className="adm-sub">{sub}</div>}
        </div>
        {actions && <div className="adm-head-actions">{actions}</div>}
      </header>
    </>
  );
}

export function Panel({ title, meta, action, children, className = "", bodyClass = "adm-panel-body", id }: { title?: ReactNode; meta?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string; id?: string }) {
  return (
    <section className={`adm-panel ${className}`} aria-labelledby={title && id ? id : undefined}>
      {(title || action) && (
        <div className="adm-panel-head">
          <div>
            {title && (
              <h2 className="adm-h2" id={id}>
                {title}
              </h2>
            )}
            {meta && <p>{meta}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

/* ---------- pills, tags, wood ---------- */
export function StatusPill({ status }: { status: AdminStatus }) {
  const s = STATUS[status];
  return (
    <span className="adm-pill" data-tone={s.tone}>
      {s.label}
    </span>
  );
}

export function Pill({ tone, children, plain }: { tone?: string; children: ReactNode; plain?: boolean }) {
  return (
    <span className="adm-pill" data-tone={tone} data-plain={plain ? "" : undefined}>
      {children}
    </span>
  );
}

export function WoodDot({ wood }: { wood: Wood }) {
  return <i className={wood === "red" ? "ring-red" : "ring-white"} aria-hidden />;
}
export function WoodLabel({ wood }: { wood: Wood }) {
  return (
    <span className="adm-wood">
      <WoodDot wood={wood} />
      {wood === "red" ? "Red" : "White"}
    </span>
  );
}
export function Woods({ woods }: { woods: Wood[] }) {
  return (
    <span className="adm-woods" title={woods.map((w) => (w === "red" ? "Red sandalwood" : "White sandalwood")).join(" + ")}>
      {woods.map((w) => (
        <WoodDot key={w} wood={w} />
      ))}
      <span className="adm-sr">{woods.join(" and ")} sandalwood</span>
    </span>
  );
}

export function Stars({ value, label = true }: { value: number; label?: boolean }) {
  const r = Math.round(value);
  return (
    <span className="adm-stars" aria-label={`${value} out of 5`} role="img">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} off={i > r} />
      ))}
      {label && <span style={{ marginLeft: 5, color: "var(--a-ink-2)", fontSize: 12.5 }}>{value ? value.toFixed(1) : "–"}</span>}
    </span>
  );
}

/* ---------- photos ---------- */
export function Thumb({ photoId, tone, size, slug, alt }: { photoId: string; tone?: Tone; size?: "sm" | "lg"; slug?: string; alt?: string }) {
  const p = photoById(photoId);
  const t = tone ?? (slug ? getProduct(slug)?.shots.find((s) => s.photo.id === photoId)?.tone : undefined);
  return (
    <span className="adm-thumb" data-size={size}>
      <Photo p={{ id: p.id, alt: alt ?? p.alt }} sizes={size === "lg" ? "64px" : "44px"} tone={t} />
    </span>
  );
}
export { TONE_FILTER };

/* ---------- empty + skeleton ---------- */
export function Empty({ icon = "inbox", title, children, action }: { icon?: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="adm-empty">
      <span className="adm-empty-mark">
        <Icon name={icon} />
      </span>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="adm-page" aria-busy="true" aria-label="Loading">
      <div className="adm-skel" style={{ width: 140, height: 12 }} />
      <div className="adm-skel" style={{ width: 260, height: 32, margin: "14px 0 24px" }} />
      <div className="adm-kpis">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="adm-skel" style={{ height: 104, borderRadius: 14 }} />
        ))}
      </div>
      <div className="adm-skel" style={{ height: 320, borderRadius: 14, marginTop: 16 }} />
    </div>
  );
}

/* ---------- delta ---------- */
export function Delta({ value, upIsGood = true, suffix = "%" }: { value: number | null; upIsGood?: boolean; suffix?: string }) {
  if (value === null || !isFinite(value)) return <span className="adm-delta" data-good="flat">–</span>;
  const flat = Math.abs(value) < 0.05;
  const good = flat ? "flat" : String(value > 0 === upIsGood);
  return (
    <span className="adm-delta" data-good={good}>
      {!flat && <Icon name={value > 0 ? "arrowUp" : "arrowDown"} />}
      {Math.abs(value).toFixed(1)}
      {suffix}
      <span className="adm-sr">{value > 0 ? "up" : "down"}</span>
    </span>
  );
}

/* ---------- switch, field ---------- */
export function Switch({ checked, onChange, label, id, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; id?: string; disabled?: boolean }) {
  return (
    <label className="adm-switch">
      <input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

/* ---------- search field: our own clear button instead of the browser's ---------- */
export function SearchField({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <label className="adm-search-field">
      <Icon name="search" />
      <span className="adm-sr">{label}</span>
      <input type="search" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === "Escape" && value && onChange("")} />
      {value && (
        <button type="button" className="adm-search-clear" aria-label="Clear search" onClick={() => onChange("")}>
          <Icon name="close" />
        </button>
      )}
    </label>
  );
}

export function Field({ label, hint, error, children, className = "", count }: { label: ReactNode; hint?: ReactNode; error?: string | null; children: (id: string) => ReactNode; className?: string; count?: ReactNode }) {
  const id = useId();
  return (
    <div className={`adm-field ${className}`}>
      <label className="adm-label" htmlFor={id}>
        <span>{label}</span>
        {count !== undefined && <small>{count}</small>}
      </label>
      {children(id)}
      {error ? <span className="adm-error">{error}</span> : hint ? <span className="adm-hint">{hint}</span> : null}
    </div>
  );
}

/* ---------- tabs / segmented ---------- */
export function Tabs<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { id: T; label: string; count?: number }[]; label: string }) {
  return (
    <div className="adm-tabs" role="tablist" aria-label={label}>
      {items.map((t) => (
        <button key={t.id} role="tab" type="button" aria-selected={value === t.id} onClick={() => onChange(t.id)}>
          {t.label}
          {t.count !== undefined && <span className="adm-tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Seg<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { id: T; label: ReactNode; title?: string }[]; label: string }) {
  return (
    <div className="adm-seg" role="group" aria-label={label}>
      {items.map((t) => (
        <button key={t.id} type="button" aria-pressed={value === t.id} title={t.title} aria-label={t.title} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- pagination: folios of the day-book, turned one at a time ---------- */
export function Pager({ page, pages, total, per, onPage, noun = "orders" }: { page: number; pages: number; total: number; per: number; onPage: (p: number) => void; noun?: string }) {
  if (total === 0) return null;
  const from = (page - 1) * per + 1;
  const to = Math.min(total, page * per);
  return (
    <nav className="adm-pager" aria-label="Pagination">
      <span className="num">
        Entries {from}–{to} of {total} {noun}
      </span>
      {pages > 1 && (
        <div className="adm-pager-btns">
          <button type="button" className="adm-btn" data-size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <Icon name="chevronLeft" />
            Previous
          </button>
          <span className="adm-folio" aria-live="polite">
            Folio <b>{page}</b> of {pages}
          </span>
          <button type="button" className="adm-btn" data-size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
            Next
            <Icon name="chevronRight" />
          </button>
        </div>
      )}
    </nav>
  );
}

/* ---------- modal: native <dialog>, so focus is trapped and Esc closes ---------- */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size,
  print,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "lg";
  print?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="adm-modal"
      data-size={size}
      data-print={print ? "" : undefined}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <>
          <div className="adm-modal-head adm-noprint">
            <div>
              <h2 className="adm-h2" id={id}>
                {title}
              </h2>
              {description && <p>{description}</p>}
            </div>
            <button type="button" className="adm-btn" data-variant="ghost" data-size="icon-sm" onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
          </div>
          <div className="adm-modal-body">{children}</div>
          {footer && <div className="adm-modal-foot adm-noprint">{footer}</div>}
        </>
      )}
    </dialog>
  );
}

/* ---------- toasts ---------- */
type ToastItem = { id: number; text: string };
let toasts: ToastItem[] = [];
let toastN = 0;
const toastSubs = new Set<() => void>();
const emitToasts = () => toastSubs.forEach((f) => f());
export function toast(text: string) {
  const id = ++toastN;
  toasts = [...toasts, { id, text }].slice(-3);
  emitToasts();
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emitToasts();
  }, 3400);
}
const EMPTY_TOASTS: ToastItem[] = [];
export function Toaster() {
  const list = useSyncExternalStore(
    (cb) => {
      toastSubs.add(cb);
      return () => toastSubs.delete(cb);
    },
    () => toasts,
    () => EMPTY_TOASTS,
  );
  return (
    <div className="adm-toasts" role="status" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className="adm-toast">
          <Icon name="check" />
          {t.text}
        </div>
      ))}
    </div>
  );
}

/** Download text as a file in the browser (CSV export). */
export function downloadText(name: string, text: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
