"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, type Badge, type Tone, type Wood } from "@/lib/shop/products";
import { blankDraft, PHOTO_LIST, revertProduct, saveProduct, useProducts, type ProductRow } from "../../_data/store";
import type { ProductDraft, ProductStatus } from "../../_data/types";
import { BASE, Check, Choice, Empty, F, Head, note, WoodMark } from "./kit";

const BADGES: (Badge | "")[] = ["", "New", "Edition", "Studio favourite", "Limited"];
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

export function EditCard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const products = useProducts();
  const row = products.find((p) => p.slug === decodeURIComponent(slug));
  if (!row)
    return (
      <div>
        <Head kicker="Catalogue" title="No such card" />
        <Empty>
          There is no card for “{slug}”. <Link href={`${BASE}/products`} className="a2-link">Back to the catalogue</Link>
        </Empty>
      </div>
    );
  return <CardForm key={row.slug + (row.updatedAt ?? "")} row={row} isNew={false} />;
}

export function NewCard() {
  return <CardForm row={null} isNew />;
}

function toDraft(r: ProductRow): ProductDraft {
  // keep only the draft fields; the list-only figures are worked out again on save
  const d: ProductDraft = {
    slug: r.slug, wood: r.wood, name: r.name, category: r.category, optionName: r.optionName,
    options: r.options.map((o) => ({ ...o })), photos: r.photos.map((p) => ({ ...p })), short: r.short, story: r.story,
    details: r.details.map((x) => ({ ...x })), care: r.care, badge: r.badge, editionSize: r.editionSize, editionLeft: r.editionLeft,
    featured: r.featured, status: r.status, seoTitle: r.seoTitle, seoDescription: r.seoDescription, updatedAt: r.updatedAt,
  };
  return d;
}

