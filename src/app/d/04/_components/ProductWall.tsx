"use client";

import Link from "next/link";
import { W } from "@/components/maison/W";
import { formatINR, getFamily, WOOD_NAMES, type Family, type Tone } from "@/lib/catalog";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { switchWood, type Wood } from "@/lib/wood";
import { s } from "./cls";
import { Corridor } from "./Corridor";
import { Exhibit, HANG, RoomSheet } from "./RoomsA";
import { accession, acquire, CARE, familiesIn, openLedger, type Room } from "./store";
import { at, cx, Frame, RoomShell, vars } from "./ui";

const P_ROOMS: Room[] = [
  { id: "object", n: "1", name: "The object" },
  { id: "plates", n: "2", name: "Plates" },
  { id: "nearby", n: "3", name: "Nearby" },
];

const other = (w: Wood): Wood => (w === "red" ? "white" : "red");

/** The wood actually shown for a family when the room is lit in `wood` (falls back if it is not made in it). */
function shownWood(f: Family, wood: Wood): Wood {
  return f.variants[wood] ? wood : other(wood);
}

/** Product view: a horizontal wall of its own. Large plate, long wall label, then the remaining plates. */
export function ProductWall({ slug }: { slug: string }) {
  const f = getFamily(slug)!;
  return (
    <Corridor rooms={P_ROOMS} label={f.name}>
      <RoomShell id="object" n="4" name="The collection" w={198}>
        <W red={<ObjectWall f={f} wood="red" />} white={<ObjectWall f={f} wood="white" />} />
      </RoomShell>
      <RoomShell id="plates" n="Plates" name={f.name}>
        <W red={<Plates f={f} wood="red" />} white={<Plates f={f} wood="white" />} />
      </RoomShell>
      <RoomShell id="nearby" n="Nearby" name="Also on the wall">
        <div className={s.gallery}>
          <div className={s.galleryIntro}>
            <h2 className={s.h2}>Also in the collection</h2>
            <p className={cx(s.body, "mt-[3vh]")}>Pieces that hang near this one in room 4.</p>
            <div className={s.sheet}>
              <p className={s.sheetTitle}>Everything in room 4</p>
              <W red={<RoomSheet wood="red" />} white={<RoomSheet wood="white" />} />
            </div>
          </div>
          <W red={<Near f={f} wood="red" />} white={<Near f={f} wood="white" />} />
          <div className={s.galleryEnd}>
            <p className={s.h3}>Back to the walk</p>
            <p className={s.small}>The corridor continues with the making, the provenance archive and the 2011 Vault.</p>
            <Link href="/d/04#collection" className={s.btnLine}>
              Return to the collection
            </Link>
            <button type="button" className={s.link} onClick={openLedger}>
              Open acquisitions
            </button>
          </div>
        </div>
      </RoomShell>
    </Corridor>
  );
}

function WoodChoice({ f, branch }: { f: Family; branch: Wood }) {
  return (
    <div className={s.woodChoice} role="group" aria-label="Choose the wood">
      {(["red", "white"] as const).map((w) => {
        const v = f.variants[w];
        return (
          <button
            key={w}
            type="button"
            className={s.woodOpt}
            data-tone={w}
            disabled={!v}
            aria-pressed={!!v && w === branch}
            onClick={() => switchWood(w)}
          >
            <span className={cx(s.sw, w === "red" ? "ring-red" : "ring-white")} aria-hidden="true" />
            <span>{v ? WOOD_NAMES[w].common : `Not made in ${WOOD_NAMES[w].common.toLowerCase()}`}</span>
            {v && <em>{formatINR(v.price)}</em>}
          </button>
        );
      })}
    </div>
  );
}

