"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useHydrated } from "@/lib/shop/store";
import { formatINR, STATUS } from "../../_data/format";
import { adminSignOut, useCustomers, useOrders, useProducts, useReviews, useSession } from "../../_data/store";
import { BASE, gKey, Kbd, paletteStore, Toasts, typingIn, useMini, useSeconds } from "./kit";

export const NAV = [
  { key: "d", href: "", label: "Dash" },
  { key: "o", href: "/orders", label: "Orders" },
  { key: "p", href: "/products", label: "Products" },
  { key: "i", href: "/inventory", label: "Stock" },
  { key: "c", href: "/customers", label: "Customers" },
  { key: "r", href: "/reviews", label: "Reviews" },
  { key: "k", href: "/coupons", label: "Coupons" },
  { key: "t", href: "/content", label: "Content" },
  { key: "s", href: "/settings", label: "Settings" },
];

/* ---------- gate ---------- */
export function Gate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && !session) router.replace(`${BASE}/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [hydrated, session, router]);
  if (!hydrated || !session) return <Loading />;
  return <>{children}</>;
}

export function Loading() {
  return (
    <div className="a3-loading" aria-busy="true">
      <span className="a3-cursor" /> loading
    </div>
  );
}

/* ---------- frame ---------- */
export function StaticBar() {
  return (
    <header className="a3-bar">
      <span className="a3-brand">
        santalum<b>/ops</b>
      </span>
    </header>
  );
}

export function LiveFrame({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const session = useSession();
  return (
    <>
      {hydrated && session ? <Bar /> : <StaticBar />}
      <div className="a3-body">{children}</div>
      {hydrated && session && (
        <>
          <Footer />
          <Palette />
          <Keys />
        </>
      )}
      <Toasts />
    </>
  );
}

function section(pathname: string) {
  const rest = pathname.slice(BASE.length);
  return NAV.find((n) => n.href && rest.startsWith(n.href)) ?? NAV[0];
}

function Bar() {
  const pathname = usePathname() ?? BASE;
  const session = useSession();
  const router = useRouter();
  const cur = section(pathname);
  const orders = useOrders();
  const open = orders.filter((o) => o.status === "new").length;
  return (
    <header className="a3-bar">
      <Link href={BASE} className="a3-brand">
        santalum<b>/ops</b>
      </Link>
      <nav className="a3-nav" aria-label="Sections">
        {NAV.map((n) => (
          <Link key={n.key} href={BASE + n.href} aria-current={cur.key === n.key ? "page" : undefined}>
            <span className="a3-nav-k">{n.key}</span>
            {n.label}
            {n.key === "o" && open > 0 && <span className="a3-nav-n">{open}</span>}
          </Link>
        ))}
      </nav>
      <button type="button" className="a3-cmd" onClick={() => paletteStore.set(true)}>
        <span>jump to order, product, customer</span>
        <Kbd>⌘K</Kbd>
      </button>
      <Clock />
      <button
        type="button"
        className="a3-who"
        title="Sign out"
        onClick={() => {
          adminSignOut();
          router.replace(`${BASE}/login`);
        }}
      >
        {session?.name.toLowerCase().replace(/\s+/g, ".")}
        <span className="a3-who-x">exit</span>
      </button>
    </header>
  );
}

function Clock() {
  const s = useSeconds();
  if (!s) return null;
  const d = new Date(s);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="a3-clock" aria-label="Local time">
      <i className="a3-led" data-tone="green" data-pulse /> {p(d.getHours())}:{p(d.getMinutes())}:{p(d.getSeconds())} IST
    </span>
  );
}

/* ---------- footer hints ---------- */
const HINTS: Record<string, [string, string][]> = {
  d: [["g o", "orders"], ["g p", "products"]],
  o: [["a", "advance"], ["w", "awb"], ["x", "cancel"], ["v", "invoice"]],
  p: [["n", "new"], ["1 2 3", "wood"]],
  i: [["+ -", "adjust"], ["1 2 3", "wood"]],
  c: [["n", "note"]],
  r: [["p", "publish"], ["h", "hide"], ["f", "feature"], ["e", "reply"]],
  k: [["n", "new code"]],
  t: [["⌘S", "save"]],
  s: [["⌘S", "save"]],
};
function Footer() {
  const pathname = usePathname() ?? BASE;
  const cur = section(pathname);
  const editor = /\/products\/(new|[^/]+)$/.test(pathname);
  const local = editor ? [["⌘S", "save"], ["esc", "back"]] : (HINTS[cur.key] ?? []);
  return (
    <footer className="a3-foot" aria-label="Keyboard shortcuts">
      {[["⌘K", "jump"], ["j k", "move"], ["↵", "open"], ["/", "filter"], ["g+key", "go"], ...local].map(([k, t]) => (
        <span key={k + t}>
          <Kbd>{k}</Kbd> {t}
        </span>
      ))}
      <span className="a3-foot-r">{cur.label.toLowerCase()} · preview data</span>
    </footer>
  );
}

/* ---------- global keys: ⌘K, /, g + key ---------- */
function Keys() {
  const router = useRouter();
  useEffect(() => {
    let g = 0;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        paletteStore.set(!paletteStore.get());
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || typingIn(e.target) || paletteStore.get()) return;
      if (e.key === "/") {
        const el = document.querySelector<HTMLInputElement>("[data-a3-search]");
        if (el) {
          e.preventDefault();
          el.focus();
          el.select();
        }
        return;
      }
      if (e.key === "g") {
        g = e.timeStamp;
        gKey.at = e.timeStamp;
        return;
      }
      if (g && e.timeStamp - g < 900) {
        const n = NAV.find((x) => x.key === e.key);
        g = 0;
        if (n) {
          e.preventDefault();
          router.push(BASE + n.href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
  return null;
}

/* ---------- command palette ---------- */
type Cmd = { id: string; kind: string; label: string; sub: string; href: string };

function Palette() {
  const open = useMini(paletteStore, false);
  if (!open) return null;
  return <PaletteBody />;
}

function PaletteBody() {
  const router = useRouter();
  const orders = useOrders();
  const products = useProducts();
  const customers = useCustomers();
  const { questions, reviews } = useReviews();
  const [q, setQ] = useState("");
  const [cur, setCur] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const all = useMemo<Cmd[]>(() => {
    const pages: Cmd[] = NAV.map((n) => ({ id: "go" + n.key, kind: "go", label: n.label, sub: `g ${n.key}`, href: BASE + n.href }));
    pages.push({ id: "new-p", kind: "do", label: "New product", sub: "create", href: `${BASE}/products/new` });
    pages.push({ id: "rev-p", kind: "do", label: `Moderate ${reviews.filter((r) => r.state === "pending").length} pending reviews`, sub: `${questions.filter((x) => !x.answer).length} open questions`, href: `${BASE}/reviews` });
    return [
      ...pages,
      ...orders.map((o) => ({ id: o.id, kind: "ord", label: `${o.id}  ${o.name}`, sub: `${STATUS[o.status].label.toLowerCase()} · ${formatINR(o.total)}`, href: `${BASE}/orders/${o.id}` })),
      ...products.map((p) => ({ id: "p" + p.slug, kind: "prd", label: p.name, sub: `${p.slug} · ${p.wood}`, href: `${BASE}/products/${p.slug}` })),
      ...customers.map((c) => ({ id: "c" + c.id, kind: "cus", label: c.name, sub: `${c.email} · ${c.city}`, href: `${BASE}/customers/${c.id}` })),
    ];
  }, [orders, products, customers, reviews, questions]);

  const hits = useMemo(() => {
    const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return all.slice(0, 13).concat(all.filter((c) => c.kind === "ord").slice(0, 8));
    const prefix = terms[0].match(/^(ord|prd|cus|go):?$/)?.[1];
    const rest = prefix ? terms.slice(1) : terms;
    return all
      .filter((c) => (!prefix || c.kind === prefix) && rest.every((t) => (c.label + " " + c.sub).toLowerCase().includes(t)))
      .slice(0, 40);
  }, [all, q]);

  useEffect(() => {
    input.current?.focus();
  }, []);

  const go = (c: Cmd | undefined) => {
    if (!c) return;
    paletteStore.set(false);
    router.push(c.href);
  };
  const move = (n: number) => {
    setCur(n);
    listRef.current?.querySelector(`[data-i="${n}"]`)?.scrollIntoView({ block: "nearest" });
  };

  return (
    <div className="a3-pal-wrap" onMouseDown={(e) => e.target === e.currentTarget && paletteStore.set(false)}>
      <div className="a3-pal" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="a3-pal-in">
          <span aria-hidden>&gt;</span>
          <input
            ref={input}
            value={q}
            placeholder="order id, name, product, email…  (prefix ord: prd: cus:)"
            aria-label="Search everything"
            role="combobox"
            aria-expanded="true"
            aria-controls="a3-pal-list"
            onChange={(e) => {
              setQ(e.target.value);
              setCur(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") paletteStore.set(false);
              else if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "n")) {
                e.preventDefault();
                move(Math.min(hits.length - 1, cur + 1));
              } else if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "p")) {
                e.preventDefault();
                move(Math.max(0, cur - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(hits[cur]);
              }
            }}
          />
          <Kbd>esc</Kbd>
        </div>
        <ul className="a3-pal-list" id="a3-pal-list" role="listbox" ref={listRef}>
          {hits.length === 0 && <li className="a3-pal-none">no match for “{q}”</li>}
          {hits.map((c, i) => (
            <li key={c.id} data-i={i} role="option" aria-selected={i === cur} onMouseEnter={() => setCur(i)} onClick={() => go(c)}>
              <span className="a3-pal-kind" data-k={c.kind}>
                {c.kind}
              </span>
              <span className="a3-pal-label">{c.label}</span>
              <span className="a3-pal-sub">{c.sub}</span>
            </li>
          ))}
        </ul>
        <div className="a3-pal-foot">
          <span>
            <Kbd>↑ ↓</Kbd> move
          </span>
          <span>
            <Kbd>↵</Kbd> open
          </span>
          <span>{hits.length} shown</span>
        </div>
      </div>
    </div>
  );
}
