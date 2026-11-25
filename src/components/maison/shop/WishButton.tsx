"use client";

import { motion } from "motion/react";
import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { useHydrated } from "@/lib/shop/store";
import { HeartIcon } from "./Icons";

/** Keep a piece for later. Works signed out; the list joins the account on sign-in. */
export function WishButton({ slug, name, className = "", size = "md" }: { slug: string; name: string; className?: string; size?: "md" | "lg" }) {
  const hydrated = useHydrated();
  const list = useWishlist();
  const on = hydrated && list.includes(slug);
  return (
    <button
      type="button"
      onClick={() => toggleWishlist(slug)}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from your wishlist` : `Save ${name} to your wishlist`}
      title={on ? "Saved to your wishlist" : "Save to your wishlist"}
      className={`grid place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-300 ease-out-soft active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent) ${
        size === "lg" ? "size-14" : "size-10"
      } ${on ? "border-transparent bg-(--mz-accent-soft) text-(--mz-accent)" : "border-(--mz-line) bg-(--mz-bg)/85 text-(--mz-ink-2) backdrop-blur hover:border-(--mz-ink)/25 hover:text-(--mz-ink)"} ${className}`}
    >
      <motion.span key={on ? "on" : "off"} initial={{ scale: on ? 0.5 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }} className="grid">
        <HeartIcon filled={on} />
      </motion.span>
    </button>
  );
}
