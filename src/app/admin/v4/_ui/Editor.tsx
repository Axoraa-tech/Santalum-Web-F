"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { CATEGORIES, type Badge, type Tone, type Wood } from "@/lib/shop/products";
import { blankDraft, PHOTO_LIST, revertProduct, saveProduct, useProducts } from "../../_data/store";
import type { DraftOption, ProductDraft, ProductStatus } from "../../_data/types";
import { BASE, Check, Chips, Empty, Field, Head, Icon, Pinned, say } from "./kit";

const BADGES: (Badge | "")[] = ["", "New", "Edition", "Studio favourite", "Limited"];
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function NewProduct() {
  return <EditorBody initial={blankDraft("red")} isNew />;
}

export function EditProduct({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const rows = useProducts();
  const row = rows.find((r) => r.slug === decodeURIComponent(slug));
  if (!row)
    return (
      <div className="a4-page">
        <Head kicker={<Link href={`${BASE}/products`}>Products</Link>} title="No such piece" />
        <Empty>There is no product with the slug {slug}.</Empty>
      </div>
    );
  return <EditorBody key={row.slug + (row.updatedAt ?? 0)} initial={row} isNew={false} edited={row.edited} />;
}

function EditorBody({ initial, isNew, edited }: { initial: ProductDraft; isNew: boolean; edited?: boolean }) {
  const router = useRouter();
  const rows = useProducts();
  const [d, setD] = useState<ProductDraft>(() => ({
    ...initial,
    options: initial.options.map((o) => ({ ...o })),
    photos: initial.photos.map((p) => ({ ...p })),
    details: initial.details.map((x) => ({ ...x })),
  }));
  const [tried, setTried] = useState(false);
  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const setOpt = (i: number, patch: Partial<DraftOption>) => set("options", d.options.map((o, j) => (j === i ? { ...o, ...patch } : o)));

  const slug = isNew ? `${d.wood === "red" ? "r" : "w"}-${slugify(d.name)}` : d.slug;
  const errors = useMemo(() => {
    const e: string[] = [];
    if (!d.name.trim()) e.push("Give the piece a name.");
    if (isNew && d.name.trim() && rows.some((r) => r.slug === slug)) e.push(`The slug ${slug} is taken. Change the name.`);
    if (d.options.some((o) => !o.label.trim())) e.push("Every option needs a label.");
    if (d.options.some((o) => !(o.price > 0))) e.push("Every option needs a price above zero.");
    if (d.status === "active" && d.photos.length === 0) e.push("A piece on sale needs at least one photo.");
    return e;
  }, [d, isNew, rows, slug]);

  const save = () => {
    setTried(true);
    if (errors.length) return;
    const out: ProductDraft = {
      ...d,
      slug,
      name: d.name.trim(),
      details: d.details.filter((x) => x.label.trim() || x.value.trim()),
      seoTitle: d.seoTitle.trim() || `${d.name.trim()} · Santalum Maison`,
      seoDescription: d.seoDescription.trim() || d.short.trim(),
    };
    saveProduct(out, isNew);
    say(isNew ? `${out.name} added` : "Saved");
    if (isNew) router.push(`${BASE}/products/${slug}`);
  };

  const togglePhoto = (id: string) => {
    const has = d.photos.some((p) => p.id === id);
    set("photos", has ? d.photos.filter((p) => p.id !== id) : [...d.photos, { id, tone: d.wood === "white" ? "pale" : undefined }]);
  };
  const movePhoto = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= d.photos.length) return;
    const next = [...d.photos];
    [next[i], next[j]] = [next[j], next[i]];
    set("photos", next);
  };

  return (
    <div className="a4-page">
      <Head
        kicker={
          <Link href={`${BASE}/products`} className="a4-back">
            <Icon name="back" size={14} /> Products
          </Link>
        }
        title={isNew ? "A new piece" : d.name || "Untitled"}
        sub={isNew ? (d.name ? `Will be saved as ${slug}` : "Starts as a draft. Nothing shows on the shop until it is on sale.") : `${slug}${edited ? " · edited in this browser" : ""}`}
      >
        {!isNew && (
          <a href={`/maison/shop/${slug}`} className="a4-btn a4-btn-ghost" target="_blank" rel="noreferrer">
            View on shop
          </a>
        )}
        <button type="button" className="a4-btn a4-btn-ink" onClick={save}>
          {isNew ? "Add piece" : "Save changes"}
        </button>
      </Head>

      {tried && errors.length > 0 && (
        <ul className="a4-errors" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className="a4-editor">
        <section className="a4-paper a4-pad a4-sheet" aria-labelledby="e-basics">
          <h2 id="e-basics" className="a4-h2">
            Name and wood
          </h2>
          <div className="a4-form">
            <Field label="Name" wide>
              {(id) => <input id={id} value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Japa mala, 108 beads" />}
            </Field>
            <Field label="Wood">
              {() => (
                <Chips<Wood>
                  label="Wood"
                  value={d.wood}
                  onChange={(w) => setD((x) => ({ ...x, wood: w, category: CATEGORIES[w][0].id }))}
                  items={[
                    { id: "red", label: "Red sandalwood" },
                    { id: "white", label: "White sandalwood" },
                  ]}
                />
              )}
            </Field>
            <Field label="Category">
              {(id) => (
                <select id={id} value={d.category} onChange={(e) => set("category", e.target.value as ProductDraft["category"])}>
                  {CATEGORIES[d.wood].map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Short line" hint="One sentence under the name on the shop." wide>
              {(id) => <input id={id} value={d.short} onChange={(e) => set("short", e.target.value)} />}
            </Field>
          </div>
        </section>

        <section className="a4-paper a4-pad a4-sheet" aria-labelledby="e-price">
          <h2 id="e-price" className="a4-h2">
            Price and options
          </h2>
          <Field label="Option name" hint="Size, Length, Volume… Leave blank for a single price.">
            {(id) => <input id={id} value={d.optionName} onChange={(e) => set("optionName", e.target.value)} />}
          </Field>
          <div className="a4-opts" role="table" aria-label="Options">
            <div className="a4-opts-row a4-opts-head" role="row">
              <span role="columnheader">Label</span>
              <span role="columnheader">Price, ₹</span>
              <span role="columnheader">Stock</span>
              <span role="columnheader">
                <span className="a4-sr">Remove</span>
              </span>
            </div>
            {d.options.map((o, i) => (
              <div className="a4-opts-row" role="row" key={o.id}>
                <input aria-label={`Option ${i + 1} label`} value={o.label} onChange={(e) => setOpt(i, { label: e.target.value })} />
                <input aria-label={`Option ${i + 1} price`} inputMode="numeric" value={o.price || ""} onChange={(e) => setOpt(i, { price: Number(e.target.value.replace(/\D/g, "")) })} />
                <input aria-label={`Option ${i + 1} stock`} inputMode="numeric" value={o.stock} onChange={(e) => setOpt(i, { stock: Number(e.target.value.replace(/\D/g, "")) })} />
                <button type="button" className="a4-icon-btn" aria-label={`Remove option ${o.label || i + 1}`} disabled={d.options.length === 1} onClick={() => set("options", d.options.filter((_, j) => j !== i))}>
                  <Icon name="close" size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="a4-link-btn"
            onClick={() => set("options", [...d.options, { id: `opt-${Date.now().toString(36)}`, label: "", price: d.options[0]?.price ?? 0, stock: 0 }])}
          >
            + Add an option
          </button>
          <div className="a4-form">
            <Field label="Edition size" hint="For numbered editions only.">
              {(id) => <input id={id} inputMode="numeric" value={d.editionSize ?? ""} onChange={(e) => set("editionSize", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} />}
            </Field>
            <Field label="Left in edition">
              {(id) => <input id={id} inputMode="numeric" value={d.editionLeft ?? ""} onChange={(e) => set("editionLeft", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} />}
            </Field>
          </div>
        </section>

        <section className="a4-paper a4-pad a4-sheet a4-sheet-wide" aria-labelledby="e-photos">
          <h2 id="e-photos" className="a4-h2">
            Photos
          </h2>
          <p className="a4-sub">Pinned in order; the first is the cover. Tap a photo below to pin or unpin it.</p>
          {d.photos.length > 0 ? (
            <ol className="a4-pinned-row">
              {d.photos.map((p, i) => (
                <li key={p.id}>
                  <Pinned photoId={p.id} tone={p.tone} size="md" />
                  <span className="a4-pin-n">{i === 0 ? "Cover" : i + 1}</span>
                  <select
                    aria-label={`Tone for photo ${i + 1}`}
                    value={p.tone ?? ""}
                    onChange={(e) => set("photos", d.photos.map((x, j) => (j === i ? { ...x, tone: (e.target.value || undefined) as Tone | undefined } : x)))}
                  >
                    <option value="">As shot</option>
                    <option value="red">Warm</option>
                    <option value="pale">Pale</option>
                  </select>
                  <span className="a4-inline">
                    <button type="button" className="a4-icon-btn" aria-label="Move earlier" disabled={i === 0} onClick={() => movePhoto(i, -1)}>
                      <Icon name="back" size={14} />
                    </button>
                    <button type="button" className="a4-icon-btn" aria-label="Move later" disabled={i === d.photos.length - 1} onClick={() => movePhoto(i, 1)}>
                      <Icon name="arrow" size={14} />
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="a4-empty">No photos pinned yet.</p>
          )}
          <ul className="a4-library" aria-label="Photo library">
            {PHOTO_LIST.map((p) => {
              const on = d.photos.some((x) => x.id === p.id);
              return (
                <li key={p.id}>
                  <button type="button" aria-pressed={on} onClick={() => togglePhoto(p.id)} title={p.alt}>
                    <Pinned photoId={p.id} size="sm" pin={false} />
                    <span className="a4-sr">{on ? "Unpin" : "Pin"}: {p.alt}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="a4-paper a4-pad a4-sheet a4-sheet-wide" aria-labelledby="e-story">
          <h2 id="e-story" className="a4-h2">
            Story
          </h2>
          <Field label="Story" hint="Leave an empty line between paragraphs." wide>
            {(id) => <textarea id={id} rows={7} value={d.story} onChange={(e) => set("story", e.target.value)} />}
          </Field>
          <p className="a4-label">Details</p>
          <div className="a4-details">
            {d.details.map((x, i) => (
              <div key={i} className="a4-details-row">
                <input aria-label={`Detail ${i + 1} label`} placeholder="Bead size" value={x.label} onChange={(e) => set("details", d.details.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} />
                <input aria-label={`Detail ${i + 1} value`} placeholder="8 mm" value={x.value} onChange={(e) => set("details", d.details.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))} />
                <button type="button" className="a4-icon-btn" aria-label={`Remove detail ${i + 1}`} onClick={() => set("details", d.details.filter((_, j) => j !== i))}>
                  <Icon name="close" size={14} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="a4-link-btn" onClick={() => set("details", [...d.details, { label: "", value: "" }])}>
            + Add a detail
          </button>
          <Field label="Care" wide>
            {(id) => <textarea id={id} rows={3} value={d.care} onChange={(e) => set("care", e.target.value)} />}
          </Field>
        </section>

        <section className="a4-paper a4-pad a4-sheet" aria-labelledby="e-status">
          <h2 id="e-status" className="a4-h2">
            Status
          </h2>
          <Chips<ProductStatus>
            label="Status"
            value={d.status}
            onChange={(v) => set("status", v)}
            items={[
              { id: "active", label: "On sale" },
              { id: "draft", label: "Draft" },
              { id: "archived", label: "Archived" },
            ]}
          />
          <Field label="Badge">
            {(id) => (
              <select id={id} value={d.badge} onChange={(e) => set("badge", e.target.value as Badge | "")}>
                {BADGES.map((b) => (
                  <option key={b} value={b}>
                    {b || "None"}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Check checked={d.featured} onChange={(v) => set("featured", v)}>
            Featured on the homepage
          </Check>
          {!isNew && edited && (
            <button
              type="button"
              className="a4-link-btn"
              onClick={() => {
                revertProduct(d.slug);
                say("Back to the original");
              }}
            >
              Undo all edits to this piece
            </button>
          )}
        </section>

        <section className="a4-paper a4-pad a4-sheet" aria-labelledby="e-seo">
          <h2 id="e-seo" className="a4-h2">
            Search listing
          </h2>
          <Field label="Title" wide>
            {(id) => <input id={id} value={d.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={`${d.name || "Name"} · Santalum Maison`} />}
          </Field>
          <Field label="Description" hint={`${d.seoDescription.length}/160`} wide>
            {(id) => <textarea id={id} rows={3} maxLength={160} value={d.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} placeholder={d.short} />}
          </Field>
        </section>
      </div>
    </div>
  );
}