function ObjectWall({ f, wood }: { f: Family; wood: Wood }) {
  const has = !!f.variants[wood];
  const sw = shownWood(f, wood);
  const v = f.variants[sw]!;
  const n = WOOD_NAMES[sw];
  const first = v.shots[0];
  return (
    <>
      <Frame
        p={first.photo}
        tone={first.tone}
        ar={0.8}
        className={s.at}
        style={at(6, 12, { ht: 72 })}
        light
        priority
        sizes="(min-width: 900px) 62vh, 100vw"
      />
      <div className={cx(s.longLabel, s.at)} style={at(76, 11, { wd: 114 })}>
        <div>
          <p className={s.acc}>Accession {accession(f.slug, sw)}</p>
          <h1 className={s.pTitle}>{f.name}</h1>
          <p className={cx(s.body, "mt-2")}>
            {n.common}, <span className={s.latin}>{n.latin}</span>
          </p>
          {f.edition && <p className={s.small}>{f.edition}</p>}
          <p className={cx(s.body, "mt-3")}>{f.summary}</p>
          <WoodChoice f={f} branch={wood} />
          {has ? (
            <button type="button" className={cx(s.btn, "mt-3 w-full")} onClick={() => acquire(f.slug, wood)}>
              Add to acquisitions, {formatINR(v.price)}
            </button>
          ) : (
            <>
              <p className={cx(s.small, "mt-3")}>
                The {f.name.toLowerCase()} is made only in {n.common.toLowerCase()}.
              </p>
              <button type="button" className={cx(s.btn, "mt-2 w-full")} onClick={() => switchWood(sw)}>
                Light the {sw} room
              </button>
            </>
          )}
          <p className={cx(s.small, "mt-3")}>
            Complimentary delivery across India, dispatched within 3 to 5 working days, with its batch record.
          </p>
        </div>
        <div>
          <h2 className={s.h3}>The piece</h2>
          <div className={cx(s.body, "mt-2")}>
            {f.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className={cx(s.inscription, "mt-3")}>{v.note}</p>
          <h2 className={cx(s.h3, "mt-[3vh]")}>Details</h2>
          <dl className={cx(s.details, "mt-2")}>
            <div>
              <dt>Material</dt>
              <dd>
                {n.common} heartwood, <span className={s.latin}>{n.latin}</span>
              </dd>
            </div>
            {f.details.map((d) => (
              <div key={d.label}>
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className={s.h3}>Care</h2>
          <p className={cx(s.body, "mt-2")}>{CARE[f.category]}</p>
          <div className={cx(s.card, s.miniCard, "mt-[3vh]")}>
            <p className={s.acc}>Its record will read</p>
            <dl className={cx(s.record, "mt-2")}>
              <div>
                <dt>Piece</dt>
                <dd>{f.name}</dd>
              </div>
              <div>
                <dt>Wood</dt>
                <dd>{n.common}</dd>
              </div>
              <div>
                <dt>Origin</dt>
                <dd>{n.origin}</dd>
              </div>
              <div>
                <dt>Batch</dt>
                <dd>{sw === "red" ? "R-26" : "W-26"}, then its own number</dd>
              </div>
              <div>
                <dt>Artisan</dt>
                <dd>Initials of the hand that made it</dd>
              </div>
              <div>
                <dt>Finished</dt>
                <dd>The day it left the bench</dd>
              </div>
            </dl>
          </div>
          <h2 className={cx(s.h3, "mt-[3vh]")}>Delivery and returns</h2>
          <p className={cx(s.body, "mt-2")}>
            Complimentary across India, dispatched within 3 to 5 working days. Unused pieces can be returned within 14 days
            in their original packaging. Numbered editions are final.
          </p>
          <Link href="/d/04#collection" className={cx(s.link, "mt-4")}>
            Back to room 4
          </Link>
        </div>
      </div>
    </>
  );
}

type Plate = { p: PhotoRef; tone?: Tone; cap: string };
const PLATE_HANG = [
  { top: 12, ht: 60, ar: 0.8 },
  { top: 22, ht: 44, ar: 1.25 },
  { top: 14, ht: 54, ar: 0.75 },
  { top: 26, ht: 40, ar: 1 },
];

function Plates({ f, wood }: { f: Family; wood: Wood }) {
  const sw = shownWood(f, wood);
  const v = f.variants[sw]!;
  const n = WOOD_NAMES[sw];
  const list: Plate[] = v.shots.slice(1).map((sh) => ({ p: sh.photo, tone: sh.tone, cap: sh.photo.alt }));
  const mat = sw === "red" ? PHOTOS.redGrain : PHOTOS.whiteLog;
  if (!v.shots.some((sh) => sh.photo.id === mat.id))
    list.push({ p: mat, cap: `The material: ${n.common.toLowerCase()} heartwood, ${n.latin}.` });
  list.push({ p: PHOTOS.carving, cap: "Shaped by hand, following the grain." });

  return (
    <div className={s.plates}>
      <div className={s.platesIntro}>
        <h2 className={s.h2}>Plates</h2>
        <p className={cx(s.vinyl, "mt-[3vh]")}>{v.note}</p>
        <p className={cx(s.small, "mt-3")}>
          {list.length + 1} photographs of the {f.name.toLowerCase()} and its material. Plate 1 hangs beside the label.
        </p>
        <dl className={cx(s.details, "mt-[3vh]")}>
          <div>
            <dt>Wood</dt>
            <dd>{n.common}</dd>
          </div>
          <div>
            <dt>Botanical</dt>
            <dd className={s.latin}>{n.latin}</dd>
          </div>
          <div>
            <dt>Sanskrit</dt>
            <dd className={s.deva} lang="sa">
              {n.sa}
            </dd>
          </div>
          <div>
            <dt>Grows in</dt>
            <dd>{n.origin}</dd>
          </div>
        </dl>
      </div>
      {list.map((pl, i) => {
        const h = PLATE_HANG[i % PLATE_HANG.length];
        return (
          <figure key={pl.p.id} className={s.plate} style={vars({ top: h.top })}>
            <Frame p={pl.p} tone={pl.tone} ar={h.ar} style={vars({ ht: h.ht })} sizes="(min-width: 900px) 60vh, 92vw" />
            <figcaption className={s.label}>
              <span className={s.acc}>Plate {i + 2}</span>
              <span className="block">{pl.cap}</span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

function Near({ f, wood }: { f: Family; wood: Wood }) {
  const list = familiesIn(wood).filter((x) => x.slug !== f.slug);
  const near = [...list.filter((x) => x.category === f.category), ...list.filter((x) => x.category !== f.category)].slice(0, 3);
  const hangs = [HANG[2], HANG[1], HANG[3]];
  return (
    <>
      {near.map((x, i) => (
        <Exhibit key={x.slug} f={x} wood={wood} hang={hangs[i]} odd={i % 2 === 1} />
      ))}
    </>
  );
}
