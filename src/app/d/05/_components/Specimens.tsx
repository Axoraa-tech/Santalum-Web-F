"use client";

import Link from "next/link";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { switchWood, type Wood } from "@/lib/wood";
import { categoriesIn, countIn, rangeIn, sectionNo, SPECIMEN } from "./content";
import { Head } from "./Head";

function SpecTable({ wood }: { wood: Wood }) {
  const s = SPECIMEN[wood];
  const c = CONTENT[wood];
  const otherWood: Wood = wood === "red" ? "white" : "red";
  return (
    <>
      <table className="x5-spec">
        <caption className="sr-only">{c.name}, as found and as worked</caption>
        <colgroup>
          <col className="x5-specLabelCol" />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <td className="x5-specCorner">
              <span>
                <i>{c.latin}</i>, {wood === "red" ? "from a documented lot in the Eastern Ghats." : "from a documented lot in Karnataka."}
              </span>
            </td>
            {[s.figA, s.figB].map((f, i) => (
              <th key={i} scope="col" className={i === 0 ? "x5-specA" : "x5-specB"}>
                <figure className="x5-specFig">
                  <div className="x5-specFrame">
                    <Photo p={f.p} tone={f.tone} sizes="(min-width: 768px) 34vw, 46vw" />
                  </div>
                  <figcaption className="x5-caption">
                    <b>Fig. {i + 2}</b>
                    {f.caption}
                  </figcaption>
                </figure>
                <span className="x5-specName">{i === 0 ? "As found" : "As worked"}</span>
                <span className="x5-specState">
                  {i === 0 ? (wood === "red" ? "The billet, before the lathe" : "The log, before the still") : wood === "red" ? "After turning, oil and wax" : "After distilling and carving"}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {s.rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              {r.span ? (
                <td colSpan={2} className="x5-specSpan">
                  {r.label === "Botanical name" ? (
                    <>
                      <i>{c.latin}</i>
                      {r.span.slice(c.latin.length)}
                    </>
                  ) : (
                    r.span
                  )}
                  {r.note && <sup className="x5-fnRef">*</sup>}
                </td>
              ) : (
                <>
                  <td>{r.found}</td>
                  <td>{r.worked}</td>
                </>
              )}
            </tr>
          ))}
          <tr>
            <th scope="row">Names</th>
            <td colSpan={2} className="x5-specSpan">
              <span className="x5-deva" lang="sa">
                {c.sanskrit}
              </span>{" "}
              in Sanskrit,{" "}
              <span className="x5-knda" lang="kn">
                {c.kannada}
              </span>{" "}
              in Kannada, and {c.localName.toLowerCase()} at home.
            </td>
          </tr>
          <tr>
            <th scope="row">In this edition</th>
            <td colSpan={2} className="x5-specSpan">
              {countIn(wood)} pieces in {categoriesIn(wood).length} categories, {rangeIn(wood)}.{" "}
              <Link href="/d/05/shop" className="x5-specLink">
                Open the {wood} catalogue
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="x5-specFoot">
        <p className="x5-footnote">
          <sup>*</sup> {s.footnote}
        </p>
        <button type="button" className="x5-specSwitch" onClick={() => switchWood(otherWood)}>
          Read the {otherWood} specimen instead
        </button>
      </div>
    </>
  );
}

/** The current wood as a specimen sheet: the same heartwood as found and as worked, on the grid. */
export function Specimens() {
  return (
    <section id="specimens" className="x5-section" aria-labelledby="specimens-title">
      <Head
        id="specimens-title"
        n={sectionNo("specimens")}
        title={
          <>
            The <WT red="red" white="white" />
            <br />
            specimen
          </>
        }
        meta="Figures 2 and 3"
        dek={
          <p>
            <WT red={SPECIMEN.red.dek} white={SPECIMEN.white.dek} />
          </p>
        }
      />
      <W red={<SpecTable wood="red" />} white={<SpecTable wood="white" />} />
    </section>
  );
}
