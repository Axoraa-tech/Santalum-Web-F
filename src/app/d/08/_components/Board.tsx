"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { WT } from "@/components/maison/W";
import { FAMILIES, WOOD_NAMES, formatINR, getFamily } from "@/lib/catalog";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { useWood, type Wood } from "@/lib/wood";
import {
  BOARD,
  CATEGORY_LABELS,
  CATEGORY_Y,
  CIRCLE,
  CITES,
  COLLECTION_HEAD,
  CONTOURS,
  CREDITS,
  GIFTING,
  LEGEND,
  MAKING_HEAD,
  MAKING_PATH,
  MAKING_PHOTO,
  MAKING_QUOTE,
  MAP,
  OIL_NOTE,
  PIN_WORLD,
  RECORD,
  RED_NOTES,
  RED_ORIGIN,
  RED_SPECIMENS,
  RED_TITLE,
  ROUTES,
  STEPS,
  TEMPLE,
  TITLE,
  VAULT_HEAD,
  VAULT_NOTE,
  VAULT_RING,
  WHITE_NOTES,
  WHITE_ORIGIN,
  WHITE_SPECIMENS,
  WHITE_TITLE,
  categoryOf,
  leader,
  waypoint,
  type Note,
  type Rect,
  type Specimen,
} from "../_lib/board";
import { atlas } from "../_lib/engine";
import { setMode } from "../_lib/view";
import { ProductCard } from "./Detail";
import { IndiaMap } from "./IndiaMap";
import { PinGlyph, WOOD_HEX, pickWood } from "./Pins";
import { CircleForm, RecordCard, VaultRing, WPhoto } from "./Shared";
import { Mark } from "./TopBar";
import { s } from "./styles";

const at = (r: Rect, extra?: CSSProperties): CSSProperties => ({ left: r.x, top: r.y, width: r.w, ...extra });

function Node({ r, children, className = "", label, h }: { r: Rect; children: ReactNode; className?: string; label?: string; h?: boolean }) {
  return (
    <section data-node aria-label={label} className={`absolute ${className}`} style={at(r, h ? { height: r.h } : undefined)}>
      {children}
    </section>
  );
}

function SpecimenPlate({ sp }: { sp: Specimen }) {
  return (
    <figure data-node className="absolute m-0 bg-(--a-card) p-3 shadow-[0_24px_50px_-34px_rgba(31,29,26,0.55)]" style={{ left: sp.rect.x - 12, top: sp.rect.y - 12, width: sp.rect.w + 24, height: sp.rect.h + 24 }}>
      <div className="relative h-full w-full overflow-hidden bg-(--a-paper-2)">
        <Photo p={sp.photo} sizes="900px" />
      </div>
      <figcaption className="absolute bottom-6 left-6 bg-(--a-card) px-3 py-1.5 text-[18px] text-(--a-ink-2)">{sp.caption}</figcaption>
    </figure>
  );
}

function NoteLabel({ n }: { n: Note }) {
  return (
    <div className="absolute" style={{ left: n.label.x, top: n.label.y, width: n.label.w }}>
      <p className={`${s.serif} text-[32px] leading-none`}>{n.title}</p>
      <p className="mt-2 text-[22px] leading-snug text-(--a-ink-2)">{n.text}</p>
    </div>
  );
}

