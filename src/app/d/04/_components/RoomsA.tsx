"use client";

import Link from "next/link";
import { Fragment } from "react";
import { W, WT } from "@/components/maison/W";
import { CATEGORIES, formatINR, WOOD_NAMES, type Family } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { switchWood, type Wood } from "@/lib/wood";
import { s } from "./cls";
import { accession, familiesIn, goToRoom, ROOMS } from "./store";
import { at, capital, cx, Frame, RoomShell, vars, words } from "./ui";

/* ======================= Room 1: Entrance ======================= */
export function Entrance() {
  return (
    <RoomShell id="entrance" n="1" name="Entrance" w={300} className={s.entrance}>
      <div className={s.at} style={at(7, 21, { wd: 32 })}>
        <h2 className={s.h3}>A house for sandalwood</h2>
        <div className={cx(s.body, "mt-3")}>
          <p>
            Santalum Maison is a contemporary Indian house for objects, jewellery and gifts in red and white sandalwood.
          </p>
          <p>Each piece is made by hand from one batch of heartwood, numbered, and sent with its record.</p>
        </div>
        <p className={s.walk}>
          <span className={s.walkLine} aria-hidden="true" />
          <span className={s.hideH}>Scroll down to walk through nine rooms.</span>
          <span className={s.onlyH}>Nine rooms. Scroll, swipe or use the arrow keys to walk.</span>
        </p>
      </div>

      <h1 className={s.giant} style={vars({ x: 44 })} data-drift="0.2" aria-label="Santalum">
        {"Santalum".split("").map((ch, i) => (
          <span key={i} style={vars({ i })} aria-hidden="true">
            {ch}
          </span>
        ))}
      </h1>

      <Frame
        p={PHOTOS.temple}
        ar={0.72}
        className={cx(s.at, s.right)}
        style={at(150, 13, { ht: 58, vw: "78%" })}
        priority
        sizes="(min-width: 900px) 44vh, 80vw"
      />
      <div className={cx(s.label, s.plaque, s.at)} style={at(196, 50, { wd: 25 })}>
        <h3 className={s.h3}>Temple corridor</h3>
        <p>Carved stone pillars along a Hoysala temple corridor in Karnataka, where white sandalwood has long been worked.</p>
        <p className={s.acc}>Photograph</p>
      </div>

      <p className={cx(s.vinyl, s.at)} style={at(196, 12, { wd: 52 })}>
        Four thousand years found its way to you.
      </p>

      <Frame
        p={PHOTOS.diyaHands}
        ar={0.8}
        className={s.at}
        style={at(256, 28, { ht: 38, vw: "64%" })}
        sizes="(min-width: 900px) 32vh, 64vw"
      />
      <div className={cx(s.label, s.plaque, s.at)} style={at(256, 70, { wd: 34 })}>
        <h3 className={s.h3}>Clay diya</h3>
        <p>Held in two hands at the start of a ritual. In this house we photograph hands and the work, not faces.</p>
      </div>
    </RoomShell>
  );
}

