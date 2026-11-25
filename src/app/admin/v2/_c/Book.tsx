"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHydrated } from "@/lib/shop/store";
import { adminSignOut, useOrders, useReviews, useSession } from "../../_data/store";
import { BASE } from "./kit";

export const TABS = [
  { href: BASE, label: "Today" },
  { href: `${BASE}/orders`, label: "Orders" },
  { href: `${BASE}/products`, label: "Catalogue" },
  { href: `${BASE}/inventory`, label: "Stock" },
  { href: `${BASE}/customers`, label: "Customers" },
  { href: `${BASE}/reviews`, label: "Reviews" },
  { href: `${BASE}/coupons`, label: "Coupons" },
  { href: `${BASE}/content`, label: "Content" },
  { href: `${BASE}/settings`, label: "Settings" },
];

function activeIndex(path: string) {
  let best = 0;
  TABS.forEach((t, i) => {
    if (i > 0 && (path === t.href || path.startsWith(t.href + "/"))) best = i;
  });
  return best;
}

/** Ledger index tabs down the right edge. Alt+1…9 turns to a tab; "/" jumps to the page's search. */
export function IndexTabs() {
  const path = usePathname();
  const router = useRouter();
  const cur = activeIndex(path);
  const hydrated = useHydrated();
  const session = useSession();
  const orders = useOrders();
  const reviews = useReviews();
  const counts: Record<string, number> = hydrated && session
    ? {
        Orders: orders.filter((o) => o.status === "new" || o.status === "confirmed" || o.status === "packed" || o.status === "return-requested").length,
        Reviews: reviews.reviews.filter((r) => r.state === "pending").length,
      }
    : {};

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.closest("input, textarea, select, [contenteditable]");
      if (e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        router.push(TABS[Number(e.key) - 1].href);
      } else if (e.key === "/" && !typing) {
        const s = document.querySelector<HTMLInputElement>("[data-a2-search]");
        if (s) {
          e.preventDefault();
          s.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <nav className="a2-tabs" aria-label="Book index">
      {TABS.map((t, i) => (
        <Link key={t.href} href={t.href} className="a2-tab" aria-current={i === cur ? "page" : undefined} title={`${t.label} (Alt+${i + 1})`}>
          <span>{t.label}</span>
          {counts[t.label] ? <b className="a2-tab-n">{counts[t.label]}</b> : null}
        </Link>
      ))}
    </nav>
  );
}
export function StaticTabs() {
  return (
    <nav className="a2-tabs" aria-label="Book index">
      {TABS.map((t) => (
        <a key={t.href} href={t.href} className="a2-tab">
          <span>{t.label}</span>
        </a>
      ))}
    </nav>
  );
}

/** The running head across the top of every page. */
export function RunningHead() {
  const hydrated = useHydrated();
  const session = useSession();
  const router = useRouter();
  return (
    <div className="a2-run">
      <Link href={BASE} className="a2-run-title">
        Santalum Maison <span>Day Book, 2026–27</span>
      </Link>
      {hydrated && session ? (
        <span className="a2-run-who">
          <span className="a2-hide-sm">kept by </span>
          {session.name}
          <button
            type="button"
            className="a2-link"
            onClick={() => {
              adminSignOut();
              router.push(`${BASE}/login`);
            }}
          >
            close book
          </button>
        </span>
      ) : null}
    </div>
  );
}
