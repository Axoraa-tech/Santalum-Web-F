"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { FAMILIES, WOOD_NAMES, formatINR, getFamily, type Family } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { BOARD, CARD_POS, MINI_SHAPES, cardRect, careFor, categoryOf } from "../_lib/board";
import { atlas } from "../_lib/engine";
import { setMode } from "../_lib/view";
import { PinGlyph, WOOD_HEX } from "./Pins";
import { s } from "./styles";

/* The plate is drawn in a 1000 × 860 space; callouts sit in the margins, leader lines run onto the photo. */
const PW = 1000;
const PH = 860;
const PHOTO = { x: 270, y: 40, w: 460, h: 575 };
const SPOTS: { at: [number, number]; box: { x: number; y: number }; side: "l" | "r" }[] = [
  { at: [430, 250], box: { x: 0, y: 110 }, side: "l" },
  { at: [590, 300], box: { x: 780, y: 170 }, side: "r" },
  { at: [455, 450], box: { x: 0, y: 420 }, side: "l" },
  { at: [570, 500], box: { x: 780, y: 480 }, side: "r" },
];
const BOX_W = 220;

/** Back to the board, with the camera on this piece and its card open. */
function useBackToBoard(slug: string) {
  const router = useRouter();
  return () => {
    atlas.pending = slug;
    setMode("canvas");
    router.push("/d/08");
  };
}

