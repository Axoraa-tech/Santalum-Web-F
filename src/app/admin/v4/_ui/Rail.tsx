"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useHydrated } from "@/lib/shop/store";
import { adminSignOut, useOrders, useReviews, useSession } from "../../_data/store";
import { BASE, Icon, initialsOf, type IconName } from "./kit";

type Item = { href: string; label: string; count?: (c: Counts) => number };
type Drawer = { id: string; icon: IconName; label: string; items: Item[]; match: RegExp };
type Counts = { fresh: number; toPack: number; pending: number; questions: number };

const DRAWERS: Drawer[] = [
  { id: "bench", icon: "bench", label: "Bench", match: /^\/admin\/v4\/?$/, items: [{ href: BASE, label: "Today on the bench" }] },
  {
    id: "orders",
    icon: "board",
    label: "Orders",
    match: /^\/admin\/v4\/orders/,
    items: [
      { href: `${BASE}/orders`, label: "Order board", count: (c) => c.fresh },
      { href: `${BASE}/orders?view=list`, label: "All orders, as a list" },
    ],
  },
  {
    id: "catalogue",
    icon: "jar",
    label: "Pieces",
    match: /^\/admin\/v4\/(products|inventory)/,
    items: [
      { href: `${BASE}/products`, label: "Products" },
      { href: `${BASE}/products/new`, label: "New product" },
      { href: `${BASE}/inventory`, label: "Stock shelves" },
    ],
  },
  {
    id: "people",
    icon: "people",
    label: "People",
    match: /^\/admin\/v4\/(customers|reviews)/,
    items: [
      { href: `${BASE}/customers`, label: "Customers" },
      { href: `${BASE}/reviews`, label: "Review wall", count: (c) => c.pending + c.questions },
    ],
  },
  {
    id: "shop",
    icon: "shop",
    label: "Shop",
    match: /^\/admin\/v4\/(coupons|content|settings)/,
    items: [
      { href: `${BASE}/coupons`, label: "Coupons" },
      { href: `${BASE}/content`, label: "Homepage content" },
      { href: `${BASE}/settings`, label: "Settings" },
    ],
  },
];

function useCounts(): Counts {
  const orders = useOrders();
  const { reviews, questions } = useReviews();
  return useMemo(
    () => ({
      fresh: orders.filter((o) => o.status === "new").length,
      toPack: orders.filter((o) => o.status === "confirmed").length,
      pending: reviews.filter((r) => r.state === "pending").length,
      questions: questions.filter((q) => !q.answer).length,
    }),
    [orders, reviews, questions],
  );
}

export function StaticRail() {
  return (
    <nav className="a4-rail" aria-label="Admin">
      <span className="a4-mark">S</span>
      <ul className="a4-rail-list">
        {DRAWERS.map((d) => (
          <li key={d.id}>
            <span className="a4-rail-btn">
              <Icon name={d.icon} size={20} />
              <span className="a4-rail-label">{d.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Rail() {
  const pathname = usePathname() ?? BASE;
  const hydrated = useHydrated();
  const session = useSession();
  const counts = useCounts();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const drawer = DRAWERS.find((d) => d.id === open);
  const live = hydrated && !!session;

  return (
    <>
      <nav className="a4-rail" aria-label="Admin">
        <Link href={BASE} className="a4-mark" aria-label="Santalum, the bench">
          S
        </Link>
        <ul className="a4-rail-list">
          {DRAWERS.map((d) => {
            const here = d.match.test(pathname);
            const badge = live ? d.items.reduce((s, it) => s + (it.count?.(counts) ?? 0), 0) : 0;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  className="a4-rail-btn"
                  aria-expanded={open === d.id}
                  aria-controls="a4-drawer"
                  data-here={here || undefined}
                  onClick={() => (d.items.length === 1 ? router.push(d.items[0].href) : setOpen(open === d.id ? null : d.id))}
                >
                  <Icon name={d.icon} size={20} />
                  <span className="a4-rail-label">{d.label}</span>
                  {badge > 0 && <span className="a4-rail-badge">{badge}</span>}
                </button>
              </li>
            );
          })}
        </ul>
        {live && (
          <button
            type="button"
            className="a4-rail-me"
            title={`Signed in as ${session.email}. Sign out`}
            onClick={() => {
              adminSignOut();
              router.replace(`${BASE}/login`);
            }}
          >
            <span className="a4-avatar">{initialsOf(session.name)}</span>
            <span className="a4-rail-label">Sign out</span>
          </button>
        )}
      </nav>
      <div id="a4-drawer" className="a4-drawer" data-open={drawer ? "" : undefined} aria-hidden={!drawer}>
        {drawer && (
          <>
            <p className="a4-drawer-title">{drawer.label}</p>
            <ul>
              {drawer.items.map((it) => {
                const n = live ? (it.count?.(counts) ?? 0) : 0;
                return (
                  <li key={it.href}>
                    <Link href={it.href} onClick={() => setOpen(null)}>
                      {it.label}
                      {n > 0 && <span className="a4-chip-n">{n}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
      {drawer && <button type="button" className="a4-scrim" aria-label="Close drawer" tabIndex={-1} onClick={() => setOpen(null)} />}
    </>
  );
}
