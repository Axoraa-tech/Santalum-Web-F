"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, getProduct, priceLabel, productsFor } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { useHydrated } from "@/lib/shop/store";
import { BOARD, BOARDS, cardRect } from "../_lib/board";
import { COPY } from "../_lib/copy";
import { atlas } from "../_lib/engine";
import { setMode } from "../_lib/view";
import { Footer } from "./Footer";
import { Mark } from "./Mark";
import { PinGlyph, WOOD_HEX, pickWood } from "./Pins";
import { RegionMap } from "./RegionMap";
import { CircleForm, EditionRing, FactsSheet, RecordCard } from "./Shared";
import { s } from "./styles";

const wrap = "mx-auto w-full max-w-[1320px] px-4 md:px-8";

function SectionHead({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="grid gap-4 border-t border-(--a-ink) pt-5 md:grid-cols-[1fr_minmax(0,440px)] md:gap-10">
      <h2 id={id} className={`${s.serif} text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] tracking-[-0.02em]`}>
        {title}
      </h2>
      {children && <div className="text-[16px] leading-relaxed text-(--a-ink-2) md:pt-3">{children}</div>}
    </div>
  );
}

const COLS = "ABCDEFGH";

/** The square a piece is pinned in on the board: column letter, row number, read like an atlas grid reference. */
function squareOf(slug: string) {
  const r = cardRect(slug);
  if (!r) return null;
  const col = COLS[Math.min(COLS.length - 1, Math.floor((r.x + r.w / 2) / (BOARD.w / COLS.length)))];
  return `${col}${Math.floor((r.y + r.h / 2) / (BOARD.h / 4)) + 1}`;
}

