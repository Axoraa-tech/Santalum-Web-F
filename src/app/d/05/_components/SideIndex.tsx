"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { WT } from "@/components/maison/W";
import { EASE, type IndexItem } from "./content";

/**
 * The page's table of contents. On desktop a sticky column at the left of the grid that highlights the
 * section being read and fills a thin bar with reading progress; on phones a single sticky line at the top.
 */
export function SideIndex({ items, back = false, heading = "Index" }: { items: IndexItem[]; back?: boolean; heading?: string }) {
  const key = items.map((i) => i.id).join(",");
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const pct = useTransform(scrollYProgress, (v) => `${Math.round(v * 100)}%`);

  useEffect(() => {
    const ids = key.split(",");
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-38% 0px -61% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);

  // The last section is often too short to reach the reading line: claim it at the very end.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.985) setActive(items[items.length - 1].id);
  });

  const go = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id);
    setOpen(false);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const activeIndex = Math.max(0, items.findIndex((i) => i.id === active));

  return (
    <>
      <aside className="x5-index" aria-label={heading}>
        <nav className="x5-indexInner">
          <Link href="/d/05" className="x5-wordmark">
            Santalum
            <br />
            Maison
          </Link>
          {back && (
            <Link href="/d/05#catalogue" className="x5-backLink">
              Back to the catalogue
            </Link>
          )}
          <p className="x5-indexHead">
            {heading}
            <span>
              {activeIndex + 1} of {items.length}
            </span>
          </p>
          <div className="x5-tocWrap">
            <span className="x5-rail" aria-hidden>
              <motion.span className="x5-railFill" style={{ scaleY: scrollYProgress }} />
            </span>
            <ol className="x5-toc">
              {items.map((it, i) => (
                <li key={it.id}>
                  <a href={`#${it.id}`} className="x5-tocLink" aria-current={active === it.id ? "true" : undefined} onClick={go(it.id)}>
                    {active === it.id && (
                      <motion.span layoutId="idx-toc-mark" className="x5-tocMark" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                    )}
                    <span className="x5-tocN">{i + 1}</span>
                    <span>{it.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
          <div className="x5-indexFoot">
            <p>
              <motion.span className="x5-pct">{pct}</motion.span> read
            </p>
            <p>
              Edition: <strong><WT red="red sandalwood" white="white sandalwood" /></strong>
            </p>
          </div>
        </nav>
      </aside>

      <div className="x5-phoneBar">
        <button type="button" className="x5-phoneToggle" aria-expanded={open} aria-controls="idx-phone-index" onClick={() => setOpen((o) => !o)}>
          <i>{activeIndex + 1}</i>
          <b>{items[activeIndex]?.label}</b>
          <u>{open ? "Close" : heading}</u>
        </button>
        <motion.span className="x5-phoneProgress" style={{ scaleX: scrollYProgress }} aria-hidden />
        <AnimatePresence>
          {open && (
            <motion.nav
              id="idx-phone-index"
              aria-label={heading}
              className="x5-phoneList"
              initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {back && (
                <Link href="/d/05#catalogue" onClick={() => setOpen(false)}>
                  <span />
                  Back to the catalogue
                </Link>
              )}
              {items.map((it, i) => (
                <a key={it.id} href={`#${it.id}`} aria-current={active === it.id ? "true" : undefined} onClick={go(it.id)}>
                  <span>{i + 1}</span>
                  {it.label}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
