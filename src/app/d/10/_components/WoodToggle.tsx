"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { getProduct } from "@/lib/shop/products";
import { setWoodQuietly, switchWood, useWood, type Wood } from "@/lib/wood";
import k from "../k";
import { useStore, woodRouteStore } from "./lib";

/** The product a /d/10/p/[slug] path shows, if any. */
function productAt(pathname: string) {
  const m = pathname.match(/^\/d\/10\/p\/([^/?#]+)/);
  return m ? getProduct(decodeURIComponent(m[1])) : undefined;
}

/**
 * The wood toggle is two words. The current wood is set wide (wdth 150), the other condensed (wdth 50);
 * CSS reads <html data-wood>, so it is right before hydration, and the axes ease when you switch.
 * On a product page the piece belongs to one wood: the toggle opens the other wood's piece (or the shop)
 * and the colours change only when that page is on screen; meanwhile the chosen word breathes.
 */
export function WoodToggle({ size = 22, className = "" }: { size?: number; className?: string }) {
  const wood = useWood();
  const pathname = usePathname();
  const router = useRouter();
  const pending = useStore(woodRouteStore, null);
  const go = (w: Wood) => {
    if (w === wood && !pending) return;
    const p = productAt(pathname);
    if (p && p.wood !== w) {
      const path = p.counterpart ? `/d/10/p/${p.counterpart}` : "/d/10/shop";
      woodRouteStore.set({ wood: w, path });
      router.push(path);
      return;
    }
    woodRouteStore.set(null);
    if (w !== wood) switchWood(w);
  };
  return (
    <div role="group" aria-label="Sandalwood" aria-busy={pending ? true : undefined} className={`flex items-baseline gap-[0.18em] ${className}`} style={{ fontSize: size }}>
      <button
        type="button"
        aria-pressed={wood === "red"}
        aria-label="Red sandalwood"
        data-pending={pending?.wood === "red" ? "" : undefined}
        onClick={() => go("red")}
        className={`${k.tog} ${k.togRed} rounded-sm px-[0.04em]`}
      >
        Red
      </button>
      <span aria-hidden className="text-[0.6em] text-[var(--k10-grey)]">
        /
      </span>
      <button
        type="button"
        aria-pressed={wood === "white"}
        aria-label="White sandalwood"
        data-pending={pending?.wood === "white" ? "" : undefined}
        onClick={() => go("white")}
        className={`${k.tog} ${k.togWhite} rounded-sm px-[0.04em]`}
      >
        White
      </button>
    </div>
  );
}

/**
 * Mounted once in the nav: when the page a product-page switch asked for arrives, set its wood before
 * that page paints. Any other navigation drops the pending switch.
 */
export function WoodRouteSync() {
  const pathname = usePathname();
  const router = useRouter();
  useLayoutEffect(() => {
    const p = woodRouteStore.get();
    if (!p) return;
    if (pathname === p.path) setWoodQuietly(p.wood);
    woodRouteStore.set(null);
  }, [pathname]);
  // on a product page, fetch the other wood's page ahead, so a flip of the toggle opens it without a wait
  useEffect(() => {
    const p = productAt(pathname);
    if (p) router.prefetch(p.counterpart ? `/d/10/p/${p.counterpart}` : "/d/10/shop");
  }, [pathname, router]);
  return null;
}
