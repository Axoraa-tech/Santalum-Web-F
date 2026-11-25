"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { DELIVERY } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import {
  categoryOf,
  formatINR,
  getOption,
  getProduct,
  priceOf,
  productsFor,
  type Product,
} from "@/lib/shop/products";
import { PHOTOS } from "@/lib/photos";
import { setWoodQuietly } from "@/lib/wood";
import { s } from "./cls";
import { Corridor } from "./Corridor";
import { Footer } from "./Footer";
import { Keep } from "./Keep";
import { Pic, picOf, platesOf } from "./plates";
import { Rating, VisitorsBook } from "./Reviews";
import { editionLine, Exhibit, HANG } from "./RoomsA";
import { accession, acquire, ROOMS, shopHref, type Room } from "./store";
import { at, capital, cx, Frame, RoomShell, vars, words } from "./ui";

/** Product view: a horizontal wall of its own, lit for the wood the piece is made in. */
export function ProductWall({ slug }: { slug: string }) {
  const p = getProduct(slug)!;
  const ct = CONTENT[p.wood];

  // the page belongs to its product's wood
  useEffect(() => {
    setWoodQuietly(p.wood);
  }, [p.wood]);

  const rooms = useMemo<Room[]>(() => {
    const one = (n: string, name: string): Room => ({ id: "", n, red: name, white: name });
    return [
      { ...one("4", ROOMS[3][p.wood]), id: "object" },
      { ...one("Plates", p.name), id: "plates" },
      { ...one("Nearby", "Pairs with"), id: "nearby" },
    ];
  }, [p.wood, p.name]);

  return (
    <div className="c4-woodScope" data-wood={p.wood}>
      <Corridor rooms={rooms} label={`${p.name}, ${ct.name.toLowerCase()}`}>
        <RoomShell room={rooms[0]} w={236}>
          <ObjectWall p={p} />
        </RoomShell>
        <RoomShell room={rooms[1]}>
          <Plates p={p} />
        </RoomShell>
        <RoomShell room={rooms[2]}>
          <Nearby p={p} />
        </RoomShell>
      </Corridor>
      <VisitorsBook p={p} />
      <Footer />
    </div>
  );
}

/** A piece named in running text keeps its name as a title, the way a wall label cites a work. */
function Titled({ p }: { p: Product }) {
  return <cite className={s.title}>{p.name}</cite>;
}

const PROVENANCE: Record<Product["wood"], (p: Product) => ReactNode> = {
  red: (p) => (
    <>
      Leaves with its batch record: the name <Titled p={p} />, the species Pterocarpus santalinus, the lot and its origin in the
      Eastern Ghats, the initials of the hand that finished it, and the date.
    </>
  ),
  white: (p) => (
    <>
      Leaves with its lot record: the name <Titled p={p} />, the species Santalum album, the lot and where in Karnataka it came
      from, the date it was distilled or carved, and the test report for oils.
    </>
  ),
};

