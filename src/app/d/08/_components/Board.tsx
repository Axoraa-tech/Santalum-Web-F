"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, formatINR, getProduct, priceLabel, productsFor } from "@/lib/shop/products";
import type { PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import {
  BOARD,
  BOARDS,
  CATEGORY_Y,
  CIRCLE,
  COLLECTION_HEAD,
  CREDITS,
  FACTS,
  GIFTING,
  JOURNAL,
  LEGEND,
  MAKING_HEAD,
  MAKING_PATH,
  MAKING_PHOTO,
  MAKING_QUOTE,
  MAP,
  ORIGIN,
  OTHER,
  RECORD,
  REG,
  REGION_TITLE,
  SHOP,
  STEP_RECTS,
  TITLE,
  USE_A,
  USE_B,
  USE_HEAD,
  VAULT_HEAD,
  VAULT_NOTE,
  VAULT_RING,
  leader,
  type Note,
  type Rect,
  type Specimen,
} from "../_lib/board";
import { COPY, NOTES } from "../_lib/copy";
import { atlas } from "../_lib/engine";
import { setMode } from "../_lib/view";
import { ProductCard } from "./Detail";
import { Mark } from "./Mark";
import { PinGlyph, WOOD_HEX, pickWood } from "./Pins";
import { RegionMap } from "./RegionMap";
import { CircleForm, EditionRing, FactsSheet, RecordCard } from "./Shared";
import { s } from "./styles";

const at = (r: Rect, extra?: CSSProperties): CSSProperties => ({ left: r.x, top: r.y, width: r.w, ...extra });
const shadow = "shadow-[0_24px_50px_-34px_rgba(31,29,26,0.55)]";

function Node({ r, children, className = "", label, h }: { r: Rect; children: ReactNode; className?: string; label?: string; h?: boolean }) {
  return (
    <section data-node aria-label={label} className={`absolute ${className}`} style={at(r, h ? { height: r.h } : undefined)}>
      {children}
    </section>
  );
}

function PhotoBlock({ r, p, caption, sizes = "800px" }: { r: Rect; p: PhotoRef; caption: string; sizes?: string }) {
  return (
    <figure data-node className={`absolute m-0 bg-(--a-card) p-3 ${shadow}`} style={{ left: r.x - 12, top: r.y - 12, width: r.w + 24, height: r.h + 24 }}>
      <div className="relative h-full w-full overflow-hidden bg-(--a-paper-2)">
        <Photo p={p} sizes={sizes} />
      </div>
      <figcaption className="absolute bottom-6 left-6 max-w-[80%] bg-(--a-card) px-3 py-1.5 text-[18px] text-(--a-ink-2)">{caption}</figcaption>
    </figure>
  );
}

function SpecimenPlate({ sp }: { sp: Specimen }) {
  return <PhotoBlock r={sp.rect} p={sp.photo} caption={sp.caption} sizes="900px" />;
}

function NoteLabel({ n }: { n: Note }) {
  return (
    <div className="absolute" style={{ left: n.label.x, top: n.label.y, width: n.label.w }}>
      <p className={`${s.serif} text-[32px] leading-none`}>{n.title}</p>
      <p className="mt-2 text-[22px] leading-snug text-(--a-ink-2)">{n.text}</p>
    </div>
  );
}

function StepCard({ wood, i }: { wood: Wood; i: number }) {
  const st = CONTENT[wood].making[i];
  const r = STEP_RECTS[i];
  return (
    <article data-node className={`${s.card} overflow-visible`} style={{ left: r.x, top: r.y, width: r.w, height: r.h, ["--rot" as string]: `${i % 2 ? 0.8 : -0.8}deg` }}>
      <span className="absolute -left-6 -top-6 z-10 grid size-14 place-items-center rounded-full bg-(--a-accent) text-[24px] font-semibold text-(--a-card) shadow-[0_6px_10px_-4px_rgba(31,29,26,0.5)]">
        {i + 1}
      </span>
      <div className="relative h-[290px] overflow-hidden bg-(--a-paper-2)">
        <Photo p={COPY[wood].stepPhotos[i]} sizes="600px" className={s.photoZoom} />
      </div>
      <div className="p-6">
        <h3 className={`${s.serif} text-[44px] leading-none`}>{st.title}</h3>
        <p className="mt-3 text-[21px] leading-snug text-(--a-ink-2)">{st.text}</p>
      </div>
    </article>
  );
}

/** One wood's board. Both are rendered; CSS shows the current wood, so nothing flashes before hydration. */
function WoodBoard({ wood, open }: { wood: Wood; open: string | null }) {
  const spec = BOARDS[wood];
  const copy = COPY[wood];
  const c = CONTENT[wood];
  const other: Wood = wood === "red" ? "white" : "red";
  const all = productsFor(wood);
  const cats = CATEGORIES[wood];
  const ed = getProduct(spec.edition.slug)!;
  const gift = getProduct(copy.gift.slug)!;
  const giftOnBoard = !!spec.cards[gift.slug];
  const lower = c.name.toLowerCase();

  return (
    <>
      {/* under-layer: region contours and the making route */}
      <svg className="pointer-events-none absolute left-0 top-0" width={BOARD.w} height={BOARD.h} viewBox={`0 0 ${BOARD.w} ${BOARD.h}`} aria-hidden>
        <path d={spec.contour[0]} className={s.contourFill} />
        {spec.contour.map((d, i) => (
          <path key={`c${i}`} d={d} className={s.contour} strokeDasharray={i === 0 ? "none" : "6 10"} />
        ))}
        <path d={spec.contourUse[0]} className={s.contourFill} />
        {spec.contourUse.map((d, i) => (
          <path key={`u${i}`} d={d} className={s.contour} strokeOpacity={0.18} strokeDasharray={i === 0 ? "none" : "6 10"} />
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
          <p className="text-[22px] text-(--a-muted)">{copy.plateRight}</p>
        </div>
        <h1 className={`${s.serif} mt-8 whitespace-nowrap text-[158px] leading-[0.94] tracking-[-0.03em]`}>
          {copy.titleLines[0]}
          <br />
          {copy.titleLines[1]}
        </h1>
        <div className="mt-9 flex items-end justify-between gap-12">
          <p className="max-w-[960px] text-[28px] leading-[1.45] text-(--a-ink-2)">{c.hero.sub}</p>
          <div className="flex shrink-0 flex-col items-end gap-3">
            <div className="flex gap-3">
              <button type="button" onClick={() => atlas.startTour()} className={`${s.btn} ${s.btnInk} h-[68px] px-8 text-[24px] font-medium`}>
                Take the tour
              </button>
              <Link href="/d/08/shop" className={`${s.btn} ${s.btnLine} h-[68px] px-8 text-[24px]`}>
                {c.hero.cta}
              </Link>
            </div>
            <p className="text-[19px] text-(--a-muted)">{copy.hint}</p>
          </div>
        </div>
      </Node>

      {/* ---------- the wood ---------- */}
      <Node r={REGION_TITLE} label={c.name}>
        <h2 className={`${s.serif} whitespace-nowrap text-[128px] leading-[0.95] tracking-[-0.025em]`}>{c.name}</h2>
        <p className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <span className="text-[38px] italic text-(--a-ink-2)">{c.latin}</span>
          <span className={`${s.deva} text-[40px] text-(--a-muted)`} lang="sa">
            {c.sanskrit}
          </span>
          <span className="text-[34px] text-(--a-muted)" lang="kn">
            {c.kannada}
          </span>
        </p>
        <p className="mt-5 max-w-[1180px] text-[27px] leading-[1.45] text-(--a-ink-2)">{copy.regionLead}</p>
      </Node>
      {spec.specimens.map((sp) => (
        <SpecimenPlate key={sp.id} sp={sp} />
      ))}
      {spec.notes.map((n) => (
        <NoteLabel key={n.title} n={n} />
      ))}

      {/* ---------- the place ---------- */}
      <Node r={ORIGIN} h label={copy.originTitle} className={`flex flex-col border border-(--a-line-2) bg-(--a-card) p-7 ${shadow}`}>
        <div className="flex items-center gap-3">
          <PinGlyph color="var(--a-accent)" className="h-11 w-8 shrink-0" />
          <div>
            <p className={`${s.serif} text-[38px] leading-none`}>{copy.originTitle}</p>
            <p className="mt-1.5 text-[19px] text-(--a-muted)">{copy.originSub}</p>
          </div>
        </div>
        <p className="mt-4 text-[20px] leading-snug text-(--a-ink-2)">{c.origin.text}</p>
        <button type="button" onClick={() => atlas.go("place")} className={`${s.btn} ${s.btnLine} mt-auto h-12 self-start px-5 text-[18px]`}>
          See the range on the map
        </button>
      </Node>
      <Node r={REG} h label={copy.regTitle} className="border-l-4 border-(--a-accent) bg-(--a-card) p-7">
        <p className={`${s.serif} text-[34px] leading-none`}>{copy.regTitle}</p>
        <p className="mt-4 text-[20px] leading-snug text-(--a-ink-2)">{c.regulation}</p>
        <button type="button" onClick={() => atlas.go("provenance")} className={`${s.link} mt-3 text-[19px]`}>
          {wood === "red" ? "How each piece is recorded" : "How each lot is recorded"}
        </button>
      </Node>
      <div data-node className="absolute shadow-[0_30px_60px_-40px_rgba(31,29,26,0.6)]" style={{ left: MAP.x, top: MAP.y, width: MAP.w, height: MAP.h }}>
        <RegionMap wood={wood} id={`board-${wood}`} className="block h-full w-full" />
        <button
          type="button"
          onClick={() => atlas.go("place")}
          aria-label={`${copy.originTitle} pin: frame the map`}
          className="absolute size-16 -translate-x-1/2 rounded-full transition-transform duration-300 hover:scale-110 active:scale-95"
          style={{ left: spec.pin[0] - MAP.x, top: spec.pin[1] - MAP.y - 66 }}
        />
      </div>
      <div data-node className="absolute text-[24px]" style={at(FACTS)}>
        <FactsSheet wood={wood} />
      </div>

      {/* ---------- in use ---------- */}
      <PhotoBlock r={USE_A} p={copy.use.a.photo} caption={copy.use.a.caption} />
      <PhotoBlock r={USE_B} p={copy.use.b.photo} caption={copy.use.b.caption} sizes="600px" />
      <Node r={USE_HEAD} label={copy.use.title}>
        <h2 className={`${s.serif} text-[96px] leading-[0.98] tracking-[-0.02em]`}>{copy.use.title}</h2>
        <p className="mt-6 max-w-[1240px] text-[26px] leading-[1.45] text-(--a-ink-2)">{copy.use.text}</p>
      </Node>
      <Node r={JOURNAL} label="From the journal">
        <div className="flex items-baseline justify-between border-t-2 border-(--a-ink) pt-3">
          <p className={`${s.serif} text-[34px]`}>From the journal</p>
          <button type="button" onClick={() => atlas.go("gifting")} className={`${s.link} text-[19px] text-(--a-ink-2)`}>
            Sent as letters to the Circle
          </button>
        </div>
        <ul className="mt-6 grid grid-cols-3 gap-7">
          {c.journal.map((j, i) => (
            <li key={j.title} className={`${s.card} ${s.flow} p-6`} style={{ ["--rot" as string]: `${[-1.2, 0.8, -0.6][i]}deg` }}>
              <span className={s.pinHead} aria-hidden />
              <p className={`${s.serif} text-[30px] leading-[1.1]`}>{j.title}</p>
              <p className="mt-3 text-[19px] leading-snug text-(--a-ink-2)">{j.dek}</p>
            </li>
          ))}
        </ul>
      </Node>
      <Node r={OTHER} h label={copy.other.lead} className={`flex border border-dashed border-(--a-line-2) bg-(--a-card) ${shadow}`}>
        <div className="relative w-[330px] shrink-0 overflow-hidden">
          <Photo p={copy.other.photo} sizes="420px" />
        </div>
        <div className="flex flex-1 flex-col p-8">
          <p className="flex items-center gap-3">
            <PinGlyph color={WOOD_HEX[other]} filled={false} className="h-9 w-7 shrink-0" />
            <span className={`${s.serif} text-[40px] leading-none`}>{copy.other.lead}</span>
          </p>
          <p className="mt-4 max-w-[900px] text-[22px] leading-snug text-(--a-ink-2)">{copy.other.line}</p>
          <button type="button" onClick={() => pickWood(other, true)} className={`${s.btn} ${s.btnInk} mt-auto h-14 self-start px-7 text-[20px] font-medium`}>
            {copy.other.go}
          </button>
        </div>
      </Node>

      {/* ---------- the collection ---------- */}
      <Node r={COLLECTION_HEAD} label={copy.collection.title}>
        <div className="flex items-start gap-14">
          <h2 className={`${s.serif} shrink-0 whitespace-nowrap text-[88px] leading-[0.95] tracking-[-0.02em]`}>{copy.collection.title}</h2>
          <p className="mt-2 max-w-[880px] text-[23px] leading-[1.45] text-(--a-ink-2)">
            {copy.collection.text}{" "}
            <Link href="/d/08/shop" className={s.link}>
              All {all.length} are in the shop.
            </Link>
          </p>
        </div>
      </Node>
      {spec.categories.map((cl) => {
        const cat = cats.find((x) => x.id === cl.id)!;
        return (
          <Link
            key={cl.id}
            href={`/d/08/shop?c=${cl.id}`}
            className="group absolute block border-t-2 border-(--a-ink) pt-3"
            style={{ left: cl.x, top: CATEGORY_Y, width: Math.max(cl.w, 300) }}
          >
            <span className={`${s.serif} block text-[30px] leading-none decoration-(--a-accent) decoration-2 underline-offset-4 group-hover:underline`}>{cat.label}</span>
            <span className="mt-1.5 block text-[19px] leading-snug text-(--a-muted)">{cat.line}</span>
          </Link>
        );
      })}
      {spec.featured.map((p) => (
        <ProductCard key={p.slug} p={p} pos={spec.cards[p.slug]} open={open === p.slug} />
      ))}

      {/* ---------- the shop: the row continues there ---------- */}
      <section data-node aria-label={copy.shop.title} className="absolute" style={at(SHOP, { height: SHOP.h })}>
        <span aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rotate-[2.2deg] border border-(--a-line-2) bg-(--a-paper-2)" />
        <span aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 rotate-[1deg] border border-(--a-line-2) bg-(--a-paper)" />
        <div className="relative flex h-full flex-col border border-(--a-ink) bg-(--a-card) p-8">
          <p className="text-[19px] text-(--a-muted)">The row continues in the shop</p>
          <h2 className={`${s.serif} mt-2 text-[46px] leading-[1.02]`}>{copy.shop.title}</h2>
          <p className="mt-3 text-[20px] leading-snug text-(--a-ink-2)">
            {all.length} pieces in {cats.length} categories. {copy.shop.text}
          </p>
          <ul className="mt-5 border-t border-(--a-line-2)">
            {cats.map((cat) => (
              <li key={cat.id}>
                <Link href={`/d/08/shop?c=${cat.id}`} className="group flex items-baseline justify-between gap-4 border-b border-(--a-line) py-2.5 text-[21px] transition-colors hover:text-(--a-accent-deep)">
                  <span className="flex items-center gap-3">
                    <span className="size-2.5 rounded-full border-2 border-(--a-accent) transition-colors group-hover:bg-(--a-accent)" aria-hidden />
                    {cat.label}
                  </span>
                  <span className="tabular-nums text-(--a-muted)">{all.filter((p) => p.category === cat.id).length}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/d/08/shop" className={`${s.btn} ${s.btnInk} mt-auto h-16 w-full px-6 text-[21px] font-medium`}>
            All {all.length} {lower} pieces
          </Link>
        </div>
      </section>

      {/* ---------- the making ---------- */}
      <Node r={MAKING_QUOTE} label="How a piece begins">
        <p className={`${s.serif} text-[80px] leading-[0.98] tracking-[-0.02em]`}>{copy.makingQuote.title}</p>
        <p className="mt-6 max-w-[900px] text-[28px] leading-[1.4] text-(--a-ink-2)">{copy.makingQuote.text}</p>
      </Node>
      <PhotoBlock r={MAKING_PHOTO} p={copy.makingPhoto.photo} caption={copy.makingPhoto.caption} />
      <Node r={MAKING_HEAD} label="The making">
        <div className="flex items-end gap-8 border-t-2 border-(--a-ink) pt-5">
          <h2 className={`${s.serif} shrink-0 whitespace-nowrap text-[96px] leading-none tracking-[-0.02em]`}>The making</h2>
          <p className="pb-2 text-[24px] leading-snug text-(--a-ink-2)">{copy.makingSub}</p>
        </div>
      </Node>
      {STEP_RECTS.map((_, i) => (
        <StepCard key={i} wood={wood} i={i} />
      ))}
      <Node r={LEGEND} h label="How to read this board" className="border border-dashed border-(--a-line-2) bg-(--a-card) p-7">
        <p className={`${s.serif} text-[34px] leading-none`}>Reading the board</p>
        <ul className="mt-5 space-y-4 text-[21px] leading-snug text-(--a-ink-2)">
          <li className="flex items-center gap-4">
            <PinGlyph color="var(--a-accent)" className="h-9 w-7 shrink-0" />
            {copy.legendPin}
          </li>
          <li className="flex items-center gap-4">
            <svg viewBox="0 0 40 24" className="h-6 w-10 shrink-0" aria-hidden>
              <rect x="1" y="1" width="38" height="22" fill="var(--a-accent)" fillOpacity="0.08" stroke="var(--a-accent)" strokeDasharray="4 3" />
              <path d="M4 22L22 2M14 22L32 2M24 22L39 6" stroke="var(--a-accent)" strokeOpacity="0.6" strokeWidth="1.6" />
            </svg>
            {copy.legendRange}
          </li>
          <li className="flex items-center gap-4">
            <svg viewBox="0 0 40 10" className="h-3 w-10 shrink-0" aria-hidden>
              <path d="M2 5h36" stroke="var(--a-accent)" strokeWidth="3" strokeDasharray="7 5" />
            </svg>
            A route: from the hills, or through the making
          </li>
          <li className="flex items-center gap-4">
            <span className="grid h-9 w-7 shrink-0 place-items-center border border-(--a-line-2) bg-(--a-paper)">
              <span className="size-2.5 rounded-full bg-(--a-accent)" />
            </span>
            A piece you can open
          </li>
        </ul>
      </Node>

      {/* ---------- provenance ---------- */}
      <section data-node aria-label={c.provenance.title} className="absolute" style={at(RECORD)}>
        <h2 className={`${s.serif} whitespace-nowrap text-[74px] leading-none tracking-[-0.02em]`}>{c.provenance.title}</h2>
        <p className="mt-4 max-w-[780px] text-[22px] leading-snug text-(--a-ink-2)">{c.provenance.text}</p>
        <div className="mt-6 text-[25px]">
          <RecordCard wood={wood} />
        </div>
      </section>

      {/* ---------- the edition ---------- */}
      <Node r={VAULT_HEAD} label={c.edition.name}>
        <h2 className={`${s.serif} whitespace-nowrap text-[96px] leading-none tracking-[-0.02em]`}>{c.edition.name}</h2>
        <p className="mt-4 max-w-[840px] text-[23px] leading-snug text-(--a-ink-2)">{c.edition.text}</p>
      </Node>
      <button
        type="button"
        onClick={() => atlas.openProduct(ed.slug)}
        aria-label={`${c.edition.name}: ${spec.edition.left} of ${spec.edition.size} remain. Open ${ed.name}.`}
        className="absolute rounded-full transition-transform duration-500 active:scale-[0.99]"
        style={{ left: VAULT_RING.cx - VAULT_RING.r - spec.edition.token, top: VAULT_RING.cy - VAULT_RING.r - spec.edition.token }}
      >
        <EditionRing
          size={(VAULT_RING.r + spec.edition.token) * 2}
          token={spec.edition.token * 2}
          count={spec.edition.size}
          left={spec.edition.left}
          label={wood === "red" ? "Twenty-one cuffs, numbered" : "Fifty vials, numbered"}
        />
      </button>
      <div className="absolute" style={at(VAULT_NOTE)}>
        <p className="text-[21px] leading-snug text-(--a-ink-2)">{ed.story[1]}</p>
        <p className="mt-3 text-[22px] font-semibold tabular-nums">{formatINR(ed.price)}</p>
        <Link href={`/d/08/p/${ed.slug}`} className={`${s.link} mt-2 inline-block text-[20px]`}>
          Open the full page
        </Link>
      </div>

      {/* ---------- gifting ---------- */}
      <Node r={GIFTING} h label={c.gifting.title} className={`flex border border-(--a-line-2) bg-(--a-card) shadow-[0_30px_60px_-40px_rgba(31,29,26,0.6)]`}>
        <div className="relative w-[540px] shrink-0 overflow-hidden">
          <Photo p={copy.gift.photo} sizes="700px" />
        </div>
        <div className="flex flex-1 flex-col p-10">
          <h2 className={`${s.serif} text-[62px] leading-[1.02] tracking-[-0.015em]`}>{c.gifting.title}</h2>
          <p className="mt-5 text-[22px] leading-[1.45] text-(--a-ink-2)">{c.gifting.text}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3">
            {giftOnBoard ? (
              <button type="button" onClick={() => atlas.openProduct(gift.slug)} className={`${s.btn} ${s.btnInk} h-[60px] px-7 text-[21px] font-medium`}>
                {copy.gift.label}
              </button>
            ) : (
              <Link href={`/d/08/p/${gift.slug}`} className={`${s.btn} ${s.btnInk} h-[60px] px-7 text-[21px] font-medium`}>
                {copy.gift.label}
              </Link>
            )}
            <span className="text-[20px] text-(--a-muted)">{priceLabel(gift)}</span>
            <Link href={`/d/08/shop?c=${copy.gift.cat}`} className={`${s.link} text-[20px]`}>
              {copy.gift.all}
            </Link>
          </div>
        </div>
      </Node>

      {/* ---------- circle ---------- */}
      <Node r={CIRCLE} h label={c.circle.title} className="flex flex-col border border-(--a-ink) bg-(--a-card) p-10">
        <div className="flex items-baseline justify-between gap-6 border-b border-(--a-line-2) pb-5">
          <h2 className={`${s.serif} whitespace-nowrap text-[62px] leading-none tracking-[-0.015em]`}>{c.circle.title}</h2>
          <PinGlyph color="var(--a-accent)" className="h-12 w-9 shrink-0" />
        </div>
        <div className="mt-6 flex flex-1 items-start gap-10">
          <p className="w-[360px] shrink-0 text-[22px] leading-snug text-(--a-ink-2)">{c.circle.text}</p>
          <div className="flex-1 text-[24px]">
            <CircleForm />
          </div>
        </div>
      </Node>

      {/* ---------- credits: the board's footer ---------- */}
      <Node r={CREDITS} h label="Credits and links" className="flex flex-col border-t-2 border-(--a-ink) pt-6">
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="flex items-center gap-3">
              <Mark className="size-10" />
              <span className={`${s.serif} text-[44px] leading-none`}>Santalum Maison</span>
            </p>
            <p className="mt-3 max-w-[560px] text-[21px] leading-snug text-(--a-ink-2)">{c.closing}</p>
          </div>
          <nav aria-label="The house" className="flex flex-col items-end gap-2 text-[21px]">
            <Link href="/d/08/shop" className={s.link}>
              Shop
            </Link>
            <Link href="/d/08/track" className={s.link}>
              Track your order
            </Link>
            <Link href="/d/08/account" className={s.link}>
              Your account
            </Link>
            <button type="button" onClick={() => setMode("list")} className={s.link}>
              Read the board as a list
            </button>
          </nav>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-6 border-t border-(--a-line-2) pt-5 text-[18px] leading-snug">
          <div>
            <dt className={`${s.serif} text-[22px]`}>Delivery</dt>
            <dd className="mt-1 text-(--a-ink-2)">{NOTES.delivery}</dd>
          </div>
          <div>
            <dt className={`${s.serif} text-[22px]`}>Returns</dt>
            <dd className="mt-1 text-(--a-ink-2)">{NOTES.returns}</dd>
          </div>
          <div>
            <dt className={`${s.serif} text-[22px]`}>Care</dt>
            <dd className="mt-1 text-(--a-ink-2)">{c.care}</dd>
          </div>
        </dl>
        <p className="mt-auto flex justify-between gap-6 text-[17px] text-(--a-muted)">
          <span>&copy; 2026 Santalum Maison, India. Photographs are placeholders. Prices in Indian rupees.</span>
          <span className="shrink-0">{copy.footerPlace}</span>
        </p>
      </Node>

      {/* over-layer: leader lines and routes */}
      <svg className="pointer-events-none absolute left-0 top-0" width={BOARD.w} height={BOARD.h} viewBox={`0 0 ${BOARD.w} ${BOARD.h}`} aria-hidden>
        <path d={spec.routes.out} className={s.route} />
        <path d={spec.routes.origin} className={s.route} />
        {spec.notes.map((n) => (
          <g key={n.title + n.at[0]}>
            <path d={leader(n)} className={s.leader} />
            <circle cx={n.at[0]} cy={n.at[1]} r="9" className={s.leaderDot} />
            <circle cx={n.at[0]} cy={n.at[1]} r="3" fill="var(--a-ink)" />
          </g>
        ))}
      </svg>
    </>
  );
}

/** Everything on the board, in world coordinates. DOM order is the reading order for keyboard users. */
export function Board({ open }: { open: string | null }) {
  return <W red={<WoodBoard wood="red" open={open} />} white={<WoodBoard wood="white" open={open} />} />;
}