function Plate({ f, wood }: { f: Family; wood: Wood }) {
  const v = f.variants[wood] ?? f.variants[wood === "red" ? "white" : "red"]!;
  const [shot, setShot] = useState(0);
  const cur = v.shots[Math.min(shot, v.shots.length - 1)];
  const notes = [...f.details.slice(0, 3), { label: "Wood", value: `${WOOD_NAMES[v === f.variants[wood] ? wood : wood === "red" ? "white" : "red"].common}, ${v.note.charAt(0).toLowerCase()}${v.note.slice(1)}` }];
  return (
    <div>
      {/* wide screens: the annotated plate */}
      <div className="relative hidden lg:block" style={{ aspectRatio: `${PW} / ${PH}` }}>
        <div
          className="absolute overflow-hidden bg-(--a-paper-2) shadow-[0_40px_80px_-50px_rgba(31,29,26,0.7)] outline outline-[10px] outline-(--a-card)"
          style={{ left: `${(PHOTO.x / PW) * 100}%`, top: `${(PHOTO.y / PH) * 100}%`, width: `${(PHOTO.w / PW) * 100}%`, height: `${(PHOTO.h / PH) * 100}%` }}
        >
          <AnimatePresence initial={false}>
            <motion.div key={`${wood}-${shot}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
              <Photo p={cur.photo} tone={cur.tone} sizes="(min-width: 1024px) 560px, 1px" priority />
            </motion.div>
          </AnimatePresence>
        </div>
        <svg viewBox={`0 0 ${PW} ${PH}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {notes.map((_, i) => {
            const sp = SPOTS[i];
            const ax = sp.side === "l" ? sp.box.x + BOX_W + 12 : sp.box.x - 12;
            const ay = sp.box.y + 14;
            const kx = sp.side === "l" ? ax + 30 : ax - 30;
            return (
              <g key={i}>
                <path d={`M${sp.at[0]} ${sp.at[1]} L${kx} ${ay} L${ax} ${ay}`} fill="none" stroke="#1f1d1a" strokeWidth="1.2" strokeOpacity="0.8" />
                <circle cx={sp.at[0]} cy={sp.at[1]} r="7" fill="#fbfaf7" stroke="#1f1d1a" strokeWidth="1.6" />
                <circle cx={sp.at[0]} cy={sp.at[1]} r="2.4" fill="#1f1d1a" />
              </g>
            );
          })}
          <line x1={PHOTO.x} x2={PHOTO.x + PHOTO.w} y1={PHOTO.y + PHOTO.h + 46} y2={PHOTO.y + PHOTO.h + 46} stroke="#1f1d1a" strokeOpacity="0.5" />
          <line x1={PHOTO.x} x2={PHOTO.x} y1={PHOTO.y + PHOTO.h + 38} y2={PHOTO.y + PHOTO.h + 54} stroke="#1f1d1a" strokeOpacity="0.5" />
          <line x1={PHOTO.x + PHOTO.w} x2={PHOTO.x + PHOTO.w} y1={PHOTO.y + PHOTO.h + 38} y2={PHOTO.y + PHOTO.h + 54} stroke="#1f1d1a" strokeOpacity="0.5" />
        </svg>
        {notes.map((d, i) => {
          const sp = SPOTS[i];
          return (
            <div
              key={d.label}
              className={`absolute ${sp.side === "l" ? "text-right" : ""}`}
              style={{ left: `${(sp.box.x / PW) * 100}%`, top: `${(sp.box.y / PH) * 100}%`, width: `${(BOX_W / PW) * 100}%` }}
            >
              <p className="text-[12px] text-(--a-muted)">{d.label}</p>
              <p className={`${s.serif} mt-0.5 text-[17px] leading-snug`}>{d.value}</p>
            </div>
          );
        })}
        <p
          className="absolute -translate-x-1/2 bg-(--a-paper) px-3 text-center text-[12px] text-(--a-muted)"
          style={{ left: "50%", top: `${((PHOTO.y + PHOTO.h + 38) / PH) * 100}%` }}
        >
          {f.details.find((d) => d.label === "Size")?.value ?? WOOD_NAMES[wood].common}
        </p>
        <div className="absolute flex gap-2" style={{ left: `${(PHOTO.x / PW) * 100}%`, top: `${((PHOTO.y + PHOTO.h + 80) / PH) * 100}%` }} role="group" aria-label="Photos">
          {v.shots.map((sh, i) => (
            <button
              key={`${sh.photo.id}-${i}`}
              type="button"
              aria-label={`Photo ${i + 1} of ${v.shots.length}`}
              aria-pressed={i === shot}
              onClick={() => setShot(i)}
              className={`relative size-16 overflow-hidden border-2 transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 ${i === shot ? "border-(--a-ink)" : "border-transparent opacity-75 hover:opacity-100"}`}
            >
              <Photo p={sh.photo} tone={sh.tone} sizes="128px" />
            </button>
          ))}
        </div>
      </div>

      {/* phones and tablets: the photo with numbered marks, notes below */}
      <div className="lg:hidden">
        <div className="relative aspect-[4/5] overflow-hidden bg-(--a-paper-2)">
          <Photo p={cur.photo} tone={cur.tone} sizes="(max-width: 1023px) 100vw, 1px" priority />
          {notes.map((d, i) => (
            <span
              key={d.label}
              aria-hidden
              className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-(--a-ink) bg-(--a-card) text-[12px] font-semibold"
              style={{ left: `${((SPOTS[i].at[0] - PHOTO.x) / PHOTO.w) * 100}%`, top: `${((SPOTS[i].at[1] - PHOTO.y) / PHOTO.h) * 100}%` }}
            >
              {i + 1}
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2" role="group" aria-label="Photos">
          {v.shots.map((sh, i) => (
            <button
              key={`${sh.photo.id}-m${i}`}
              type="button"
              aria-label={`Photo ${i + 1} of ${v.shots.length}`}
              aria-pressed={i === shot}
              onClick={() => setShot(i)}
              className={`relative size-14 overflow-hidden border-2 ${i === shot ? "border-(--a-ink)" : "border-transparent opacity-75"}`}
            >
              <Photo p={sh.photo} tone={sh.tone} sizes="112px" />
            </button>
          ))}
        </div>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2">
          {notes.map((d, i) => (
            <li key={d.label} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-(--a-ink) text-[12px] font-semibold">{i + 1}</span>
              <span>
                <span className="block text-[12px] text-(--a-muted)">{d.label}</span>
                <span className={`${s.serif} block text-[17px] leading-snug`}>{d.value}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** Where this piece sits on the board: a small map of the board with its pin. */
function Locator({ slug, onBack }: { slug: string; onBack: () => void }) {
  const r = cardRect(slug);
  return (
    <button type="button" onClick={onBack} className="group block w-full text-left" aria-label="Show this piece on the board">
      <svg viewBox={`0 0 ${BOARD.w} ${BOARD.h}`} className="block h-auto w-full border border-(--a-line-2) bg-(--a-card) transition-colors group-hover:border-(--a-ink)" aria-hidden>
        {MINI_SHAPES.map((m, i) => (
          <rect key={i} x={m.r.x} y={m.r.y} width={m.r.w} height={m.r.h} fill={m.kind === "photo" ? "#d8cfbf" : m.kind === "card" ? "#efebe2" : "#1f1d1a"} fillOpacity={m.kind === "text" ? 0.1 : 1} />
        ))}
        <rect x={r.x - 30} y={r.y - 30} width={r.w + 60} height={r.h + 60} fill="none" stroke="var(--m-accent)" strokeWidth="24" />
        <g transform={`translate(${r.x + r.w / 2} ${r.y - 40}) scale(9)`}>
          <path d="M0 0C-1.2-4-7.5-8.8-7.5-15.2a7.5 7.5 0 1 1 15 0C7.5-8.8 1.2-4 0 0z" fill="var(--m-accent)" />
          <circle cy="-15.2" r="2.8" fill="#fbfaf7" />
        </g>
      </svg>
      <span className={`${s.link} mt-2 inline-block text-[14px]`}>Show it on the board</span>
    </button>
  );
}

export function ProductPlate({ slug }: { slug: string }) {
  const f = getFamily(slug)!;
  const wood = useWood();
  const v = f.variants[wood];
  const other: Wood = wood === "red" ? "white" : "red";
  const [added, setAdded] = useState(false);
  const back = useBackToBoard(slug);
  const cat = categoryOf(f.category);
  const near = FAMILIES.filter((x) => x.slug !== slug)
    .map((x) => ({ x, d: Math.hypot(CARD_POS[x.slug].x - CARD_POS[slug].x, CARD_POS[x.slug].y - CARD_POS[slug].y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((n) => n.x);

  const add = () => {
    bag.add(slug, wood);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <main className={`${s.paper} min-h-svh pb-32 pt-24 md:pt-28`}>
      <div className="mx-auto w-full max-w-[1320px] px-4 md:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-(--a-ink-2)">
          <button type="button" onClick={back} className={s.link}>
            The board
          </button>
          <span aria-hidden className="text-(--a-muted)">
            /
          </span>
          <span>{cat.label}</span>
          <span aria-hidden className="text-(--a-muted)">
            /
          </span>
          <span className="text-(--a-ink)" aria-current="page">
            {f.name}
          </span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-14">
          <Plate key={wood} f={f} wood={wood} />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[14px] text-(--a-muted)">
              {f.edition ?? f.level} piece
            </p>
            <h1 className={`${s.serif} mt-2 text-balance text-[clamp(2.4rem,4.5vw,3.8rem)] leading-[0.98] tracking-[-0.02em]`}>{f.name}</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-(--a-ink-2)">{f.summary}</p>

            <div className="mt-6 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Wood">
              {(["red", "white"] as const).map((w) => {
                const vv = f.variants[w];
                const on = wood === w;
                return (
                  <button
                    key={w}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={!vv}
                    onClick={() => switchWood(w)}
                    className={`flex items-center gap-3 rounded-[12px] border bg-(--a-card) px-3.5 py-3 text-left transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${
                      on ? "border-(--a-ink)" : "border-(--a-line-2) hover:border-(--a-ink) active:bg-black/5"
                    }`}
                  >
                    <PinGlyph color={WOOD_HEX[w]} filled={on} className="h-7 w-5 shrink-0" />
                    <span>
                      <span className="block text-[13px] text-(--a-muted)">{WOOD_NAMES[w].common}</span>
                      <span className="block text-[17px] font-semibold tabular-nums">{vv ? formatINR(vv.price) : "Not made"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[15px] italic text-(--a-ink-2)">
              {v ? v.note : `Made in ${WOOD_NAMES[other].common.toLowerCase()} only. ${other === "white" ? "Red sandalwood does not carry this oil." : ""}`}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {v ? (
                <button type="button" onClick={add} aria-live="polite" className={`${s.btn} ${s.btnInk} h-13 min-h-12 flex-1 px-6 text-[16px] font-medium`}>
                  {added ? "Added to your bag" : `Add to bag, ${formatINR(v.price)}`}
                </button>
              ) : (
                <button type="button" onClick={() => switchWood(other)} className={`${s.btn} ${s.btnInk} min-h-12 flex-1 px-6 text-[16px] font-medium`}>
                  Switch to {WOOD_NAMES[other].common.toLowerCase()}
                </button>
              )}
            </div>

            <div className="mt-8 space-y-3 border-t border-(--a-line-2) pt-6 text-[16px] leading-relaxed text-(--a-ink-2)">
              {f.story.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-6 border-l-2 border-(--m-accent) pl-4">
              <p className="text-[13px] text-(--a-muted)">Care</p>
              <p className="mt-1 text-[15px] leading-relaxed">{careFor(f)}</p>
            </div>
            <dl className="mt-6 border-t border-(--a-line-2)">
              {f.details.slice(3).map((d) => (
                <div key={d.label} className="flex justify-between gap-4 border-b border-(--a-line) py-2 text-[14px]">
                  <dt className="text-(--a-muted)">{d.label}</dt>
                  <dd className="text-right">{d.value}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-b border-(--a-line) py-2 text-[14px]">
                <dt className="text-(--a-muted)">Wood</dt>
                <dd className="text-right">
                  {WOOD_NAMES[v ? wood : other].common}, <i>{WOOD_NAMES[v ? wood : other].latin}</i>
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-(--a-line) py-2 text-[14px]">
                <dt className="text-(--a-muted)">Origin</dt>
                <dd className="text-right">{(v ? wood : other) === "red" ? "Eastern Ghats, Andhra Pradesh" : "Southern India, worked in Mysuru"}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-(--a-line) py-2 text-[14px]">
                <dt className="text-(--a-muted)">Record</dt>
                <dd className="text-right">Batch number and artisan&rsquo;s initials, with the piece</dd>
              </div>
            </dl>
          </div>
        </div>

        <section aria-labelledby="a8p-near" className="mt-24 grid gap-10 border-t border-(--a-ink) pt-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <h2 id="a8p-near" className={`${s.serif} text-[clamp(1.8rem,3.4vw,2.8rem)] leading-none`}>
              Near it on the board
            </h2>
            <p className="mt-3 max-w-[420px] text-[15px] leading-relaxed text-(--a-ink-2)">
              On the canvas this piece is pinned in {cat.label.toLowerCase()}, between the regions of the woods it is made in.
            </p>
            <div className="mt-6 max-w-[460px]">
              <Locator slug={slug} onBack={back} />
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
            {near.map((n, i) => {
              const nv = n.variants[wood] ?? n.variants[other]!;
              return (
                <li key={n.slug} className={i === 1 ? "sm:mt-10" : ""}>
                  <Link href={`/d/08/p/${n.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-(--a-paper-2)">
                      <Photo p={nv.shots[0].photo} tone={nv.shots[0].tone} sizes="(min-width: 768px) 260px, 45vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
                    </div>
                    <p className={`${s.serif} mt-2 text-[17px] leading-tight group-hover:underline group-hover:decoration-(--m-accent) group-hover:underline-offset-4`}>{n.name}</p>
                    <p className="mt-0.5 text-[14px] tabular-nums text-(--a-muted)">{formatINR(nv.price)}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
