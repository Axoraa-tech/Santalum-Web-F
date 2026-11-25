"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { W } from "@/components/maison/W";
import { DELIVERY } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, formatINR, getProduct, priceLabel, productsFor, type CategoryId, type Product, type Tone } from "@/lib/shop/products";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import { s } from "./cls";
import { editionLine } from "./RoomsA";
import { CUFF_PLATE, Pic, platesOf, type Plate } from "./plates";
import { accession, countIn, goToRoom, openLedger, revealOnWall, ROOMS, shopHref } from "./store";
import { at, capital, cx, Frame, RoomShell, vars, words } from "./ui";

const must = (slug: string) => getProduct(slug)!;

/* ======================= Room 5: At the lathe / At the still ======================= */
type Shot = { p: PhotoRef; tone?: Tone };
const MAKING: Record<Wood, { title: string; quote: string; under: string; shots: Shot[] }> = {
  red: {
    title: "At the lathe",
    quote:
      "Every piece begins as a reading. The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.",
    under: "Five steps, in this order, for every red piece, from a pocket mala to a Vault cuff.",
    shots: [{ p: PHOTOS.redGrain }, { p: PHOTOS.turned, tone: "red" }, { p: PHOTOS.braceletDark }, { p: PHOTOS.braceletClose }, { p: PHOTOS.boxRed }],
  },
  white: {
    title: "At the still",
    quote: "Only the heartwood carries the oil. The pale sapwood is set aside; the rest goes to the still, or to the carver's bench.",
    under: "Five steps for every bottle, jar and carving, from a tube of incense to a Reserve vial.",
    shots: [{ p: PHOTOS.whiteLog }, { p: PHOTOS.shavingsPale }, { p: PHOTOS.oilDrop }, { p: PHOTOS.oilVials }, { p: PHOTOS.oil }],
  },
};

