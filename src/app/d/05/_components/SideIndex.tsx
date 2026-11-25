"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { WT } from "@/components/maison/W";
import { EASE, type IndexItem } from "./content";
import { AccountLabel, NAV } from "./Controls";

export type Back = { href: string; label: string };

/** A section label in one or both woods. */
export function Label({ label }: { label: IndexItem["label"] }) {
  return typeof label === "string" ? <>{label}</> : <WT red={label.red} white={label.white} />;
}

type LinkItem = IndexItem & { href?: string; count?: number };

/**
 * The page's table of contents. On desktop a sticky column at the left of the grid that highlights the
 * section being read and fills a thin bar with reading progress; on phones a single sticky line at the top.
 * With `activeId`, the items are links (the shop's categories) and the active one is given, not observed.
 */
export function SideIndex({
  items,
  back,
  heading = "Index",
  activeId,
  layoutKey = "idx",
  foot,
}: {
  items: LinkItem[];
  back?: Back;
  heading?: string;
  activeId?: string;
  layoutKey?: string;
  foot?: ReactNode;
}) {
  const linkMode = activeId !== undefined;
  const key = items.map((i) => i.id).join(",");
  // Which sections are on the page right now: a form that turns into its confirmation, or a log that
  // appears after a lookup, changes them. null until the page has been read (the server lists them all).
  const [present, setPresent] = useState<string | null>(null);
  const [observed, setObserved] = useState(items[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const pct = useTransform(scrollYProgress, (v) => `${Math.round(v * 100)}%`);

  useEffect(() => {
    if (linkMode) return;
    const ids = key.split(",");
    let frame = 0;
    // The section being read is the last one whose top has passed the reading line, in page order.
    const read = () => {
      frame = 0;
      const here = ids.filter((id) => document.getElementById(id));
      setPresent(here.join(","));
      if (!here.length) return;
      const line = window.innerHeight * 0.38;
      let cur = here[0];
      for (const id of here) if (document.getElementById(id)!.getBoundingClientRect().top <= line) cur = id;
      // the last section is often too short to reach the line: claim it at the very end
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) cur = here[here.length - 1];
      setObserved(cur);
    };
    const soon = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", soon, { passive: true });
    window.addEventListener("resize", soon);
    const mo = new MutationObserver(soon);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", soon);
      window.removeEventListener("resize", soon);
      mo.disconnect();
    };
  }, [key, linkMode]);

  const shown = linkMode || present === null ? items : items.filter((i) => present.split(",").includes(i.id));
  const active = linkMode ? activeId : observed;

  const go = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id);
    setOpen(false);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const activeIndex = Math.max(0, shown.findIndex((i) => i.id === active));

  const entry = (it: LinkItem, i: number, phone: boolean) => {
    const current = active === it.id;
    const inner = phone ? (
      <>
        <span className="x5-phoneN">{i + 1}</span>
        <span className="x5-phoneLabel">
          <Label label={it.label} />
          {it.count !== undefined && <sup>{it.count}</sup>}
        </span>
      </>
    ) : (
      <>
        {current && <motion.span layoutId={`${layoutKey}-toc-mark`} className="x5-tocMark" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
        <span className="x5-tocN">{i + 1}</span>
        <span>
          <Label label={it.label} />
        </span>
        {it.count !== undefined && <span className="x5-tocCount">{it.count}</span>}
      </>
    );
    if (it.href)
      return (
        <Link
          key={it.id}
          href={it.href}
          scroll={false}
          className={phone ? undefined : "x5-tocLink"}
          aria-current={current ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          {inner}
        </Link>
      );
    return (
      <a key={it.id} href={`#${it.id}`} className={phone ? undefined : "x5-tocLink"} aria-current={current ? "true" : undefined} onClick={go(it.id)}>
        {inner}
      </a>
    );
  };

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
            <Link href={back.href} className="x5-backLink">
              {back.label}
            </Link>
          )}
          <p className="x5-indexHead">
            {heading}
            <span>
              {activeIndex + 1} of {shown.length}
            </span>
          </p>
          <div className="x5-tocWrap">
            <span className="x5-rail" aria-hidden>
              <motion.span className="x5-railFill" style={{ scaleY: scrollYProgress }} />
            </span>
            <ol className="x5-toc">
              {shown.map((it, i) => (
                <li key={it.id}>{entry(it, i, false)}</li>
              ))}
            </ol>
          </div>
          <div className="x5-indexFoot">
            {foot}
            <p>
              <motion.span className="x5-pct">{pct}</motion.span> read
            </p>
            <p>
              Edition:{" "}
              <strong>
                <WT red="red sandalwood" white="white sandalwood" />
              </strong>
            </p>
          </div>
        </nav>
      </aside>

      <div className="x5-phoneBar">
        <button
          type="button"
          className="x5-phoneToggle"
          aria-expanded={open}
          aria-controls={`${layoutKey}-phone-index`}
          onClick={() => setOpen((o) => !o)}
        >
          <i>{activeIndex + 1}</i>
          <b>{shown[activeIndex] ? <Label label={shown[activeIndex].label} /> : null}</b>
          <span className="sr-only">{open ? `Close the ${heading.toLowerCase()}` : `Open the ${heading.toLowerCase()}`}</span>
          <span className="x5-phonePlus" aria-hidden data-open={open || undefined} />
        </button>
        <motion.span className="x5-phoneProgress" style={{ scaleX: scrollYProgress }} aria-hidden />
        <AnimatePresence>
          {open && (
            <motion.nav
              id={`${layoutKey}-phone-index`}
              aria-label={heading}
              className="x5-phoneList"
              initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div className="x5-phoneNav">
                {NAV.map((n) => (
                  <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
                    {n.label ?? <AccountLabel />}
                  </Link>
                ))}
              </div>
              {back && (
                <Link href={back.href} onClick={() => setOpen(false)}>
                  <span className="x5-phoneN" />
                  <span className="x5-phoneLabel">{back.label}</span>
                </Link>
              )}
              {shown.map((it, i) => entry(it, i, true))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
