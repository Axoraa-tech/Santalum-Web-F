"use client";

import Link from "next/link";
import { Fragment } from "react";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, featured, productsFor, priceLabel, type Product } from "@/lib/shop/products";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { switchWood, type Wood } from "@/lib/wood";
import { s } from "./cls";
import { platesOf } from "./plates";
import { accession, countIn, goToRoom, other, ROOMS, shopHref } from "./store";
import { Rating } from "./Reviews";
import { at, capital, cx, Frame, RoomShell, vars, words } from "./ui";

/* ======================= Room 1: Entrance ======================= */
const ENTRANCE: Record<
  Wood,
  {
    title: string;
    paras: string[];
    walk: [string, string];
    big: { p: PhotoRef; name: string; text: string };
    vinyl: string;
    small: { p: PhotoRef; name: string; text: string };
  }
> = {
  red: {
    title: "Raktachandan, the red heartwood",
    paras: [
      CONTENT.red.hero.sub,
      "This is the red room of Santalum Maison: colour, weight and the lathe, from the dry hills of the Eastern Ghats to the 2011 Vault.",
    ],
    walk: ["Scroll down to walk through nine red rooms.", "Nine red rooms. Scroll, swipe or use the arrow keys to walk."],
    big: {
      p: CONTENT.red.hero.photo,
      name: "End grain, red heartwood",
      text: "The close grain of Pterocarpus santalinus. The red deepens toward black at the core, and the slower the tree grew, the deeper it goes.",
    },
    vinyl: CONTENT.red.hero.title,
    small: {
      p: PHOTOS.malaHand,
      name: "A mala in the hand",
      text: "An old hand on a string of red beads. In this house we photograph hands and the work, not faces.",
    },
  },
  white: {
    title: "Srigandha, the fragrant heartwood",
    paras: [
      CONTENT.white.hero.sub,
      "This is the white room of Santalum Maison: oil, attar, chandan and Mysuru carving, from the temple towns of Karnataka to the 2011 Reserve.",
    ],
    walk: ["Scroll down to walk through nine white rooms.", "Nine white rooms. Scroll, swipe or use the arrow keys to walk."],
    big: {
      p: CONTENT.white.hero.photo,
      name: "A cut log, heartwood and sapwood",
      text: "Only the darker heartwood carries the oil. The pale ring of sapwood has no scent, and we set it aside.",
    },
    vinyl: CONTENT.white.hero.title,
    small: {
      p: PHOTOS.diyaHands,
      name: "A lamp for the puja",
      text: "Held in two hands at the start of a puja, where fresh chandan paste is laid beside the flame.",
    },
  },
};

