"use client";

import { useMemo, useState } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import type { Wood } from "@/lib/shop/products";
import { contentDefaults, photoById, resetContent, saveContent, useContent, useContentEdited, useProducts } from "../_data/store";
import type { ContentDraft } from "../_data/types";
import { priceText } from "./Products";
import { Icon } from "./icons";
import { Field, PageHead, Panel, Seg, toast } from "./ui";

export function ContentView() {
  const [wood, setWood] = useState<Wood>("red");
  const red = useContentEdited("red");
  const white = useContentEdited("white");
  return (
    <div className="adm-page">
      <PageHead
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Storefront content" }]}
        title="Storefront content"
        sub="Each wood has its own landing page. Change the opening lines, the edition and the pieces shown first."
        actions={
          <Seg
            label="Wood"
            value={wood}
            onChange={setWood}
            items={[
              { id: "red", label: <><i className="ring-red" style={{ width: 10, height: 10, borderRadius: 9, display: "inline-block" }} />Red sandalwood{red && <span className="adm-tag" style={{ height: 17 }}>edited</span>}</> },
              { id: "white", label: <><i className="ring-white" style={{ width: 10, height: 10, borderRadius: 9, display: "inline-block" }} />White sandalwood{white && <span className="adm-tag" style={{ height: 17 }}>edited</span>}</> },
            ]}
          />
        }
      />
      <WoodEditor key={wood} wood={wood} />
    </div>
  );
}

