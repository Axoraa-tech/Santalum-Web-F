"use client";

import type { ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { WT } from "@/components/maison/W";
import { formatINR } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { switchWood, type Wood } from "@/lib/wood";
import { familiesIn, priceRange, sectionNo } from "./content";
import { Head } from "./Head";

const count = (w: Wood) => familiesIn(w).length;
const range = (w: Wood) => {
  const [lo, hi] = priceRange(w);
  return `${formatINR(lo)} to ${formatINR(hi)}`;
};

const ROWS: { label: string; red: ReactNode; white: ReactNode }[] = [
  { label: "Botanical name", red: <i>Pterocarpus santalinus</i>, white: <i>Santalum album</i> },
  {
    label: "Sanskrit",
    red: (
      <span className="x5-deva" lang="sa">
        रक्तचन्दन
      </span>
    ),
    white: (
      <span className="x5-deva" lang="sa">
        श्वेतचन्दन
      </span>
    ),
  },
  { label: "Colour", red: "Brick to deep red; aged pieces nearly black at the core", white: "Pale gold, with a darker heart" },
  { label: "Scent", red: "Almost none", white: "Fragrant; faint when warm, stronger when worked" },
  { label: "In the hand", red: "Dense, heavy, cool, fine-grained", white: "Smooth and warm, lightly fragrant on the skin" },
  { label: "Oil", red: "Carries none", white: "In the heartwood only" },
  {
    label: "Grows in",
    red: (
      <>
        The Eastern Ghats, mainly Andhra Pradesh<sup className="x5-fnRef">*</sup>
      </>
    ),
    white: "Dry forests of southern India; Mysuru, Karnataka, is the centre of its craft",
  },
  { label: "In this catalogue", red: `${count("red")} pieces, ${range("red")}`, white: `${count("white")} pieces, ${range("white")}` },
];

function WoodHead({ wood }: { wood: Wood }) {
  const red = wood === "red";
  return (
    <th scope="col" className={red ? "x5-specRed" : "x5-specWhite"}>
      <figure className="x5-specFig">
        <div className="x5-specFrame">
          <Photo p={red ? PHOTOS.redChip : PHOTOS.whiteRitual} sizes="(min-width: 768px) 34vw, 46vw" />
        </div>
        <figcaption className="x5-caption">
          <b>Fig. {red ? 2 : 3}</b>
          {red ? "A raw piece of red sandalwood." : "White sandalwood pieces with a bottle of oil."}
        </figcaption>
      </figure>
      <span className="x5-specName">{red ? "Red sandalwood" : "White sandalwood"}</span>
      <span className="x5-specState">
        <WT
          red={red ? <span className="x5-specNow">This edition</span> : <SwitchTo wood="white" />}
          white={red ? <SwitchTo wood="red" /> : <span className="x5-specNow">This edition</span>}
        />
      </span>
    </th>
  );
}

function SwitchTo({ wood }: { wood: Wood }) {
  return (
    <button type="button" className="x5-specSwitch" onClick={() => switchWood(wood)}>
      Read the {wood} edition
    </button>
  );
}

/** The two woods compared as a specimen sheet. */
export function Specimens() {
  return (
    <section id="specimens" className="x5-section" aria-labelledby="specimens-title">
      <Head
        id="specimens-title"
        n={sectionNo("specimens")}
        title="Specimens"
        meta="Figures 2 and 3"
        dek={<p>Two trees, two forests and one word in common. What changes when you hold a piece of each.</p>}
      />
      <table className="x5-spec">
        <caption className="sr-only">Red and white sandalwood compared</caption>
        <colgroup>
          <col className="x5-specLabelCol" />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <td className="x5-specCorner">
              <span>Compared on the grid. The column you are reading is marked.</span>
            </td>
            <WoodHead wood="red" />
            <WoodHead wood="white" />
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td>{r.red}</td>
              <td>{r.white}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="x5-footnote">
        <sup>*</sup> Red sandalwood is listed in CITES Appendix II: international trade in it needs export permits.
      </p>
    </section>
  );
}