/* ======================= Room 2: Wall text ======================= */
export function WallText() {
  return (
    <RoomShell id="wall-text" n="2" name="Wall text" w={214}>
      <article className={cx(s.intro, s.at)} style={at(8, 10, { wd: 112 })}>
        <h2 className={s.h2}>Two woods, one house</h2>
        <div className={cx(s.essay, s.body)}>
          <p>
            Sandalwood, in India, means two different trees. Red sandalwood, Pterocarpus santalinus, grows in the Eastern
            Ghats, mostly in Andhra Pradesh. It is deep red, dense and fine-grained, and it has almost no scent. It is
            regulated internationally under CITES Appendix II, so every piece needs a clear record of where its wood came
            from.
          </p>
          <p>
            White sandalwood, Santalum album, grows in the dry forests of southern India. It is pale gold and fragrant,
            and its oil sits in the heartwood, the dark centre of the tree. Mysuru, in Karnataka, is its traditional
            craft centre.
          </p>
          <p>
            We work with both and keep them apart. Each object is made in one wood, from one batch, and carries that
            batch number with it. The lighting switch at the top of every room changes the wood: walk the same museum in
            red, or in white.
          </p>
        </div>
        <nav className={s.index} aria-label="Rooms of this museum">
          <p className={s.indexTitle}>In these rooms</p>
          {[ROOMS.slice(2, 4), ROOMS.slice(4, 6), ROOMS.slice(6, 8)].map((group) => (
            <ul key={group[0].id}>
              {group.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => goToRoom(r.id)}>
                    <b>{r.n}</b>
                    {r.name}
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </nav>
      </article>

      <div className={cx(s.names, s.at)} style={at(176, 12, { wd: 30 })}>
        <p>
          <span className={s.deva} lang="sa">
            रक्तचन्दन
          </span>
        </p>
        <p className={s.small}>
          <i>Raktachandana</i>, red sandal. The name used in Sanskrit texts for Pterocarpus santalinus.
        </p>
        <p className={s.deva} lang="sa">
          श्वेतचन्दन
        </p>
        <p className={s.small}>
          <i>Shvetachandana</i>, white sandal. Santalum album, the fragrant one.
        </p>
      </div>

      <Frame
        p={PHOTOS.carving}
        ar={0.78}
        className={cx(s.at, s.right)}
        style={at(130, 12, { ht: 54, vw: "82%" })}
        sizes="(min-width: 900px) 44vh, 82vw"
      />
      <div className={cx(s.label, s.at)} style={at(176, 50, { wd: 28 })}>
        <h3 className={s.h3}>Carving by hand</h3>
        <p>A carver works a block of heartwood with a chisel, following the grain.</p>
      </div>
      <p className={cx(s.vinyl, s.at)} style={at(130, 71, { wd: 80 })}>
        From the heartwood.
      </p>
    </RoomShell>
  );
}

/* ======================= Room 3: The two woods ======================= */
function WoodLabel({ wood, code }: { wood: Wood; code: string }) {
  const n = WOOD_NAMES[wood];
  return (
    <>
      <h3 className={s.h3}>{n.common}</h3>
      <p className={s.latin}>{n.latin}</p>
      <p className={s.deva} lang="sa">
        {n.sa}
      </p>
      <p>Heartwood. {wood === "red" ? "Eastern Ghats, Andhra Pradesh." : "Dry forests of southern India; Mysuru craft tradition."}</p>
      <p className="mt-1">
        {wood === "red"
          ? "Deep red, dense, fine-grained; almost no scent. Regulated internationally under CITES Appendix II."
          : "Pale gold and fragrant. The oil is in the heartwood, nowhere else."}
      </p>
      <p className={cx(s.acc, "mt-2")}>Accession {code}</p>
      <button type="button" className={cx(s.link, s.lit)} onClick={() => switchWood(wood)}>
        Light the {wood} room
      </button>
      <p className={s.litOn}>This room is lit in {n.common.toLowerCase()}.</p>
    </>
  );
}

export function TwoWoods() {
  return (
    <RoomShell id="two-woods" n="3" name="The two woods" w={184}>
      <div className={s.woodPair}>
        <div className={cx(s.woodRed, "grid gap-4")}>
          <Frame
            p={PHOTOS.redChip}
            ar={0.78}
            className={s.at}
            style={at(8, 12, { ht: 56, vw: "84%" })}
            light
            dim
            sizes="(min-width: 900px) 44vh, 84vw"
          />
          <div className={cx(s.label, s.objLabel, s.at)} style={at(55, 30, { wd: 30 })}>
            <WoodLabel wood="red" code="SM.2026.001" />
          </div>
        </div>
        <div className={cx(s.woodWhite, "grid gap-4")}>
          <Frame
            p={PHOTOS.whiteLog}
            ar={0.78}
            className={cx(s.at, s.right)}
            style={at(94, 12, { ht: 56, vw: "84%" })}
            light
            dim
            sizes="(min-width: 900px) 44vh, 84vw"
          />
          <div className={cx(s.label, s.objLabel, s.at)} style={at(141, 30, { wd: 30 })}>
            <WoodLabel wood="white" code="SM.2026.002" />
          </div>
        </div>
      </div>

      <div className={cx(s.compareWrap, s.at)} style={at(8, 73, { wd: 163 })}>
        <table className={s.compare}>
          <caption className="sr-only">Red and white sandalwood compared</caption>
          <thead>
            <tr>
              <th scope="col">Wood</th>
              <th scope="col">Colour</th>
              <th scope="col">Scent</th>
              <th scope="col">Oil</th>
              <th scope="col">Grows in</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Red sandalwood</th>
              <td>Deep red, nearly black at the core</td>
              <td>Almost none</td>
              <td>Does not carry it</td>
              <td>Eastern Ghats, mainly Andhra Pradesh</td>
            </tr>
            <tr>
              <th scope="row">White sandalwood</th>
              <td>Pale gold</td>
              <td>Fragrant</td>
              <td>In the heartwood</td>
              <td>Dry forests of southern India</td>
            </tr>
          </tbody>
        </table>
      </div>
    </RoomShell>
  );
}

/* ======================= Room 4: The collection ======================= */
type Hang = { top: number; ht: number; ar: number; below?: boolean };

/** Varied hanging: tall portraits with labels beside, smaller pieces with labels below. */
export const HANG: Hang[] = [
  { top: 12, ht: 46, ar: 0.8 },
  { top: 40, ht: 34, ar: 1 },
  { top: 14, ht: 40, ar: 1.25, below: true },
  { top: 18, ht: 62, ar: 0.75 },
  { top: 34, ht: 30, ar: 0.85, below: true },
  { top: 12, ht: 44, ar: 1, below: true },
  { top: 30, ht: 44, ar: 1.3 },
  { top: 12, ht: 56, ar: 0.78 },
  { top: 38, ht: 36, ar: 0.9 },
  { top: 14, ht: 42, ar: 1.1, below: true },
  { top: 16, ht: 64, ar: 0.8 },
];

export function Exhibit({ f, wood, hang, odd }: { f: Family; wood: Wood; hang: Hang; odd?: boolean }) {
  const v = f.variants[wood];
  if (!v) return null;
  const [a, b] = v.shots;
  const n = WOOD_NAMES[wood];
  const href = `/d/04/p/${f.slug}`;
  return (
    <article
      className={s.exhibit}
      data-odd={odd ? "" : undefined}
      style={vars({ top: hang.top, dir: hang.below ? "column" : "row", align: hang.below ? "flex-start" : "flex-end" })}
    >
      <Frame
        p={a.photo}
        tone={a.tone}
        alt={b?.photo}
        altTone={b?.tone}
        ar={hang.ar}
        style={vars({ ht: hang.ht })}
        light
        sizes="(min-width: 900px) 50vh, 46vw"
      >
        <Link href={href} className={s.exhibitLink} tabIndex={-1} aria-hidden="true" />
      </Frame>
      <div className={s.label}>
        <h3 className={s.h3}>{f.name}</h3>
        <p>
          {n.common}, <span className={s.latin}>{n.latin}</span>
        </p>
        {f.edition && <p>{f.edition}</p>}
        <p className={s.note}>{v.note}</p>
        <p className={cx(s.acc, "mt-1")}>Accession {accession(f.slug, wood)}</p>
        <div className={s.priceRow}>
          <span className={s.price}>{formatINR(v.price)}</span>
          <Link href={href} className={s.link} aria-label={`View ${f.name} in ${n.common.toLowerCase()}`}>
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

const ORDER = ["objects", "beads", "powder", "gifting", "jewellery"] as const;

function Exhibits({ wood }: { wood: Wood }) {
  const list = familiesIn(wood);
  const index = new Map(list.map((f, i) => [f.slug, i]));
  return (
    <>
      {ORDER.map((key) => {
        const cat = CATEGORIES.find((x) => x.key === key)!;
        const fams = list.filter((f) => f.category === key);
        if (!fams.length) return null;
        return (
          <Fragment key={key}>
            <div className={s.cat}>
              <p className={s.catName}>{cat.label}</p>
              <p className={s.small}>{cat.line}</p>
              <p className={s.acc}>{fams.length === 1 ? "One piece" : `${capital(words(fams.length))} pieces`}</p>
              <ul className={s.catList}>
                {fams.map((f) => (
                  <li key={f.slug}>{f.name}</li>
                ))}
              </ul>
            </div>
            {fams.map((f, j) => (
              <Exhibit key={f.slug} f={f} wood={wood} hang={HANG[(index.get(f.slug) ?? 0) % HANG.length]} odd={j % 2 === 1} />
            ))}
          </Fragment>
        );
      })}
    </>
  );
}

export function RoomSheet({ wood }: { wood: Wood }) {
  return (
    <ol>
      {familiesIn(wood).map((f) => (
        <li key={f.slug}>
          <Link href={`/d/04/p/${f.slug}`}>
            <span>{f.name}</span>
            <span>{formatINR(f.variants[wood]!.price)}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function Collection() {
  const red = familiesIn("red").length;
  const white = familiesIn("white").length;
  return (
    <RoomShell id="collection" n="4" name="The collection">
      <div className={s.gallery}>
        <div className={s.galleryIntro}>
          <h2 className={s.h2}>The collection</h2>
          <div className={cx(s.body, "mt-[3vh]")}>
            <p>
              <WT
                red={`${capital(words(red))} pieces in red sandalwood`}
                white={`${capital(words(white))} pieces in white sandalwood`}
              />
              , hung in the order of the workshop: everyday objects, beads, powder and oil, gifting, then jewellery.
            </p>
          </div>
          <p className={cx(s.small, "mt-4")}>
            Each frame has its own picture light. Point at a frame, or tab to its label, and the photograph turns to show
            the piece another way.
          </p>
          <div className={s.sheet}>
            <p className={s.sheetTitle}>On these walls</p>
            <W red={<RoomSheet wood="red" />} white={<RoomSheet wood="white" />} />
          </div>
        </div>

        <W red={<Exhibits wood="red" />} white={<Exhibits wood="white" />} />

        <div className={s.galleryEnd}>
          <W
            red={
              <>
                <p className={s.h3}>{capital(words(white))} pieces in the white room</p>
                <p className={s.small}>
                  White sandalwood adds heartwood oil, which red sandalwood does not carry. Same walls, other wood.
                </p>
                <button type="button" className={s.btnLine} onClick={() => switchWood("white")}>
                  Light the white room
                </button>
              </>
            }
            white={
              <>
                <p className={s.h3}>{capital(words(red))} pieces in the red room</p>
                <p className={s.small}>
                  Red sandalwood is denser, darker and almost without scent. Same walls, other wood.
                </p>
                <button type="button" className={s.btnLine} onClick={() => switchWood("red")}>
                  Light the red room
                </button>
              </>
            }
          />
        </div>
      </div>
    </RoomShell>
  );
}

