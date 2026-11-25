"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, type ReactNode } from "react";
import { useHydrated } from "@/lib/shop/store";
import { useOrders, useReviews, useSession, useProducts } from "../../_data/store";
import { I, type A5IconName } from "./icons";
import { BASE } from "./kit";

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
    <div className="a5-app">
      <div className="a5-col">
        <div className="a5-main">
          <div className="a5-skel" style={{ height: 18, width: 120, marginTop: 28 }} />
          <div className="a5-skel" style={{ height: 40, width: 200, marginTop: 10 }} />
          <div className="a5-skel" style={{ height: 160, marginTop: 24, borderRadius: 24 }} />
          <div className="a5-skel" style={{ height: 96, marginTop: 12, borderRadius: 24 }} />
        </div>
      </div>
      <div className="a5-panel" data-idle="" />
    </div>
  );
}

/* ---------- counts for the tab bar ---------- */
export function useCounts() {
  const orders = useOrders();
  const products = useProducts();
  const { reviews, questions } = useReviews();
  return useMemo(
    () => ({
      newOrders: orders.filter((o) => o.status === "new").length,
      returns: orders.filter((o) => o.status === "return-requested").length,
      stock: products.filter((p) => p.status === "active" && p.stock !== "in").length,
      reviews: reviews.filter((r) => r.state === "pending").length,
      questions: questions.filter((q) => !q.answer).length,
    }),
    [orders, products, reviews, questions],
  );
}

const TABS: { href: string; label: string; icon: A5IconName; match: (p: string) => boolean }[] = [
  { href: BASE, label: "Today", icon: "today", match: (p) => p === BASE },
  { href: `${BASE}/orders`, label: "Orders", icon: "orders", match: (p) => p.startsWith(`${BASE}/orders`) },
  { href: `${BASE}/products`, label: "Products", icon: "products", match: (p) => p.startsWith(`${BASE}/products`) },
  { href: `${BASE}/customers`, label: "Customers", icon: "customers", match: (p) => p.startsWith(`${BASE}/customers`) },
  { href: `${BASE}/more`, label: "More", icon: "more", match: (p) => /\/(more|inventory|reviews|coupons|content|settings)/.test(p) },
];

function TabBar() {
  const path = usePathname();
  const c = useCounts();
  const badge = (label: string) => (label === "Orders" ? c.newOrders : label === "More" ? c.reviews + c.questions : 0);
  return (
    <nav className="a5-tabs" aria-label="Sections">
      {TABS.map((t) => {
        const b = badge(t.label);
        return (
          <Link key={t.href} href={t.href} aria-current={t.match(path) ? "page" : undefined}>
            <span className="a5-tab-ic">
              <I n={t.icon} size={24} />
              {b > 0 && <span className="a5-badge">{b > 99 ? "99+" : b}</span>}
            </span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * The frame of every screen. On a phone: one column, the tab bar at the bottom, and the detail
 * rising over it as a sheet. On a desktop: the same 480px column beside a wide detail panel.
 */
export function Split({ list, detail, open, onClose, closeHref, idle }: { list: ReactNode; detail?: ReactNode; open: boolean; onClose?: () => void; closeHref?: string; idle?: ReactNode }) {
  const router = useRouter();
  const close = () => {
    if (onClose) onClose();
    else if (closeHref) router.push(closeHref, { scroll: false });
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector(".a5-sheet")) return;
      if (onClose) onClose();
      else if (closeHref) router.push(closeHref, { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, closeHref, router]);
  return (
    <div className="a5-app" data-open={open ? "" : undefined}>
      <div className="a5-col">
        <main className="a5-main" id="main">
          {list}
        </main>
        <TabBar />
      </div>
      <button type="button" className="a5-panel-scrim" aria-label="Close" tabIndex={-1} onClick={close} />
      <aside className="a5-panel" aria-label="Detail" data-idle={open ? undefined : ""}>
        <div className="a5-panel-bar">
          <span className="a5-grab" aria-hidden />
          <button type="button" className="a5-back" onClick={close}>
            <I n="back" size={20} />
            Back
          </button>
        </div>
        <div className="a5-panel-body">{open ? detail : idle}</div>
      </aside>
    </div>
  );
}

/** Routed master-detail: the list stays mounted in a layout, the page is the detail. */
export function RoutedSplit({ base, list, idle, children }: { base: string; list: ReactNode; idle?: ReactNode; children: ReactNode }) {
  const path = usePathname();
  const open = path !== base && path.startsWith(base + "/");
  return <Split list={list} detail={children} idle={idle ?? children} open={open} closeHref={base} />;
}
