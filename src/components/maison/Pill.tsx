"use client";

import Link from "next/link";
import type { MouseEvent, PointerEvent, ReactNode, Ref } from "react";

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
  ref,
  ...aria
}: {
  children: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  variant?: "solid" | "line";
  type?: "button" | "submit";
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  const track = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  const base = `group/pill relative isolate inline-flex items-center justify-center gap-3 overflow-hidden rounded-full font-medium transition-[color,transform,opacity] duration-300 ease-out-soft active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-(--mz-accent) ${
    size === "lg" ? "h-14 px-8 text-[16px]" : size === "sm" ? "h-10 px-4 text-[14px]" : "h-12 px-6 text-[15px]"
  } ${variant === "solid" ? "bg-(--mz-ink) text-(--mz-bg)" : "border border-(--mz-ink)/15 text-(--mz-ink) hover:text-(--mz-bg)"} ${className}`;

  const inner = (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute left-[var(--x,50%)] top-[var(--y,50%)] -z-10 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full transition-transform duration-500 ease-out-soft group-hover/pill:scale-100 ${
          variant === "solid" ? "bg-accent" : "bg-(--mz-ink)"
        }`}
      />
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} onPointerEnter={track} onPointerMove={track} onClick={onClick} className={base} {...aria}>
        {inner}
      </Link>
    );
  }
  return (
    <button ref={ref} type={type} disabled={disabled} onPointerEnter={track} onClick={onClick} className={base} {...aria}>
      {inner}
    </button>
  );
}
