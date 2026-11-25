"use client";

import { useState } from "react";
import { productsFor, type Wood } from "@/lib/shop/products";
import { resetContent, saveContent, useContent, useContentEdited } from "../../_data/store";
import type { ContentDraft } from "../../_data/types";
import { Chips, Field, Head, Pinned, say } from "./kit";

export function Content() {
  const [wood, setWood] = useState<Wood>("red");
  const draft = useContent(wood);
  const edited = useContentEdited(wood);
  return (
    <div className="a4-page">
      <Head kicker="Shop" title="Homepage content" sub="Each wood has its own homepage. Edit the words and pin the pieces that lead it." />
      <Chips
        label="Wood"
        value={wood}
        onChange={setWood}
        items={[
          { id: "red", label: "Red sandalwood" },
          { id: "white", label: "White sandalwood" },
        ]}
      />
      <ContentForm key={wood + JSON.stringify(draft)} wood={wood} initial={draft} edited={edited} />
    </div>
  );
}

function ContentForm({ wood, initial, edited }: { wood: Wood; initial: ContentDraft; edited: boolean }) {
  const [d, setD] = useState(initial);
  const set = <K extends keyof ContentDraft>(k: K, v: ContentDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const products = productsFor(wood);
  const toggle = (slug: string) => set("featured", d.featured.includes(slug) ? d.featured.filter((s) => s !== slug) : d.featured.length >= 8 ? d.featured : [...d.featured, slug]);

  return (
    <form
      className="a4-editor"
      onSubmit={(e) => {
        e.preventDefault();
        saveContent(wood, d);
        say("Homepage saved");
      }}
    >
      <section className="a4-paper a4-pad a4-sheet" aria-labelledby="ct-hero">
        <h2 id="ct-hero" className="a4-h2">
          Opening words
        </h2>
        <Field label="Headline" wide>
          {(id) => <input id={id} value={d.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />}
        </Field>
        <Field label="Line under it" wide>
          {(id) => <textarea id={id} rows={3} value={d.heroSub} onChange={(e) => set("heroSub", e.target.value)} />}
        </Field>
        <Field label="Button">{(id) => <input id={id} value={d.heroCta} onChange={(e) => set("heroCta", e.target.value)} />}</Field>
      </section>
      <section className="a4-paper a4-pad a4-sheet" aria-labelledby="ct-ed">
        <h2 id="ct-ed" className="a4-h2">
          The current edition
        </h2>
        <Field label="Edition name" wide>
          {(id) => <input id={id} value={d.editionName} onChange={(e) => set("editionName", e.target.value)} />}
        </Field>
        <Field label="Pieces in the edition">{(id) => <input id={id} inputMode="numeric" value={d.editionSize || ""} onChange={(e) => set("editionSize", Number(e.target.value.replace(/\D/g, "")))} />}</Field>
        <Field label="Piece">
          {(id) => (
            <select id={id} value={d.editionSlug} onChange={(e) => set("editionSlug", e.target.value)}>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Edition text" wide>
          {(id) => <textarea id={id} rows={4} value={d.editionText} onChange={(e) => set("editionText", e.target.value)} />}
        </Field>
      </section>
      <section className="a4-paper a4-pad a4-sheet a4-sheet-wide" aria-labelledby="ct-feat">
        <h2 id="ct-feat" className="a4-h2">
          Pinned to the homepage
        </h2>
        <p className="a4-sub">{d.featured.length} of 8 pinned, in the order you pin them.</p>
        <ul className="a4-library a4-library-lg">
          {products.map((p) => {
            const at = d.featured.indexOf(p.slug);
            return (
              <li key={p.slug}>
                <button type="button" aria-pressed={at >= 0} onClick={() => toggle(p.slug)} disabled={at < 0 && d.featured.length >= 8}>
                  <Pinned photoId={p.shots[0].photo.id} tone={p.shots[0].tone} size="sm" pin={at >= 0} alt="" />
                  <span className="a4-lib-name">{p.name}</span>
                  {at >= 0 && <span className="a4-pin-n">{at + 1}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <div className="a4-savebar">
        <button type="submit" className="a4-btn a4-btn-ink">
          Save homepage
        </button>
        {edited && (
          <button
            type="button"
            className="a4-btn a4-btn-ghost"
            onClick={() => {
              resetContent(wood);
              say("Back to the original words");
            }}
          >
            Restore original
          </button>
        )}
      </div>
    </form>
  );
}