/** A small bookmark that reads as a margin note, not a button floating on the photograph. */
function Bookmark({ slug, name }: { slug: string; name: string }) {
  const list = useWishlist();
  const hydrated = useHydrated();
  const on = hydrated && list.includes(slug);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from your wishlist` : `Save ${name} to your wishlist`}
      onClick={() => toggleWishlist(slug)}
      className="group/bm inline-flex items-center gap-1.5 text-(--a-ink-2) hover:text-(--a-ink)"
    >
      <svg viewBox="0 0 20 20" className="size-[15px] transition-transform duration-300 group-hover/bm:-translate-y-0.5" aria-hidden>
        <path
          d="M5 2.8h10a.8.8 0 0 1 .8.8v13.2l-5.8-3.6-5.8 3.6V3.6a.8.8 0 0 1 .8-.8z"
          fill={on ? "var(--a-accent)" : "none"}
          stroke={on ? "var(--a-accent)" : "currentColor"}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className={s.link}>{on ? "Bookmarked" : "Bookmark"}</span>
    </button>
  );
}

/** Switch to the canvas and open the piece where it is pinned. */
function showOnBoard(slug: string) {
  if (cardRect(slug)) atlas.pending = slug;
  setMode("canvas");
  window.scrollTo({ top: 0 });
}

/**
 * The collection as a plate of figures: one ruled sheet, each piece a numbered figure with its square
 * on the board, its name and price set on a dotted leader like an index entry.
 */
function Plates({ wood }: { wood: Wood }) {
  const spec = BOARDS[wood];
  const cats = CATEGORIES[wood];
  return (
    <figure className="mt-10 border border-(--a-ink) bg-(--a-card) p-1">
      <div className="border border-(--a-line-2)">
        <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-(--a-line-2) px-4 py-2.5 md:px-5">
          <span className={`${s.serif} text-[17px]`}>Figures 1 to {spec.featured.length}</span>
          <span className="text-[13.5px] text-(--a-muted)">Each square is where the piece is pinned on the board.</span>
        </figcaption>
        <ol className="grid grid-cols-2 gap-px bg-(--a-line-2) lg:grid-cols-4">
          {spec.featured.map((p, i) => {
            const sq = squareOf(p.slug);
            const cat = cats.find((c) => c.id === p.category);
            return (
              <li key={p.slug} className="group flex flex-col bg-(--a-card) p-3 md:p-4">
                <p className="flex items-baseline justify-between text-[12.5px] tabular-nums text-(--a-muted)">
                  <span>
                    Fig. <span className="font-semibold text-(--a-ink)">{i + 1}</span>
                  </span>
                  {sq && <span>Sq. {sq}</span>}
                </p>
                <Link href={`/d/08/p/${p.slug}`} className="mt-2 block">
                  <span className="relative block aspect-[4/5] overflow-hidden bg-(--a-paper-2)">
                    <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="(min-width: 1024px) 24vw, 46vw" className="transition-transform duration-[900ms] group-hover:scale-[1.04]" />
                    <span aria-hidden className="pointer-events-none absolute inset-[5px] border border-(--a-card)/70" />
                  </span>
                  <span className={`${s.serif} mt-3 block text-[clamp(1.05rem,1.8vw,1.3rem)] leading-tight decoration-(--a-accent) underline-offset-4 group-hover:underline`}>{p.name}</span>
                </Link>
                <p className="mt-1.5 flex items-baseline gap-2 text-[14px]">
                  <span className="truncate text-(--a-muted)">{cat?.label}</span>
                  <span className="min-w-3 flex-1 -translate-y-[3px] border-b border-dotted border-(--a-ink)/40" aria-hidden />
                  <span className="shrink-0 font-semibold tabular-nums">{priceLabel(p)}</span>
                </p>
                {p.badge && <p className="mt-1 text-[13px] italic text-(--a-accent-deep)">{p.badge}</p>}
                <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-[13.5px]">
                  {sq && (
                    <button type="button" onClick={() => showOnBoard(p.slug)} className="inline-flex items-center gap-1.5 text-(--a-ink-2) hover:text-(--a-ink)">
                      <PinGlyph color="var(--a-accent)" className="h-[15px] w-[11px]" />
                      <span className={s.link}>On the board</span>
                    </button>
                  )}
                  <Bookmark slug={p.slug} name={p.name} />
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}

/** The board, read top to bottom: one wood at a time. */
function WoodList({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  const copy = COPY[wood];
  const spec = BOARDS[wood];
  const all = productsFor(wood);
  const cats = CATEGORIES[wood];
  const sp = spec.specimens[0];
  const ed = getProduct(spec.edition.slug)!;
  const gift = getProduct(copy.gift.slug)!;
  const other: Wood = wood === "red" ? "white" : "red";
  const k = (x: string) => `a8l-${wood}-${x}`;
  const marks = spec.notes.filter((n) => n.at[0] >= sp.rect.x && n.at[0] <= sp.rect.x + sp.rect.w && n.at[1] >= sp.rect.y && n.at[1] <= sp.rect.y + sp.rect.h);

  return (
    <>
      <section className={`${wrap} grid gap-10 pt-24 md:pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-14`} aria-labelledby={k("hero")}>
        <div>
          <p className="flex items-center gap-2 text-[15px] text-(--a-ink-2)">
            <Mark className="size-6" />
            Santalum Maison. {copy.plateRight}
          </p>
          <h1 id={k("hero")} className={`${s.serif} mt-6 text-balance text-[clamp(2.8rem,6.4vw,6.4rem)] leading-[0.92] tracking-[-0.03em]`}>
            {c.hero.title}
          </h1>
          <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-(--a-ink-2)">{c.hero.sub}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/d/08/shop" className={`${s.btn} ${s.btnInk} h-12 px-6 text-[15px] font-medium`}>
              {c.hero.cta}
            </Link>
            <button type="button" onClick={() => setMode("canvas")} className={`${s.btn} ${s.btnLine} h-12 px-6 text-[15px]`}>
              Open the canvas
            </button>
          </div>
        </div>
        <figure>
          <div className="relative overflow-hidden border border-(--a-line-2) shadow-[0_30px_60px_-40px_rgba(31,29,26,0.55)]">
            <RegionMap wood={wood} id={`list-${wood}`} className="block h-auto w-full" />
          </div>
          <figcaption className="mt-3 text-[14px] text-(--a-muted)">{copy.legendRange}.</figcaption>
        </figure>
      </section>

      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby={k("wood")}>
        <SectionHead id={k("wood")} title={c.name}>
          <p>{c.intro[0]}</p>
          <p className="mt-3">{c.intro[1]}</p>
        </SectionHead>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <figure className="relative overflow-hidden bg-(--a-paper-2)" style={{ aspectRatio: `${sp.rect.w} / ${sp.rect.h}` }}>
              <Photo p={sp.photo} sizes="(min-width: 1024px) 700px, 92vw" />
              {marks.map((n, i) => (
                <span
                  key={n.title}
                  aria-hidden
                  className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-(--a-ink) bg-(--a-card) text-[13px] font-semibold"
                  style={{ left: `${((n.at[0] - sp.rect.x) / sp.rect.w) * 100}%`, top: `${((n.at[1] - sp.rect.y) / sp.rect.h) * 100}%` }}
                >
                  {i + 1}
                </span>
              ))}
              <figcaption className="absolute bottom-3 left-3 bg-(--a-card) px-2 py-1 text-[14px] text-(--a-ink-2)">{sp.caption}</figcaption>
            </figure>
          </div>
          {/* the notes keyed to the photograph sit beside it, under the field label, so both columns end together */}
          <div className="grid content-start gap-6">
            <div className="text-[17px]">
              <FactsSheet wood={wood} />
            </div>
            <ol className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-1">
              {spec.notes.map((n, i) => (
                <li key={n.title} className="flex gap-3">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold ${i < marks.length ? "border-2 border-(--a-ink)" : "border border-dashed border-(--a-line-2)"}`}>
                    {i < marks.length ? i + 1 : ""}
                  </span>
                  <span>
                    <span className={`${s.serif} block text-[19px] leading-tight`}>{n.title}</span>
                    <span className="mt-0.5 block text-[16px] leading-snug text-(--a-ink-2)">{n.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="border-l-4 border-(--a-accent) bg-(--a-card) p-5">
              <p className={`${s.serif} text-[22px]`}>{copy.regTitle}</p>
              <p className="mt-2 text-[16px] leading-relaxed text-(--a-ink-2)">{c.regulation}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby={k("collection")}>
        <SectionHead id={k("collection")} title={copy.collection.title}>
          {copy.collection.text}
        </SectionHead>
        <Plates wood={wood} />
        <div className="mt-8 grid gap-6 border border-(--a-ink) bg-(--a-card) p-5 md:grid-cols-[1fr_1.2fr] md:p-8">
          <div>
            <p className={`${s.serif} text-[clamp(1.6rem,3vw,2.2rem)] leading-tight`}>{copy.shop.title}</p>
            <p className="mt-2 text-[16px] leading-relaxed text-(--a-ink-2)">
              {all.length} pieces in {cats.length} categories. {copy.shop.text}
            </p>
            <Link href="/d/08/shop" className={`${s.btn} ${s.btnInk} mt-5 h-12 px-6 text-[15px] font-medium`}>
              All {all.length} {c.name.toLowerCase()} pieces
            </Link>
          </div>
          <ul className="grid content-start gap-x-6 sm:grid-cols-2">
            {cats.map((cat) => (
              <li key={cat.id}>
                <Link href={`/d/08/shop?c=${cat.id}`} className="flex items-baseline justify-between gap-4 border-b border-(--a-line) py-2.5 text-[16px] hover:text-(--a-accent-deep)">
                  {cat.label}
                  <span className="tabular-nums text-(--a-muted)">{all.filter((p) => p.category === cat.id).length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby={k("making")}>
        <SectionHead id={k("making")} title="The making">
          <span className={`${s.serif} block text-[22px] leading-snug text-(--a-ink)`}>{copy.makingQuote.title}</span>
          <span className="mt-2 block">{copy.makingQuote.text}</span>
        </SectionHead>
        <ol className="relative mt-12 grid gap-8 md:grid-cols-5 md:gap-5">
          <span className={`${s.vroute} absolute bottom-4 left-[19px] top-4 w-[3px] md:hidden`} aria-hidden />
          <span className={`${s.hroute} absolute left-[10%] right-[10%] top-[19px] hidden h-[3px] md:block`} aria-hidden />
          {c.making.map((st, i) => (
            <li key={st.title} className={`relative grid grid-cols-[40px_1fr] gap-4 md:block ${i % 2 ? "md:mt-16" : ""}`}>
              <span className="relative z-10 grid size-10 place-items-center rounded-full bg-(--a-accent) text-[16px] font-semibold text-(--a-card) md:mx-auto">{i + 1}</span>
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-(--a-paper-2) md:mt-5 md:aspect-[4/5]">
                  <Photo p={copy.stepPhotos[i]} sizes="(min-width: 768px) 20vw, 85vw" />
                </div>
                <h3 className={`${s.serif} mt-4 text-[clamp(1.5rem,2.3vw,2.1rem)] leading-none`}>{st.title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-(--a-ink-2)">{st.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby={k("prov")}>
        <SectionHead id={k("prov")} title={c.provenance.title} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <p className="text-[17px] leading-relaxed text-(--a-ink-2)">{c.provenance.text}</p>
          <div className="text-[15px] sm:text-[17px]">
            <RecordCard wood={wood} />
          </div>
        </div>
      </section>

      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby={k("ed")}>
        <SectionHead id={k("ed")} title={c.edition.name} />
        <div className="mt-10 grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-16">
          <Link href={`/d/08/p/${ed.slug}`} aria-label={`${c.edition.name}: open ${ed.name}`} className="mx-auto block w-fit rounded-full">
            <EditionRing size={320} token={wood === "red" ? 38 : 22} count={spec.edition.size} left={spec.edition.left} label={wood === "red" ? "Twenty-one cuffs, numbered" : "Fifty vials, numbered"} />
          </Link>
          <div>
            <p className={`${s.serif} text-[clamp(1.5rem,3vw,2.3rem)] leading-tight`}>{c.edition.text}</p>
            <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-(--a-ink-2)">{ed.story[1]}</p>
            <Link href={`/d/08/p/${ed.slug}`} className={`${s.btn} ${s.btnInk} mt-6 h-11 px-5 text-[15px] font-medium`}>
              {ed.name}, {priceLabel(ed)}
            </Link>
          </div>
        </div>
      </section>

      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby={k("gift")}>
        <div className="grid overflow-hidden border border-(--a-line-2) bg-(--a-card) md:grid-cols-2">
          <div className="relative min-h-[280px] md:min-h-[440px]">
            <Photo p={copy.gift.photo} sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
          <div className="flex flex-col p-6 md:p-10">
            <h2 id={k("gift")} className={`${s.serif} text-[clamp(2.1rem,4.5vw,3.6rem)] leading-[0.98]`}>
              {c.gifting.title}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-(--a-ink-2)">{c.gifting.text}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-auto">
              <Link href={`/d/08/p/${gift.slug}`} className={`${s.btn} ${s.btnInk} h-11 px-5 text-[15px] font-medium`}>
                {copy.gift.label}
              </Link>
              <Link href={`/d/08/shop?c=${copy.gift.cat}`} className={`${s.link} text-[16px]`}>
                {copy.gift.all}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby={k("circle")}>
        <div className="grid gap-8 border-y border-(--a-ink) py-10 md:grid-cols-2 md:gap-16 md:py-14">
          <div>
            <h2 id={k("circle")} className={`${s.serif} text-[clamp(2.1rem,4.5vw,3.6rem)] leading-[0.98]`}>
              {c.circle.title}
            </h2>
            <p className="mt-4 max-w-[460px] text-[17px] leading-relaxed text-(--a-ink-2)">{c.circle.text}</p>
          </div>
          <div className="self-center text-[16px]">
            <CircleForm />
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <PinGlyph color={WOOD_HEX[other]} filled={false} className="h-8 w-6" />
          <p className="flex-1 text-[16px] text-(--a-ink-2)">
            {copy.other.lead}. {copy.other.line}
          </p>
          <button type="button" onClick={() => (pickWood(other), window.scrollTo({ top: 0 }))} className={`${s.btn} ${s.btnLine} h-11 px-5 text-[15px]`}>
            {copy.other.go}
          </button>
        </div>
      </section>
    </>
  );
}

export function ListView() {
  return (
    <main className={s.paper}>
      <W red={<WoodList wood="red" />} white={<WoodList wood="white" />} />
      <Footer force />
    </main>
  );
}
