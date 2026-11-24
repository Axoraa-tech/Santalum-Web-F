"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, FAMILIES, formatINR, WOOD_NAMES, type CategoryKey, type Family } from "@/lib/catalog";
import { useWood, type Wood } from "@/lib/wood";
import k from "../k";
import { EASE, measure, onFonts, openTakeover, splitName, useFinePointer, useReduced, wdthFor } from "./lib";

type Cat = CategoryKey | "all";

/**
 * Size every row name so it fits condensed (wdth 50), and work out how far each may stretch
 * on hover (--hw) without leaving its row. `key` re-runs it when the rows change.
 */
export function useRowFit(listRef: RefObject<HTMLElement | null>, key: string, scale: [number, number] = [0.15, 0.088]) {
  const [phone, desk] = scale;
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const calc = () => {
      const vw = window.innerWidth;
      const base = vw < 768 ? vw * phone : Math.min(vw * desk, 160);
      list.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
        const name = row.querySelector<HTMLElement>("[data-name]");
        const slot = row.querySelector<HTMLElement>("[data-slot]");
        if (!name || !slot) return;
        const text = name.textContent ?? "";
        const avail = slot.clientWidth * 0.98;
        const w50 = measure(text, 50, 560, base);
        const size = w50 > avail ? (base * avail) / w50 : base;
        name.style.fontSize = `${size.toFixed(2)}px`;
        row.style.setProperty("--hw", wdthFor(text, avail, size, 840).toFixed(1));
      });
    };
    const off = onFonts(calc);
    const ro = new ResizeObserver(calc);
    ro.observe(list);
    return () => {
      off();
      ro.disconnect();
    };
  }, [listRef, key, phone, desk]);
}

/**
 * The collection as huge type: one row per family made in the current wood. On a mouse, hovering a row
 * stretches the name as far as the row allows and opens a photograph in a pill that grows from the cursor.
 * On a phone the row crossing the middle of the screen stretches instead, and a tap opens the piece.
 */
export function Collection() {
  const wood = useWood();
  const fine = useFinePointer();
  const [cat, setCat] = useState<Cat>("all");
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const inWood = FAMILIES.filter((f) => f.variants[wood]);
  const fams = inWood.filter((f) => cat === "all" || f.category === cat);
  const cats = CATEGORIES.filter((c) => inWood.some((f) => f.category === c.key));
  const key = `${wood}-${cat}`;

  useRowFit(listRef, key);

  // phones: the row in the middle band of the screen is the active one
  useEffect(() => {
    const list = listRef.current;
    if (fine || !list) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.slug ?? null);
      },
      { rootMargin: "-46% 0px -46% 0px" },
    );
    list.querySelectorAll("[data-row]").forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, [fine, key]);

  return (
    <section id="collection" aria-labelledby="k10-collection" className="relative scroll-mt-12 border-t border-[var(--k-line)] pt-10 md:pt-14">
      <div className={`${k.gut} grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end`}>
        <div className="md:col-span-5">
          <h2 id="k10-collection" className={`${k.mono} text-[var(--k-grey)]`}>
            The collection
          </h2>
          <p className={`${k.disp} mt-3 whitespace-normal text-[length:clamp(30px,3.4vw,54px)] leading-[0.92] [font-variation-settings:'wdth'_66,'wght'_760]`}>
            {inWood.length} families in {WOOD_NAMES[wood].common.toLowerCase()}
          </p>
          <p className={`${k.mono} mt-3 text-[var(--k-grey)]`}>
            {fine ? "Point at a name to see the piece. Click to open it." : "Tap a name to open the piece."}
          </p>
        </div>
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2 md:col-span-7 md:justify-end">
          <button type="button" aria-pressed={cat === "all"} onClick={() => setCat("all")} className={k.chip}>
            Everything
          </button>
          {cats.map((c) => (
            <button key={c.key} type="button" aria-pressed={cat === c.key} onClick={() => setCat(c.key)} className={k.chip}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <ul ref={listRef} className={`${k.rows} mt-8 border-t border-[var(--k-ink)] md:mt-12`}>
        {fams.map((f) => (
          <Row key={`${wood}-${f.slug}`} f={f} wood={wood} fine={fine} active={!fine && active === f.slug} />
        ))}
      </ul>
    </section>
  );
}

function Row({ f, wood, fine, active }: { f: Family; wood: Wood; fine: boolean; active: boolean }) {
  const reduced = useReduced();
  const v = f.variants[wood]!;
  const shot = v.shots[0];
  const { head, tail } = splitName(f.name);
  const ref = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const x = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 26, mass: 0.6 });
  const show = fine ? hover : active;
  const cat = CATEGORIES.find((c) => c.key === f.category)?.label;

  const at = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? Math.min(Math.max(clientX - r.left, r.width * 0.12), r.width * 0.88) : 0;
  };

  return (
    <li data-row data-slug={f.slug} className="border-b border-[var(--k-line)]">
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        data-active={show}
        onClick={() => openTakeover(f.slug, ref.current)}
        onPointerEnter={(e) => {
          if (!fine) return;
          x.jump(at(e.clientX));
          sx.jump(at(e.clientX));
          setHover(true);
        }}
        onPointerMove={(e) => {
          if (fine) x.set(at(e.clientX));
        }}
        onPointerLeave={() => setHover(false)}
        className={`${k.row} ${k.gut} relative grid w-full grid-cols-1 items-end gap-x-6 gap-y-1 py-3 text-left md:grid-cols-[1fr_14rem] md:py-[0.5vw]`}
      >
        <span data-slot className="relative z-[1] block min-w-0 overflow-visible">
          <span data-name className={`${k.rowName} block w-max text-[15vw] md:text-[8.8vw]`}>
            {head}
          </span>
        </span>
        <span className={`${k.mono} relative z-[3] flex justify-between gap-4 pb-[0.4vw] md:block md:text-right`}>
          <span className="text-[var(--k-grey)] md:block">
            {cat}
            {tail ? `, ${tail}` : ""}
          </span>
          <span className="tabular-nums md:block md:text-[15px]">
            {formatINR(v.price)}
            {f.edition ? `, ${f.edition.toLowerCase()}` : ""}
          </span>
        </span>
        <AnimatePresence>
          {show && (
            <motion.span
              key="pill"
              className={k.rowPill}
              style={fine ? { left: sx, x: "-50%", y: "-50%" } : { left: "70%", x: "-50%", y: "-50%" }}
              initial={reduced ? { opacity: 0 } : { scale: 0 }}
              animate={reduced ? { opacity: 1 } : { scale: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <motion.span
                className="absolute inset-0 block"
                initial={reduced ? false : { scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <Photo p={shot.photo} tone={shot.tone} sizes="(min-width: 768px) 32vw, 60vw" />
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </li>
  );
}