function ObjectWall({ p }: { p: Product }) {
  const ct = CONTENT[p.wood];
  const [plate, setPlate] = useState(0);
  const [option, setOption] = useState(p.options?.values[0].id);
  const [qty, setQty] = useState(1);
  const optName = useId();
  const unit = priceOf(p, option);
  const plates = platesOf(p);
  const shot = plates[plate] ?? plates[0];
  const counterpart = p.counterpart ? getProduct(p.counterpart) : undefined;
  const ed = editionLine(p);

  return (
    <>
      <Frame
        p={shot.photo}
        tone={shot.tone}
        crop={shot.crop}
        ar={0.8}
        className={cx(s.at, s.mainPlate)}
        style={at(6, 11, { ht: 64 })}
        light
        priority
        sizes="(min-width: 900px) 52vh, 100vw"
      />
      {plates.length > 1 && (
        <div className={cx(s.thumbs, s.at)} style={at(6, 79, { wd: 54 })} role="group" aria-label="Plates of this piece">
          {plates.map((sh, i) => (
            <button
              key={sh.photo.id}
              type="button"
              className={s.thumbBtn}
              aria-pressed={plate === i}
              aria-label={`Plate ${i + 1}: ${sh.photo.alt}`}
              onClick={() => setPlate(i)}
            >
              <Pic p={sh.photo} tone={sh.tone} crop={sh.crop} sizes="80px" />
            </button>
          ))}
          <span className={s.thumbsNote}>
            Plate {plate + 1} of {plates.length}
          </span>
        </div>
      )}

      <div className={cx(s.longLabel, s.at)} style={at(68, 10, { wd: 160 })}>
        <div className={s.buy}>
          <p className={s.acc}>
            Accession {accession(p)}
            {p.badge ? <span className={s.badge}>{p.badge}</span> : null}
          </p>
          <h1 className={s.pTitle}>{p.name}</h1>
          <Rating slug={p.slug} href="#reviews" />
          <p className={cx(s.body, "mt-1")}>
            {ct.name}, <span className={s.latin}>{ct.latin}</span>
          </p>
          {ed && <p className={s.edLine}>{ed}</p>}
          <p className={cx(s.body, "mt-2")}>{p.short}</p>

          <p className={s.bigPrice} aria-live="polite">
            {formatINR(unit)}
            {qty > 1 && <span> each, {formatINR(unit * qty)} for {words(qty)}</span>}
          </p>

          {p.options && (
            <fieldset className={s.opts}>
              <legend>{p.options.name}</legend>
              <div>
                {p.options.values.map((v) => (
                  <label key={v.id} className={s.opt}>
                    <input
                      type="radio"
                      name={optName}
                      value={v.id}
                      checked={(option ?? p.options!.values[0].id) === v.id}
                      onChange={() => setOption(v.id)}
                    />
                    <span>{v.label}</span>
                    <em>{formatINR(v.price)}</em>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className={s.buyRow}>
            <span className={s.stepper} role="group" aria-label="Quantity">
              <button type="button" aria-label="One fewer" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span aria-live="polite">{qty}</span>
              <button type="button" aria-label="One more" disabled={qty >= 9} onClick={() => setQty((q) => Math.min(9, q + 1))}>
                +
              </button>
            </span>
            <button type="button" className={cx(s.btn, s.addBtn)} onClick={() => acquire(p.slug, { option, qty })}>
              Add to acquisitions, {formatINR(unit * qty)}
            </button>
          </div>
          <div className={s.buyMeta}>
            <Keep slug={p.slug} name={p.name} />
            {getOption(p, option) && (
              <span className={s.small}>
                {p.options!.name}: {getOption(p, option)!.label}
              </span>
            )}
          </div>
          <p className={cx(s.small, "mt-3")}>
            Free delivery across India, 3–5 working days. Express {formatINR(DELIVERY.express.price)}.
          </p>
          {counterpart && (
            <p className={cx(s.small, "mt-2")}>
              Also in {CONTENT[counterpart.wood].name.toLowerCase()}:{" "}
              <Link href={`/d/04/p/${counterpart.slug}`} className={s.link}>
                {counterpart.name}
              </Link>
            </p>
          )}
        </div>

        <div>
          <h2 className={s.h3}>The piece</h2>
          <div className={cx(s.body, "mt-2")}>
            {p.story.map((x) => (
              <p key={x}>{x}</p>
            ))}
          </div>
          <p className={cx(s.inscription, "mt-3")}>{PROVENANCE[p.wood](p)}</p>
          <h2 className={cx(s.h3, "mt-[3vh]")}>Details</h2>
          <dl className={cx(s.details, "mt-2")}>
            <div>
              <dt>Material</dt>
              <dd>
                {ct.name} heartwood, <span className={s.latin}>{ct.latin}</span>
              </dd>
            </div>
            {p.details.map((d) => (
              <div key={d.label}>
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
            <div>
              <dt>Department</dt>
              <dd>
                <Link href={shopHref(p.category)} className={s.link}>
                  {categoryOf(p).label}
                </Link>
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className={s.h3}>Care</h2>
          <p className={cx(s.body, "mt-2")}>{p.care}</p>
          <div className={cx(s.card, s.miniCard, "mt-[3vh]")}>
            <p className={s.acc}>{p.wood === "red" ? "Its batch record will read" : "Its lot record will read"}</p>
            <dl className={cx(s.record, "mt-2")}>
              <div>
                <dt>Piece</dt>
                <dd>{p.name}</dd>
              </div>
              <div>
                <dt>Species</dt>
                <dd className={s.latin}>{ct.latin}</dd>
              </div>
              <div>
                <dt>Origin</dt>
                <dd>{ct.origin.region}</dd>
              </div>
              <div>
                <dt>{p.wood === "red" ? "Batch" : "Lot"}</dt>
                <dd>{p.wood === "red" ? "R-26" : "W-26"}, then its own number</dd>
              </div>
              <div>
                <dt>{p.wood === "red" ? "Finished by" : "Distilled"}</dt>
                <dd>{p.wood === "red" ? "Initials of the hand that made it" : "The month the lot was taken"}</dd>
              </div>
            </dl>
          </div>
          <h2 className={cx(s.h3, "mt-[3vh]")}>Delivery and returns</h2>
          <p className={cx(s.body, "mt-2")}>
            Free across India, 3 to 5 working days; express in 1 to 2 for {formatINR(DELIVERY.express.price)}. Unused pieces can
            be returned within 14 days in their packaging. Numbered editions are final.
          </p>
        </div>
      </div>
    </>
  );
}

const PLATE_HANG = [
  { top: 12, ht: 60, ar: 0.8 },
  { top: 22, ht: 44, ar: 1.25 },
  { top: 14, ht: 54, ar: 0.75 },
  { top: 26, ht: 40, ar: 1 },
];

function Plates({ p }: { p: Product }) {
  const ct = CONTENT[p.wood];
  const mat = p.wood === "red" ? PHOTOS.redGrain : PHOTOS.whiteLog;
  const shots = platesOf(p);
  const list = shots.map((sh) => ({ p: sh.photo, tone: sh.tone, crop: sh.crop, cap: sh.photo.alt }));
  if (!shots.some((sh) => sh.photo.id === mat.id))
    list.push({ p: mat, tone: undefined, crop: undefined, cap: `The material: ${ct.name.toLowerCase()} heartwood, ${ct.latin}.` });

  return (
    <div className={s.plates}>
      <div className={s.platesIntro}>
        <h2 className={s.h2}>Plates</h2>
        <p className={cx(s.vinyl, "mt-[3vh]")}>{p.short}</p>
        <p className={cx(s.small, "mt-3")}>
          {capital(words(list.length))} photographs of <Titled p={p} /> and its material, in the order they were taken.
        </p>
        <dl className={cx(s.details, "mt-[3vh]")}>
          <div>
            <dt>Wood</dt>
            <dd>{ct.name}</dd>
          </div>
          <div>
            <dt>Botanical</dt>
            <dd className={s.latin}>{ct.latin}</dd>
          </div>
          <div>
            <dt>Sanskrit</dt>
            <dd className={s.deva} lang="sa">
              {ct.sanskrit}
            </dd>
          </div>
          <div>
            <dt>Kannada</dt>
            <dd className={s.deva} lang="kn">
              {ct.kannada}
            </dd>
          </div>
          <div>
            <dt>Grows in</dt>
            <dd>{ct.origin.region}</dd>
          </div>
        </dl>
      </div>
      {list.map((pl, i) => {
        const h = PLATE_HANG[i % PLATE_HANG.length];
        return (
          <figure key={pl.p.id} className={s.plate} style={vars({ top: h.top })}>
            <Frame p={pl.p} tone={pl.tone} crop={pl.crop} ar={h.ar} style={vars({ ht: h.ht })} sizes="(min-width: 900px) 60vh, 92vw" />
            <figcaption className={s.label}>
              <span className={s.acc}>Plate {i + 1}</span>
              <span className="block">{pl.cap}</span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

function Nearby({ p }: { p: Product }) {
  const ct = CONTENT[p.wood];
  const list = productsFor(p.wood).filter((x) => x.slug !== p.slug);
  const pairs = [
    ...list.filter((x) => x.category === p.category),
    ...list.filter((x) => x.category !== p.category && x.featured),
    ...list.filter((x) => x.category !== p.category && !x.featured),
  ].slice(0, 3);
  const counterpart = p.counterpart ? getProduct(p.counterpart) : undefined;
  const hangs = [HANG[2], HANG[1], HANG[3]];
  const all = productsFor(p.wood).length;
  return (
    <div className={s.gallery}>
      <div className={s.galleryIntro}>
        <h2 className={s.h2}>Pairs with</h2>
        <p className={cx(s.body, "mt-[3vh]")}>
          {p.wood === "red"
            ? "Three red pieces that sit well beside this one, on a desk, a wrist or a shelf."
            : "Three white pieces that belong beside this one, on the altar, the dressing table or in the same box."}
        </p>
        {counterpart && (
          <Link href={`/d/04/p/${counterpart.slug}`} className={s.loan}>
            <span className={s.loanPhoto}>
              <Pic {...picOf(counterpart)} sizes="120px" />
            </span>
            <span className={s.loanText}>
              <span className={s.acc}>On loan from the {counterpart.wood} room</span>
              <span className={s.loanName}>
                Also in {CONTENT[counterpart.wood].name.toLowerCase()}: {counterpart.name}
              </span>
              <span className={s.small}>{counterpart.short}</span>
            </span>
          </Link>
        )}
      </div>
      {pairs.map((x, i) => (
        <Exhibit key={x.slug} p={x} hang={hangs[i]} odd={i % 2 === 1} />
      ))}
      <div className={s.shopDoor}>
        <div className={s.doorFrame}>
          <p className={s.doorSign}>
            <span className={s.exitDoor} aria-hidden="true" />
            {p.wood === "red" ? "The red shop" : "The white shop"}
          </p>
          <p className={s.doorBig}>
            All {all} {ct.short.toLowerCase()} sandalwood pieces
          </p>
          <p className={s.small}>Back to the department: {categoryOf(p).label.toLowerCase()}, or the whole shop.</p>
          <div className="flex flex-wrap gap-2">
            <Link href={shopHref(p.category)} className={s.btn}>
              {categoryOf(p).label}
            </Link>
            <Link href="/d/04/shop" className={s.btnLine}>
              The whole shop
            </Link>
          </div>
        </div>
        <div className={s.doorInvite}>
          <p className={s.h3}>Back to the walk</p>
          <p className={s.small}>The corridor continues with the making, the records and the 2011 edition.</p>
          <Link href="/d/04#collection" className={s.link}>
            Return to room 4
          </Link>
        </div>
      </div>
    </div>
  );
}
