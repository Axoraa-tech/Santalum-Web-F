"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useHydrated } from "@/lib/shop/store";
import { formatINR, STATUS } from "../_data/format";
import { stockKey } from "../_data/mock";
import { adminSignOut, stockState, useCustomers, useOrders, useProducts, useReviews, useSession, useStock } from "../_data/store";
import { Icon, type IconName } from "./icons";
import { initials, PageSkeleton, Thumb, Toaster } from "./ui";

/* ---------- frame + drawer ---------- */
const Drawer = createContext<{ open: boolean; set: (v: boolean) => void }>({ open: false, set: () => {} });

export function AdminFrame({ children }: { children: ReactNode }) {
  const [open, set] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && set(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <Drawer value={{ open, set }}>
      <div className="adm-frame" data-drawer={open ? "open" : "closed"}>
        {children}
        <button type="button" className="adm-scrim" aria-label="Close menu" tabIndex={-1} onClick={() => set(false)} />
      </div>
      <Toaster />
    </Drawer>
  );
}

/* ---------- sidebar ---------- */
type NavItem = { href: string; label: string; icon: IconName; count?: "orders" | "stock" | "reviews" };
const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Sell",
    items: [
      { href: "/admin", label: "Overview", icon: "overview" },
      { href: "/admin/orders", label: "Orders", icon: "orders", count: "orders" },
      { href: "/admin/products", label: "Products", icon: "products" },
      { href: "/admin/inventory", label: "Inventory", icon: "inventory", count: "stock" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", label: "Customers", icon: "customers" },
      { href: "/admin/reviews", label: "Reviews & Q&A", icon: "reviews", count: "reviews" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/coupons", label: "Coupons", icon: "coupons" },
      { href: "/admin/content", label: "Storefront content", icon: "content" },
    ],
  },
  { label: "Store", items: [{ href: "/admin/settings", label: "Settings", icon: "settings" }] },
];

type Counts = { orders: number; stock: number; reviews: number };