function EntranceWood({ wood }: { wood: Wood }) {
  const e = ENTRANCE[wood];
  return (
    <>
      <div className={s.at} style={at(7, 19, { wd: 33 })}>
        <h2 className={s.h3}>{e.title}</h2>
        <div className={cx(s.body, "mt-3")}>
          {e.paras.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <Link href="/d/04/shop" className={cx(s.btn, "mt-5")}>
          {CONTENT[wood].hero.cta}
        </Link>
        <p className={s.walk}>
          <span className={s.walkLine} aria-hidden="true" />
          <span className={s.hideH}>{e.walk[0]}</span>
          <span className={s.onlyH}>{e.walk[1]}</span>
        </p>
      </div>

      <Frame
        p={e.big.p}
        ar={0.72}
        className={cx(s.at, s.right)}
        style={at(150, 13, { ht: 58, vw: "78%" })}
        priority
        sizes="(min-width: 900px) 44vh, 80vw"
      />
      <div className={cx(s.label, s.plaque, s.at)} style={at(196, 50, { wd: 25 })}>
        <h3 className={s.h3}>{e.big.name}</h3>
        <p>{e.big.text}</p>
        <p className={s.acc}>Photograph, plate 1</p>
      </div>

      <p className={cx(s.vinyl, s.at)} style={at(196, 12, { wd: 52 })}>
        {e.vinyl}
      </p>

      <Frame p={e.small.p} ar={0.8} className={s.at} style={at(256, 28, { ht: 38, vw: "64%" })} sizes="(min-width: 900px) 32vh, 64vw" />
      <div className={cx(s.label, s.plaque, s.at)} style={at(256, 70, { wd: 34 })}>
        <h3 className={s.h3}>{e.small.name}</h3>
        <p>{e.small.text}</p>
      </div>
    </>
  );
}

export function Entrance() {
  return (
    <RoomShell room={ROOMS[0]} w={300} className={s.entrance}>
      <W red={<EntranceWood wood="red" />} white={<EntranceWood wood="white" />} />
      <h1 className={s.giant} style={vars({ x: 44 })} data-drift="0.2" aria-label="Santalum">
        {"Santalum".split("").map((ch, i) => (
          <span key={i} style={vars({ i })} aria-hidden="true">
            {ch}
          </span>
        ))}
      </h1>
    </RoomShell>
  );
}

/* ======================= Room 2: Wall text ======================= */
const WALL: Record<
  Wood,
  { title: string; names: { text: string; lang: string; note: string }[]; frame: { p: PhotoRef; tone?: "red"; name: string; text: string } }
> = {
  red: {
    title: "A dense red wood",
    names: [
      { text: CONTENT.red.sanskrit, lang: "sa", note: "Raktachandana, red sandal: the Sanskrit name for Pterocarpus santalinus." },
      { text: CONTENT.red.kannada, lang: "kn", note: "The same name in Kannada. At home it is simply raktachandan." },
    ],
    frame: {
      p: PHOTOS.turned,
      tone: "red",
      name: "Turned, not carved",
      text: "Beads, bowls and bangles go on the lathe. The wood is dense enough to take a fine edge and keep it for years.",
    },
  },
  white: {
    title: "A fragrant wood",
    names: [
      { text: CONTENT.white.sanskrit, lang: "sa", note: "Shvetachandana, white sandal: the Sanskrit name for Santalum album." },
      { text: CONTENT.white.kannada, lang: "kn", note: "Srigandha, the Kannada name. Most homes in the south simply say chandan." },
    ],
    frame: {
      p: PHOTOS.carving,
      name: "Carved in Mysuru",
      text: "A carver follows the grain of a white heartwood block. Fans, figures and boxes are still carved this way in Mysuru.",
    },
  },
};

function WallWood({ wood }: { wood: Wood }) {
  const w = WALL[wood];
  const ct = CONTENT[wood];
  return (
    <>
      <article className={cx(s.intro, s.at)} style={at(8, 10, { wd: 112 })}>
        <h2 className={s.h2}>{w.title}</h2>
        <div className={cx(s.essay, s.body)}>
          {ct.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p>{ct.regulation}</p>
        </div>
        <nav className={s.index} aria-label={`Rooms of the ${wood} museum`}>
          <p className={s.indexTitle}>{wood === "red" ? "In the red rooms" : "In the white rooms"}</p>
          {[ROOMS.slice(2, 4), ROOMS.slice(4, 6), ROOMS.slice(6, 8)].map((group) => (
            <ul key={group[0].id}>
              {group.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => goToRoom(r.id)}>
                    <b>{r.n}</b>
                    {r[wood]}
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </nav>
      </article>

      <div className={cx(s.names, s.at)} style={at(176, 12, { wd: 30 })}>
        {w.names.map((n) => (
          <Fragment key={n.text}>
            <p className={s.deva} lang={n.lang}>
              {n.text}
            </p>
            <p className={s.small}>{n.note}</p>
          </Fragment>
        ))}
      </div>

      <Frame
        p={w.frame.p}
        tone={w.frame.tone}
        ar={0.78}
        className={cx(s.at, s.right)}
        style={at(130, 12, { ht: 54, vw: "82%" })}
        sizes="(min-width: 900px) 44vh, 82vw"
      />
      <div className={cx(s.label, s.at)} style={at(176, 50, { wd: 28 })}>
        <h3 className={s.h3}>{w.frame.name}</h3>
        <p>{w.frame.text}</p>
      </div>
      <p className={cx(s.vinyl, s.at)} style={at(130, 71, { wd: 80 })}>
        {ct.oneLine}
      </p>
    </>
  );
}

export function WallText() {
  return (
    <RoomShell room={ROOMS[1]} w={214}>
      <W red={<WallWood wood="red" />} white={<WallWood wood="white" />} />
    </RoomShell>
  );
}

/* ======================= Room 3: Red beside white ======================= */
function WoodLabel({ wood }: { wood: Wood }) {
  const ct = CONTENT[wood];
  return (
    <>
      <h3 className={s.h3}>{ct.name}</h3>
      <p className={s.latin}>{ct.latin}</p>
      <p className={s.deva} lang="sa">
        {ct.sanskrit}
      </p>
      <p>Heartwood. {ct.origin.region}.</p>
      <p className="mt-1">{ct.oneLine}</p>
      <p className={cx(s.acc, "mt-2")}>Accession SM.2026.00{wood === "red" ? 1 : 2}</p>
      <button type="button" className={cx(s.link, s.lit)} onClick={() => switchWood(wood)}>
        Light the {wood} room
      </button>
      <p className={s.litOn}>This room is lit for {ct.name.toLowerCase()}.</p>
    </>
  );
}

const FACT_ROWS = ["Grows in", "Colour", "Scent", "Used for"];
const fact = (w: Wood, label: string) => CONTENT[w].facts.find((f) => f.label === label)?.value ?? "";

function Compare({ wood }: { wood: Wood }) {
  const order: Wood[] = [wood, other(wood)];
  return (
    <div className={cx(s.compareWrap, s.at)} style={at(8, 72, { wd: 163 })}>
      <p className={s.compareHead}>
        {wood === "red"
          ? "Read from the red side: the wood lit in this room comes first."
          : "Read from the white side: the wood lit in this room comes first."}
      </p>
      <table className={s.compare}>
        <caption className="sr-only">{wood === "red" ? "Red sandalwood compared with white" : "White sandalwood compared with red"}</caption>
        <thead>
          <tr>
            <th scope="col">Wood</th>
            {FACT_ROWS.map((l) => (
              <th key={l} scope="col">
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {order.map((w) => (
            <tr key={w} data-lit={w === wood ? "" : undefined}>
              <th scope="row">{CONTENT[w].name}</th>
              {FACT_ROWS.map((l) => (
                <td key={l}>{fact(w, l)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TwoWoods() {
  return (
    <RoomShell room={ROOMS[2]} w={184}>
      <div className={s.woodPair}>
        <div className={cx(s.woodRed, "grid gap-4")}>
          <Frame
            p={CONTENT.red.hero.photoAlt}
            ar={0.78}
            className={s.at}
            style={at(8, 12, { ht: 56, vw: "84%" })}
            light
            dim
            sizes="(min-width: 900px) 44vh, 84vw"
          />
          <div className={cx(s.label, s.objLabel, s.at)} style={at(55, 26, { wd: 30 })}>
            <WoodLabel wood="red" />
          </div>
        </div>
        <div className={cx(s.woodWhite, "grid gap-4")}>
          <Frame
            p={CONTENT.white.hero.photo}
            ar={0.78}
            className={cx(s.at, s.right)}
            style={at(94, 12, { ht: 56, vw: "84%" })}
            light
            dim
            sizes="(min-width: 900px) 44vh, 84vw"
          />
          <div className={cx(s.label, s.objLabel, s.at)} style={at(141, 26, { wd: 30 })}>
            <WoodLabel wood="white" />
          </div>
        </div>
      </div>
      <W red={<Compare wood="red" />} white={<Compare wood="white" />} />
    </RoomShell>
  );
}

/* ======================= Room 4: The gallery ======================= */
type Hang = { top: number; ht: number; ar: number; below?: boolean };

/** Varied hanging: tall portraits with labels beside, smaller pieces with labels below. */
export const HANG: Hang[] = [
  { top: 12, ht: 46, ar: 0.8 },
  { top: 40, ht: 34, ar: 1 },
  { top: 9, ht: 36, ar: 1.25, below: true },
  { top: 18, ht: 62, ar: 0.75 },
  { top: 18, ht: 28, ar: 0.85, below: true },
  { top: 9, ht: 36, ar: 1, below: true },
  { top: 30, ht: 44, ar: 1.3 },
  { top: 12, ht: 56, ar: 0.78 },
];

export function editionLine(p: Product) {
  return p.edition ? `Edition of ${p.edition.size}. ${capital(words(p.edition.left))} remain.` : null;
}

export function Exhibit({ p, hang, odd }: { p: Product; hang: Hang; odd?: boolean }) {
  const [a, b] = platesOf(p);
  const ct = CONTENT[p.wood];
  const href = `/d/04/p/${p.slug}`;
  return (
    <article
      className={s.exhibit}
      data-odd={odd ? "" : undefined}
      style={vars({ top: hang.top, dir: hang.below ? "column" : "row", align: hang.below ? "flex-start" : "flex-end" })}
    >
      <Frame
        p={a.photo}
        tone={a.tone}
        crop={a.crop}
        alt={b?.photo}
        altTone={b?.tone}
        altCrop={b?.crop}
        ar={hang.ar}
        style={vars({ ht: hang.ht })}
        light
        sizes="(min-width: 900px) 50vh, 46vw"
      >
        <Link href={href} className={s.exhibitLink} tabIndex={-1} aria-hidden="true" />
      </Frame>
      <div className={s.label}>
        <h3 className={s.h3}>{p.name}</h3>
        <p>
          {ct.name}, <span className={s.latin}>{ct.latin}</span>
        </p>
        {editionLine(p) && <p className={s.edLine}>{editionLine(p)}</p>}
        <p className={s.note}>{p.short}</p>
        <Rating slug={p.slug} />
        <p className={cx(s.acc, "mt-1")}>Accession {accession(p)}</p>
        <div className={s.priceRow}>
          <span className={s.price}>{priceLabel(p)}</span>
          <Link href={href} className={s.link} aria-label={`View ${p.name}`}>
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

const GALLERY: Record<Wood, { title: string; body: (n: number, all: number) => string; hint: string; invite: string; inviteText: string }> = {
  red: {
    title: "The red gallery",
    body: (n, all) =>
      `${capital(words(n))} of the ${all} red sandalwood pieces hang here: beads first, then the desk and the home, the powder, a box and the jewellery. The rest are in the shop.`,
    hint: "Each frame has its own picture light. Point at a frame, or tab to its label, and the photograph turns to show the piece another way.",
    invite: "The white room hangs oil, attar and Mysuru carving",
    inviteText: "Same walls, other wood. Nothing in it is the same piece.",
  },
  white: {
    title: "The fragrant gallery",
    body: (n, all) =>
      `${capital(words(n))} of the ${all} white sandalwood pieces hang here: the oils first, then the incense and the chandan stone, the beads and a Mysuru fan. The rest are in the shop.`,
    hint: "Each frame is lit from above. Point at a frame, or tab to its label, and a second photograph comes up, the way a vitrine is lit from two sides.",
    invite: "The red room hangs beads, turned objects and the Vault",
    inviteText: "Same walls, other wood. Nothing in it is the same piece.",
  },
};

function Gallery({ wood }: { wood: Wood }) {
  const list = featured(wood);
  const all = productsFor(wood).length;
  const g = GALLERY[wood];
  const cats = CATEGORIES[wood].filter((cat) => list.some((p) => p.category === cat.id));
  const hung = new Map(cats.flatMap((cat) => list.filter((p) => p.category === cat.id)).map((p, i) => [p.slug, i]));
  return (
    <>
      <div className={s.galleryIntro}>
        <h2 className={s.h2}>{g.title}</h2>
        <div className={cx(s.body, "mt-[3vh]")}>
          <p>{g.body(list.length, all)}</p>
        </div>
        <p className={cx(s.small, "mt-4")}>{g.hint}</p>
        <div className={s.sheet}>
          <p className={s.sheetTitle}>{wood === "red" ? "The red shop, by department" : "The white shop, by department"}</p>
          <ol>
            {CATEGORIES[wood].map((cat) => (
              <li key={cat.id}>
                <Link href={shopHref(cat.id)}>
                  <span>{cat.label}</span>
                  <span>{countIn(wood, cat.id)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {cats.map((cat) => {
        const ps = list.filter((p) => p.category === cat.id);
        const n = countIn(wood, cat.id);
        return (
          <Fragment key={cat.id}>
            <div className={s.cat}>
              <p className={s.catName}>{cat.label}</p>
              <p className={s.small}>{cat.line}</p>
              <p className={s.acc}>
                {ps.length === 1 ? "One" : capital(words(ps.length))} on the wall, {n} in the shop
              </p>
              <Link href={shopHref(cat.id)} className={cx(s.link, "mt-1")}>
                All {n} in {cat.label.toLowerCase()}
              </Link>
            </div>
            {ps.map((p, j) => (
              <Exhibit key={p.slug} p={p} hang={HANG[(hung.get(p.slug) ?? 0) % HANG.length]} odd={j % 2 === 1} />
            ))}
          </Fragment>
        );
      })}

      <div className={s.shopDoor}>
        <div className={s.doorFrame}>
          <p className={s.doorSign}>
            <span className={s.exitDoor} aria-hidden="true" />
            {wood === "red" ? "The red shop" : "The white shop"}
          </p>
          <p className={s.doorBig}>
            All {all} {wood} sandalwood pieces
          </p>
          <p className={s.small}>
            {CATEGORIES[wood].length} departments, every piece with its price, its options and its record.
          </p>
          <Link href="/d/04/shop" className={s.btn}>
            Go through to the shop
          </Link>
        </div>
        <div className={s.doorInvite}>
          <p className={s.h3}>{g.invite}</p>
          <p className={s.small}>{g.inviteText}</p>
          <button type="button" className={s.link} onClick={() => switchWood(other(wood))}>
            Light the {other(wood)} room
          </button>
        </div>
      </div>
    </>
  );
}

export function Collection() {
  return (
    <RoomShell room={ROOMS[3]}>
      <div className={s.gallery}>
        <W red={<Gallery wood="red" />} white={<Gallery wood="white" />} />
      </div>
    </RoomShell>
  );
}
