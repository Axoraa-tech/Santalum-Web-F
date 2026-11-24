"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { CATEGORIES, FAMILIES, WOOD_NAMES, formatINR, getFamily, type Family } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { PHOTOS } from "@/lib/photos";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { RED_NOTES, RED_SPECIMENS, STEPS, WHITE_NOTES, WHITE_SPECIMENS, type Note, type Specimen } from "../_lib/board";
import { setMode } from "../_lib/view";
import { IndiaMap } from "./IndiaMap";
import { PinGlyph, WOOD_HEX } from "./Pins";
import { CircleForm, RecordCard, VaultRing, WPhoto } from "./Shared";
import { Mark } from "./TopBar";
import { s } from "./styles";

const wrap = "mx-auto w-full max-w-[1320px] px-4 md:px-8";

function SectionHead({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="grid gap-4 border-t border-(--a-ink) pt-5 md:grid-cols-[1fr_minmax(0,420px)] md:gap-10">
      <h2 id={id} className={`${s.serif} text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.95] tracking-[-0.02em]`}>
        {title}
      </h2>
      {children && <div className="text-[16px] leading-relaxed text-(--a-ink-2) md:pt-3">{children}</div>}
    </div>
  );
}

/* ---------------- woods ---------------- */
function Plate({ w, sp, notes }: { w: Wood; sp: Specimen; notes: Note[] }) {
  const name = WOOD_NAMES[w];
  const wood = useWood();
  const on = wood === w;
  const marks = notes.filter((n) => n.at[0] >= sp.rect.x && n.at[0] <= sp.rect.x + sp.rect.w && n.at[1] >= sp.rect.y && n.at[1] <= sp.rect.y + sp.rect.h);
  const rest = notes.filter((n) => !marks.includes(n));
  return (
    <article aria-labelledby={`a8l-wood-${w}`} className={`relative border bg-(--a-card) p-4 transition-colors duration-500 md:p-6 ${on ? "border-(--a-ink)" : "border-(--a-line-2)"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 id={`a8l-wood-${w}`} className={`${s.serif} text-[clamp(2rem,4vw,3.2rem)] leading-none`}>
            {name.common}
          </h3>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-4">
            <span className="text-[17px] italic text-(--a-ink-2)">{name.latin}</span>
            <span className={`${s.deva} text-[19px] text-(--a-muted)`} lang="sa">
              {name.sa}
            </span>
          </p>
        </div>
        <PinGlyph color={WOOD_HEX[w]} filled={on} className="h-10 w-8 shrink-0" />
      </div>
      <figure className="relative mt-5 overflow-hidden bg-(--a-paper-2)" style={{ aspectRatio: `${sp.rect.w} / ${sp.rect.h}` }}>
        <Photo p={sp.photo} sizes="(min-width: 1024px) 620px, 92vw" />
        {marks.map((n, i) => (
          <span
            key={n.title}
            className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-(--a-ink) bg-(--a-card) text-[13px] font-semibold"
            style={{ left: `${((n.at[0] - sp.rect.x) / sp.rect.w) * 100}%`, top: `${((n.at[1] - sp.rect.y) / sp.rect.h) * 100}%` }}
            aria-hidden
          >
            {i + 1}
          </span>
        ))}
        <figcaption className="absolute bottom-3 left-3 bg-(--a-card) px-2 py-1 text-[13px] text-(--a-ink-2)">{sp.caption}</figcaption>
      </figure>
      <ol className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {[...marks, ...rest].map((n, i) => (
          <li key={n.title} className="flex gap-3">
            <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold ${i < marks.length ? "border-2 border-(--a-ink)" : "border border-dashed border-(--a-line-2) text-(--a-muted)"}`}>
              {i < marks.length ? i + 1 : ""}
            </span>
            <span>
              <span className={`${s.serif} block text-[19px] leading-tight`}>{n.title}</span>
              <span className="mt-0.5 block text-[15px] leading-snug text-(--a-ink-2)">{n.text}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-5 border-t border-(--a-line) pt-4 text-[15px] leading-relaxed text-(--a-ink-2)">
        {w === "red"
          ? "Grows in the Eastern Ghats, mainly Andhra Pradesh. Listed under CITES Appendix II, so its international trade is regulated."
          : "Grows in the dry forests of southern India. Mysuru, in Karnataka, is its traditional craft centre."}
      </p>
      <button
        type="button"
        aria-pressed={on}
        onClick={() => switchWood(w)}
        className={`${s.btn} mt-4 h-11 border px-5 text-[14px] font-medium ${on ? "border-(--a-ink) bg-(--a-ink) text-(--a-paper)" : "border-(--a-line-2) hover:border-(--a-ink)"}`}
      >
        {on ? `Showing ${name.common.toLowerCase()}` : `Show ${name.common.toLowerCase()}`}
      </button>
    </article>
  );
}