function WoodEditor({ wood }: { wood: Wood }) {
  const saved = useContent(wood);
  const edited = useContentEdited(wood);
  const products = useProducts();
  const [d, setD] = useState<ContentDraft>(saved);
  const dirty = JSON.stringify(d) !== JSON.stringify(saved);
  const set = <K extends keyof ContentDraft>(k: K, v: ContentDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const pool = useMemo(() => products.filter((p) => p.wood === wood && p.status === "active"), [products, wood]);
  const bySlug = new Map(pool.map((p) => [p.slug, p]));
  const c = CONTENT[wood];
  const editionProduct = products.find((p) => p.slug === d.editionSlug);
  const move = (i: number, by: number) => {
    const next = [...d.featured];
    const [x] = next.splice(i, 1);
    next.splice(i + by, 0, x);
    set("featured", next);
  };

  return (
    <>
      <div className="adm-grid adm-cols-2" style={{ alignItems: "start" }}>
        <div className="adm-stack">
          <Panel title="Opening" meta="The first thing on the landing page" id="ct-hero">
            <div style={{ display: "grid", gap: 14 }}>
              <Field label="Headline" count={`${d.heroTitle.length}/60`}>
                {(id) => <input id={id} className="adm-input" maxLength={60} value={d.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />}
              </Field>
              <Field label="Line under the headline" count={`${d.heroSub.length}/200`}>
                {(id) => <textarea id={id} className="adm-textarea" rows={3} maxLength={200} value={d.heroSub} onChange={(e) => set("heroSub", e.target.value)} />}
              </Field>
              <Field label="Button">{(id) => <input id={id} className="adm-input" value={d.heroCta} onChange={(e) => set("heroCta", e.target.value)} style={{ maxWidth: 280 }} />}</Field>
            </div>
          </Panel>

          <Panel title="The edition" meta="A numbered run, shown in its own section" id="ct-edition">
            <div className="adm-form-grid">
              <Field label="Edition name" className="adm-span-2">
                {(id) => <input id={id} className="adm-input" value={d.editionName} onChange={(e) => set("editionName", e.target.value)} />}
              </Field>
              <Field label="Piece">
                {(id) => (
                  <select id={id} className="adm-select" value={d.editionSlug} onChange={(e) => set("editionSlug", e.target.value)}>
                    {pool.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Edition size">
                {(id) => <input id={id} className="adm-input num" inputMode="numeric" value={d.editionSize || ""} onChange={(e) => set("editionSize", Number(e.target.value.replace(/\D/g, "")))} />}
              </Field>
              <Field label="Text" className="adm-span-2">
                {(id) => <textarea id={id} className="adm-textarea" rows={3} value={d.editionText} onChange={(e) => set("editionText", e.target.value)} />}
              </Field>
            </div>
          </Panel>

          <Panel title="Featured pieces" meta={`${d.featured.length} of 8, in the order shown`} id="ct-feat">
            <ol className="adm-list" style={{ margin: "0 -18px" }}>
              {d.featured.map((slug, i) => {
                const p = bySlug.get(slug);
                return (
                  <li key={slug} style={{ padding: "8px 18px" }}>
                    <span className="adm-muted num" style={{ width: 16 }}>
                      {i + 1}
                    </span>
                    <span className="adm-thumb" data-size="sm">
                      {p?.photos[0] && <Photo p={photoById(p.photos[0].id)} tone={p.photos[0].tone} sizes="40px" />}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="adm-cell-title" style={{ display: "block" }}>
                        {p?.name ?? slug}
                      </span>
                      <span className="adm-cell-sub">{p ? priceText(p) : "Not active"}</span>
                    </span>
                    <button type="button" className="adm-btn" data-variant="ghost" data-size="icon-sm" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                      <Icon name="arrowUp" />
                    </button>
                    <button type="button" className="adm-btn" data-variant="ghost" data-size="icon-sm" aria-label="Move down" disabled={i === d.featured.length - 1} onClick={() => move(i, 1)}>
                      <Icon name="arrowDown" />
                    </button>
                    <button type="button" className="adm-btn" data-variant="ghost" data-size="icon-sm" aria-label={`Remove ${p?.name ?? slug}`} onClick={() => set("featured", d.featured.filter((x) => x !== slug))}>
                      <Icon name="close" />
                    </button>
                  </li>
                );
              })}
            </ol>
            {d.featured.length < 8 && (
              <select
                className="adm-select"
                aria-label="Add a featured piece"
                value=""
                style={{ marginTop: 10 }}
                onChange={(e) => e.target.value && set("featured", [...d.featured, e.target.value])}
              >
                <option value="">Add a piece…</option>
                {pool
                  .filter((p) => !d.featured.includes(p.slug))
                  .map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
              </select>
            )}
          </Panel>
        </div>

        <aside className="adm-stack adm-sticky" aria-label="Preview">
          <div className="adm-muted" style={{ fontSize: 12.5 }}>
            Preview of the {wood} sandalwood landing page
          </div>
          <div className="adm-hero-prev" data-wood={wood}>
            <Photo p={c.hero.photo} sizes="560px" priority />
            <div>
              <div className="adm-hero-eyebrow">{c.eyebrow}</div>
              <h3>{d.heroTitle || "Headline"}</h3>
              <p>{d.heroSub}</p>
              <span style={{ display: "inline-flex", marginTop: 16, height: 36, alignItems: "center", padding: "0 16px", borderRadius: 999, background: "#fffdf9", color: "#17130f", fontSize: 13.5, fontWeight: 500 }}>{d.heroCta || "Button"}</span>
            </div>
          </div>
          <div className="adm-panel" style={{ display: "grid", gridTemplateColumns: "96px minmax(0,1fr)", gap: 14, padding: 14, alignItems: "center", background: wood === "red" ? "#f7efeb" : "#f8f3e8" }}>
            <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 10, overflow: "hidden" }}>
              {editionProduct?.photos[0] && <Photo p={photoById(editionProduct.photos[0].id)} tone={editionProduct.photos[0].tone} sizes="100px" />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="adm-muted" style={{ fontSize: 12 }}>
                Edition of {d.editionSize || "–"}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, lineHeight: 1.1, margin: "3px 0 6px" }}>{d.editionName || "Edition name"}</div>
              <p className="adm-ink2" style={{ margin: 0, fontSize: 13, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {d.editionText}
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8 }}>
            {d.featured.slice(0, 8).map((slug) => {
              const p = bySlug.get(slug);
              return (
                <div key={slug} style={{ minWidth: 0 }}>
                  <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 8, overflow: "hidden", background: "var(--a-surface-3)" }}>
                    {p?.photos[0] && <Photo p={photoById(p.photos[0].id)} tone={p.photos[0].tone} sizes="120px" />}
                  </div>
                  <div className="adm-cell-title" style={{ fontSize: 12, marginTop: 4 }}>
                    {p?.name ?? slug}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {(dirty || edited) && (
        <div className="adm-savebar adm-noprint" role="region" aria-label="Save content">
          <Icon name="edit" width={16} height={16} />
          <span style={{ flex: 1 }}>{dirty ? "Unsaved changes to the " + (wood === "red" ? "red" : "white") + " sandalwood page" : "This page uses edited copy"}</span>
          {edited && !dirty && (
            <button
              type="button"
              className="adm-btn"
              data-variant="ghost"
              data-size="sm"
              onClick={() => {
                resetContent(wood);
                setD(contentDefaults(wood));
                toast("Back to the site's original copy");
              }}
            >
              Reset to original
            </button>
          )}
          {dirty && (
            <button type="button" className="adm-btn" data-variant="ghost" data-size="sm" onClick={() => setD(saved)}>
              Discard
            </button>
          )}
          {dirty && (
            <button
              type="button"
              className="adm-btn"
              data-size="sm"
              onClick={() => {
                saveContent(wood, d);
                toast(`${wood === "red" ? "Red" : "White"} sandalwood page saved`);
              }}
            >
              Save
            </button>
          )}
        </div>
      )}
    </>
  );
}
