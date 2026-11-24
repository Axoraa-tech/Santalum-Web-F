"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Photo } from "@/components/Photo";
import { formatINR } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { s } from "../cls";
import { cx, familiesIn, WOOD_SHORT } from "../data";
import { views } from "../store";
import { Corner } from "../ui";

/**
 * The price ladder: every piece in the current wood on one log-scaled track, from the
 * cheapest to the Vault cuff. Drag the marker (or use the arrow keys) to see the piece at that price.
 */
export function LadderTile() {
  const wood = useWood();
  const list = familiesIn(wood)
    .map((f) => ({ f, v: f.variants[wood]! }))
    .sort((a, b) => a.v.price - b.v.price);
  const lmin = Math.log(list[0].v.price);
  const lmax = Math.log(list[list.length - 1].v.price);
  const posOf = (p: number) => (Math.log(p) - lmin) / (lmax - lmin);

  const [pos, setPos] = useState(0.46);
  const [drag, setDrag] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  const value = Math.round(Math.exp(lmin + pos * (lmax - lmin)) / 100) * 100;
  const idx = Math.max(0, list.findLastIndex((x) => x.v.price <= value + 50));
  const cur = list[idx];
  const shot = cur.v.shots[0];

  const fromEvent = (e: PointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };
  const snapTo = (i: number) => setPos(posOf(list[Math.min(list.length - 1, Math.max(0, i))].v.price));

  const onKey = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowUp") snapTo(idx + 1);
    else if (k === "ArrowLeft" || k === "ArrowDown") snapTo(value > cur.v.price + 50 ? idx : idx - 1);
    else if (k === "Home") snapTo(0);
    else if (k === "End") snapTo(list.length - 1);
    else return;
    e.preventDefault();
  };

  const open = () => views.open({ kind: "product", slug: cur.f.slug, from: "ladder", img: true });

  return (
    <div className="flex h-full flex-col gap-4 p-2 @min-[560px]:flex-row">
      {/* the piece at this price */}
      <motion.div
        layoutId="ladder"
        style={{ borderRadius: 20 }}
        className={cx(s.opener, "group relative aspect-[4/3] shrink-0 overflow-hidden bg-[#f6f4f0] @min-[560px]:aspect-auto @min-[560px]:w-[40%]")}
      >
        <motion.div layoutId="ladder-img" className="absolute inset-0" style={{ borderRadius: 20 }}>
          <div className={s.zoom}>
            <AnimatePresence initial={false}>
              <motion.div
                key={`${cur.f.slug}-${wood}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                <Photo p={shot.photo} tone={shot.tone} priority sizes="(min-width:1024px) 22vw, 90vw" />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        <Corner />
        <button type="button" className={s.hit} onClick={open} aria-label={`Open ${cur.f.name}`} />
      </motion.div>

      <div className="flex min-w-0 flex-1 flex-col px-3 pb-3 @min-[560px]:px-2 @min-[560px]:pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[clamp(20px,4.2cqw,28px)] font-medium leading-[1.05] tracking-[-0.03em]">Find a piece by price</h2>
          <p className={cx(s.mono, s.muted, "hidden text-[10.5px] @min-[420px]:block")}>{list.length} pieces</p>
        </div>
        <p className={cx(s.muted, "mt-1 text-[14px]")}>
          {WOOD_SHORT[wood]}, from {formatINR(list[0].v.price)} to {formatINR(list[list.length - 1].v.price)}.
        </p>

        <div className="mt-4 min-h-[86px] @min-[560px]:mt-auto">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={cur.f.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className={cx(s.mono, s.muted, "text-[10.5px]")}>
                {cur.f.level}
                {cur.f.edition ? `, ${cur.f.edition.toLowerCase()}` : ""}
              </p>
              <p className="mt-1 text-[clamp(22px,4.6cqw,32px)] font-medium leading-[1.05] tracking-[-0.035em]">{cur.f.name}</p>
              <p className={cx(s.monoWide, "mt-1 text-[17px]")}>{formatINR(cur.v.price)}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* the track */}
        <div
          ref={track}
          role="slider"
          tabIndex={0}
          aria-label="Price"
          aria-valuemin={list[0].v.price}
          aria-valuemax={list[list.length - 1].v.price}
          aria-valuenow={value}
          aria-valuetext={`${formatINR(value)}: ${cur.f.name}, ${formatINR(cur.v.price)}`}
          onKeyDown={onKey}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDrag(true);
            setPos(fromEvent(e));
          }}
          onPointerMove={(e) => drag && setPos(fromEvent(e))}
          onPointerUp={() => {
            setDrag(false);
            snapTo(idx);
          }}
          onPointerCancel={() => setDrag(false)}
          className="relative mt-9 h-14 cursor-grab touch-none select-none rounded-[16px] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:cursor-grabbing"
        >
          <div className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-[#ebe8e2]" />
          <div
            className="absolute left-0 top-1/2 h-[6px] w-full origin-left -translate-y-1/2 rounded-full bg-[#141414]"
            style={{ transform: `scaleX(${pos})`, transition: drag ? "none" : "transform .5s cubic-bezier(.22,1,.36,1)" }}
          />
          {list.map((x, i) => (
            <span
              key={x.f.slug}
              aria-hidden
              className="absolute top-1/2 size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white transition-colors"
              style={{ left: `${posOf(x.v.price) * 100}%`, background: i <= idx ? "#141414" : "#c9c6be" }}
            />
          ))}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ transform: `translateX(${pos * 100}%)`, transition: drag ? "none" : "transform .5s cubic-bezier(.22,1,.36,1)" }}
            aria-hidden
          >
            <span className="absolute left-0 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_2px_10px_rgba(20,20,20,0.22)] ring-1 ring-black/5">
              <span className="size-2.5 rounded-full bg-accent" />
            </span>
            <span
              className={cx(
                s.mono,
                "absolute -top-3 left-0 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-[#141414] px-2 py-1 text-[10.5px] text-white",
              )}
            >
              {formatINR(value)}
            </span>
          </div>
        </div>
        <div className={cx(s.mono, s.muted, "mt-1 flex justify-between text-[10px]")} aria-hidden>
          <span>{formatINR(list[0].v.price)}</span>
          <span>{formatINR(list[list.length - 1].v.price)}</span>
        </div>
      </div>
    </div>
  );
}
