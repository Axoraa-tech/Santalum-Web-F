"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, FAMILIES, formatINR, type Shot } from "@/lib/catalog";
import { switchWood, useWood } from "@/lib/wood";
import { s } from "./cls";
import { cx, other, SECTIONS, STORIES, variantFor, WOOD_SHORT, type StoryId } from "./data";
import { bagUI, palette, usePalette, views } from "./store";
import { IconArrow, IconBag, IconSearch, Kbd, Mark, Swatch } from "./ui";

type Group = "Pieces" | "Sections" | "Stories" | "Actions";
type Item = {
  id: string;
  group: Group;
  label: string;
  hint: string;
  words: string;
  thumb?: Shot;
  glyph?: ReactNode;
  run: () => void;
};

/** Subsequence match with bonuses for runs and word starts. -1 when it does not match. */
function fuzzy(query: string, text: string) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const t = text.toLowerCase();
  if (!q) return 0;
  let score = 0;
  let from = 0;
  let prev = -2;
  for (const ch of q) {
    const i = t.indexOf(ch, from);
    if (i < 0) return -1;
    score += i === prev + 1 ? 3 : 1;
    if (i === 0 || " -,".includes(t[i - 1])) score += 2;
    prev = i;
    from = i + 1;
  }
  return score - t.length * 0.01;
}

export function Palette() {
  const open = usePalette();
  return <AnimatePresence>{open && <PalettePanel key="palette" />}</AnimatePresence>;
}