function RegionTitle({ w, r }: { w: Wood; r: Rect }) {
  const name = WOOD_NAMES[w];
  const wood = useWood();
  const on = wood === w;
  return (
    <Node r={r} label={name.common}>
      <h2 className={`${s.serif} whitespace-nowrap text-[128px] leading-[0.95] tracking-[-0.025em]`}>{name.common}</h2>
      <p className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <span className="text-[38px] italic text-(--a-ink-2)">{name.latin}</span>
        <span className={`${s.deva} text-[40px] text-(--a-muted)`} lang="sa">
          {name.sa}
        </span>
      </p>
      <p className="mt-5 max-w-[960px] text-[27px] leading-[1.45] text-(--a-ink-2)">
        {w === "red"
          ? "Deep red, dense and fine-grained, with almost no scent. It grows in the Eastern Ghats, mainly in Andhra Pradesh, and its international trade is regulated under CITES Appendix II."
          : "Pale gold and fragrant. The oil sits in the heartwood, so the scent comes from the centre of the tree. It grows in the dry forests of southern India; Mysuru, in Karnataka, is its traditional craft centre."}
      </p>
      <button
        type="button"
        onClick={() => pickWood(w, false)}
        aria-pressed={on}
        className={`${s.btn} mt-6 h-[60px] gap-3 border px-6 text-[22px] ${on ? "border-(--a-ink) bg-(--a-ink) text-(--a-paper)" : "border-(--a-line-2) bg-(--a-card) hover:border-(--a-ink)"}`}
      >
        <PinGlyph color={WOOD_HEX[w]} filled={!on} className="h-8 w-6" />
        {on ? `Showing ${name.common.toLowerCase()} across the board` : `Show ${name.common.toLowerCase()} across the board`}
      </button>
    </Node>
  );
}

function OriginCard({ w, r }: { w: Wood; r: Rect }) {
  const red = w === "red";
  return (
    <Node r={r} h label={red ? "Eastern Ghats" : "Mysuru"} className="flex flex-col border border-(--a-line-2) bg-(--a-card) p-7 shadow-[0_24px_50px_-34px_rgba(31,29,26,0.5)]">
      <div className="flex items-center gap-3">
        <PinGlyph color={WOOD_HEX[w]} className="h-11 w-8" />
        <div>
          <p className={`${s.serif} text-[40px] leading-none`}>{red ? "Eastern Ghats" : "Mysuru"}</p>
          <p className="mt-1.5 text-[20px] text-(--a-muted)">{red ? "Andhra Pradesh" : "Karnataka"}</p>
        </div>
      </div>
      <p className="mt-5 text-[22px] leading-snug text-(--a-ink-2)">
        {red
          ? "Red sandalwood grows in the dry hills of the southern Eastern Ghats, mainly in Andhra Pradesh."
          : "White sandalwood grows in the dry forests of southern India. Mysuru has long been the centre of its craft."}
      </p>
      <button type="button" onClick={() => pickWood(w)} className={`${s.btn} ${s.btnLine} mt-auto h-14 self-start px-5 text-[19px]`}>
        Go to {red ? "red" : "white"} sandalwood
      </button>
    </Node>
  );
}

function StepCard({ i }: { i: number }) {
  const st = STEPS[i];
  return (
    <article data-node className={`${s.card} overflow-visible`} style={{ left: st.rect.x, top: st.rect.y, width: st.rect.w, height: st.rect.h, ["--rot" as string]: `${i % 2 ? 0.8 : -0.8}deg` }}>
      <span className="absolute -left-6 -top-6 z-10 grid size-14 place-items-center rounded-full bg-(--m-accent) text-[24px] font-semibold text-white shadow-[0_6px_10px_-4px_rgba(31,29,26,0.5)]">
        {st.n}
      </span>
      <div className="relative h-[290px] overflow-hidden bg-(--a-paper-2)">
        <WPhoto red={<Photo p={st.photo.red} sizes="600px" className={s.photoZoom} />} white={<Photo p={st.photo.white} sizes="600px" className={s.photoZoom} />} />
      </div>
      <div className="p-6">
        <h3 className={`${s.serif} text-[46px] leading-none`}>{st.name}</h3>
        <p className="mt-3 text-[22px] leading-snug text-(--a-ink-2)">{st.text}</p>
      </div>
    </article>
  );
}

function PhotoBlock({ r, p, caption }: { r: Rect; p: PhotoRef; caption: string }) {
  return (
    <figure data-node className="absolute m-0 bg-(--a-card) p-3 shadow-[0_24px_50px_-34px_rgba(31,29,26,0.55)]" style={{ left: r.x, top: r.y, width: r.w, height: r.h }}>
      <div className="relative h-full w-full overflow-hidden bg-(--a-paper-2)">
        <Photo p={p} sizes="800px" />
      </div>
      <figcaption className="absolute bottom-6 left-6 max-w-[80%] bg-(--a-card) px-3 py-1.5 text-[18px] text-(--a-ink-2)">{caption}</figcaption>
    </figure>
  );
}

