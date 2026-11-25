"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, categoryOf, featured, priceLabel, productsFor, type Product } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import k from "../k";
import { editionLine, RatingInline } from "./bits";
import { seededRating } from "@/lib/shop/reviews-data";
import { EASE, fitSize, measure, onFonts, openTakeover, splitName, unsplash, useFinePointer, useReduced, wdthFor } from "./lib";

/**
 * Size every row name so it fits condensed (wdth 50), and work out how far each may stretch
 * on hover (--hw) without leaving its row. `key` re-runs it when the rows change.
 * A row marked `data-big` is sized the other way round: it fills its row only when fully stretched.
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
        if (!avail) return;
        if (row.dataset.big !== undefined) {
          const size = Math.min(window.innerHeight * 0.42, fitSize(text, avail, 150, 840));
          name.style.fontSize = `${size.toFixed(2)}px`;
          row.style.setProperty("--hw", "150");
          return;
        }
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

const COPY: Record<Wood, { label: string; line: string; point: string; tap: string }> = {
  red: {
    label: "Turned in red",
    line: "Eight pieces from the lathe and the bench",
    point: "Point at a name to see the piece in the hand. Click to open it.",
    tap: "Tap a name to open the piece.",
  },
  white: {
    label: "Chosen in white",
    line: "Eight pieces for oil, ritual and carving",
    point: "Point at a name to see the bottle, the box or the carving. Click to open it.",
    tap: "Tap a name to open it.",
  },
};

/**
 * The collection as huge type, curated: the featured pieces of the current wood, one row each. On a mouse,
 * hovering a row stretches the name as far as the row allows and opens a photograph in a pill that grows
 * from the cursor. On a phone the row crossing the middle of the screen stretches instead. The list ends in
 * one row larger than the rest, the way into the whole shop.
 */
export function Collection() {
  return (
    <section id="collection" className="relative scroll-mt-12 border-t border-[var(--k10-line)] pt-10 md:pt-14">
      <W red={<Featured wood="red" />} white={<Featured wood="white" />} />
    </section>
  );
}

function Featured({ wood }: { wood: Wood }) {
  const fine = useFinePointer();
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const items = featured(wood);
  const total = productsFor(wood).length;
  const c = CONTENT[wood];
  const copy = COPY[wood];

  useRowFit(listRef, wood);

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
  }, [fine]);

  return (
    <>
      <div className={`${k.gut} grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end`}>
        <div className="md:col-span-6">
          <h2 id={`k10-collection-${wood}`} className={`${k.mono} text-[var(--k10-grey)]`}>
            {copy.label}
          </h2>
          <p className={`${k.disp} mt-3 whitespace-normal text-[length:clamp(30px,3.4vw,54px)] leading-[0.92] [font-variation-settings:'wdth'_66,'wght'_760]`}>
            {copy.line}
          </p>
          <p className={`${k.mono} mt-3 text-[var(--k10-grey)]`}>{fine ? copy.point : copy.tap}</p>
        </div>
        <nav aria-label={`${c.name} by category`} className="md:col-span-6">
          <p className={`${k.mono} text-[var(--k10-grey)] md:text-right`}>Or go straight to a shelf</p>
          <ul className="mt-2 flex flex-wrap gap-2 md:justify-end">
            {CATEGORIES[wood].map((cat) => (
              <li key={cat.id}>
                <Link href={`/d/10/shop?c=${cat.id}`} className={`${k.chip} inline-block`}>
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <ul ref={listRef} className={`${k.rows} mt-8 border-t border-[var(--k10-ink)] md:mt-12`}>
        {items.map((p) => (
          <Row key={p.slug} p={p} fine={fine} active={!fine && active === p.slug} />
        ))}
        <li data-row data-big data-slug="__all" data-active={!fine && active === "__all"} className={`${k.row} border-b border-[var(--k10-ink)]`}>
          <Link href="/d/10/shop" className={`${k.gut} grid grid-cols-1 gap-y-2 pb-6 pt-5 md:pb-8 md:pt-7`}>
            <span className={`${k.mono} flex flex-wrap justify-between gap-x-6 gap-y-1`}>
              <span>
                All {total} {c.name.toLowerCase()} pieces
              </span>
              <span className="text-[var(--k10-grey)]">{CATEGORIES[wood].map((x) => x.label).join(", ")}</span>
            </span>
            <span data-slot className="block min-w-0">
              <span data-name className={`${k.rowName} block w-max text-[18vw] text-[var(--k10-accent)] md:text-[12vw]`}>
                Shop all {total}
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </>
  );
}

function Row({ p, fine, active }: { p: Product; fine: boolean; active: boolean }) {
  const reduced = useReduced();
  const shot = p.shots[0];
  const { head, tail } = splitName(p.name);
  const ref = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const x = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 26, mass: 0.6 });
  const show = fine ? hover : active;
  const cat = categoryOf(p).label;
  const extra = editionLine(p) || p.badge;

  const at = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? Math.min(Math.max(clientX - r.left, r.width * 0.12), r.width * 0.88) : 0;
  };

  return (
    <li data-row data-slug={p.slug} className="border-b border-[var(--k10-line)]">
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        aria-label={`${p.name}, ${priceLabel(p)}`}
        data-active={show}
        onClick={() => openTakeover(p.slug, ref.current)}
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
        className={`${k.row} ${k.gut} relative grid w-full grid-cols-1 items-end gap-x-6 gap-y-1 py-3 text-left md:grid-cols-[1fr_15rem] md:py-[0.5vw]`}
      >
        <span data-slot className="relative z-[1] block min-w-0 overflow-visible">
          {/* phones: no pill over the row; the stretched name itself carries the photograph */}
          <span
            data-name
            className={`${k.rowName} ${fine ? "" : k.rowFill} block w-max text-[15vw] md:text-[8.8vw]`}
            style={fine ? undefined : ({ "--fill": `url(${unsplash(shot.photo.id, 900)})` } as CSSProperties)}
          >
            {head}
          </span>
        </span>
        <span className={`${k.mono} relative z-[3] flex justify-between gap-4 pb-[0.4vw] md:block md:text-right`}>
          <span className="text-[var(--k10-grey)] md:block">
            {cat}
            {tail ? `, ${tail}` : ""}
          </span>
          <span className="tabular-nums md:block md:text-[15px]">
            {priceLabel(p)}
            {extra ? <span className="text-[var(--k10-accent)]">, {extra.toLowerCase()}</span> : null}
          </span>
          <RatingInline {...seededRating(p.slug)} className="md:mt-1 md:flex md:justify-end" />
        </span>
        <AnimatePresence>
          {fine && hover && (
            <motion.span
              key="pill"
              className={k.rowPill}
              style={{ left: sx, x: "-50%", y: "-50%" }}
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
