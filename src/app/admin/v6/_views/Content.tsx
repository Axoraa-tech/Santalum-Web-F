"use client";

import { useState } from "react";
import type { Wood } from "@/lib/shop/products";
import { contentDefaults, resetContent, saveContent, useContent, useContentEdited, useProducts } from "../../_data/store";
import type { ContentDraft } from "../../_data/types";
import { Field, Head, say, Tabs, WOOD_NAME } from "../_ui/kit";

export function Content() {
  const [wood, setWood] = useState<Wood>("red");
  return (
    <>
      <Head
        no="08"
        title="Content"
        lede="The words on each wood's landing page: the opening, the current edition and the pieces shown first."
        actions={<Tabs label="Wood" value={wood} onChange={setWood} items={[{ id: "red", label: "Red sandalwood" }, { id: "white", label: "White sandalwood" }]} />}
      />
      <ContentForm key={wood} wood={wood} />
    </>
  );
}

function ContentForm({ wood }: { wood: Wood }) {
  const saved = useContent(wood);
  const edited = useContentEdited(wood);
  const products = useProducts().filter((p) => p.wood === wood && p.status === "active");
  const [d, setD] = useState<ContentDraft>(saved);
  const set = (p: Partial<ContentDraft>) => setD((x) => ({ ...x, ...p }));
  const toggle = (slug: string) => set({ featured: d.featured.includes(slug) ? d.featured.filter((s) => s !== slug) : d.featured.length >= 8 ? d.featured : [...d.featured, slug] });

  return (
    <form
      className="a6-form a6-grid"
      onSubmit={(e) => {
        e.preventDefault();
        saveContent(wood, d);
        say(`${WOOD_NAME[wood]} landing page saved`);
      }}
    >
      <div className="a6-form-col">
        <h2 className="a6-h2">
          <span className="a6-block-no">A</span>Opening
        </h2>
        <Field no="01" label="Headline" hint={`${d.heroTitle.length}/60`}>
          {(id) => <input id={id} className="a6-input a6-input-lg" maxLength={60} value={d.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} />}
        </Field>
        <Field no="02" label="Line under the headline">
          {(id) => <textarea id={id} className="a6-input" rows={3} value={d.heroSub} onChange={(e) => set({ heroSub: e.target.value })} />}
        </Field>
        <Field no="03" label="Button">
          {(id) => <input id={id} className="a6-input" value={d.heroCta} onChange={(e) => set({ heroCta: e.target.value })} />}
        </Field>
        <h2 className="a6-h2">
          <span className="a6-block-no">B</span>Current edition
        </h2>
        <Field no="04" label="Edition name">
          {(id) => <input id={id} className="a6-input" value={d.editionName} onChange={(e) => set({ editionName: e.target.value })} />}
        </Field>
        <Field no="05" label="Pieces in the edition">
          {(id) => <input id={id} className="a6-input a6-num" inputMode="numeric" value={d.editionSize || ""} onChange={(e) => set({ editionSize: Number(e.target.value.replace(/\D/g, "")) })} />}
        </Field>
        <Field no="06" label="Edition text">
          {(id) => <textarea id={id} className="a6-input" rows={4} value={d.editionText} onChange={(e) => set({ editionText: e.target.value })} />}
        </Field>
        <Field no="07" label="Edition product">
          {(id) => (
            <select id={id} className="a6-input" value={d.editionSlug} onChange={(e) => set({ editionSlug: e.target.value })}>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <div className="a6-form-col">
        <h2 className="a6-h2">
          <span className="a6-block-no">C</span>Shown first
        </h2>
        <Field no="08" label="Featured pieces" hint={`${d.featured.length} of 8 chosen, shown in this order.`}>
          {(id) => (
            <ol id={id} className="a6-picklist">
              {products.map((p) => {
                const i = d.featured.indexOf(p.slug);
                return (
                  <li key={p.slug}>
                    <label>
                      <input type="checkbox" checked={i >= 0} disabled={i < 0 && d.featured.length >= 8} onChange={() => toggle(p.slug)} />
                      <span className="a6-num a6-picklist-no">{i >= 0 ? String(i + 1).padStart(2, "0") : "··"}</span>
                      {p.name}
                    </label>
                  </li>
                );
              })}
            </ol>
          )}
        </Field>
      </div>
      <div className="a6-form-foot">
        {edited && (
          <button
            type="button"
            className="a6-link"
            onClick={() => {
              resetContent(wood);
              setD(contentDefaults(wood));
              say("Restored the original words");
            }}
          >
            Restore original
          </button>
        )}
        <button type="submit" className="a6-btn" data-primary>
          Save {WOOD_NAME[wood].toLowerCase()} page
        </button>
      </div>
    </form>
  );
}