/* ---------------- collection ---------------- */
const ASPECTS = ["4 / 5", "1 / 1", "3 / 4", "5 / 4", "4 / 5", "3 / 4", "1 / 1"];

function ListCard({ f, wood, i }: { f: Family; wood: Wood; i: number }) {
  const v = f.variants[wood]!;
  const [added, setAdded] = useState(false);
  return (
    <article className="group relative mb-10 break-inside-avoid md:mb-14">
      <Link href={`/d/08/p/${f.slug}`} className="block">
        <div className="relative overflow-hidden bg-(--a-paper-2)" style={{ aspectRatio: ASPECTS[i % ASPECTS.length] }}>
          <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="(min-width: 1024px) 30vw, 50vw" className="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />
          {f.edition && <span className="absolute left-3 top-3 bg-(--a-card) px-2 py-1 text-[12px] font-medium">{f.edition}</span>}
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h3 className={`${s.serif} text-[clamp(1.15rem,2vw,1.6rem)] leading-tight decoration-(--m-accent) decoration-1 underline-offset-4 group-hover:underline`}>{f.name}</h3>
          <span className="shrink-0 text-[15px] font-semibold tabular-nums">{formatINR(v.price)}</span>
        </div>
        <p className="mt-1 text-[14px] leading-snug text-(--a-muted)">{v.note}</p>
      </Link>
      <button
        type="button"
        onClick={() => {
          bag.add(f.slug, wood);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1600);
        }}
        className={`${s.btn} ${s.btnLine} mt-3 h-10 px-4 text-[13px]`}
        aria-label={`Add ${f.name} in ${WOOD_NAMES[wood].common.toLowerCase()} to the bag`}
      >
        {added ? "Added" : "Add to bag"}
      </button>
    </article>
  );
}

function Collection({ wood }: { wood: Wood }) {
  const fams = FAMILIES.filter((f) => f.variants[wood]);
  const missing = FAMILIES.filter((f) => !f.variants[wood]);
  return (
    <>
      <div className="mt-10 columns-2 gap-4 md:gap-8 lg:columns-3 lg:gap-10">
        {fams.map((f, i) => (
          <ListCard key={f.slug} f={f} wood={wood} i={i} />
        ))}
      </div>
      {missing.map((f) => (
        <div key={f.slug} className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border border-dashed border-(--a-line-2) p-5">
          <p className="flex-1 text-[15px] text-(--a-ink-2)">
            <span className="font-semibold text-(--a-ink)">{f.name}</span> is made only in {WOOD_NAMES[wood === "red" ? "white" : "red"].common.toLowerCase()}. {f.variants.white && wood === "red" ? "Red sandalwood does not carry this oil." : ""}
          </p>
          <button type="button" onClick={() => switchWood(wood === "red" ? "white" : "red")} className={`${s.btn} ${s.btnLine} h-10 px-4 text-[13px]`}>
            Switch to {WOOD_NAMES[wood === "red" ? "white" : "red"].common.toLowerCase()}
          </button>
        </div>
      ))}
    </>
  );
}