/** The product editor as a catalogue card: typed fields on a ruled index card, a punched hole at the foot. */
function CardForm({ row, isNew }: { row: ProductRow | null; isNew: boolean }) {
  const router = useRouter();
  const products = useProducts();
  const [d, setD] = useState<ProductDraft>(() => (row ? toDraft(row) : blankDraft("red")));
  const [dirty, setDirty] = useState(false);
  const [tried, setTried] = useState(false);
  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => {
    setD((x) => ({ ...x, [k]: v }));
    setDirty(true);
  };
  const autoSlug = (d.wood === "red" ? "r-" : "w-") + slugify(d.name);
  const slug = isNew ? autoSlug : d.slug;
  const errors: string[] = [];
  if (!d.name.trim()) errors.push("Write the piece's name.");
  if (isNew && products.some((p) => p.slug === slug)) errors.push(`A card called ${slug} already exists.`);
  if (d.options.some((o) => !o.label.trim())) errors.push("Every option needs a label.");
  if (d.options.some((o) => !(o.price > 0))) errors.push("Every option needs a price above ₹0.");
  if (!d.short.trim()) errors.push("Write the one-line description.");

  const save = () => {
    setTried(true);
    if (errors.length) return;
    const clean: ProductDraft = { ...d, slug, name: d.name.trim(), seoTitle: d.seoTitle || `${d.name.trim()} · Santalum Maison`, seoDescription: d.seoDescription || d.short };
    saveProduct(clean, isNew);
    setDirty(false);
    note(isNew ? "Card filed in the catalogue" : "Card saved");
    if (isNew) router.push(`${BASE}/products/${slug}`);
  };

  const setOpt = (i: number, k: "label" | "price" | "stock", v: string) =>
    set(
      "options",
      d.options.map((o, j) => (j === i ? { ...o, [k]: k === "label" ? v : Math.max(0, Math.round(Number(v.replace(/[^\d]/g, "")) || 0)) } : o)),
    );
  const used = new Set(d.photos.map((p) => p.id));

  return (
    <div>
      <Head
        kicker={
          <>
            <Link href={`${BASE}/products`} className="a2-link">Catalogue</Link> · {isNew ? "new card" : slug}
          </>
        }
        title={isNew ? "A new catalogue card" : d.name || "Untitled"}
        aside={
          <div className="a2-acts">
            {!isNew && row?.edited ? (
              <button
                type="button"
                className="a2-link"
                onClick={() => {
                  revertProduct(d.slug);
                  note("Card restored to the shop's original");
                }}
              >
                restore original
              </button>
            ) : null}
            {!isNew ? (
              <a className="a2-link" href={`/maison/shop/${d.slug}`} target="_blank" rel="noreferrer">
                see on shop
              </a>
            ) : null}
            <button type="button" className="a2-btn" data-kind="ink" onClick={save}>
              {isNew ? "File the card" : dirty ? "Save card" : "Saved"}
            </button>
          </div>
        }
      />

      {tried && errors.length ? (
        <ul className="a2-errs" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}

      <form
        className="a2-card"
        data-wood={d.wood}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="a2-card-top">
          <span className="a2-card-no">{slug || "—"}</span>
          <WoodMark wood={d.wood} />
        </div>

        <div className="a2-card-grid">
          <F label="Name of the piece" wide>
            <input value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Japa Mala, 108 beads" className="a2-big" />
          </F>
          <F group label="Wood">
            <Choice
              label="Wood"
              value={d.wood}
              onChange={(w: Wood) => {
                setD((x) => ({ ...x, wood: w, category: CATEGORIES[w][0].id }));
                setDirty(true);
              }}
              items={[
                { id: "red", label: "Red" },
                { id: "white", label: "White" },
              ]}
            />
          </F>
          <F label="Shelf (category)">
            <select value={d.category} onChange={(e) => set("category", e.target.value as ProductDraft["category"])}>
              {CATEGORIES[d.wood].map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </F>
          <F group label="Status">
            <Choice
              label="Status"
              value={d.status}
              onChange={(s: ProductStatus) => set("status", s)}
              items={[
                { id: "active", label: "On the shop" },
                { id: "draft", label: "Draft" },
                { id: "archived", label: "Archived" },
              ]}
            />
          </F>
          <F label="Mark">
            <select value={d.badge} onChange={(e) => set("badge", e.target.value as ProductDraft["badge"])}>
              {BADGES.map((b) => (
                <option key={b} value={b}>
                  {b || "None"}
                </option>
              ))}
            </select>
          </F>
          <F label="One line, for the shop card" wide>
            <input value={d.short} onChange={(e) => set("short", e.target.value)} maxLength={140} />
          </F>
        </div>

        <fieldset className="a2-card-part">
          <legend>Options and price</legend>
          <F label="Option is called">
            <input value={d.optionName} onChange={(e) => set("optionName", e.target.value)} placeholder="Bead size, Volume…" />
          </F>
          <div className="a2-opts" role="table" aria-label="Options">
            <div className="a2-opt a2-lhead" role="row">
              <span role="columnheader">Label</span>
              <span role="columnheader" className="a2-r">Price ₹</span>
              <span role="columnheader" className="a2-r">In stock</span>
              <span role="columnheader">
                <span className="a2-sr">Remove</span>
              </span>
            </div>
            {d.options.map((o, i) => (
              <div key={o.id + i} className="a2-opt" role="row">
                <input aria-label="Option label" value={o.label} onChange={(e) => setOpt(i, "label", e.target.value)} />
                <input aria-label="Price" inputMode="numeric" className="a2-r a2-fig" value={o.price || ""} onChange={(e) => setOpt(i, "price", e.target.value)} />
                <input aria-label="Stock" inputMode="numeric" className="a2-r a2-fig" value={o.stock} onChange={(e) => setOpt(i, "stock", e.target.value)} />
                <button type="button" className="a2-link" disabled={d.options.length === 1} onClick={() => set("options", d.options.filter((_, j) => j !== i))} aria-label={`Remove ${o.label || "option"}`}>
                  strike
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="a2-link"
            onClick={() => {
              const id = `opt-${d.options.length + 1}-${slugify(String(d.options.length))}`;
              set("options", [...d.options, { id, label: "", price: d.options[d.options.length - 1]?.price ?? 0, stock: 0 }]);
            }}
          >
            + add an option
          </button>
        </fieldset>

        <fieldset className="a2-card-part">
          <legend>Photographs</legend>
          {d.photos.length === 0 ? <p className="a2-dim">No photographs pinned yet. Choose from the box below.</p> : null}
          <ol className="a2-pins">
            {d.photos.map((ph, i) => (
              <li key={ph.id}>
                <span className="a2-pin">
                  <Photo p={{ id: ph.id, alt: "" }} sizes="96px" tone={ph.tone} />
                </span>
                <span className="a2-pin-tools">
                  <select aria-label="Tone" value={ph.tone ?? ""} onChange={(e) => set("photos", d.photos.map((x, j) => (j === i ? { ...x, tone: (e.target.value || undefined) as Tone | undefined } : x)))}>
                    <option value="">As shot</option>
                    <option value="red">Warmer</option>
                    <option value="pale">Paler</option>
                  </select>
                  <button type="button" className="a2-link" disabled={i === 0} onClick={() => set("photos", [d.photos[i], ...d.photos.filter((_, j) => j !== i)])}>
                    first
                  </button>
                  <button type="button" className="a2-link" onClick={() => set("photos", d.photos.filter((_, j) => j !== i))}>
                    unpin
                  </button>
                </span>
              </li>
            ))}
          </ol>
          <details className="a2-box">
            <summary>The photograph box ({PHOTO_LIST.length})</summary>
            <div className="a2-box-grid">
              {PHOTO_LIST.map((ph) => (
                <button key={ph.id} type="button" className="a2-pin" disabled={used.has(ph.id)} onClick={() => set("photos", [...d.photos, { id: ph.id, tone: d.wood === "white" ? "pale" : undefined }])} title={ph.alt}>
                  <Photo p={ph} sizes="96px" />
                  <span className="a2-sr">Pin {ph.alt}</span>
                </button>
              ))}
            </div>
          </details>
        </fieldset>

        <fieldset className="a2-card-part">
          <legend>Story</legend>
          <F label="The story, in short paragraphs (blank line between)" wide>
            <textarea rows={7} value={d.story} onChange={(e) => set("story", e.target.value)} />
          </F>
          <F label="Care" wide>
            <textarea rows={2} value={d.care} onChange={(e) => set("care", e.target.value)} />
          </F>
          <div className="a2-details">
            <span className="a2-f-l">Details</span>
            {d.details.map((x, i) => (
              <div key={i} className="a2-detail">
                <input aria-label="Detail label" placeholder="Bead size" value={x.label} onChange={(e) => set("details", d.details.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} />
                <input aria-label="Detail value" placeholder="8 mm" value={x.value} onChange={(e) => set("details", d.details.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))} />
                <button type="button" className="a2-link" onClick={() => set("details", d.details.filter((_, j) => j !== i))}>
                  strike
                </button>
              </div>
            ))}
            <button type="button" className="a2-link" onClick={() => set("details", [...d.details, { label: "", value: "" }])}>
              + add a detail
            </button>
          </div>
        </fieldset>

        <fieldset className="a2-card-part a2-card-grid">
          <legend>Edition and search</legend>
          <F label="Edition of (pieces)">
            <input inputMode="numeric" value={d.editionSize ?? ""} onChange={(e) => set("editionSize", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} placeholder="none" />
          </F>
          <F label="Left in the edition">
            <input inputMode="numeric" value={d.editionLeft ?? ""} onChange={(e) => set("editionLeft", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} placeholder="—" />
          </F>
          <F group label="Feature">
            <Check checked={d.featured} onChange={(v) => set("featured", v)}>
              Show on the landing page
            </Check>
          </F>
          <F label="Search title" wide>
            <input value={d.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={`${d.name || "Name"} · Santalum Maison`} />
          </F>
          <F label="Search description" wide>
            <textarea rows={2} value={d.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} placeholder={d.short} />
          </F>
        </fieldset>
        <span className="a2-card-hole" aria-hidden />
      </form>
    </div>
  );
}
