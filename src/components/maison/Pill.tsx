"use client";

import Link from "next/link";
import type { MouseEvent, PointerEvent, ReactNode } from "react";

/**
 * Rounded action. On hover, a fill grows from wherever the pointer entered.
 * solid: ink → accent fill. line: hairline → ink fill.
 */
export function Pill({
  children,
  href,
  onClick,
  variant = "solid",
  type = "button",
  className = "",
  size = "md",
  disabled,
}: {
  children: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  variant?: "solid" | "line";
  type?: "button" | "submit";
  className?: string;
  size?: "md" | "lg";
  disabled?: boolean;
}) {
  const track = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  const base = `group relative isolate inline-flex items-center justify-center gap-3 overflow-hidden rounded-full font-medium transition-[color,transform,opacity] duration-300 ease-out-soft active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 ${
    size === "lg" ? "h-14 px-8 text-[16px]" : "h-12 px-6 text-[15px]"
  } ${variant === "solid" ? "bg-ink text-paper" : "border border-ink/15 text-ink hover:text-paper"} ${className}`;

  const inner = (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute left-[var(--x,50%)] top-[var(--y,50%)] -z-10 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full transition-transform duration-500 ease-out-soft group-hover:scale-100 ${
          variant === "solid" ? "bg-accent" : "bg-ink"
        }`}
      />
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} onPointerEnter={track} onPointerMove={track} onClick={onClick} className={base}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled} onPointerEnter={track} onClick={onClick} className={base}>
      {inner}
    </button>
  );
}
