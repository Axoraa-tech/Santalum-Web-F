"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useHydrated } from "@/lib/shop/store";
import { fmtLong } from "../../_data/format";
import { adminSignOut, useNow, useOrders, useProducts, useReviews, useSession } from "../../_data/store";
import { BASE } from "./kit";

export const SECTIONS = [
  { no: "01", label: "Overview", href: BASE },
  { no: "02", label: "Orders", href: `${BASE}/orders` },
  { no: "03", label: "Products", href: `${BASE}/products` },
  { no: "04", label: "Inventory", href: `${BASE}/inventory` },
  { no: "05", label: "Customers", href: `${BASE}/customers` },
  { no: "06", label: "Reviews", href: `${BASE}/reviews` },
  { no: "07", label: "Coupons", href: `${BASE}/coupons` },
  { no: "08", label: "Content", href: `${BASE}/content` },
  { no: "09", label: "Settings", href: `${BASE}/settings` },
] as const;

function current(pathname: string) {
  const rest = pathname.slice(BASE.length);
  if (!rest || rest === "/") return SECTIONS[0];
  return SECTIONS.find((s, i) => i > 0 && pathname.startsWith(s.href)) ?? SECTIONS[0];
}

/** Signed-out admins go to the v6 sign-in. Nothing data-bound renders on the server. */
export function Gate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && !session) router.replace(`${BASE}/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [hydrated, session, router]);
  if (!hydrated || !session) return <Skeleton />;
  return <>{children}</>;
}

export function Skeleton() {
  return (
    <div className="a6-skel" aria-busy="true" aria-label="Loading">
      <span />
      <span />
      <span />
    </div>
  );
}

/* ---------- masthead + numbered top navigation ---------- */
export function Masthead() {
  const pathname = usePathname() ?? BASE;
  const hydrated = useHydrated();
  const session = useSession();
  return <MastheadView pathname={pathname} live={hydrated && !!session} />;
}
export function StaticMasthead() {
  return <MastheadView pathname="" live={false} />;
}

function MastheadView({ pathname, live }: { pathname: string; live: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const here = current(pathname);
  const menuOpen = open === pathname;
  return (
    <header className="a6-mast">
      <div className="a6-mast-top a6-grid">
        <Link href={BASE} className="a6-mast-name">
          Santalum Maison
        </Link>
        <div className="a6-mast-meta">{live ? <LiveMeta /> : <span>Administration</span>}</div>
      </div>
      <nav className="a6-nav" aria-label="Sections" data-open={menuOpen || undefined}>
        <button type="button" className="a6-nav-toggle" aria-expanded={menuOpen} onClick={() => setOpen(menuOpen ? null : pathname)}>
          <span className="a6-nav-no">{here.no}</span>
          {here.label}
          <span className="a6-nav-index">{menuOpen ? "Close" : "Index"}</span>
        </button>
        <ol>
          {SECTIONS.map((s) => (
            <li key={s.no}>
              <Link href={s.href} aria-current={pathname && s === here ? "page" : undefined} onClick={() => setOpen(null)}>
                <span className="a6-nav-no">{s.no}</span>
                {s.label}
                {live && <Count section={s.no} />}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </header>
  );
}

function LiveMeta() {
  const now = useNow();
  const session = useSession();
  const router = useRouter();
  return (
    <>
      <span className="a6-mast-date">{fmtLong(now)}</span>
      <span>{session?.name}</span>
      <button
        type="button"
        className="a6-link"
        onClick={() => {
          adminSignOut();
          router.replace(`${BASE}/login`);
        }}
      >
        Sign out
      </button>
    </>
  );
}

function Count({ section }: { section: string }) {
  const orders = useOrders();
  const products = useProducts();
  const { reviews } = useReviews();
  const n = useMemo(() => {
    if (section === "02") return orders.filter((o) => o.status === "new" || o.status === "confirmed" || o.status === "packed" || o.status === "return-requested").length;
    if (section === "04") return products.filter((p) => p.status === "active" && p.stock !== "in").length;
    if (section === "06") return reviews.filter((r) => r.state === "pending").length;
    return 0;
  }, [section, orders, products, reviews]);
  return n ? <sup className="a6-nav-count">{n}</sup> : null;
}
