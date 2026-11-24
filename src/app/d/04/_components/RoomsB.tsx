"use client";

import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { W, WT } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { CATEGORIES, FAMILIES, formatINR, getFamily, WOOD_NAMES, type CategoryKey, type Tone } from "@/lib/catalog";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { useWood, type Wood } from "@/lib/wood";
import { s } from "./cls";
import { accession, familiesIn, goToRoom, openLedger, ROOMS } from "./store";
import { at, cx, Frame, RoomShell } from "./ui";

/* ======================= Room 5: Making ======================= */
type Shot = { p: PhotoRef; tone?: Tone };
const STEPS: { name: string; text: string; red: Shot; white: Shot }[] = [
  {
    name: "Select",
    text: "The artisan reads the grain before the first cut and chooses the part of the heartwood each piece will come from.",
    red: { p: PHOTOS.redGrain },
    white: { p: PHOTOS.whiteLog },
  },
  {
    name: "Shape",
    text: "Cut, carved or turned by hand, following the grain instead of working against it.",
    red: { p: PHOTOS.carving },
    white: { p: PHOTOS.carving },
  },
  {
    name: "Finish",
    text: "Sanded smooth, then rubbed with natural oil, and beeswax where the piece will be handled every day.",
    red: { p: PHOTOS.turned, tone: "red" },
    white: { p: PHOTOS.woodRounds },
  },
  {
    name: "Inspect",
    text: "Checked in daylight for cracks, fit and finish, then given its batch number and entered in the record.",
    red: { p: PHOTOS.braceletClose },
    white: { p: PHOTOS.beadsPale },
  },
  {
    name: "Present",
    text: "Wrapped in cotton or linen, boxed, and sent with its record, so you know what you hold.",
    red: { p: PHOTOS.boxCarved },
    white: { p: PHOTOS.giftLinen },
  },
];

