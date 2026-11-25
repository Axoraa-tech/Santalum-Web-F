"use client";

import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { useHydrated } from "@/lib/shop/store";
import { cx } from "./ui";

/**
 * The wishlist, in museum terms: "Keep" puts a small paper tag on the piece, as a curator would mark
 * a work to come back to. Works signed out too; the list joins the account on sign-in.
 */
export function Keep({ slug, name, className, quiet = false }: { slug: string; name: string; className?: string; quiet?: boolean }) {
  const hydrated = useHydrated();
  const list = useWishlist();
  const kept = hydrated && list.includes(slug);
  return (
    <button
      type="button"
      className={cx("c4s-keep", className)}
      data-quiet={quiet ? "" : undefined}
      aria-pressed={kept}
      aria-label={kept ? `Kept: ${name}. Remove from your kept pieces` : `Keep ${name} for later`}
      onClick={() => toggleWishlist(slug)}
    >
      <svg viewBox="0 0 14 18" aria-hidden="true" className="c4s-keepTag">
        <path d="M1 1h12v16l-6-4.2L1 17z" />
      </svg>
      <span>{kept ? "Kept" : "Keep"}</span>
    </button>
  );
}