function MakingWood({ wood }: { wood: Wood }) {
  const mk = MAKING[wood];
  const steps = CONTENT[wood].making;
  return (
    <>
      <div className={s.at} style={at(8, 14, { wd: 60 })}>
        <h2 className={s.h2}>{mk.title}</h2>
        <p className={cx(s.vinyl, s.vinylL, "mt-[3vh]")}>{mk.quote}</p>
      </div>
      <p className={cx(s.inscription, s.at)} style={at(8, 70, { wd: 56 })}>
        {mk.under}
      </p>
      <ol className={cx(s.frieze, s.at)} style={at(76, 12, { ht: 74 })}>
        {steps.map((st, i) => (
          <li key={st.title} className={s.step}>
            <div className={s.stepPhoto}>
              <div className={s.par} data-par="">
                <Pic p={mk.shots[i].p} tone={mk.shots[i].tone} sizes="(min-width: 900px) 58vh, 40vw" />
              </div>
            </div>
            <div className={s.stepText}>
              <span className={s.stepNum} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={s.stepName}>
                <span className="sr-only">Step {i + 1}: </span>
                {st.title}
              </h3>
              <p className={s.small}>{st.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

export function Making() {
  return (
    <RoomShell room={ROOMS[4]} w={384}>
      <W red={<MakingWood wood="red" />} white={<MakingWood wood="white" />} />
    </RoomShell>
  );
}

/* ======================= Room 6: The record room / The lot room ======================= */
type Drawer = { id: string; code: string; name: string; cat?: CategoryId };
const CAT_CODE: Record<CategoryId, string> = {
  beads: "Beads",
  objects: "Objects",
  powder: "Powder",
  gifting: "Gifts",
  jewellery: "Jewellery",
  oil: "Oil",
  incense: "Incense",
  skin: "Chandan",
  "w-beads": "Beads",
  carvings: "Carving",
  "w-gifting": "Gifts",
};

const ARCHIVE: Record<
  Wood,
  { title: string; inscription: string; open: string; drawers: Drawer[]; example: string; recordName: string; recordNote: string; numbering: string }
> = {
  red: {
    title: "Know what you hold.",
    inscription: "If there is evidence, we show it. If there isn't, we don't invent it.",
    open: "Open a drawer to read what it holds.",
    drawers: [
      { id: "record", code: "R-26", name: "Batch records" },
      { id: "cites", code: "CITES", name: "Appendix II papers" },
      { id: "edition", code: "2011", name: "The Vault registry" },
      { id: "origin", code: "Ghats", name: "Lot origins" },
      ...CATEGORIES.red.map((cat) => ({ id: cat.id, code: CAT_CODE[cat.id], name: cat.label, cat: cat.id })),
    ],
    example: "r-japa-mala-108",
    recordName: "Batch record",
    recordNote: "An example of the record that travels with every red piece. Yours carries its own batch, hands and date.",
    numbering: "Batch numbers begin with the wood and the year: R-26 for red sandalwood finished in 2026.",
  },
  white: {
    title: "Know what is in the bottle.",
    inscription: "Heartwood only, tested by the batch, the lot on every label.",
    open: "Open a drawer to read the lot.",
    drawers: [
      { id: "record", code: "W-26", name: "Lot records" },
      { id: "rules", code: "Forest", name: "State forest rules" },
      { id: "edition", code: "2011", name: "The Reserve registry" },
      ...CATEGORIES.white.map((cat) => ({ id: cat.id, code: CAT_CODE[cat.id], name: cat.label, cat: cat.id })),
    ],
    example: "w-heartwood-oil",
    recordName: "Lot record",
    recordNote: "An example of the lot record printed on every white bottle, jar and box. Yours carries its own lot and dates.",
    numbering: "Lot numbers begin with the wood and the year: W-26 for white sandalwood distilled or carved in 2026.",
  },
};

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className={s.record}>
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Card({ wood, d }: { wood: Wood; d: Drawer }) {
  const ct = CONTENT[wood];
  const a = ARCHIVE[wood];
  if (d.id === "record") {
    const p = must(a.example);
    return (
      <>
        <span className={s.stamp}>Example record</span>
        <p className={s.acc}>{a.recordName}</p>
        <p className={s.cardCode}>{ct.provenance.record[0].value}</p>
        <Rows rows={[["Piece", p.name], ...ct.provenance.record.map((r): [string, ReactNode] => [r.label, r.value])]} />
        <p className={s.cardNote}>{a.recordNote}</p>
      </>
    );
  }
  if (d.id === "cites" || d.id === "rules") {
    return (
      <>
        <p className={s.acc}>Regulation</p>
        <p className={s.cardCode}>{d.id === "cites" ? "CITES II" : "Forest rules"}</p>
        <p className={s.cardText}>{ct.regulation}</p>
        <Rows
          rows={
            d.id === "cites"
              ? [
                  ["Species", <i key="l">{ct.latin}</i>],
                  ["Listed in", "CITES Appendix II"],
                  ["Our pieces", "From documented lots, with the paperwork shown"],
                ]
              : [
                  ["Species", <i key="l">{ct.latin}</i>],
                  ["Sold under", "State forest rules in India"],
                  ["Our labels", "The lot is printed on every one"],
                ]
          }
        />
      </>
    );
  }
  if (d.id === "edition") {
    const p = must(ct.edition.productSlug);
    return (
      <>
        <p className={s.acc}>Registry</p>
        <p className={s.cardCode}>{ct.edition.name}</p>
        <p className={s.cardText}>{ct.edition.text}</p>
        <Rows
          rows={[
            ["Edition", `${ct.edition.size}, numbered`],
            ["Remaining", p.edition ? `${p.edition.left} of ${p.edition.size}` : ""],
            ["Price", priceLabel(p)],
          ]}
        />
        <Link href={`/d/04/p/${p.slug}`} className={cx(s.link, "mt-4")}>
          {wood === "red" ? "See the cuff" : "See the oil"}
        </Link>
      </>
    );
  }
  if (d.id === "origin") {
    return (
      <>
        <p className={s.acc}>Lot origin</p>
        <p className={s.cardCode}>{ct.origin.region}</p>
        <p className={s.cardText}>{ct.origin.text}</p>
        <Rows
          rows={[
            ["Grows in", ct.facts.find((f) => f.label === "Grows in")?.value ?? ""],
            ["Colour", ct.facts.find((f) => f.label === "Colour")?.value ?? ""],
          ]}
        />
      </>
    );
  }
  const cat = CATEGORIES[wood].find((x) => x.id === d.cat)!;
  const all = productsFor(wood).filter((p) => p.category === cat.id);
  const some = [...all.filter((p) => p.featured), ...all.filter((p) => !p.featured)].slice(0, 3);
  return (
    <>
      <p className={s.acc}>Drawer of records</p>
      <p className={s.cardCode}>{cat.label}</p>
      <p className={s.cardText}>{cat.line}</p>
      <Rows
        rows={some.map((p): [string, ReactNode] => [
          p.name,
          <Link key={p.slug} href={`/d/04/p/${p.slug}`} className={s.link}>
            {priceLabel(p)}
          </Link>,
        ])}
      />
      <Link href={shopHref(cat.id)} className={cx(s.link, "mt-4")}>
        All {all.length} in {cat.label.toLowerCase()}
      </Link>
      <p className={s.cardNote}>{a.numbering}</p>
    </>
  );
}

function Archive({ wood }: { wood: Wood }) {
  const a = ARCHIVE[wood];
  const ct = CONTENT[wood];
  const [shown, setShown] = useState(a.drawers[0].id);
  const cardId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  const d = a.drawers.find((x) => x.id === shown) ?? a.drawers[0];
  // opening a drawer walks you over to its card, so the click always shows what the drawer holds
  useEffect(() => {
    if (!opened.current) return;
    const t = window.setTimeout(() => revealOnWall(cardRef.current), 40);
    return () => window.clearTimeout(t);
  }, [shown]);
  return (
    <>
      <div className={s.at} style={at(8, 14, { wd: 48 })}>
        <h2 className={s.h2}>{a.title}</h2>
        <div className={cx(s.body, "mt-[3vh]")}>
          <p>{ct.provenance.text}</p>
        </div>
        <p className={cx(s.inscription, "mt-[2.4vh]")}>{a.inscription}</p>
        <p className={cx(s.small, "mt-[2.4vh]")}>{a.open}</p>
      </div>

      <div className={cx(s.cabinet, s.at)} style={at(64, 14, { wd: 82, ht: 72 })}>
        <span className={s.cabinetTop} aria-hidden="true" />
        <div className={s.drawers} role="group" aria-label={wood === "red" ? "Drawers of the record room" : "Drawers of the lot room"}>
          {a.drawers.map((x) => (
            <button
              key={x.id}
              type="button"
              className={s.drawer}
              aria-pressed={shown === x.id}
              aria-controls={cardId}
              onClick={() => {
                opened.current = true;
                if (x.id === shown) revealOnWall(cardRef.current);
                else setShown(x.id);
              }}
            >
              <span className={s.holder}>
                <span className={s.holderCode}>{x.code}</span>
                <span className={s.holderName}>{x.name}</span>
              </span>
              <span className={s.pull} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className={s.cabinetBase} aria-hidden="true" />
      </div>

      <div id={cardId} ref={cardRef} className={cx(s.card, s.at)} style={at(152, 14, { wd: 56 })} key={shown} aria-live="polite">
        <Card wood={wood} d={d} />
      </div>
    </>
  );
}

export function Provenance() {
  return (
    <RoomShell room={ROOMS[5]} w={220}>
      <W red={<Archive wood="red" />} white={<Archive wood="white" />} />
    </RoomShell>
  );
}

/* ======================= Room 7: The 2011 Vault / The 2011 Reserve ======================= */
const EDITION: Record<Wood, { plate: Plate; plinth: [string, string]; vinyl: string; view: string; places: string }> = {
  red: {
    plate: CUFF_PLATE,
    plinth: ["No. 1 to 21", "The 2011 Vault Cuff, aged red heartwood"],
    vinyl: "21 places. One cuff for each.",
    view: "View the cuff",
    places: "Twenty-one plinths, one for each numbered cuff",
  },
  white: {
    plate: { photo: PHOTOS.oilVials },
    plinth: ["No. 1 to 50", "The 2011 Reserve Oil, 3 ml each"],
    vinyl: "50 vials. One lot, one year.",
    view: "View the oil",
    places: "A rack of fifty places, one for each numbered vial",
  },
};

/** The order the numbered cuffs were placed in is not the order they were made: the ones still held are scattered. */
/** Pedestal heights along the run, in vh: varied like a real plinth run, tall enough that the lamps light the cuffs. */
const PLINTH_VH = [30, 24, 34, 27, 32, 25, 29];

const STILL_HELD = [4, 9, 10, 14, 17, 19, 21, 2, 6, 12, 15, 20, 1, 3, 5, 7, 8, 11, 13, 16, 18];

function EditionWood({ wood }: { wood: Wood }) {
  const ct = CONTENT[wood];
  const e = EDITION[wood];
  const p = must(ct.edition.productSlug);
  const left = p.edition?.left ?? 0;
  const held = new Set(STILL_HELD.slice(0, left));
  const placed = ct.edition.size - left;
  return (
    <>
      <div className={s.at} style={at(8, 13, { wd: 50 })}>
        <h2 className={s.h2}>{ct.edition.name}</h2>
        <div className={cx(s.body, "mt-[3vh]")}>
          <p>{ct.edition.text}</p>
          <p>{p.story[1] ?? p.story[0]}</p>
        </div>
        <p className={s.edCount}>
          <b>{capital(words(left))}</b> of {ct.edition.size} remain
        </p>
        <div className={s.priceRow}>
          <span className={s.price}>{priceLabel(p)}</span>
          <Link href={`/d/04/p/${p.slug}`} className={s.link}>
            {e.view}
          </Link>
        </div>
        <dl className={cx(s.details, "mt-[2.4vh]")}>
          {p.details.map((d) => (
            <div key={d.label}>
              <dt>{d.label}</dt>
              <dd>{d.value}</dd>
            </div>
          ))}
          <div>
            <dt>Accession</dt>
            <dd>{accession(p)}</dd>
          </div>
        </dl>
      </div>

      <div className={cx(s.vitrine, s.at)} style={at(64, 12, { wd: 46 })}>
        <div className={s.glass}>
          <span className={s.pool} aria-hidden="true" />
          <div className={s.glassPhoto}>
            <div className={s.par} data-par="">
              <Pic p={e.plate.photo} tone={e.plate.tone} crop={e.plate.crop} sizes="(min-width: 900px) 40vh, 80vw" />
            </div>
          </div>
        </div>
        <p className={s.vPlinth}>
          <b>{e.plinth[0]}</b>
          {e.plinth[1]}
        </p>
      </div>

      <p className={cx(s.vinyl, s.at)} style={at(124, 12, { wd: 150 })}>
        {e.vinyl}
      </p>
      {wood === "red" ? (
        <>
          <p className={cx(s.legend, s.at)} style={at(124, 20, { wd: 140 })}>
            <span>
              <span className={s.legendCuff} aria-hidden="true" />
              {capital(words(left))} cuffs still on their plinths
            </span>
            <span>
              <span className={s.legendDot} aria-hidden="true" />A red dot for each of the {placed} already placed, as a gallery marks a work that has gone to its owner
            </span>
          </p>
          <ol className={cx(s.plinths, s.at)} style={at(124, 33, { ht: 55 })} aria-label={e.places}>
            {Array.from({ length: ct.edition.size }, (_, i) => {
              const n = i + 1;
              const here = held.has(n);
              return (
                <li key={n} className={s.plinth} data-placed={here ? undefined : ""} style={vars({ ph: `${PLINTH_VH[i % PLINTH_VH.length]}vh` })}>
                  <span className={s.beam} data-lamp="" aria-hidden="true" />
                  <span className={s.lampHead} aria-hidden="true" />
                  {here && <span className={s.cuff} aria-hidden="true" />}
                  <span className={s.block}>
                    {n}
                    {!here && <span className={s.dot} aria-hidden="true" />}
                    <span className="sr-only">{here ? ", on its plinth" : ", placed"}</span>
                  </span>
                  <span className={s.plinthTip} aria-hidden="true">
                    No. {n} of {ct.edition.size}, {here ? "on its plinth" : "placed"}
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <div className={cx(s.rackWrap, s.at)} style={at(124, 24, { wd: 98, ht: 64 })}>
          <div className={s.rackLamps} aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={s.rackBeam} data-lamp="" />
            ))}
          </div>
          <ol className={s.rack} aria-label={e.places}>
            {Array.from({ length: ct.edition.size }, (_, i) => (
              <li key={i} className={s.vial}>
                <span className={s.vialCap} aria-hidden="true" />
                <span className={s.vialGlass} aria-hidden="true" />
                <span className={s.vialNo}>{i + 1}</span>
              </li>
            ))}
          </ol>
          <span className={s.rackShelf} aria-hidden="true" />
        </div>
      )}
    </>
  );
}

export function Vault() {
  return (
    <RoomShell room={ROOMS[6]} className={s.vaultRoom}>
      <W red={<EditionWood wood="red" />} white={<EditionWood wood="white" />} />
    </RoomShell>
  );
}

/* ======================= Room 8: Gifts ======================= */
const GIFTS: Record<Wood, { more: string; cat: CategoryId; big: string; small: string; bigTone?: Tone }> = {
  red: {
    more: "Any order can leave as a gift: a note in your own words, written by hand, and no prices inside the parcel. Desk sets for teams start at ten.",
    cat: "gifting",
    big: "r-heirloom-casket",
    small: "r-presentation-box",
  },
  white: {
    more: "Any order can leave as a gift: a note in your own words, written by hand, and no prices inside the parcel. Wedding trays are packed by hand, from ten.",
    cat: "w-gifting",
    big: "w-wedding-tray",
    small: "w-morning-ritual",
  },
};

function GiftLabel({ p }: { p: Product }) {
  return (
    <>
      <h3 className={s.h3}>{p.name}</h3>
      <p>{p.short}</p>
      {editionLine(p) && <p className={s.edLine}>{editionLine(p)}</p>}
      <p className={cx(s.acc, "mt-1")}>Accession {accession(p)}</p>
      <div className={s.priceRow}>
        <span className={s.price}>{priceLabel(p)}</span>
        <Link href={`/d/04/p/${p.slug}`} className={s.link} aria-label={`View ${p.name}`}>
          View
        </Link>
      </div>
    </>
  );
}

function GiftsWood({ wood }: { wood: Wood }) {
  const ct = CONTENT[wood];
  const g = GIFTS[wood];
  const shelf = productsFor(wood).filter((p) => p.category === g.cat);
  const big = must(g.big);
  const small = must(g.small);
  const catLabel = CATEGORIES[wood].find((c) => c.id === g.cat)!.label;
  return (
    <>
      <div className={s.at} style={at(8, 13, { wd: 72 })}>
        <h2 className={s.h2}>{ct.gifting.title}</h2>
        <div className={cx(s.body, "mt-[3vh]")}>
          <p>{ct.gifting.text}</p>
          <p>{g.more}</p>
        </div>
      </div>
      <div className={cx(s.shelf, s.at)} style={at(8, 56, { wd: 72 })}>
        <p className={s.tierName}>{wood === "red" ? "On the gift shelf, red" : "On the gift shelf, white"}</p>
        <ul>
          {shelf.map((p) => (
            <li key={p.slug}>
              <Link href={`/d/04/p/${p.slug}`}>
                <span>{p.name}</span>
                <span>{priceLabel(p)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={shopHref(g.cat)} className={cx(s.link, "mt-3")}>
          All {countIn(wood, g.cat)} in {catLabel.toLowerCase()}, in the shop
        </Link>
      </div>

      <Frame
        p={platesOf(big)[0].photo}
        tone={platesOf(big)[0].tone}
        crop={platesOf(big)[0].crop}
        ar={1.3}
        className={s.at}
        style={at(90, 14, { ht: 50 })}
        light
        sizes="(min-width: 900px) 66vh, 92vw"
      />
      <div className={cx(s.label, s.at)} style={at(90, 69, { wd: 60 })}>
        <GiftLabel p={big} />
      </div>

      <Frame
        p={platesOf(small)[0].photo}
        tone={platesOf(small)[0].tone}
        crop={platesOf(small)[0].crop}
        ar={0.8}
        className={cx(s.at, s.right)}
        style={at(162, 22, { ht: 42, vw: "70%" })}
        light
        sizes="(min-width: 900px) 36vh, 70vw"
      />
      <div className={cx(s.label, s.at)} style={at(200, 40, { wd: 28 })}>
        <GiftLabel p={small} />
      </div>
    </>
  );
}

export function Gifting() {
  return (
    <RoomShell room={ROOMS[7]} w={236}>
      <W red={<GiftsWood wood="red" />} white={<GiftsWood wood="white" />} />
    </RoomShell>
  );
}

/* ======================= Exit ======================= */
function CircleSignup({ wood }: { wood: Wood }) {
  const [done, setDone] = useState(false);
  const id = useId();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(true);
  };
  if (done)
    return (
      <p className={cx(s.body, "mt-4")} role="status">
        {wood === "red"
          ? "Thank you. The next letter from the red workshop will find you. This preview does not send anything yet."
          : "Thank you. The next letter on oil and ritual will find you. This preview does not send anything yet."}
      </p>
    );
  return (
    <form className={s.circleForm} onSubmit={submit}>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input id={id} type="email" name="email" required autoComplete="email" placeholder="Your email address" />
      <button type="submit" className={s.btn}>
        Join the Circle
      </button>
    </form>
  );
}

const EXIT: Record<Wood, { vinyl: string; photo: PhotoRef; legal: string }> = {
  red: {
    vinyl: "Four thousand years found its way to you.",
    photo: CONTENT.red.origin.photo,
    legal: "Red sandalwood from documented lots in the Eastern Ghats.",
  },
  white: {
    vinyl: "Give something that remains.",
    photo: CONTENT.white.origin.photo,
    legal: "White sandalwood from documented lots in Karnataka.",
  },
};

function ExitWood({ wood }: { wood: Wood }) {
  const ct = CONTENT[wood];
  const e = EXIT[wood];
  const walk = (id: string) => goToRoom(id);
  return (
    <>
      <p className={cx(s.h2, s.at, "italic")} style={at(8, 11, { wd: 100 })}>
        {e.vinyl}
      </p>

      <div className={s.at} style={at(8, 29, { wd: 46 })}>
        <h2 className={s.h3}>{ct.circle.title}</h2>
        <p className={cx(s.body, "mt-2")}>{ct.circle.text}</p>
        <CircleSignup wood={wood} />
        <p className={cx(s.small, "mt-2")}>Front-end preview. Nothing is sent yet.</p>
      </div>

      <footer className={s.at} style={at(60, 29, { wd: 50 })}>
        <div className={s.foot}>
          <div>
            <h3>Visit</h3>
            <ul>
              <li>
                <Link href="/d/04/shop">Shop</Link>
              </li>
              <li>
                <Link href="/d/04/track">Track your order</Link>
              </li>
              <li>
                <Link href="/d/04/account">Your account</Link>
              </li>
              <li>
                <button type="button" onClick={openLedger}>
                  Acquisitions
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3>{wood === "red" ? "The red shop" : "The white shop"}</h3>
            <ul>
              {CATEGORIES[wood].map((cat) => (
                <li key={cat.id}>
                  <Link href={shopHref(cat.id)}>{cat.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={s.footNotes}>
            <h3>Notes</h3>
            <dl>
              <dt>Delivery</dt>
              <dd>Free across India, 3 to 5 working days. Express {formatINR(DELIVERY.express.price)}.</dd>
              <dt>Returns</dt>
              <dd>Unused pieces within 14 days. Numbered editions are final.</dd>
              <dt>Care</dt>
              <dd>{ct.care}</dd>
            </dl>
          </div>
        </div>
      </footer>

      <p className={cx(s.exitSign, s.at)} style={at(116, 6.5)}>
        <span className={s.exitDoor} aria-hidden="true" />
        {wood === "red" ? "Exit to the red shop" : "Exit to the white shop"}
      </p>
      <Link href="/d/04/shop" className={cx(s.doorway, s.at, s.right)} style={at(116, 13, { wd: 24, ht: 75 })}>
        <div className={s.par} data-par="">
          <Pic p={e.photo} sizes="(min-width: 900px) 30vh, 72vw" />
        </div>
        <span className={s.doorwayLabel}>
          {wood === "red" ? `All ${productsFor("red").length} red pieces` : `All ${productsFor("white").length} white pieces`}
        </span>
      </Link>

      <div className={cx(s.at, "flex flex-wrap items-center gap-x-5 gap-y-2")} style={at(8, 72, { wd: 100 })}>
        <button type="button" className={s.btnLine} onClick={() => walk("entrance")}>
          Return to the entrance
        </button>
        <p className={s.legal}>
          {ct.closing}
          <br />© 2026 Santalum Maison. {e.legal}
        </p>
      </div>
    </>
  );
}

export function Exit() {
  return (
    <RoomShell room={ROOMS[8]} w={146}>
      <W red={<ExitWood wood="red" />} white={<ExitWood wood="white" />} />
    </RoomShell>
  );
}