/* ---------------- page ---------------- */
export function ListView() {
  const vault = getFamily("vault-cuff")!;
  const box = getFamily("presentation-box")!;
  return (
    <main className={`${s.paper} pb-28`}>
      {/* hero */}
      <section className={`${wrap} grid gap-10 pt-24 md:pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-14`} aria-labelledby="a8l-hero">
        <div>
          <p className="flex items-center gap-2 text-[15px] text-(--a-ink-2)">
            <Mark className="size-6" />
            Santalum Maison, red and white sandalwood from India
          </p>
          <h1 id="a8l-hero" className={`${s.serif} mt-6 text-balance text-[clamp(3rem,6.4vw,6.6rem)] leading-[0.92] tracking-[-0.03em]`}>
            Objects time cannot repeat.
          </h1>
          <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-(--a-ink-2)">
            Four thousand years found its way to you. Here is the whole house in order: the two woods and where they grow, every piece we
            make, how it is made, and the record that leaves with it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setMode("canvas")} className={`${s.btn} ${s.btnInk} h-12 px-6 text-[15px] font-medium`}>
              Open the canvas
            </button>
            <a href="#a8l-collection" className={`${s.btn} ${s.btnLine} h-12 px-6 text-[15px]`}>
              See the collection
            </a>
          </div>
          <p className="mt-3 text-[13px] text-(--a-muted)">The canvas lays all of this out on one board you can drag and zoom. Touch works too.</p>
        </div>
        <figure className="relative">
          <div className="relative overflow-hidden border border-(--a-line-2) bg-(--a-card) shadow-[0_30px_60px_-40px_rgba(31,29,26,0.55)]">
            <IndiaMap className="block h-auto w-full" />
          </div>
          <figcaption className="mt-3 text-[13px] text-(--a-muted)">Southern India. The filled pin is the wood you are viewing.</figcaption>
        </figure>
      </section>

      {/* woods */}
      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby="a8l-woods">
        <SectionHead id="a8l-woods" title="Two woods">
          From the heartwood. The two sandalwoods look, smell and behave differently, and we tell you which one you are holding. Choose one and the
          whole page follows.
        </SectionHead>
        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Plate w="red" sp={RED_SPECIMENS[0]} notes={RED_NOTES} />
          <div className="lg:mt-24">
            <Plate w="white" sp={WHITE_SPECIMENS[0]} notes={WHITE_NOTES} />
          </div>
        </div>
      </section>

      {/* collection */}
      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby="a8l-collection">
        <SectionHead id="a8l-collection" title="The collection">
          Every family made in <WT red="red" white="white" /> sandalwood, from small things for the desk to the numbered Vault cuff.
          <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-(--a-muted)">
            {CATEGORIES.map((c) => (
              <span key={c.key}>{c.label}</span>
            ))}
          </span>
        </SectionHead>
        <W red={<Collection wood="red" />} white={<Collection wood="white" />} />
      </section>

      {/* making */}
      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby="a8l-making">
        <SectionHead id="a8l-making" title="The making">
          <span className={`${s.serif} block text-[22px] leading-snug text-(--a-ink)`}>Every piece begins as a reading.</span>
          <span className="mt-2 block">The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.</span>
        </SectionHead>
        <ol className="relative mt-12 grid gap-8 md:grid-cols-5 md:gap-5">
          <span className={`${s.vroute} absolute bottom-4 left-[19px] top-4 w-[3px] md:hidden`} aria-hidden />
          <span className={`${s.hroute} absolute left-[10%] right-[10%] top-[19px] hidden h-[3px] md:block`} aria-hidden />
          {STEPS.map((st, i) => (
            <li key={st.n} className={`relative grid grid-cols-[40px_1fr] gap-4 md:block ${i % 2 ? "md:mt-16" : ""}`}>
              <span className="relative z-10 grid size-10 place-items-center rounded-full bg-(--m-accent) text-[16px] font-semibold text-white md:mx-auto">{st.n}</span>
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-(--a-paper-2) md:mt-5 md:aspect-[4/5]">
                  <WPhoto red={<Photo p={st.photo.red} sizes="(min-width: 768px) 20vw, 85vw" />} white={<Photo p={st.photo.white} sizes="(min-width: 768px) 20vw, 85vw" />} />
                </div>
                <h3 className={`${s.serif} mt-4 text-[clamp(1.6rem,2.4vw,2.2rem)] leading-none`}>{st.name}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-(--a-ink-2)">{st.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* provenance */}
      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby="a8l-provenance">
        <SectionHead id="a8l-provenance" title="Know what you hold" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="text-[17px] leading-relaxed text-(--a-ink-2)">
            <p>Every piece is entered in a record before it leaves us: the wood and its Latin name, where it came from, the batch, the artisan&rsquo;s initials and the date it was finished.</p>
            <p className={`${s.serif} mt-6 text-[clamp(1.5rem,3vw,2.2rem)] leading-tight text-(--a-ink)`}>
              If there is evidence, we show it. If there isn&rsquo;t, we don&rsquo;t invent it.
            </p>
            <p className="mt-6 text-[14px] text-(--a-muted)">The record shown is an example. It changes with the wood you are viewing.</p>
          </div>
          <div className="text-[15px] sm:text-[17px]">
            <RecordCard />
          </div>
        </div>
      </section>

      {/* vault */}
      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby="a8l-vault">
        <SectionHead id="a8l-vault" title="The 2011 Vault" />
        <div className="mt-10 grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-16">
          <Link href="/d/08/p/vault-cuff" aria-label={`Twenty-one numbered cuffs. Open ${vault.name}.`} className="mx-auto block w-fit rounded-full">
            <span className="hidden sm:block">
              <VaultRing size={380} token={46} />
            </span>
            <span className="sm:hidden">
              <VaultRing size={300} token={36} />
            </span>
          </Link>
          <div>
            <p className={`${s.serif} text-[clamp(1.6rem,3vw,2.4rem)] leading-tight`}>Twenty-one cuffs turned from aged heartwood sourced in 2011.</p>
            <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-(--a-ink-2)">
              The wood has waited since then for the right hands. Each cuff is numbered and entered in our provenance registry with its harvest
              origin, the artisan&rsquo;s name and the date it left our hands. It comes with its registry certificate and a sealed vial of heartwood
              oil.
            </p>
            <p className="mt-5 flex flex-wrap items-center gap-4">
              <span className="text-[18px] font-semibold tabular-nums">
                <WT red={formatINR(vault.variants.red!.price)} white={formatINR(vault.variants.white!.price)} />
              </span>
              <Link href="/d/08/p/vault-cuff" className={`${s.btn} ${s.btnInk} h-11 px-5 text-[14px] font-medium`}>
                See the Vault cuff
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* gifting */}
      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby="a8l-gifting">
        <div className="grid overflow-hidden border border-(--a-line-2) bg-(--a-card) md:grid-cols-2">
          <div className="relative min-h-[300px] md:min-h-[460px]">
            <WPhoto red={<Photo p={PHOTOS.boxCarved} sizes="(min-width: 768px) 50vw, 100vw" />} white={<Photo p={PHOTOS.giftLinen} sizes="(min-width: 768px) 50vw, 100vw" />} />
          </div>
          <div className="flex flex-col p-6 md:p-10">
            <h2 id="a8l-gifting" className={`${s.serif} text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[0.98] tracking-[-0.015em]`}>
              Give something that remains
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-(--a-ink-2)">
              {box.summary} Choose it empty, or ask us to fill it with a mala, powder or oil. For corporate gifts, leave the number of pieces and the
              date in the gift note at checkout.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-auto">
              <Link href="/d/08/p/presentation-box" className={`${s.btn} ${s.btnInk} h-11 px-5 text-[14px] font-medium`}>
                See the presentation box
              </Link>
              <span className="text-[15px] text-(--a-muted)">
                From <WT red={formatINR(box.variants.red!.price)} white={formatINR(box.variants.white!.price)} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* circle */}
      <section className={`${wrap} mt-24 md:mt-32`} aria-labelledby="a8l-circle">
        <div className="grid gap-8 border-y border-(--a-ink) py-10 md:grid-cols-[1fr_1fr] md:gap-16 md:py-14">
          <div>
            <h2 id="a8l-circle" className={`${s.serif} text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[0.98] tracking-[-0.015em]`}>
              The Santalum Circle
            </h2>
            <p className="mt-4 max-w-[460px] text-[17px] leading-relaxed text-(--a-ink-2)">
              Letters from the house: new batches, Vault numbers, and notes from the workshop.
            </p>
          </div>
          <div className="self-center text-[16px]">
            <CircleForm />
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className={`${wrap} mt-24`}>
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="flex items-center gap-2">
              <Mark className="size-8" />
              <span className={`${s.serif} text-[28px]`}>Santalum Maison</span>
            </p>
            <p className="mt-4 max-w-[380px] text-[15px] leading-relaxed text-(--a-ink-2)">Made with respect for the material. Designed for the life around it.</p>
          </div>
          <nav aria-label="Collection" className="text-[15px]">
            <p className="text-[13px] text-(--a-muted)">Pieces</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {FAMILIES.map((f) => (
                <li key={f.slug}>
                  <Link href={`/d/08/p/${f.slug}`} className={s.link}>
                    {f.name.replace(/,.*$/, "")}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="This site" className="text-[15px]">
            <p className="text-[13px] text-(--a-muted)">The house</p>
            <ul className="mt-3 space-y-2">
              <li>
                <button type="button" onClick={() => setMode("canvas")} className={s.link}>
                  Open the canvas
                </button>
              </li>
              <li>
                <a href="#a8l-woods" className={s.link}>
                  The two woods
                </a>
              </li>
              <li>
                <a href="#a8l-provenance" className={s.link}>
                  Provenance
                </a>
              </li>
              <li>
                <Link href="/d/08/checkout" className={s.link}>
                  Checkout
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-14 border-t border-(--a-line-2) pb-24 pt-5 text-[13px] text-(--a-muted) md:pb-6">
          &copy; 2026 Santalum Maison, India. Photographs are placeholders from Unsplash. Prices are in Indian rupees.
        </p>
      </footer>
    </main>
  );
}