/** Everything on the board, in world coordinates. DOM order is the reading order for keyboard users. */
export function Board({ open }: { open: string | null }) {
  const vault = getFamily("vault-cuff")!;
  const box = getFamily("presentation-box")!;
  return (
    <>
      {/* under-layer: region contours and the making route */}
      <svg className="pointer-events-none absolute left-0 top-0" width={BOARD.w} height={BOARD.h} viewBox={`0 0 ${BOARD.w} ${BOARD.h}`} aria-hidden>
        <path d={CONTOURS.red[0]} className={s.fillRed} />
        <path d={CONTOURS.white[0]} className={s.fillWhite} />
        {CONTOURS.red.map((d, i) => (
          <path key={`r${i}`} d={d} className={s.contourRed} strokeDasharray={i === 0 ? "none" : "6 10"} />
        ))}
        {CONTOURS.white.map((d, i) => (
          <path key={`w${i}`} d={d} className={s.contourWhite} strokeDasharray={i === 0 ? "none" : "6 10"} />
        ))}
        <path d={MAKING_PATH} className={s.making} />
      </svg>

      {/* ---------- title plate ---------- */}
      <Node r={TITLE} label="Santalum Maison">
        <div className="flex items-center justify-between border-b border-(--a-ink) pb-4">
          <p className="flex items-center gap-3">
            <Mark className="size-11" />
            <span className={`${s.serif} text-[34px]`}>Santalum Maison</span>
          </p>
          <p className="text-[22px] text-(--a-muted)">Red and white sandalwood from India</p>
        </div>
        <h1 className={`${s.serif} mt-8 text-[170px] leading-[0.92] tracking-[-0.03em]`}>
          Objects time
          <br />
          cannot repeat.
        </h1>
        <div className="mt-9 flex items-end justify-between gap-12">
          <p className="max-w-[1000px] text-[28px] leading-[1.45] text-(--a-ink-2)">
            Four thousand years found its way to you. This board holds all of it: the two woods and where they grow, every piece we make,
            how it is made, and the record that leaves with it.
          </p>
          <div className="flex shrink-0 flex-col items-end gap-3">
            <div className="flex gap-3">
              <button type="button" onClick={() => atlas.startTour()} className={`${s.btn} ${s.btnInk} h-[68px] px-8 text-[24px] font-medium`}>
                Take the tour
              </button>
              <button type="button" onClick={() => atlas.flyTo(atlas.fitBoard())} className={`${s.btn} ${s.btnLine} h-[68px] px-8 text-[24px]`}>
                See the whole board
              </button>
            </div>
            <p className="text-[19px] text-(--a-muted)">Drag to move. Scroll or pinch to zoom. Arrow keys work too.</p>
          </div>
        </div>
      </Node>

      {/* ---------- red sandalwood ---------- */}
      <RegionTitle w="red" r={RED_TITLE} />
      {RED_SPECIMENS.map((sp) => (
        <SpecimenPlate key={sp.id} sp={sp} />
      ))}
      {RED_NOTES.map((n) => (
        <NoteLabel key={n.title} n={n} />
      ))}

      {/* ---------- white sandalwood ---------- */}
      <RegionTitle w="white" r={WHITE_TITLE} />
      {WHITE_SPECIMENS.map((sp) => (
        <SpecimenPlate key={sp.id} sp={sp} />
      ))}
      {WHITE_NOTES.map((n) => (
        <NoteLabel key={n.title} n={n} />
      ))}

      {/* ---------- map ---------- */}
      <OriginCard w="red" r={RED_ORIGIN} />
      <Node r={CITES} h label="CITES Appendix II" className="border-l-4 border-(--a-red) bg-(--a-card) p-7">
        <p className={`${s.serif} text-[36px] leading-none`}>CITES Appendix II</p>
        <p className="mt-4 text-[22px] leading-snug text-(--a-ink-2)">
          Red sandalwood is listed internationally, so its trade across borders is regulated.
        </p>
        <button type="button" onClick={() => atlas.flyToRect(waypoint("provenance").rect, { maxZ: 1 })} className={`${s.link} mt-4 text-[20px]`}>
          How we record each piece
        </button>
      </Node>
      <div data-node className="absolute bg-(--a-card) shadow-[0_30px_60px_-40px_rgba(31,29,26,0.6)]" style={{ left: MAP.x, top: MAP.y, width: MAP.w, height: MAP.h }}>
        <IndiaMap className="block h-full w-full" />
        {(["red", "white"] as const).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => pickWood(w)}
            aria-label={w === "red" ? "Eastern Ghats pin: show red sandalwood and go to its region" : "Mysuru pin: show white sandalwood and go to its region"}
            className="absolute size-14 -translate-x-1/2 rounded-full transition-transform duration-300 hover:scale-110 active:scale-95"
            style={{ left: PIN_WORLD[w][0] - MAP.x, top: PIN_WORLD[w][1] - MAP.y - 58 }}
          />
        ))}
      </div>
      <OriginCard w="white" r={WHITE_ORIGIN} />
      <PhotoBlock r={TEMPLE} p={PHOTOS.temple} caption="A Hoysala temple corridor, Karnataka" />

      {/* ---------- collection ---------- */}
      <Node r={COLLECTION_HEAD} label="The collection">
        <div className="flex items-start gap-14">
          <h2 className={`${s.serif} shrink-0 text-[110px] leading-[0.95] tracking-[-0.02em]`}>The collection</h2>
          <p className="mt-3 max-w-[640px] text-[24px] leading-[1.45] text-(--a-ink-2)">
            Eleven families. Ten are made in both woods and sit between the two regions; the heartwood oil comes only from white sandalwood.
            Prices shown are for <WT red="red" white="white" /> sandalwood. Open any piece to look closer.
          </p>
        </div>
      </Node>
      {CATEGORY_LABELS.map((c) => {
        const cat = categoryOf(c.key);
        return (
          <div key={c.key} className="absolute border-t-2 border-(--a-ink) pt-3" style={{ left: c.x, top: CATEGORY_Y, width: c.w }}>
            <p className={`${s.serif} text-[30px] leading-none`}>{cat.label}</p>
            <p className="mt-1.5 text-[19px] leading-snug text-(--a-muted)">{cat.line}</p>
          </div>
        );
      })}
      <div className="absolute" style={{ left: OIL_NOTE.x, top: OIL_NOTE.y, width: OIL_NOTE.w }}>
        <p className={`${s.serif} text-[32px] leading-[1.05]`}>Only from white sandalwood</p>
        <p className="mt-3 text-[21px] leading-snug text-(--a-ink-2)">Red sandalwood does not carry this oil. Only the heartwood of white sandalwood does.</p>
      </div>
      {FAMILIES.map((f) => (
        <ProductCard key={f.slug} f={f} open={open === f.slug} />
      ))}

      {/* ---------- making ---------- */}
      <Node r={MAKING_QUOTE} label="How a piece begins">
        <p className={`${s.serif} text-[84px] leading-[0.98] tracking-[-0.02em]`}>Every piece begins as a reading.</p>
        <p className="mt-6 max-w-[880px] text-[30px] leading-[1.4] text-(--a-ink-2)">
          The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.
        </p>
      </Node>
      <PhotoBlock r={MAKING_PHOTO} p={PHOTOS.carving} caption="Reading the grain before the cut" />
      <Node r={MAKING_HEAD} label="The making">
        <div className="flex items-end gap-8 border-t-2 border-(--a-ink) pt-5">
          <h2 className={`${s.serif} shrink-0 whitespace-nowrap text-[96px] leading-none tracking-[-0.02em]`}>The making</h2>
          <p className="pb-2 text-[24px] leading-snug text-(--a-ink-2)">Five steps, from the raw wood to the box. Follow the line.</p>
        </div>
      </Node>
      {STEPS.map((_, i) => (
        <StepCard key={i} i={i} />
      ))}
      <Node r={LEGEND} h label="How to read this board" className="border border-dashed border-(--a-line-2) bg-(--a-card) p-7">
        <p className={`${s.serif} text-[34px] leading-none`}>Reading the board</p>
        <ul className="mt-5 space-y-4 text-[21px] leading-snug text-(--a-ink-2)">
          <li className="flex items-center gap-4">
            <PinGlyph color="var(--m-accent)" className="h-9 w-7 shrink-0" />
            Where a wood grows
          </li>
          <li className="flex items-center gap-4">
            <svg viewBox="0 0 40 10" className="h-3 w-10 shrink-0" aria-hidden>
              <path d="M2 5h36" stroke="var(--m-accent)" strokeWidth="3" strokeDasharray="7 5" />
            </svg>
            A route: from the forest, or through the making
          </li>
          <li className="flex items-center gap-4">
            <svg viewBox="0 0 40 20" className="h-5 w-10 shrink-0" aria-hidden>
              <circle cx="6" cy="14" r="4" fill="#fbfaf7" stroke="#1f1d1a" strokeWidth="2" />
              <path d="M6 14L22 4h16" fill="none" stroke="#1f1d1a" strokeWidth="1.6" />
            </svg>
            A note on a photograph
          </li>
          <li className="flex items-center gap-4">
            <span className="grid h-9 w-7 shrink-0 place-items-center border border-(--a-line-2) bg-(--a-paper)">
              <span className="size-2.5 rounded-full bg-(--m-accent)" />
            </span>
            A piece you can open
          </li>
        </ul>
      </Node>

      {/* ---------- provenance ---------- */}
      <section data-node aria-label="Know what you hold" className="absolute" style={at(RECORD)}>
        <h2 className={`${s.serif} whitespace-nowrap text-[74px] leading-none tracking-[-0.02em]`}>Know what you hold</h2>
        <p className="mt-4 max-w-[760px] text-[24px] leading-snug text-(--a-ink-2)">
          Every piece is entered in a record before it leaves us: wood, origin, batch, the artisan and the date.
        </p>
        <div className="mt-7 text-[26px]">
          <RecordCard />
        </div>
      </section>

      {/* ---------- the 2011 vault ---------- */}
      <Node r={VAULT_HEAD} label="The 2011 Vault">
        <h2 className={`${s.serif} text-[96px] leading-none tracking-[-0.02em]`}>The 2011 Vault</h2>
        <p className="mt-4 max-w-[820px] text-[24px] leading-snug text-(--a-ink-2)">
          Twenty-one cuffs turned from aged heartwood sourced in 2011. The wood has waited since then for the right hands.
        </p>
      </Node>
      <button
        type="button"
        onClick={() => atlas.openProduct("vault-cuff")}
        aria-label={`The 2011 Vault: twenty-one numbered cuffs. Open ${vault.name}.`}
        className="absolute rounded-full transition-transform duration-500 active:scale-[0.99]"
        style={{
          left: VAULT_RING.cx - VAULT_RING.r - VAULT_RING.token,
          top: VAULT_RING.cy - VAULT_RING.r - VAULT_RING.token,
        }}
      >
        <VaultRing size={(VAULT_RING.r + VAULT_RING.token) * 2} token={VAULT_RING.token * 2} />
      </button>
      <div className="absolute" style={at(VAULT_NOTE)}>
        <p className="text-[21px] leading-snug text-(--a-ink-2)">
          Each cuff is entered in our provenance registry with its number, harvest origin, the artisan&rsquo;s name and the date it left our hands.
        </p>
        <p className="mt-3 text-[21px] font-semibold">
          From <WT red={formatINR(vault.variants.red!.price)} white={formatINR(vault.variants.white!.price)} />
        </p>
      </div>

      {/* ---------- gifting ---------- */}
      <Node r={GIFTING} h label="Gifting" className="flex border border-(--a-line-2) bg-(--a-card) shadow-[0_30px_60px_-40px_rgba(31,29,26,0.6)]">
        <div className="relative w-[540px] shrink-0 overflow-hidden">
          <WPhoto red={<Photo p={PHOTOS.boxCarved} sizes="700px" />} white={<Photo p={PHOTOS.giftLinen} sizes="700px" />} />
        </div>
        <div className="flex flex-1 flex-col p-10">
          <h2 className={`${s.serif} text-[64px] leading-[1.02] tracking-[-0.015em]`}>Give something that remains</h2>
          <p className="mt-5 text-[23px] leading-[1.45] text-(--a-ink-2)">
            {box.summary} Choose it empty, or ask us to fill it with a mala, powder or oil. For corporate gifts, leave the number of pieces and
            the date in the gift note at checkout.
          </p>
          <div className="mt-auto flex items-center gap-6">
            <button type="button" onClick={() => atlas.openProduct("presentation-box")} className={`${s.btn} ${s.btnInk} h-[60px] px-7 text-[21px] font-medium`}>
              See the presentation box
            </button>
            <span className="text-[21px] text-(--a-muted)">
              From <WT red={formatINR(box.variants.red!.price)} white={formatINR(box.variants.white!.price)} />
            </span>
          </div>
        </div>
      </Node>

      {/* ---------- circle ---------- */}
      <Node r={CIRCLE} h label="The Santalum Circle" className="flex flex-col border border-(--a-ink) bg-(--a-card) p-10">
        <div className="flex items-baseline justify-between gap-6 border-b border-(--a-line-2) pb-5">
          <h2 className={`${s.serif} whitespace-nowrap text-[64px] leading-none tracking-[-0.015em]`}>The Santalum Circle</h2>
          <PinGlyph color="var(--m-accent)" className="h-12 w-9 shrink-0" />
        </div>
        <div className="mt-6 flex flex-1 items-start gap-10">
          <p className="w-[330px] shrink-0 text-[23px] leading-snug text-(--a-ink-2)">
            Letters from the house: new batches, Vault numbers, and notes from the workshop.
          </p>
          <div className="flex-1 text-[24px]">
            <CircleForm />
          </div>
        </div>
      </Node>

      {/* ---------- credits (the board's footer) ---------- */}
      <Node r={CREDITS} h label="Credits" className="flex flex-col justify-between border-t-2 border-(--a-ink) pt-6">
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className={`${s.serif} text-[44px] leading-none`}>Santalum Maison</p>
            <p className="mt-3 max-w-[560px] text-[21px] leading-snug text-(--a-ink-2)">
              Made with respect for the material. Designed for the life around it.
            </p>
          </div>
          <nav aria-label="Board links" className="flex flex-col items-end gap-2 text-[21px]">
            <button type="button" onClick={() => setMode("list")} className={s.link}>
              Read the board as a list
            </button>
            <Link href="/d/08/checkout" className={s.link}>
              Checkout
            </Link>
            <button type="button" onClick={() => atlas.startTour()} className={s.link}>
              Take the tour again
            </button>
          </nav>
        </div>
        <p className="text-[18px] text-(--a-muted)">
          &copy; 2026 Santalum Maison, India. Photographs are placeholders from Unsplash. Prices are in Indian rupees.
        </p>
      </Node>

      {/* over-layer: leader lines and routes */}
      <svg className="pointer-events-none absolute left-0 top-0" width={BOARD.w} height={BOARD.h} viewBox={`0 0 ${BOARD.w} ${BOARD.h}`} aria-hidden>
        <path d={ROUTES.redOut} className={s.routeRed} />
        <path d={ROUTES.whiteOut} className={s.routeWhite} />
        <path d={ROUTES.red} className={s.routeRed} />
        <path d={ROUTES.white} className={s.routeWhite} />
        <path d={ROUTES.oil} className={s.leader} strokeDasharray="4 8" />
        {[...RED_NOTES, ...WHITE_NOTES].map((n) => (
          <g key={n.title + n.at[0]}>
            <path d={leader(n)} className={s.leader} />
            <circle cx={n.at[0]} cy={n.at[1]} r="9" className={s.leaderDot} />
            <circle cx={n.at[0]} cy={n.at[1]} r="3" fill="#1f1d1a" />
          </g>
        ))}
      </svg>
    </>
  );
}