function Sidebar({ pathname, counts }: { pathname: string; counts: Counts | null }) {
  const { set } = use(Drawer);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));
  return (
    <aside className="adm-side" aria-label="Admin">
      <Link href="/admin" className="adm-brand" onClick={() => set(false)}>
        <span className="adm-brand-mark" aria-hidden>
          <span className="ring-red" />
          <span className="ring-white" />
        </span>
        <span>
          <span className="adm-brand-name">Santalum</span>
          <span className="adm-brand-sub">Maison admin</span>
        </span>
      </Link>
      <nav className="adm-nav">
        {NAV.map((g) => (
          <div key={g.label} className="adm-nav-group">
            <div className="adm-nav-label">{g.label}</div>
            {g.items.map((it) => {
              const n = it.count && counts ? counts[it.count] : 0;
              return (
                <Link key={it.href} href={it.href} aria-current={isActive(it.href) ? "page" : undefined} onClick={() => set(false)}>
                  <Icon name={it.icon} />
                  {it.label}
                  {n > 0 && (
                    <span className="adm-nav-count" data-tone={it.count === "stock" ? "alert" : undefined} title={it.count === "orders" ? "New orders" : it.count === "stock" ? "Options low or out of stock" : "Waiting for moderation"}>
                      {n}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="adm-side-foot">
        <Link href="/maison" target="_blank" rel="noreferrer">
          <Icon name="external" width={14} height={14} />
          View the shop
        </Link>
        <span>Preview build. Data lives in this browser until the backend is connected.</span>
      </div>
    </aside>
  );
}

function SidebarCounts({ pathname }: { pathname: string }) {
  const orders = useOrders();
  const products = useProducts();
  const stock = useStock();
  const { reviews } = useReviews();
  const counts = useMemo(
    () => ({
      orders: orders.filter((o) => o.status === "new").length,
      // counted per option, like Inventory and the Overview, so all three agree
      stock: products
        .filter((p) => p.status !== "archived")
        .reduce((n, p) => n + p.options.filter((o) => stockState(o.stock, stock.thresholds[stockKey(p.slug, o.id)] ?? 5) !== "in").length, 0),
      reviews: reviews.filter((r) => r.state === "pending").length,
    }),
    [orders, products, reviews, stock],
  );
  return <Sidebar pathname={pathname} counts={counts} />;
}

/** Reads the pathname, so it sits behind Suspense in the layout (dynamic params suspend it). */
export function LiveSidebar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const session = useSession();
  return hydrated && session ? <SidebarCounts pathname={pathname} /> : <Sidebar pathname={pathname} counts={null} />;
}
export function StaticSidebar() {
  return <Sidebar pathname="" counts={null} />;
}

/* ---------- top bar ---------- */
export function Topbar() {
  const { open, set } = use(Drawer);
  const hydrated = useHydrated();
  return (
    <header className="adm-top adm-noprint">
      <button type="button" className="adm-btn adm-menu-btn" data-variant="ghost" data-size="icon" aria-label="Open menu" aria-expanded={open} onClick={() => set(!open)}>
        <Icon name="menu" />
      </button>
      <GlobalSearch enabled={hydrated} />
      <div className="adm-top-right">
        <span className="adm-preview-tag" title="Orders, customers and stock are sample data plus anything placed on the shop in this browser.">
          <span>Preview data</span>
        </span>
        {hydrated && <UserMenu />}
      </div>
    </header>
  );
}

function UserMenu() {
  const session = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  if (!session) return null;
  return (
    <div className="adm-user" ref={ref}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="adm-avatar">{initials(session.name)}</span>
        <span className="adm-user-name" style={{ fontSize: 13.5, fontWeight: 500 }}>
          {session.name}
        </span>
        <Icon name="chevronDown" width={14} height={14} />
      </button>
      {open && (
        <div className="adm-menu" role="menu">
          <div className="adm-menu-head">
            <div style={{ fontWeight: 500 }}>{session.name}</div>
            <div className="adm-muted" style={{ fontSize: 12.5 }}>
              {session.email} · Owner
            </div>
          </div>
          <Link role="menuitem" href="/admin/settings" onClick={() => setOpen(false)}>
            <Icon name="settings" width={16} height={16} />
            Settings
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              adminSignOut();
              router.push("/admin/login");
            }}
          >
            <Icon name="logout" width={16} height={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- global search: orders, products, customers ---------- */
function GlobalSearch({ enabled }: { enabled: boolean }) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable;
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const show = enabled && focused && q.trim().length > 0;
  return (
    <div className="adm-search">
      <div className="adm-search-field">
        <Icon name="search" />
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-expanded={show}
          aria-controls="adm-search-list"
          aria-autocomplete="list"
          aria-label="Search orders, products and customers"
          placeholder="Search orders, pieces, people"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        />
        {q ? (
          <button
            type="button"
            className="adm-search-clear"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQ("");
              input.current?.focus();
            }}
          >
            <Icon name="close" />
          </button>
        ) : (
          <span className="adm-kbd" aria-hidden>
            /
          </span>
        )}
      </div>
      {show && <SearchResults q={q} inputRef={input} onDone={() => { setQ(""); input.current?.blur(); }} />}
    </div>
  );
}

type Hit = { href: string; title: string; sub: string; meta: string; photo?: { id: string; slug: string } };

function SearchResults({ q, inputRef, onDone }: { q: string; inputRef: RefObject<HTMLInputElement | null>; onDone: () => void }) {
  const orders = useOrders();
  const products = useProducts();
  const customers = useCustomers();
  const router = useRouter();
  const [sel, setSel] = useState(0);
  const groups = useMemo(() => {
    const n = q.trim().toLowerCase();
    const digits = n.replace(/\D/g, "");
    const o: Hit[] = orders
      .filter((x) => x.id.toLowerCase().includes(n) || x.name.toLowerCase().includes(n) || x.email.includes(n) || (digits.length >= 4 && (x.phone.includes(digits) || x.courier?.awb.includes(digits))))
      .slice(0, 5)
      .map((x) => ({ href: `/admin/orders/${x.id}`, title: x.id, sub: x.name, meta: `${formatINR(x.total)} · ${STATUS[x.status].label}` }));
    const p: Hit[] = products
      .filter((x) => x.name.toLowerCase().includes(n) || x.slug.includes(n))
      .slice(0, 5)
      .map((x) => ({ href: `/admin/products/${x.slug}`, title: x.name, sub: x.wood === "red" ? "Red sandalwood" : "White sandalwood", meta: `${x.stockTotal} in stock`, photo: x.photos[0] ? { id: x.photos[0].id, slug: x.slug } : undefined }));
    const c: Hit[] = customers
      .filter((x) => x.name.toLowerCase().includes(n) || x.email.includes(n) || (digits.length >= 4 && x.phone.includes(digits)))
      .slice(0, 5)
      .map((x) => ({ href: `/admin/customers/${x.id}`, title: x.name, sub: x.email, meta: `${x.orders} orders` }));
    return [
      { label: "Orders", hits: o },
      { label: "Products", hits: p },
      { label: "Customers", hits: c },
    ].filter((g) => g.hits.length);
  }, [q, orders, products, customers]);
  const flat = groups.flatMap((g) => g.hits);
  const cur = Math.min(sel, Math.max(0, flat.length - 1));

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSel((s) => Math.min(flat.length - 1, s + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSel((s) => Math.max(0, s - 1));
      } else if (e.key === "Enter" && flat[cur]) {
        e.preventDefault();
        router.push(flat[cur].href);
        onDone();
      } else if (e.key === "Escape") onDone();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [flat, cur, router, onDone, inputRef]);

  let i = -1;
  return (
    <div className="adm-search-pop" id="adm-search-list" role="listbox" aria-label="Search results">
      {flat.length === 0 && <div className="adm-search-empty">Nothing matches “{q}”. Try an order number, a name, an email or a phone number.</div>}
      {groups.map((g) => (
        <div key={g.label} role="group" aria-label={g.label}>
          <div className="adm-search-group">{g.label}</div>
          {g.hits.map((h) => {
            i++;
            const me = i;
            return (
              <Link key={h.href} href={h.href} role="option" aria-selected={me === cur} className="adm-search-item" onMouseEnter={() => setSel(me)} onMouseDown={(e) => e.preventDefault()} onClick={onDone}>
                {h.photo ? <Thumb photoId={h.photo.id} slug={h.photo.slug} size="sm" /> : <Icon name={g.label === "Orders" ? "orders" : "customers"} width={16} height={16} style={{ color: "var(--a-ink-3)" }} />}
                <span style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 500 }}>{h.title}</span>
                  <span className="adm-muted"> · {h.sub}</span>
                </span>
                <small>{h.meta}</small>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ---------- gate: admin data renders in the browser only, behind a session ---------- */
export function Gate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && !session) router.replace(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [hydrated, session, router]);
  if (!hydrated || !session) return <PageSkeleton />;
  return <>{children}</>;
}