export function Making() {
  return (
    <RoomShell id="making" n="5" name="Making" w={384}>
      <div className={s.at} style={at(8, 14, { wd: 60 })}>
        <h2 className={s.h2}>Making</h2>
        <p className={cx(s.vinyl, s.vinylL, "mt-[3vh]")}>
          Every piece begins as a reading. The artisan studies the grain before the first cut. The wood decides what it
          will become. The hand follows.
        </p>
      </div>
      <p className={cx(s.inscription, s.at)} style={at(8, 70, { wd: 56 })}>
        The same five steps, in this order, for every piece in the house, from a key fob to a Vault cuff.
      </p>

      <ol className={cx(s.frieze, s.at)} style={at(76, 12, { ht: 74 })}>
        {STEPS.map((st, i) => (
          <li key={st.name} className={s.step}>
            <div className={s.stepPhoto}>
              <W
                red={
                  <div className={s.par} data-par="">
                    <Photo p={st.red.p} tone={st.red.tone} sizes="(min-width: 900px) 58vh, 40vw" />
                  </div>
                }
                white={
                  <div className={s.par} data-par="">
                    <Photo p={st.white.p} tone={st.white.tone} sizes="(min-width: 900px) 58vh, 40vw" />
                  </div>
                }
              />
            </div>
            <div className={s.stepText}>
              <span className={s.stepNum} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={s.stepName}>
                <span className="sr-only">Step {i + 1}: </span>
                {st.name}
              </h3>
              <p className={s.small}>{st.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </RoomShell>
  );
}

/* ======================= Room 6: Provenance archive ======================= */
type Drawer = { id: string; code: string; name: string };
const DRAWERS: Drawer[] = [
  { id: "r26", code: "R-26", name: "Red sandalwood, 2026" },
  { id: "w26", code: "W-26", name: "White sandalwood, 2026" },
  { id: "vault", code: "2011", name: "The Vault registry" },
  { id: "objects", code: "Objects", name: "Everyday objects" },
  { id: "beads", code: "Beads", name: "Beads and malas" },
  { id: "powder", code: "Powder", name: "Powder and oil" },
  { id: "gifting", code: "Gifting", name: "Boxes" },
  { id: "jewellery", code: "Jewellery", name: "Pendants, cuffs" },
  { id: "lab", code: "Lab", name: "Oil documentation" },
];

const EXAMPLES: Record<"r26" | "w26", { batch: string; slug: string; wood: Wood; origin: string; artisan: string; date: string }> = {
  r26: { batch: "R-26-0412", slug: "japa-mala", wood: "red", origin: "Eastern Ghats, Andhra Pradesh", artisan: "K. R.", date: "14 November 2026" },
  w26: { batch: "W-26-0187", slug: "heartwood-powder", wood: "white", origin: "Southern India", artisan: "S. M.", date: "21 November 2026" },
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

function Card({ id }: { id: string }) {
  if (id === "r26" || id === "w26") {
    const e = EXAMPLES[id];
    const f = getFamily(e.slug)!;
    const n = WOOD_NAMES[e.wood];
    return (
      <>
        <span className={s.stamp}>Example record</span>
        <p className={s.acc}>Batch record</p>
        <p className={s.cardCode}>{e.batch}</p>
        <Rows
          rows={[
            ["Piece", f.name],
            [
              "Wood",
              <>
                {n.common}, <span className={s.latin}>{n.latin}</span>
              </>,
            ],
            ["Origin", e.origin],
            ["Batch", e.batch],
            ["Artisan", e.artisan],
            ["Finished", e.date],
          ]}
        />
        <p className={s.cardNote}>
          An example of the record that travels with every piece. Yours carries its own batch, artisan and date.
        </p>
      </>
    );
  }
  if (id === "vault") {
    const f = getFamily("vault-cuff")!;
    return (
      <>
        <p className={s.acc}>Registry</p>
        <p className={s.cardCode}>2011</p>
        <Rows
          rows={[
            ["Edition", "21 cuffs, numbered"],
            ["Wood", "Aged heartwood sourced in 2011"],
            ["Each entry", "Number, harvest origin, the artisan's name, the date it left our hands"],
            ["Comes with", f.details.find((d) => d.label === "Comes with")?.value ?? ""],
          ]}
        />
        <Link href="/d/04/p/vault-cuff" className={cx(s.link, "mt-4")}>
          See the cuff
        </Link>
      </>
    );
  }
  if (id === "lab") {
    return (
      <>
        <p className={s.acc}>Documentation</p>
        <p className={s.cardCode}>Heartwood oil</p>
        <Rows
          rows={[
            ["Vessel", "Amber glass vial, sealed"],
            ["Papers", "Batch record; lab report where available"],
            ["Wood", "White sandalwood only. Red sandalwood does not carry this oil."],
          ]}
        />
        <Link href="/d/04/p/heartwood-oil" className={cx(s.link, "mt-4")}>
          See the oil
        </Link>
      </>
    );
  }
  const cat = CATEGORIES.find((c) => c.key === (id as CategoryKey))!;
  const fams = FAMILIES.filter((f) => f.category === cat.key);
  return (
    <>
      <p className={s.acc}>Drawer of records</p>
      <p className={s.cardCode}>{cat.label}</p>
      <Rows
        rows={fams.map((f): [string, ReactNode] => [
          f.name,
          <Link key={f.slug} href={`/d/04/p/${f.slug}`} className={s.link}>
            {[f.variants.red && `Red ${formatINR(f.variants.red.price)}`, f.variants.white && `White ${formatINR(f.variants.white.price)}`]
              .filter(Boolean)
              .join(", ")}
          </Link>,
        ])}
      />
      <p className={s.cardNote}>
        Batch numbers begin with the wood and the year: R-26 for red sandalwood finished in 2026, W-26 for white.
      </p>
    </>
  );
}

export function Provenance() {
  const wood = useWood();
  const [picked, setPicked] = useState<string | null>(null);
  const shown = picked ?? (wood === "white" ? "w26" : "r26");
  const cardId = useId();

  return (
    <RoomShell id="provenance" n="6" name="Provenance archive" w={236}>
      <div className={s.at} style={at(8, 14, { wd: 50 })}>
        <h2 className={s.h2}>Know what you hold</h2>
        <div className={cx(s.body, "mt-[3vh]")}>
          <p>
            Every piece leaves with a batch record: what it is, which wood, where the wood came from, the batch, the
            artisan&apos;s initials and the day it was finished.
          </p>
        </div>
        <p className={cx(s.inscription, "mt-[2.4vh]")}>If there is evidence, we show it. If there isn&apos;t, we don&apos;t invent it.</p>
        <p className={cx(s.small, "mt-[2.4vh]")}>Open a drawer to read what it holds.</p>
      </div>

      <div className={cx(s.cabinet, s.at)} style={at(64, 14, { wd: 92, ht: 72 })}>
        <span className={s.cabinetTop} aria-hidden="true" />
        <div className={s.drawers} role="group" aria-label="Archive drawers">
          {DRAWERS.map((d) => (
            <button
              key={d.id}
              type="button"
              className={s.drawer}
              aria-pressed={shown === d.id}
              aria-controls={cardId}
              onClick={() => setPicked(d.id)}
            >
              <span className={s.holder}>
                <span className={s.holderCode}>{d.code}</span>
                <span className={s.holderName}>{d.name}</span>
              </span>
              <span className={s.pull} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className={s.cabinetBase} aria-hidden="true" />
      </div>

      <div id={cardId} className={cx(s.card, s.at)} style={at(166, 14, { wd: 62 })} key={shown} aria-live="polite">
        <Card id={shown} />
      </div>
    </RoomShell>
  );
}

/* ======================= Room 7: The 2011 Vault ======================= */
export function Vault() {
  const cuff = getFamily("vault-cuff")!;
  return (
    <RoomShell id="vault" n="7" name="The 2011 Vault" w={286} className={s.vaultRoom}>
      <div className={s.at} style={at(8, 14, { wd: 50 })}>
        <h2 className={s.h2}>The 2011 Vault</h2>
        <div className={cx(s.body, "mt-[3vh]")}>
          <p>
            Twenty-one cuffs, turned from aged heartwood sourced in 2011. The wood waited fifteen years for the right
            hands and the right moment.
          </p>
          <p>
            Each cuff is entered in our provenance registry with its number, harvest origin, the artisan&apos;s name and
            the date it left our hands.
          </p>
        </div>
        <div className={s.priceRow}>
          <span className={s.price}>
            <WT red={formatINR(cuff.variants.red!.price)} white={formatINR(cuff.variants.white!.price)} />
          </span>
          <Link href="/d/04/p/vault-cuff" className={s.link}>
            View the cuff
          </Link>
        </div>
        <dl className={cx(s.details, "mt-[3vh]")}>
          {cuff.details.map((d) => (
            <div key={d.label}>
              <dt>{d.label}</dt>
              <dd>{d.value}</dd>
            </div>
          ))}
          <div>
            <dt>Wood sourced</dt>
            <dd>2011</dd>
          </div>
        </dl>
      </div>

      <div className={cx(s.vitrine, s.at)} style={at(64, 12, { wd: 46 })}>
        <div className={s.glass}>
          <span className={s.pool} aria-hidden="true" />
          <div className={s.glassPhoto}>
            <W
              red={
                <div className={s.par} data-par="">
                  <Photo p={PHOTOS.turned} tone="red" sizes="(min-width: 900px) 40vh, 80vw" />
                </div>
              }
              white={
                <div className={s.par} data-par="">
                  <Photo p={PHOTOS.turned} sizes="(min-width: 900px) 40vh, 80vw" />
                </div>
              }
            />
          </div>
        </div>
        <p className={s.vPlinth}>
          <b>No. 1 to 21</b>
          The 2011 Vault Cuff, <WT red="aged red heartwood" white="aged white heartwood" />
        </p>
      </div>

      <p className={cx(s.vinyl, s.at)} style={at(124, 12, { wd: 150 })}>
        21 places. One cuff for each.
      </p>
      <ol className={cx(s.plinths, s.at)} style={at(124, 24, { ht: 64 })} aria-label="Twenty-one plinths, one for each numbered cuff">
        {Array.from({ length: 21 }, (_, i) => (
          <li key={i} className={s.plinth}>
            <span className={s.beam} data-lamp="" aria-hidden="true" />
            <span className={s.lampHead} aria-hidden="true" />
            <span className={s.block}>{i + 1}</span>
            <span className={s.plinthTip} aria-hidden="true">
              No. {i + 1} of 21
            </span>
          </li>
        ))}
      </ol>
    </RoomShell>
  );
}

/* ======================= Room 8: Gifting ======================= */
const TIERS: { name: string; test: (p: number) => boolean }[] = [
  { name: `Under ${formatINR(2500)}`, test: (p) => p < 2500 },
  { name: `${formatINR(2500)} to ${formatINR(7500)}`, test: (p) => p >= 2500 && p <= 7500 },
  { name: `Above ${formatINR(7500)}`, test: (p) => p > 7500 },
];

function Tiers({ wood }: { wood: Wood }) {
  const list = familiesIn(wood).sort((a, b) => a.variants[wood]!.price - b.variants[wood]!.price);
  return (
    <>
      {TIERS.map((t) => (
        <div key={t.name} className={s.tier}>
          <p className={s.tierName}>{t.name}</p>
          <ul>
            {list
              .filter((f) => t.test(f.variants[wood]!.price))
              .map((f) => (
                <li key={f.slug}>
                  <Link href={`/d/04/p/${f.slug}`}>
                    <span>{f.name}</span>
                    <span>{formatINR(f.variants[wood]!.price)}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export function Gifting() {
  const box = getFamily("presentation-box")!;
  return (
    <RoomShell id="gifting" n="8" name="Gifting" w={236}>
      <div className={s.at} style={at(8, 13, { wd: 72 })}>
        <h2 className={s.h2}>Give something that remains</h2>
        <div className={cx(s.body, "mt-[3vh]")}>
          <p>
            Any order can leave as a gift: wrapped in linen, with your card written by hand and no prices inside the
            parcel.
          </p>
          <p>
            For weddings, festivals and company occasions, presentation boxes can be filled with a mala, powder or oil,
            each with its own record.
          </p>
        </div>
      </div>
      <div className={cx(s.tiers, s.at)} style={at(8, 52, { wd: 72 })}>
        <W red={<Tiers wood="red" />} white={<Tiers wood="white" />} />
      </div>

      <Frame
        p={PHOTOS.giftLinen}
        ar={1.3}
        className={s.at}
        style={at(90, 14, { ht: 50 })}
        sizes="(min-width: 900px) 66vh, 92vw"
      />
      <div className={cx(s.label, s.at)} style={at(90, 69, { wd: 60 })}>
        <h3 className={s.h3}>Gift wrap</h3>
        <p>Linen wrap and a handwritten card, chosen at the register for {formatINR(350)}. Prices stay out of the parcel.</p>
      </div>

      <W
        red={
          <Frame
            p={PHOTOS.boxCarved}
            ar={0.8}
            className={cx(s.at, s.right)}
            style={at(162, 24, { ht: 42, vw: "70%" })}
            light
            sizes="(min-width: 900px) 36vh, 70vw"
          />
        }
        white={
          <Frame
            p={PHOTOS.boxes}
            ar={0.8}
            className={cx(s.at, s.right)}
            style={at(162, 24, { ht: 42, vw: "70%" })}
            light
            sizes="(min-width: 900px) 36vh, 70vw"
          />
        }
      />
      <div className={cx(s.label, s.at)} style={at(200, 42, { wd: 28 })}>
        <h3 className={s.h3}>{box.name}</h3>
        <p>{box.summary}</p>
        <p className={cx(s.acc, "mt-1")}>
          Accession <WT red={accession(box.slug, "red")} white={accession(box.slug, "white")} />
        </p>
        <div className={s.priceRow}>
          <span className={s.price}>
            <WT red={formatINR(box.variants.red!.price)} white={formatINR(box.variants.white!.price)} />
          </span>
          <Link href={`/d/04/p/${box.slug}`} className={s.link}>
            View
          </Link>
        </div>
      </div>
    </RoomShell>
  );
}

/* ======================= Exit ======================= */
function CircleSignup() {
  const [done, setDone] = useState(false);
  const id = useId();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(true);
  };
  if (done)
    return (
      <p className={cx(s.body, "mt-4")} role="status">
        Thank you. You are on the list for the Circle&apos;s next letter. This preview does not send anything yet.
      </p>
    );
  return (
    <form className={s.circleForm} onSubmit={submit}>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input id={id} type="email" required autoComplete="email" placeholder="Your email address" />
      <button type="submit" className={s.btn}>
        Join the Circle
      </button>
    </form>
  );
}

export function Exit() {
  const walk = (id: string) => goToRoom(id);
  return (
    <RoomShell id="exit" n="Exit" name="Exit" w={146}>
      <p className={cx(s.h2, s.at, "italic")} style={at(8, 11, { wd: 100 })}>
        Objects time cannot repeat.
      </p>

      <div className={s.at} style={at(8, 29, { wd: 46 })}>
        <h2 className={s.h3}>The Santalum Circle</h2>
        <p className={cx(s.body, "mt-2")}>
          Letters a few times a year: new pieces before they are hung, Vault numbers as they are made, and notes from the
          workshop.
        </p>
        <CircleSignup />
        <p className={cx(s.small, "mt-2")}>Front-end preview. Nothing is sent yet.</p>
      </div>

      <footer className={s.at} style={at(60, 29, { wd: 48 })}>
        <div className={s.foot}>
          <div>
            <h3>Rooms</h3>
            <ul>
              {ROOMS.slice(0, 8).map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => walk(r.id)}>
                    {r.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Pieces</h3>
            <ul>
              {["japa-mala", "bead-bracelet", "heartwood-oil", "presentation-box", "grain-pendant", "vault-cuff"].map((slug) => (
                <li key={slug}>
                  <Link href={`/d/04/p/${slug}`}>{getFamily(slug)!.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Visit</h3>
            <ul>
              <li>
                <button type="button" onClick={openLedger}>
                  Acquisitions
                </button>
              </li>
              <li>
                <Link href="/d/04/checkout">The register</Link>
              </li>
              <li className={s.mute}>Delivery across India is complimentary.</li>
              <li className={s.mute}>Returns within 14 days, unused. Numbered editions are final.</li>
            </ul>
          </div>
        </div>
      </footer>

      <p className={cx(s.exitSign, s.at)} style={at(116, 6.5)}>
        <span className={s.exitDoor} aria-hidden="true" />
        Exit
      </p>
      <div className={cx(s.doorway, s.at, s.right)} style={at(116, 13, { wd: 24, ht: 75 })}>
        <div className={s.par} data-par="">
          <Photo p={PHOTOS.gopuram} sizes="(min-width: 900px) 30vh, 72vw" />
        </div>
      </div>

      <div className={cx(s.at, "flex flex-wrap items-center gap-x-5 gap-y-2")} style={at(8, 70, { wd: 100 })}>
        <button type="button" className={s.btnLine} onClick={() => walk("entrance")}>
          Return to the entrance
        </button>
        <p className={s.legal}>
          Made with respect for the material. Designed for the life around it.
          <br />© 2026 Santalum Maison. Red and white sandalwood from India.
        </p>
      </div>
    </RoomShell>
  );
}
