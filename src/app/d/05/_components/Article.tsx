"use client";

import Link from "next/link";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, WOOD_NAMES } from "@/lib/catalog";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { careFor, categoryLabel, familiesIn } from "./content";
import { AddLine, WoodChoice } from "./Entry";

const WOODS: Wood[] = ["red", "white"];

/** A catalogue entry as an editorial article: huge name, photographs on the grid, specifications as a table. */
export function Article({ slug }: { slug: string }) {
  const wood = useWood();
  const family = getFamily(slug)!;
  const other: Wood = wood === "red" ? "white" : "red";
  const made = !!family.variants[wood];
  const shownWood: Wood = made ? wood : other;
  const v = family.variants[shownWood]!;
  const list = familiesIn(wood);
  const here = list.findIndex((x) => x.f.slug === slug);
  const no = here >= 0 ? here + 1 : null;
  const prev = here > 0 ? list[here - 1] : null;
  const next = here >= 0 && here < list.length - 1 ? list[here + 1] : null;
  const names = WOOD_NAMES[shownWood];

  return (
    <article className="x5a-article">
      <header id="entry" className="x5a-head">
        <div className="x5a-meta">
          <p>
            <span>Entry</span>
            <br />
            {no ? `No. ${no} of ${list.length} in ${wood}` : `Not in the ${wood} edition`}
          </p>
          <p>
            <span>Category</span>
            <br />
            {categoryLabel(family.category)}
          </p>
          <p>
            <span>Range</span>
            <br />
            {family.level}
            {family.edition ? `, ${family.edition.toLowerCase()}` : ""}
          </p>
          <p>
            <span>Price</span>
            <br />
            {made ? formatINR(v.price) : `Made only in ${other}`}
          </p>
        </div>
        <h1 className="x5a-name">
          <span className="x5a-nameInner">{family.name}</span>
        </h1>
        {!made && (
          <p className="x5a-notice">
            {family.name} is made only in {other} sandalwood, shown here.{" "}
            <button type="button" className="x5a-inlineBtn" onClick={() => switchWood(other)}>
              Switch to the {other} edition
            </button>
          </p>
        )}
      </header>

      <div className="x5a-photos">
        {v.shots.slice(0, 3).map((shot, i) => (
          <figure key={`${shownWood}-${i}`} className={`x5a-fig x5a-fig${i}`}>
            <div className="x5a-frame">
              <Photo p={shot.photo} tone={shot.tone} priority={i === 0} sizes={i === 0 ? "(min-width: 768px) 45vw, 92vw" : "(min-width: 768px) 28vw, 46vw"} />
            </div>
            <figcaption className="x5a-caption">
              <b>Plate {String.fromCharCode(97 + i)}</b>
              {shot.photo.alt}.
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="x5a-standfirst">{family.summary}</p>

      <section id="specs" className="x5a-block" aria-labelledby="specs-title">
        <div className="x5a-side">
          <h2 id="specs-title" className="x5a-blockTitle">
            Specifications
          </h2>
          <p className="x5a-bigPrice">{formatINR(v.price)}</p>
          <p className="x5a-sideNote">
            {made ? `In ${shownWood} sandalwood` : `Made only in ${shownWood} sandalwood`}
            {family.edition ? `. ${family.edition}, numbered.` : "."}
          </p>
        </div>
        <div className="x5a-blockBody">
          <table className="x5a-table">
            <caption className="sr-only">Specifications of {family.name}</caption>
            <tbody>
              <tr>
                <th scope="row">Wood</th>
                <td>
                  {names.common}, <i>{names.latin}</i>
                </td>
              </tr>
              <tr>
                <th scope="row">Origin</th>
                <td>{names.origin}</td>
              </tr>
              {WOODS.map((w) => (
                <tr key={w} data-current={w === wood || undefined}>
                  <th scope="row">Price in {w} sandalwood</th>
                  <td className="x5a-num">{family.variants[w] ? formatINR(family.variants[w]!.price) : "Not made"}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Category</th>
                <td>{categoryLabel(family.category)}</td>
              </tr>
              <tr>
                <th scope="row">Range</th>
                <td>{family.level}</td>
              </tr>
              {family.edition && !family.details.some((d) => d.label === "Edition") && (
                <tr>
                  <th scope="row">Edition</th>
                  <td>{family.edition}</td>
                </tr>
              )}
              {family.details.map((d) => (
                <tr key={d.label}>
                  <th scope="row">{d.label}</th>
                  <td>{d.value}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">In this wood</th>
                <td>
                  <i>{v.note}</i>
                </td>
              </tr>
            </tbody>
          </table>
          <WoodChoice family={family} wood={wood} />
          <div className="x5a-order">
            <AddLine family={family} wood={wood} />
            <p className="x5a-orderNote">Delivered in India. Payments are not connected in this preview.</p>
          </div>
        </div>
      </section>

      <section id="story" className="x5a-block" aria-labelledby="story-title">
        <div className="x5a-side">
          <h2 id="story-title" className="x5a-blockTitle">
            Story
          </h2>
          <p className="x5a-sa" lang="sa" aria-label={`${names.common} in Sanskrit: ${names.sa}`}>
            {names.sa}
          </p>
          <p className="x5a-sideNote">
            {names.common}, <i>{names.latin}</i>
          </p>
        </div>
        <div className="x5a-story">
          {family.story.map((p, i) => (
            <p key={i} className={i === 0 ? "x5a-storyFirst" : undefined}>
              {p}
            </p>
          ))}
          <p className="x5a-storyClose">Every piece begins as a reading. The wood decides what it will become. The hand follows.</p>
        </div>
      </section>

      <section id="care" className="x5a-block" aria-labelledby="care-title">
        <h2 id="care-title" className="x5a-blockTitle">
          Care
        </h2>
        <ol className="x5a-care">
          {careFor(family).map((c, i) => (
            <li key={c}>
              <span className="x5a-careN">{i + 1}</span>
              {c}
            </li>
          ))}
        </ol>
      </section>

      <nav id="more" className="x5a-block" aria-labelledby="more-title">
        <h2 id="more-title" className="x5a-blockTitle">
          Other entries
        </h2>
        <div className="x5a-blockBody">
          <ol className="x5a-more">
            {list.map(({ f, no: n }) => (
              <li key={f.slug}>
                <Link href={`/d/05/p/${f.slug}`} className="x5a-moreLink" aria-current={f.slug === slug ? "page" : undefined}>
                  <span className="x5a-moreNo">{n}</span>
                  <span className="x5a-moreName">{f.name}</span>
                  <span className="x5a-moreCat">{categoryLabel(f.category)}</span>
                  <span className="x5a-num">{formatINR(f.variants[wood]!.price)}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="x5a-pager">
            {prev ? (
              <Link href={`/d/05/p/${prev.f.slug}`} className="x5a-pagerLink">
                <span>Previous entry, No. {prev.no}</span>
                <b>{prev.f.name}</b>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/d/05/p/${next.f.slug}`} className={`x5a-pagerLink x5a-pagerNext`}>
                <span>Next entry, No. {next.no}</span>
                <b>{next.f.name}</b>
              </Link>
            ) : (
              <Link href="/d/05#catalogue" className={`x5a-pagerLink x5a-pagerNext`}>
                <span>End of the catalogue</span>
                <b>Back to the index</b>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </article>
  );
}
