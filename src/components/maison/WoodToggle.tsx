"use client";

import { usePathname, useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { CATEGORIES, getProduct } from "@/lib/shop/products";
import { setWoodQuietly, switchWood, useWood } from "@/lib/wood";
import { beginTurn } from "./TurnVeil";

/**
 * Red / white. The knob is a slice of the wood and rolls across as it changes. Its position comes
 * from <html data-wood> in CSS, so a reload in white shows it on the right before hydration.
 * A product page belongs to one wood, so flipping there moves to the same piece in the other
 * wood (or to that wood's shop). On the shop, a category from the other wood is cleared.
 */
export function WoodToggle({ className = "" }: { className?: string }) {
  const wood = useWood();
  const white = wood === "white";
  const pathname = usePathname();
  const router = useRouter();

  /** On a product page, where flipping leads: the same piece in the other wood, or that wood's shop. */
  const away = (next: "red" | "white") => {
    const slug = pathname.match(/^\/maison\/shop\/([^/?#]+)/)?.[1];
    const p = slug ? getProduct(decodeURIComponent(slug)) : undefined;
    if (!p || p.wood === next) return null;
    return p.counterpart ? `/maison/shop/${p.counterpart}` : "/maison/shop";
  };

  const flip = () => {
    const next = white ? "red" : "white";
    const to = away(next);
    if (to) {
      // The piece on screen belongs to the old wood. Hide it in the same step as the colours change,
      // so the crossfade goes from the old piece in its own wood to the turning slice, never the old
      // piece in the new wood's colours.
      const turn = () => {
        beginTurn(to);
        setWoodQuietly(next);
      };
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (typeof document.startViewTransition === "function" && !reduce) {
        const root = document.documentElement;
        root.classList.add("wood-vt");
        document.startViewTransition(() => flushSync(turn)).finished.finally(() => root.classList.remove("wood-vt"));
      } else turn();
      router.push(to);
      return;
    }
    switchWood(next);
    if (pathname === "/maison/shop") {
      const c = new URLSearchParams(window.location.search).get("c");
      if (c && !CATEGORIES[next].some((x) => x.id === c)) router.replace("/maison/shop", { scroll: false });
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={white}
      aria-label="White sandalwood"
      title={white ? "Showing white sandalwood" : "Showing red sandalwood"}
      onClick={flip}
      onPointerEnter={() => {
        const to = away(white ? "red" : "white");
        if (to) router.prefetch(to);
      }}
      className={`relative flex h-11 w-[7.5rem] shrink-0 items-center rounded-full border border-(--mz-line) bg-(--mz-bg)/75 p-1 text-[14px] text-(--mz-ink) backdrop-blur-xl transition-colors hover:border-(--mz-ink)/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent) ${className}`}
    >
      <span aria-hidden className="mz-knob absolute left-1 top-1 size-9 overflow-hidden rounded-full shadow-[0_2px_8px_rgb(23_19_15/0.25),inset_0_0_0_1px_rgb(0_0_0/0.15)]">
        <span className="mz-knob-red ring-red absolute inset-0" />
        <span className="mz-knob-white ring-white absolute inset-0" />
      </span>
      <span className="mz-tg-red absolute right-4">Red</span>
      <span className="mz-tg-white absolute left-4">White</span>
    </button>
  );
}
