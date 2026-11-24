"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { BOARD, CONTOURS, MAP, MINI_SHAPES, SEARCH, WAYPOINTS, type SearchItem } from "../_lib/board";
import { atlas, useAtlasUI } from "../_lib/engine";
import { LAND_PATH } from "../_lib/geo";
import { Board } from "./Board";
import { DetailInWorld, DetailSheet, Wash } from "./Detail";
import { s } from "./styles";

export function Canvas() {
  const vp = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const ui = useAtlasUI();

  useEffect(() => {
    if (!vp.current || !world.current || !grid.current) return;
    return atlas.attach(vp.current, world.current, grid.current);
  }, []);

  return (
    <>
      <div ref={vp} className={s.viewport} role="region" aria-label="The board. Drag to move, scroll or pinch to zoom, arrow keys to pan.">
        <div ref={grid} className={s.grid} aria-hidden />
        <div ref={world} className={s.world} style={{ width: BOARD.w, height: BOARD.h }}>
          <Board open={ui.open} />
          <Wash on={!!ui.open && !ui.narrow} />
          {ui.open && !ui.narrow && <DetailInWorld key={ui.open} slug={ui.open} />}
        </div>
      </div>
      <Controls />
      <TourCaption step={ui.tour} />
      <DetailSheet slug={ui.narrow ? ui.open : null} />
    </>
  );
}

