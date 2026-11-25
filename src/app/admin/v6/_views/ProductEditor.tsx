"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { CATEGORIES, type Badge, type CategoryId, type Tone, type Wood } from "@/lib/shop/products";
import { blankDraft, deleteCreated, PHOTO_LIST, revertProduct, saveProduct, useProducts, type ProductRow } from "../../_data/store";
import type { DraftOption, ProductDraft, ProductStatus } from "../../_data/types";
import { BASE, Check, Empty, Field, Head, say, Thumb, WOOD_NAME } from "../_ui/kit";

export function NewProduct() {
  return <Editor initial={blankDraft("red")} isNew />;
}

export function EditProduct({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const products = useProducts();
  const row = products.find((p) => p.slug === slug);
  if (!row)
    return (
      <>
        <Head no="03" title="Product not found" back={{ href: `${BASE}/products`, label: "Products" }} />
        <Empty>There is no product at {slug}.</Empty>
      </>
    );
  return <Editor key={row.slug + (row.updatedAt ?? "")} initial={toDraft(row)} row={row} isNew={false} />;
}

function toDraft(r: ProductRow): ProductDraft {
  return {
    slug: r.slug, wood: r.wood, name: r.name, category: r.category, optionName: r.optionName, options: r.options.map((o) => ({ ...o })),
    photos: r.photos.map((p) => ({ ...p })), short: r.short, story: r.story, details: r.details.map((x) => ({ ...x })), care: r.care, badge: r.badge,
    editionSize: r.editionSize, editionLeft: r.editionLeft, featured: r.featured, status: r.status, seoTitle: r.seoTitle, seoDescription: r.seoDescription, updatedAt: r.updatedAt,
  };
}

const kebab = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
const BADGES: (Badge | "")[] = ["", "New", "Edition", "Studio favourite", "Limited"];
const STATUSES: { id: ProductStatus; label: string }[] = [
  { id: "active", label: "On sale" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
];

function Editor({ initial, row, isNew }: { initial: ProductDraft; row?: ProductRow; isNew: boolean }) {
  const router = useRouter();
  const products = useProducts();
  const [d, setD] = useState<ProductDraft>(initial);
  const [tried, setTried] = useState(false);
  const [dirty, setDirty] = useState(false);
  const set = (patch: Partial<ProductDraft>) => {
    setD((x) => ({ ...x, ...patch }));
    setDirty(true);
  };
  const slug = isNew ? `${d.wood === "red" ? "r" : "w"}-${kebab(d.name)}` : d.slug;

  const errors = {
    name: !d.name.trim() ? "Give the product a name." : isNew && products.some((p) => p.slug === slug) ? "A product with this name already exists in this wood." : null,
    options: d.options.some((o) => !o.label.trim()) ? "Every option needs a label." : d.options.some((o) => !(o.price > 0)) ? "Every option needs a price above ₹0." : null,
    short: !d.short.trim() ? "Write the one line shown on product cards." : null,
    photos: d.status === "active" && d.photos.length === 0 ? "A product on sale needs at least one photo." : null,
  };
  const invalid = Object.values(errors).some(Boolean);
  const show = (k: keyof typeof errors) => (tried ? errors[k] : null);

  function save() {
    setTried(true);
    if (invalid) return say("Check the fields marked in red");
    const out = { ...d, slug };
    saveProduct(out, isNew);
    setDirty(false);
    say(isNew ? `${d.name} created` : `${d.name} saved`);
    if (isNew) router.replace(`${BASE}/products/${slug}`);
  }

  const setOpt = (i: number, patch: Partial<DraftOption>) => set({ options: d.options.map((o, j) => (j === i ? { ...o, ...patch } : o)) });
  const addOpt = () => set({ options: [...d.options, { id: `opt-${d.options.length + 1}-${Math.floor(performance.now())}`, label: "", price: d.options[0]?.price ?? 0, stock: 0 }] });
  const movePhoto = (i: number, by: number) => {
    const p = [...d.photos];
    const j = i + by;
    if (j < 0 || j >= p.length) return;
    [p[i], p[j]] = [p[j], p[i]];
    set({ photos: p });
  };

  const actions = (
    <>
      {row?.edited && (
        <button
          type="button"
          className="a6-link"
          onClick={() => {
            revertProduct(row.slug);
            say("Reverted to the catalogue version");
          }}
        >
          Revert
        </button>
      )}
      {row?.custom && (
        <button
          type="button"
          className="a6-link"
          data-danger
          onClick={() => {
            if (!window.confirm(`Delete ${row.name}? This cannot be undone.`)) return;
            deleteCreated(row.slug);
            router.replace(`${BASE}/products`);
          }}
        >
          Delete
        </button>
      )}
      <button type="button" className="a6-btn" data-primary onClick={save}>
        {isNew ? "Create product" : "Save changes"}
      </button>
    </>
  );

  return (
    <>
      <Head
        no="03"
        back={{ href: `${BASE}/products`, label: "Products" }}
        title={isNew ? "New product" : d.name || "Untitled"}
        lede={
          <>
            {WOOD_NAME[d.wood]} sandalwood · <span className="a6-num">/{slug || "…"}</span>
            {dirty && <span className="a6-unsaved"> · unsaved changes</span>}
            {!isNew && (
              <>
                {" "}
                ·{" "}
                <Link href={`/maison/shop/${slug}`} className="a6-link" target="_blank" rel="noreferrer">
                  View in shop
                </Link>
              </>
            )}
          </>
        }
        actions={actions}
      />

      <form
        className="a6-form a6-grid"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="a6-form-col">
          <Field no="01" label="Name" error={show("name")}>
            {(id) => <input id={id} className="a6-input a6-input-lg" value={d.name} onChange={(e) => set({ name: e.target.value })} />}
          </Field>
          <Field no="02" label="Wood">
            {(id) => (
              <div className="a6-radios" id={id} role="radiogroup">
                {(["red", "white"] as Wood[]).map((w) => (
                  <label key={w} className="a6-radio" data-wood={w}>
                    <input type="radio" name="wood" checked={d.wood === w} disabled={!isNew} onChange={() => set({ wood: w, category: CATEGORIES[w][0].id })} />
                    {WOOD_NAME[w]} sandalwood
                  </label>
                ))}
              </div>
            )}
          </Field>
          <Field no="03" label="Category">
            {(id) => (
              <select id={id} className="a6-input" value={d.category} onChange={(e) => set({ category: e.target.value as CategoryId })}>
                {CATEGORIES[d.wood].map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field no="04" label="Status" hint="Drafts and archived products are hidden from the shop.">
            {(id) => (
              <div className="a6-radios" id={id} role="radiogroup">
                {STATUSES.map((s) => (
                  <label key={s.id} className="a6-radio">
                    <input type="radio" name="status" checked={d.status === s.id} onChange={() => set({ status: s.id })} />
                    {s.label}
                  </label>
                ))}
              </div>
            )}
          </Field>
          <Field no="05" label="Price and options" error={show("options")} hint="Prices include GST. A product with one row sells without a choice.">
            {(id) => (
              <div className="a6-opts">
                <input id={id} className="a6-input" placeholder="Option name, for example Bead size" value={d.optionName} onChange={(e) => set({ optionName: e.target.value })} />
                <table className="a6-table a6-opt-table">
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th className="a6-r">Price, ₹</th>
                      <th className="a6-r">Stock</th>
                      <th>
                        <span className="a6-sr">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.options.map((o, i) => (
                      <tr key={o.id}>
                        <td>
                          <input className="a6-input" aria-label={`Option ${i + 1} label`} value={o.label} onChange={(e) => setOpt(i, { label: e.target.value })} />
                        </td>
                        <td>
                          <input className="a6-input a6-num a6-r" inputMode="numeric" aria-label={`Option ${i + 1} price`} value={o.price || ""} onChange={(e) => setOpt(i, { price: Number(e.target.value.replace(/\D/g, "")) })} />
                        </td>
                        <td>
                          <input className="a6-input a6-num a6-r" inputMode="numeric" aria-label={`Option ${i + 1} stock`} value={o.stock} onChange={(e) => setOpt(i, { stock: Number(e.target.value.replace(/\D/g, "")) })} />
                        </td>
                        <td className="a6-r">
                          <button type="button" className="a6-link" disabled={d.options.length === 1} onClick={() => set({ options: d.options.filter((_, j) => j !== i) })} aria-label={`Remove option ${i + 1}`}>
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" className="a6-link" onClick={addOpt}>
                  + Add an option
                </button>
              </div>
            )}
          </Field>
          <Field no="06" label="Badge and edition" hint="Leave the edition empty for pieces that are not numbered.">
            {(id) => (
              <div className="a6-form-row">
                <select id={id} className="a6-input" value={d.badge} onChange={(e) => set({ badge: e.target.value as Badge | "" })} aria-label="Badge">
                  {BADGES.map((b) => (
                    <option key={b} value={b}>
                      {b || "No badge"}
                    </option>
                  ))}
                </select>
                <input className="a6-input a6-num" inputMode="numeric" placeholder="Edition size" aria-label="Edition size" value={d.editionSize ?? ""} onChange={(e) => set({ editionSize: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null })} />
                <input className="a6-input a6-num" inputMode="numeric" placeholder="Pieces left" aria-label="Pieces left" value={d.editionLeft ?? ""} onChange={(e) => set({ editionLeft: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null })} />
              </div>
            )}
          </Field>
          <Field no="07" label="Landing page">
            {() => (
              <Check checked={d.featured} onChange={(v) => set({ featured: v })}>
                Feature on the {WOOD_NAME[d.wood].toLowerCase()} sandalwood landing page
              </Check>
            )}
          </Field>
        </div>

        <div className="a6-form-col">
          <Field no="08" label="Photos" error={show("photos")} hint="The first photo is the cover. Choose from the library below.">
            {(id) => (
              <div id={id}>
                {d.photos.length > 0 && (
                  <ol className="a6-photos">
                    {d.photos.map((p, i) => (
                      <li key={p.id + i}>
                        <Thumb photoId={p.id} tone={p.tone} size={72} />
                        <span className="a6-num a6-muted">{String(i + 1).padStart(2, "0")}</span>
                        <select className="a6-input" aria-label={`Photo ${i + 1} tone`} value={p.tone ?? ""} onChange={(e) => set({ photos: d.photos.map((x, j) => (j === i ? { ...x, tone: (e.target.value || undefined) as Tone | undefined } : x)) })}>
                          <option value="">Natural</option>
                          <option value="red">Warm</option>
                          <option value="pale">Pale</option>
                        </select>
                        <span className="a6-photo-btns">
                          <button type="button" className="a6-link" onClick={() => movePhoto(i, -1)} disabled={i === 0} aria-label="Move earlier">
                            ←
                          </button>
                          <button type="button" className="a6-link" onClick={() => movePhoto(i, 1)} disabled={i === d.photos.length - 1} aria-label="Move later">
                            →
                          </button>
                          <button type="button" className="a6-link" onClick={() => set({ photos: d.photos.filter((_, j) => j !== i) })} aria-label="Remove photo">
                            ×
                          </button>
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                <details className="a6-library">
                  <summary>Photo library ({PHOTO_LIST.length})</summary>
                  <div className="a6-library-grid">
                    {PHOTO_LIST.map((p) => (
                      <button key={p.id} type="button" title={p.alt} onClick={() => set({ photos: [...d.photos, { id: p.id, tone: d.wood === "white" ? "pale" : undefined }] })}>
                        <Thumb photoId={p.id} size={64} />
                        <span className="a6-sr">Add {p.alt}</span>
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </Field>
          <Field no="09" label="One line" error={show("short")} hint={`${d.short.length}/90, shown on product cards`}>
            {(id) => <input id={id} className="a6-input" maxLength={90} value={d.short} onChange={(e) => set({ short: e.target.value })} />}
          </Field>
          <Field no="10" label="Story" hint="Two or three short paragraphs. Leave a blank line between paragraphs.">
            {(id) => <textarea id={id} className="a6-input" rows={8} value={d.story} onChange={(e) => set({ story: e.target.value })} />}
          </Field>
          <Field no="11" label="Details">
            {(id) => (
              <div id={id} className="a6-details">
                {d.details.map((x, i) => (
                  <div key={i} className="a6-form-row">
                    <input className="a6-input" placeholder="Label" aria-label={`Detail ${i + 1} label`} value={x.label} onChange={(e) => set({ details: d.details.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)) })} />
                    <input className="a6-input" placeholder="Value" aria-label={`Detail ${i + 1} value`} value={x.value} onChange={(e) => set({ details: d.details.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)) })} />
                    <button type="button" className="a6-link" onClick={() => set({ details: d.details.filter((_, j) => j !== i) })} aria-label={`Remove detail ${i + 1}`}>
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className="a6-link" onClick={() => set({ details: [...d.details, { label: "", value: "" }] })}>
                  + Add a detail
                </button>
              </div>
            )}
          </Field>
          <Field no="12" label="Care">
            {(id) => <textarea id={id} className="a6-input" rows={3} value={d.care} onChange={(e) => set({ care: e.target.value })} />}
          </Field>
          <Field no="13" label="Search listing" hint={`${d.seoDescription.length}/160 characters in the description`}>
            {(id) => (
              <div className="a6-stack">
                <input id={id} className="a6-input" placeholder="Title" value={d.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} />
                <textarea className="a6-input" rows={2} placeholder="Description" aria-label="Search description" maxLength={160} value={d.seoDescription} onChange={(e) => set({ seoDescription: e.target.value })} />
              </div>
            )}
          </Field>
        </div>
        <div className="a6-form-foot">
          {tried && invalid && <span className="a6-field-error">Some fields need attention.</span>}
          {actions}
        </div>
      </form>
    </>
  );
}
