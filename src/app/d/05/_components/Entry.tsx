"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, WOOD_NAMES, type Family } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { switchWood, type Wood } from "@/lib/wood";
import { careFor } from "./content";
import { slipFlag } from "./store";

const WOODS: Wood[] = ["red", "white"];

/** Wood choice set as text: the two woods with their prices; the one being read is marked. */
export function WoodChoice({ family, wood }: { family: Family; wood: Wood }) {
  return (
    <div className="x5-woodChoice" role="group" aria-label="Choose the wood">
      <span className="x5-wcLabel">Wood</span>
      {WOODS.map((w) => {
        const v = family.variants[w];
        const on = w === wood;
        return v ? (
          <button key={w} type="button" aria-pressed={on} className="x5-wcBtn" onClick={() => !on && switchWood(w)}>
            <span>{WOOD_NAMES[w].common}</span>
            <span className="x5-wcPrice">{formatINR(v.price)}</span>
          </button>
        ) : (
          <span key={w} className="x5-wcNone">
            Not made in {w} sandalwood
          </span>
        );
      })}
    </div>
  );
}

/** Add to bag; opens the order slip so the new line is seen being printed. */
export function AddLine({ family, wood, custom, label = "Add to bag" }: { family: Family; wood: Wood; custom?: string; label?: string }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 2400);
    return () => window.clearTimeout(t);
  }, [added]);

  const v = family.variants[wood];
  if (!v) {
    const other: Wood = wood === "red" ? "white" : "red";
    return (
      <div className="x5-addNone">
        <p>
          {family.name} is made only in {other} sandalwood.
        </p>
        <button type="button" className="x5-addBtn" onClick={() => switchWood(other)}>
          <span>Read it in {other} sandalwood</span>
          <span>{formatINR(family.variants[other]!.price)}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="x5-addBtn"
      data-added={added || undefined}
      onClick={() => {
        bag.add(family.slug, wood, 1, custom);
        setAdded(true);
        slipFlag.set(true);
      }}
    >
      <span aria-live="polite">{added ? "Added to the slip" : label}</span>
      <span>{formatINR(v.price)}</span>
    </button>
  );
}

/** The detail spread a catalogue row opens into. */
export function Entry({ family, wood, no, onClose }: { family: Family; wood: Wood; no: number; onClose: () => void }) {
  const v = family.variants[wood]!;
  const care = careFor(family);
  return (
    <div className="x5-entry">
      <div className="x5-entryPhotos">
        {v.shots.slice(0, 3).map((shot, i) => (
          <figure key={i} className={`x5-ep ${i === 0 ? "x5-ep0" : i === 1 ? "x5-ep1" : "x5-ep2"}`}>
            <div className="x5-epFrame">
              <Photo p={shot.photo} tone={shot.tone} sizes={i === 0 ? "(min-width: 768px) 28vw, 80vw" : "(min-width: 768px) 18vw, 50vw"} />
            </div>
            <figcaption className="x5-caption">
              <b>
                Plate {no}
                {String.fromCharCode(97 + i)}
              </b>
              {shot.photo.alt}.
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="x5-entryText">
        <p className="x5-entrySummary">{family.summary}</p>
        <div className="x5-entryStory">
          {family.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="x5-entryNote">{v.note}</p>
        </div>

        <div className="x5-entryCols">
          <div>
            <h4 className="x5-entryH">Details</h4>
            <dl className="x5-entryDl">
              <div>
                <dt>Range</dt>
                <dd>{family.level}</dd>
              </div>
              {family.edition && !family.details.some((d) => d.label === "Edition") && (
                <div>
                  <dt>Edition</dt>
                  <dd>{family.edition}</dd>
                </div>
              )}
              {family.details.map((d) => (
                <div key={d.label}>
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h4 className="x5-entryH">Care</h4>
            {care.map((c) => (
              <p key={c} className="x5-entryCare">
                {c}
              </p>
            ))}
          </div>
        </div>

        <WoodChoice family={family} wood={wood} />
        <div className="x5-entryActions">
          <AddLine family={family} wood={wood} />
          <Link href={`/d/05/p/${family.slug}`} className="x5-textLink">
            Read the full entry
          </Link>
          <button type="button" className="x5-textLink" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
