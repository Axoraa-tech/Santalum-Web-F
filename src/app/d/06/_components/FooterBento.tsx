"use client";

import Link from "next/link";
import { WOOD_NAMES } from "@/lib/catalog";
import { s } from "./cls";
import { cx, SECTIONS } from "./data";
import { IconUp, Mark, Swatch } from "./ui";

/** The footer is the last bento row. */
export function FooterBento() {
  const top = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <footer className="mx-auto max-w-[1560px] px-3 pt-3">
      <div className={cx(s.bento, s.foot)}>
        <div style={{ gridArea: "wm" }} className={cx(s.tile, "flex min-h-[260px] flex-col justify-between gap-10 p-6 sm:p-8")}>
          <p className="flex items-start gap-3">
            <span className="mt-[0.12em] shrink-0">
              <Mark size={34} />
            </span>
            <span className={cx(s.display, "text-[clamp(44px,10.5cqw,118px)]")}>Santalum Maison</span>
          </p>
          <p className={cx(s.muted, "max-w-[42ch] text-[16px] leading-[1.5]")}>
            Made with respect for the material. Designed for the life around it.
          </p>
        </div>

        <nav aria-label="Footer" style={{ gridArea: "ln" }} className={cx(s.tile, "p-5 sm:p-6")}>
          <ul className="flex flex-col">
            {SECTIONS.map((x) => (
              <li key={x.id}>
                <Link
                  href={`/d/06#${x.id}`}
                  className="group flex items-center justify-between rounded-[12px] py-1.5 text-[15px] transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {x.label}
                  <span className="size-1.5 rounded-full bg-current opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/d/06/checkout"
                className="flex rounded-[12px] py-1.5 text-[15px] transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
              >
                Checkout
              </Link>
            </li>
          </ul>
        </nav>

        <div style={{ gridArea: "wd" }} className={cx(s.tile, s.tint, "flex flex-col justify-between gap-4 p-5 sm:p-6")}>
          {(["red", "white"] as const).map((w) => (
            <div key={w} className="flex items-start gap-3">
              <Swatch wood={w} size={22} className="mt-0.5" />
              <div className="min-w-0">
                <p className="text-[15px] font-medium leading-tight">{WOOD_NAMES[w].common}</p>
                <p className={cx(s.mono, "mt-0.5 text-[10.5px] opacity-70")}>{WOOD_NAMES[w].latin}</p>
                <p className="mt-0.5 text-[13px] opacity-70">{WOOD_NAMES[w].sa}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ gridArea: "tp" }} className={cx(s.tile, s.t2, "flex items-end justify-between gap-4 p-5 sm:p-6")}>
          <p className={cx(s.mono, s.muted, "text-[10.5px] leading-[1.6]")}>
            Santalum Maison, India, 2026
            <br />
            Preview build. Photographs are placeholders.
          </p>
          <button type="button" onClick={top} className={cx(s.icon, s.onWhite)} aria-label="Back to top">
            <IconUp />
          </button>
        </div>
      </div>
    </footer>
  );
}
