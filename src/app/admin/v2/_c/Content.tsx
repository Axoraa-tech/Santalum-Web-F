"use client";

import { useState } from "react";
import type { Wood } from "@/lib/shop/products";
import { contentDefaults, resetContent, saveContent, useContent, useContentEdited, useProducts } from "../../_data/store";
import type { ContentDraft } from "../../_data/types";
import { Choice, F, Head, note, Section, WoodMark } from "./kit";

/** The shop's front pages, one leaf per wood. */
export function ContentBook() {
  const [wood, setWood] = useState<Wood>("red");
  return (
    <div>
      <Head kicker="Front pages" title="Content">
        <p className="a2-lede">What each wood&apos;s landing page says: the opening lines, the edition, and the pieces on show.</p>
      </Head>
      <div className="a2-tools">
        <Choice label="Wood" value={wood} onChange={setWood} items={[{ id: "red", label: <WoodMark wood="red" /> }, { id: "white", label: <WoodMark wood="white" /> }]} />
      </div>
      <Leaf key={wood} wood={wood} />
    </div>
  );
}

function Leaf({ wood }: { wood: Wood }) {
  const saved = useContent(wood);
  const edited = useContentEdited(wood);
  const products = useProducts().filter((p) => p.wood === wood && p.status !== "archived");
  const [d, setD] = useState<ContentDraft>(saved);
  const set = <K extends keyof ContentDraft>(k: K, v: ContentDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const dirty = JSON.stringify(d) !== JSON.stringify(saved);
  const toggle = (slug: string) => set("featured", d.featured.includes(slug) ? d.featured.filter((s) => s !== slug) : d.featured.length >= 8 ? d.featured : [...d.featured, slug]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveContent(wood, d);
        note("Front page saved");
      }}
    >
      <Section title="Opening">
        <div className="a2-formgrid">
          <F label="Headline" wide>
            <input value={d.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} className="a2-big" />
          </F>
          <F label="Beneath it" wide>
            <textarea rows={2} value={d.heroSub} onChange={(e) => set("heroSub", e.target.value)} />
          </F>
          <F label="Button says">
            <input value={d.heroCta} onChange={(e) => set("heroCta", e.target.value)} />
          </F>
        </div>
      </Section>
      <Section title="The edition">
        <div className="a2-formgrid">
          <F label="Edition name">
            <input value={d.editionName} onChange={(e) => set("editionName", e.target.value)} />
          </F>
          <F label="Pieces in it">
            <input inputMode="numeric" value={d.editionSize || ""} onChange={(e) => set("editionSize", Number(e.target.value.replace(/\D/g, "")))} />
          </F>
          <F label="The piece">
            <select value={d.editionSlug} onChange={(e) => set("editionSlug", e.target.value)}>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </F>
          <F label="About the edition" wide>
            <textarea rows={3} value={d.editionText} onChange={(e) => set("editionText", e.target.value)} />
          </F>
        </div>
      </Section>
      <Section title={`Pieces on show (${d.featured.length} of 8)`}>
        <ul className="a2-picks">
          {products.map((p) => {
            const i = d.featured.indexOf(p.slug);
            return (
              <li key={p.slug}>
                <label className="a2-check">
                  <input type="checkbox" checked={i >= 0} disabled={i < 0 && d.featured.length >= 8} onChange={() => toggle(p.slug)} />
                  <span>
                    {i >= 0 ? <b className="a2-folio">{i + 1}</b> : null} {p.name}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </Section>
      <div className="a2-savebar">
        <button type="submit" className="a2-btn" data-kind="ink" disabled={!dirty}>
          {dirty ? "Save front page" : "Saved"}
        </button>
        {edited ? (
          <button
            type="button"
            className="a2-link"
            onClick={() => {
              resetContent(wood);
              setD(contentDefaults(wood));
              note("Back to the shop's original words");
            }}
          >
            restore the original
          </button>
        ) : null}
      </div>
    </form>
  );
}