function PalettePanel() {
  const wood = useWood();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const home = pathname === "/d/06";

  useEffect(() => {
    const t = window.setTimeout(() => input.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, []);

  const jump = (id: string) => {
    if (home) {
      const el = document.getElementById(id);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    } else router.push(`/d/06#${id}`);
  };

  const items: Item[] = [
    ...FAMILIES.map((f): Item => {
      const { variant, made, wood: w } = variantFor(f, wood);
      const cat = CATEGORIES.find((c) => c.key === f.category)?.label ?? "";
      return {
        id: `p-${f.slug}`,
        group: "Pieces",
        label: f.name,
        hint: made ? formatINR(variant.price) : `${w === "white" ? "White" : "Red"} only`,
        words: `${cat} ${f.level} ${f.summary} ${Object.keys(f.variants).join(" ")} sandalwood`,
        thumb: variant.shots[0],
        run: () =>
          pathname.startsWith("/d/06/p/")
            ? router.push(`/d/06/p/${f.slug}`)
            : views.open({ kind: "product", slug: f.slug, from: `solo-${f.slug}`, img: false }),
      };
    }),
    ...SECTIONS.map(
      (x): Item => ({
        id: `s-${x.id}`,
        group: "Sections",
        label: x.label,
        hint: "Jump",
        words: x.words,
        glyph: <Mark size={16} />,
        run: () => jump(x.id),
      }),
    ),
    ...(Object.keys(STORIES) as StoryId[]).map(
      (id): Item => ({
        id: `t-${id}`,
        group: "Stories",
        label: STORIES[id].title,
        hint: "Read",
        words: `${STORIES[id].lede} story`,
        glyph: (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <path d="M3 4h10M3 8h10M3 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ),
        run: () => views.open({ kind: "story", id, from: `solo-story-${id}`, img: false }),
      }),
    ),
    {
      id: "a-wood",
      group: "Actions",
      label: `Switch to ${WOOD_SHORT[other(wood)].toLowerCase()}`,
      hint: "Wood",
      words: "wood toggle change red white",
      glyph: <Swatch wood={other(wood)} />,
      run: () => switchWood(other(wood)),
    },
    { id: "a-bag", group: "Actions", label: "Open the bag", hint: "Bag", words: "cart basket", glyph: <IconBag size={16} />, run: () => bagUI.open() },
    {
      id: "a-checkout",
      group: "Actions",
      label: "Go to checkout",
      hint: "Checkout",
      words: "pay order buy",
      glyph: <IconArrow size={16} />,
      run: () => router.push("/d/06/checkout"),
    },
  ];

  const results = q.trim()
    ? items
        .map((it) => ({ it, sc: Math.max(fuzzy(q, it.label) + 1, it.words.toLowerCase().includes(q.trim().toLowerCase()) ? q.trim().length : -1) }))
        .filter((x) => x.sc >= 0)
        .sort((a, b) => b.sc - a.sc)
        .map((x) => x.it)
        .slice(0, 12)
    : items;

  const sel = Math.min(active, Math.max(0, results.length - 1));
  const optId = (it: Item) => `b6-pal-${it.id}`;

  const activeId = results[sel] ? optId(results[sel]) : undefined;
  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const go = (it: Item) => {
    palette.close(false);
    it.run();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(sel + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(sel - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = results[sel];
      if (it) go(it);
    } else if (e.key === "Escape") {
      e.preventDefault();
      palette.close();
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  const heads = results.map((it, i) => !q.trim() && (i === 0 || results[i - 1].group !== it.group));

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[175] bg-[#eeede9]/75"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => palette.close()}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[180] flex justify-center px-3">
        <motion.div
          layoutId="cmd"
          role="dialog"
          aria-modal="true"
          aria-label="Search pieces, woods, stories"
          style={{ borderRadius: 24 }}
          className="pointer-events-auto w-full max-w-[640px] overflow-hidden bg-white shadow-[0_40px_90px_-30px_rgba(20,20,20,0.45)]"
          onKeyDown={onKey}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.08, duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            <div className="flex h-14 items-center gap-3 border-b border-black/[0.06] px-4">
              <IconSearch className="shrink-0 text-[#6b6b66]" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                role="combobox"
                aria-expanded="true"
                aria-controls="b6-pal-list"
                aria-autocomplete="list"
                aria-activedescendant={activeId}
                aria-label="Search pieces, woods, stories"
                placeholder="Search pieces, woods, stories"
                className="h-full min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-[#6b6b66]"
              />
              <button type="button" onClick={() => palette.close()} className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-accent" aria-label="Close search">
                <Kbd>Esc</Kbd>
              </button>
            </div>

            <ul id="b6-pal-list" role="listbox" aria-label="Results" className={cx(s.scroller, "max-h-[min(58svh,520px)] overflow-y-auto p-2")}>
              {results.length === 0 && (
                <li className={cx(s.muted, "px-3 py-8 text-center text-[15px]")} role="presentation">
                  Nothing matches &ldquo;{q}&rdquo;. Try a wood, a piece or a word like gift.
                </li>
              )}
              {results.map((it, i) => {
                const head = heads[i];
                return (
                  <li key={it.id} role="presentation">
                    {head && <p className={cx(s.mono, s.muted, "px-3 pb-1.5 pt-3 text-[10.5px]")}>{it.group}</p>}
                    <div
                      id={optId(it)}
                      role="option"
                      aria-selected={i === sel}
                      onMouseMove={() => i !== sel && setActive(i)}
                      onClick={() => go(it)}
                      className={cx(
                        "flex h-12 cursor-pointer items-center gap-3 rounded-[16px] px-2.5 transition-colors",
                        i === sel ? "bg-[#f6f4f0]" : "",
                      )}
                    >
                      {it.thumb ? (
                        <span className="relative size-8 shrink-0 overflow-hidden rounded-[10px] bg-[#f6f4f0]">
                          <Photo p={it.thumb.photo} tone={it.thumb.tone} sizes="32px" />
                        </span>
                      ) : (
                        <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#f6f4f0] text-[#141414]">{it.glyph}</span>
                      )}
                      <span className="min-w-0 flex-1 truncate text-[15px]">{it.label}</span>
                      <span className={cx(s.mono, s.muted, "shrink-0 text-[10.5px]")}>{q.trim() ? `${it.group === "Pieces" ? it.hint : it.group}` : it.hint}</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className={cx(s.mono, s.muted, "flex gap-4 border-t border-black/[0.06] px-4 py-2.5 text-[10.5px]")}>
              <span>↑ ↓ to move</span>
              <span>Enter to open</span>
              <span className="ml-auto hidden sm:inline">Ctrl K or / to search</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