/* ---------------- minimap ---------------- */
function Minimap() {
  const svg = useRef<SVGSVGElement>(null);
  const view = useRef<SVGRectElement>(null);
  useEffect(() => {
    atlas.bindMini(view.current);
    return () => atlas.bindMini(null);
  }, []);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const toWorld = (e: RPointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * BOARD.w, y: ((e.clientY - r.top) / r.height) * BOARD.h };
  };
  const down = (e: RPointerEvent<SVGSVGElement>) => {
    const p = toWorld(e);
    const v = atlas.viewRect();
    const inside = p.x >= v.x && p.x <= v.x + v.w && p.y >= v.y && p.y <= v.y + v.h;
    drag.current = inside ? { dx: atlas.cam.x - p.x, dy: atlas.cam.y - p.y } : { dx: 0, dy: 0 };
    if (inside) atlas.centerOn(p.x + drag.current.dx, p.y + drag.current.dy);
    else atlas.flyTo({ x: p.x, y: p.y, z: atlas.cam.z }, { ms: 420 });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: RPointerEvent<SVGSVGElement>) => {
    if (!drag.current || e.buttons === 0) return;
    const p = toWorld(e);
    atlas.centerOn(p.x + drag.current.dx, p.y + drag.current.dy);
  };
  const up = () => {
    drag.current = null;
  };
  const w = 250;
  const h = Math.round((w * BOARD.h) / BOARD.w);
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${BOARD.w} ${BOARD.h}`}
      width={w}
      height={h}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="block cursor-crosshair touch-none rounded-[8px] bg-(--a-paper)"
      aria-hidden
    >
      <path d={CONTOURS.red[0]} fill="#9b3520" fillOpacity="0.09" />
      <path d={CONTOURS.white[0]} fill="#a57a38" fillOpacity="0.12" />
      {MINI_SHAPES.map((m, i) => (
        <rect
          key={i}
          x={m.r.x}
          y={m.r.y}
          width={m.r.w}
          height={m.r.h}
          fill={m.kind === "photo" ? "#cbbfab" : m.kind === "card" ? "#fbfaf7" : "#1f1d1a"}
          fillOpacity={m.kind === "text" ? 0.12 : 1}
          stroke={m.kind === "card" ? "#1f1d1a" : "none"}
          strokeOpacity="0.35"
          strokeWidth="10"
        />
      ))}
      <path d={LAND_PATH} transform={`translate(${MAP.x} ${MAP.y})`} fill="#e3dccb" stroke="#1f1d1a" strokeOpacity="0.5" strokeWidth="8" />
      <rect ref={view} fill="var(--m-accent)" fillOpacity="0.08" stroke="var(--m-accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" rx="40" />
    </svg>
  );
}

/* ---------------- search ---------------- */
function useResults(q: string) {
  return useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const words = t.split(/\s+/);
    return SEARCH.filter((i) => words.every((w) => i.terms.includes(w) || i.label.toLowerCase().includes(w)))
      .sort((a, b) => Number(b.label.toLowerCase().startsWith(t)) - Number(a.label.toLowerCase().startsWith(t)))
      .slice(0, 6);
  }, [q]);
}

function go(item: SearchItem) {
  if ("slug" in item.target) atlas.openProduct(item.target.slug);
  else atlas.flyToRect(item.target.rect, { maxZ: 1.1 });
}

function Search({ autoFocus = false, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const results = useResults(q);
  const id = useId();
  const listId = `${id}-list`;
  const open = results.length > 0;
  const pick = (item: SearchItem) => {
    go(item);
    setQ("");
    setActive(0);
    onDone?.();
  };
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        Find on the board
      </label>
      <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--a-muted)" aria-hidden>
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open ? `${id}-o${active}` : undefined}
        autoFocus={autoFocus}
        value={q}
        placeholder="Find a piece or a place"
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && open) {
            e.preventDefault();
            setActive((a) => (a + 1) % results.length);
          } else if (e.key === "ArrowUp" && open) {
            e.preventDefault();
            setActive((a) => (a - 1 + results.length) % results.length);
          } else if (e.key === "Enter" && open) {
            e.preventDefault();
            pick(results[active]);
          } else if (e.key === "Escape") {
            setQ("");
            onDone?.();
          }
        }}
        className="h-10 w-full rounded-full border border-(--a-line-2) bg-(--a-card) pl-9 pr-3 text-[16px] text-(--a-ink) outline-none transition-[border-color,box-shadow] placeholder:text-(--a-muted) hover:border-(--a-ink) focus:border-(--m-accent) focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--m-accent)_20%,transparent)] md:text-[14px]"
      />
      <ul
        id={listId}
        role="listbox"
        aria-label="Matches"
        className={`absolute bottom-[calc(100%+8px)] left-0 right-0 overflow-hidden rounded-[12px] border border-(--a-line) bg-(--a-card) p-1 shadow-[0_24px_50px_-24px_rgba(31,29,26,0.5)] max-md:bottom-auto max-md:top-[calc(100%+8px)] ${
          open ? "" : "hidden"
        }`}
      >
        {results.map((r, i) => (
          <li
            key={r.key}
            id={`${id}-o${i}`}
            role="option"
            aria-selected={i === active}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => pick(r)}
            onMouseEnter={() => setActive(i)}
            className={`flex cursor-pointer items-baseline justify-between gap-3 rounded-[8px] px-3 py-2 ${i === active ? "bg-(--a-paper-2)" : ""}`}
          >
            <span className="truncate text-[14px] font-medium">{r.label}</span>
            <span className="shrink-0 text-[12px] text-(--a-muted)">{r.hint}</span>
          </li>
        ))}
      </ul>
      {q.trim() && !open && <p className="absolute bottom-[calc(100%+8px)] left-0 right-0 rounded-[12px] border border-(--a-line) bg-(--a-card) px-3 py-2 text-[13px] text-(--a-muted) max-md:bottom-auto max-md:top-[calc(100%+8px)]">Nothing on the board by that name.</p>}
    </div>
  );
}

/* ---------------- controls ---------------- */
const iconBtn = `${s.btn} grid size-10 place-items-center rounded-full text-(--a-ink) hover:bg-black/[0.05] active:bg-black/10`;

function ZoomIcons({ kind }: { kind: "in" | "out" | "fit" | "tour" | "search" }) {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden>
      {kind === "in" && <path d="M4 10h12M10 4v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
      {kind === "out" && <path d="M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
      {kind === "fit" && (
        <path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {kind === "tour" && (
        <>
          <circle cx="5" cy="14" r="2" fill="currentColor" />
          <circle cx="15" cy="6" r="2" fill="currentColor" />
          <path d="M5 14C5 8 15 12 15 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
        </>
      )}
      {kind === "search" && (
        <>
          <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function Controls() {
  const ui = useAtlasUI();
  const [phoneSearch, setPhoneSearch] = useState(false);
  const zoomLabel = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    atlas.bindZoomLabel(zoomLabel.current);
    return () => atlas.bindZoomLabel(null);
  }, []);
  return (
    <>
      {/* desktop: an instrument panel bottom-right */}
      <motion.div
        initial={false}
        animate={{ opacity: ui.ready ? 1 : 0, y: ui.ready ? 0 : 12 }}
        transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`${s.chip} fixed bottom-4 right-4 z-[110] hidden w-[272px] rounded-[16px] p-2.5 md:block`}
      >
        <Search />
        <div className="mt-2.5 overflow-hidden rounded-[8px] border border-(--a-line)">
          <Minimap />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <button type="button" className={iconBtn} aria-label="Zoom out" onClick={() => atlas.zoomBy(1 / 1.4)}>
            <ZoomIcons kind="out" />
          </button>
          <span ref={zoomLabel} className="w-12 text-center text-[13px] tabular-nums text-(--a-ink-2)" aria-hidden>
            40%
          </span>
          <button type="button" className={iconBtn} aria-label="Zoom in" onClick={() => atlas.zoomBy(1.4)}>
            <ZoomIcons kind="in" />
          </button>
          <span className="mx-1 h-5 w-px bg-(--a-line-2)" aria-hidden />
          <button type="button" className={`${iconBtn} w-auto gap-1.5 whitespace-nowrap px-3 text-[13px]`} onClick={() => atlas.flyTo(atlas.fitBoard())}>
            <ZoomIcons kind="fit" />
            Whole board
          </button>
        </div>
        <button
          type="button"
          onClick={() => (ui.tour === null ? atlas.startTour() : atlas.endTour())}
          className={`${s.btn} ${s.btnInk} mt-1.5 h-11 w-full gap-2 text-[14px] font-medium`}
        >
          <ZoomIcons kind="tour" />
          {ui.tour === null ? "Take the tour" : "End the tour"}
        </button>
      </motion.div>

      {/* phones: a column of round buttons on the right edge */}
      <div className="fixed bottom-4 right-3 z-[110] flex flex-col gap-2 md:hidden">
        {[
          { k: "search" as const, label: "Find on the board", on: () => setPhoneSearch((v) => !v) },
          { k: "tour" as const, label: ui.tour === null ? "Take the tour" : "End tour", on: () => (ui.tour === null ? atlas.startTour() : atlas.endTour()) },
          { k: "in" as const, label: "Zoom in", on: () => atlas.zoomBy(1.4) },
          { k: "out" as const, label: "Zoom out", on: () => atlas.zoomBy(1 / 1.4) },
          { k: "fit" as const, label: "Show the whole board", on: () => atlas.flyTo(atlas.fitBoard()) },
        ].map((b) => (
          <button key={b.k} type="button" aria-label={b.label} onClick={b.on} className={`${s.chip} ${iconBtn} size-11`}>
            <ZoomIcons kind={b.k} />
          </button>
        ))}
      </div>
      {phoneSearch && (
        <div className="fixed inset-x-3 top-[64px] z-[125] md:hidden">
          <div className={`${s.chip} rounded-[22px] p-1.5`}>
            <Search autoFocus onDone={() => setPhoneSearch(false)} />
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- tour ---------------- */
function TourCaption({ step }: { step: number | null }) {
  const wp = step !== null ? WAYPOINTS[step] : null;
  return (
    <AnimatePresence>
      {wp && step !== null && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          role="region"
          aria-label="Tour"
          className="fixed left-1/2 top-[64px] z-[115] w-[min(calc(100vw-24px),640px)] -translate-x-1/2 md:top-[76px] min-[1200px]:bottom-5 min-[1200px]:top-auto min-[1200px]:w-[min(calc(100vw-660px),680px)]"
        >
          <div className={`${s.chip} flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[16px] p-3.5 pl-5`}>
            <div className="min-w-0 flex-[1_1_300px]" aria-live="polite">
              <p className="flex items-center gap-3 text-[12px] tabular-nums text-(--a-muted)">
                <span>
                  Stop {step + 1} of {WAYPOINTS.length}
                </span>
                <span className="flex gap-1" aria-hidden>
                  {WAYPOINTS.map((w, i) => (
                    <span
                      key={w.id}
                      className={`h-1 rounded-full transition-all duration-500 ${i === step ? "w-5 bg-(--m-accent)" : i < step ? "w-1 bg-(--a-ink)" : "w-1 bg-(--a-line-2)"}`}
                    />
                  ))}
                </span>
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
                  <p className={`${s.serif} mt-1 text-[20px] leading-tight`}>{wp.title}</p>
                  <p className="mt-0.5 text-[14px] leading-snug text-(--a-ink-2)">{wp.caption}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => atlas.tourGo(step - 1)}
                className={`${s.btn} ${s.btnLine} h-10 px-4 text-[14px] disabled:opacity-40`}
              >
                Back
              </button>
              {step < WAYPOINTS.length - 1 ? (
                <button type="button" onClick={() => atlas.tourGo(step + 1)} className={`${s.btn} ${s.btnInk} h-10 px-5 text-[14px] font-medium`}>
                  Next
                </button>
              ) : (
                <button type="button" onClick={() => atlas.endTour()} className={`${s.btn} ${s.btnInk} h-10 px-5 text-[14px] font-medium`}>
                  Explore freely
                </button>
              )}
              <button type="button" onClick={() => atlas.endTour()} className={`${iconBtn} size-10`} aria-label="End the tour">
                <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
