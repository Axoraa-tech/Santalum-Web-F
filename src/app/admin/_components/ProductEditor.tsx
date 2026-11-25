"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, type Badge, type CategoryId, type Wood } from "@/lib/shop/products";
import { formatINR } from "../_data/format";
import { skuOf } from "../_data/mock";
import { blankDraft, deleteCreated, PHOTO_LIST, photoById, revertProduct, saveContent, saveProduct, useContent, useProducts, type ProductRow } from "../_data/store";
import type { ContentDraft, DraftOption, ProductDraft, ProductStatus } from "../_data/types";
import { Icon } from "./icons";
import { Empty, Field, Modal, PageHead, Panel, SearchField, Seg, Stars, Switch, toast, WoodLabel } from "./ui";

const FEATURED_PLACES = 8;

const BADGES: (Badge | "")[] = ["", "New", "Studio favourite", "Edition", "Limited"];

function toDraft(r: ProductRow): ProductDraft {
  return {
    slug: r.slug,
    wood: r.wood,
    name: r.name,
    category: r.category,
    optionName: r.optionName,
    options: r.options.map((o) => ({ ...o })),
    photos: r.photos.map((p) => ({ ...p })),
    short: r.short,
    story: r.story,
    details: r.details.map((d) => ({ ...d })),
    care: r.care,
    badge: r.badge,
    editionSize: r.editionSize,
    editionLeft: r.editionLeft,
    featured: r.featured,
    status: r.status,
    seoTitle: r.seoTitle,
    seoDescription: r.seoDescription,
  };
}

export function ProductEditorRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const products = useProducts();
  const content = { red: useContent("red"), white: useContent("white") };
  const row = products.find((p) => p.slug === decodeURIComponent(slug));
  if (!row)
    return (
      <div className="adm-page">
        <PageHead crumbs={[{ label: "Admin", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: slug }]} title="Product not found" />
        <div className="adm-panel">
          <Empty icon="products" title={`No product “${slug}”`} action={<Link href="/admin/products" className="adm-btn">Back to products</Link>} />
        </div>
      </div>
    );
  // "Featured" means "in the landing page's featured list", the same list Storefront content edits
  return <Editor key={row.slug + (row.updatedAt ?? "")} initial={{ ...toDraft(row), featured: content[row.wood].featured.includes(row.slug) }} row={row} isNew={false} />;
}

export function NewProduct() {
  return <Editor initial={blankDraft()} isNew />;
}

function slugFrom(name: string, wood: Wood) {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base ? `${wood === "red" ? "r" : "w"}-${base}` : "";
}
const optId = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "standard";

function Editor({ initial, row, isNew }: { initial: ProductDraft; row?: ProductRow; isNew: boolean }) {
  const router = useRouter();
  const products = useProducts();
  const [d, setD] = useState<ProductDraft>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [picker, setPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = useMemo(() => JSON.stringify(d) !== JSON.stringify(initial), [d, initial]);
  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const content: Record<Wood, ContentDraft> = { red: useContent("red"), white: useContent("white") };
  const othersFeatured = content[d.wood].featured.filter((s) => s !== d.slug).length;
  const placesFull = othersFeatured >= FEATURED_PLACES;
  const placesUsed = othersFeatured + (d.featured ? 1 : 0);
  const stockTotal = d.options.reduce((s, o) => s + (o.stock || 0), 0);
  const prices = d.options.map((o) => o.price).filter((n) => n > 0);
  const priceLabel = prices.length ? (new Set(prices).size > 1 ? `From ${formatINR(Math.min(...prices))}` : formatINR(prices[0])) : "₹–";

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (d.name.trim().length < 3) e.name = "Give the piece a name.";
    if (!/^[rw]-[a-z0-9-]{2,}$/.test(d.slug)) e.slug = `Slugs start with ${d.wood === "red" ? "r-" : "w-"} and use lowercase letters, digits and hyphens.`;
    else if (isNew && products.some((p) => p.slug === d.slug)) e.slug = "Another product already uses this slug.";
    else if ((d.wood === "red") !== d.slug.startsWith("r-")) e.slug = `${d.wood === "red" ? "Red" : "White"} sandalwood slugs start with ${d.wood === "red" ? "r-" : "w-"}.`;
    if (d.options.some((o) => !o.label.trim())) e.options = "Every option needs a label.";
    else if (d.options.some((o) => !(o.price > 0))) e.options = "Every option needs a price.";
    else if (new Set(d.options.map((o) => optId(o.label))).size !== d.options.length) e.options = "Two options have the same label.";
    if (d.status === "active" && !d.photos.length) e.photos = "Add at least one photo before making the piece active.";
    if (d.status === "active" && d.short.trim().length < 10) e.short = "Write a short line for the product card.";
    if (d.editionSize !== null && d.editionLeft !== null && d.editionLeft > d.editionSize) e.edition = "Pieces left can't be more than the edition size.";
    return e;
  }

  function save() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast("Check the highlighted fields");
      document.querySelector(`[data-err="${Object.keys(e)[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const clean: ProductDraft = {
      ...d,
      name: d.name.trim(),
      options: d.options.map((o) => ({ ...o, id: optId(o.label), label: o.label.trim() })),
      details: d.details.filter((x) => x.label.trim() || x.value.trim()),
      seoTitle: d.seoTitle.trim() || `${d.name.trim()} · Santalum Maison`,
      seoDescription: d.seoDescription.trim() || d.short.trim(),
    };
    saveProduct(clean, isNew);
    // keep the landing page's featured list in step with the switch, in both woods
    for (const w of ["red", "white"] as const) {
      const list = content[w].featured;
      const want = clean.featured && w === clean.wood;
      const has = list.includes(clean.slug);
      if (want && !has && list.length < FEATURED_PLACES) saveContent(w, { ...content[w], featured: [...list, clean.slug] });
      if (!want && has) saveContent(w, { ...content[w], featured: list.filter((s) => s !== clean.slug) });
    }
    toast(isNew ? `${clean.name} created` : `${clean.name} saved`);
    if (isNew) router.replace(`/admin/products/${clean.slug}`);
  }

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setOption = (i: number, patch: Partial<DraftOption>) => set("options", d.options.map((o, j) => (j === i ? { ...o, ...patch } : o)));
  const cover = d.photos[0];

  return (
    <div className="adm-page">
      <PageHead
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: isNew ? "New product" : d.name || d.slug }]}
        title={isNew ? "New product" : initial.name}
        sub={
          isNew ? (
            "Drafts are only visible here until you make them active."
          ) : (
            <span style={{ display: "inline-flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <WoodLabel wood={initial.wood} />
              <span className="adm-muted">/{initial.slug}</span>
              {row && row.rating.count > 0 && (
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <Stars value={row.rating.avg} /> <span className="adm-muted">({row.rating.count} reviews)</span>
                </span>
              )}
            </span>
          )
        }
        actions={
          <>
            {!isNew && (
              <a href={`/maison/shop/${initial.slug}`} target="_blank" rel="noreferrer" className="adm-btn">
                <Icon name="external" />
                View on shop
              </a>
            )}
            {row?.edited && !row.custom && (
              <button
                type="button"
                className="adm-btn"
                data-variant="ghost"
                onClick={() => {
                  revertProduct(initial.slug);
                  toast("Reverted to the catalogue version");
                }}
              >
                <Icon name="undo" />
                Revert
              </button>
            )}
            {row?.custom && (
              <button type="button" className="adm-btn" data-variant="danger" onClick={() => setConfirmDelete(true)}>
                <Icon name="trash" />
                Delete
              </button>
            )}
            <button type="button" className="adm-btn" data-variant="primary" onClick={save} disabled={!dirty && !isNew}>
              {isNew ? "Create product" : "Save"}
            </button>
          </>
        }
      />

      <div className="adm-grid adm-cols-main" style={{ gridTemplateColumns: undefined }}>
        <div className="adm-stack">
          <Panel title="Basics" id="ed-basics">
            <div className="adm-form-grid">
              <Field label="Name" className="adm-span-2" error={errors.name}>
                {(id) => (
                  <input
                    id={id}
                    data-err="name"
                    className="adm-input"
                    value={d.name}
                    aria-invalid={!!errors.name}
                    placeholder="e.g. Japa Mala, 108 beads"
                    onChange={(e) => {
                      const name = e.target.value;
                      setD((x) => ({ ...x, name, slug: slugTouched ? x.slug : slugFrom(name, x.wood) }));
                    }}
                  />
                )}
              </Field>
              <Field label="Wood">
                {() => (
                  <Seg
                    label="Wood"
                    value={d.wood}
                    onChange={(w) =>
                      setD((x) => ({
                        ...x,
                        wood: w,
                        category: CATEGORIES[w][0].id,
                        slug: slugTouched ? x.slug.replace(/^[rw]-/, w === "red" ? "r-" : "w-") : slugFrom(x.name, w),
                        photos: x.photos.map((p) => ({ ...p, tone: w === "white" ? p.tone : undefined })),
                      }))
                    }
                    items={[
                      { id: "red", label: <><i className="ring-red" style={{ width: 10, height: 10, borderRadius: 9, display: "inline-block" }} />Red sandalwood</> },
                      { id: "white", label: <><i className="ring-white" style={{ width: 10, height: 10, borderRadius: 9, display: "inline-block" }} />White sandalwood</> },
                    ]}
                  />
                )}
              </Field>
              <Field label="Category">
                {(id) => (
                  <select id={id} className="adm-select" value={d.category} onChange={(e) => set("category", e.target.value as CategoryId)}>
                    {CATEGORIES[d.wood].map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="URL slug" className="adm-span-2" error={errors.slug} hint={`santalum.in/maison/shop/${d.slug || "…"}`}>
                {(id) => (
                  <input
                    id={id}
                    data-err="slug"
                    className="adm-input"
                    value={d.slug}
                    aria-invalid={!!errors.slug}
                    readOnly={!isNew}
                    title={isNew ? undefined : "Slugs are fixed once a product is live, so links keep working."}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                    }}
                  />
                )}
              </Field>
              <Field label="Short line" className="adm-span-2" count={`${d.short.length}/120`} error={errors.short} hint="One sentence for product cards.">
                {(id) => <input id={id} data-err="short" className="adm-input" maxLength={120} value={d.short} onChange={(e) => set("short", e.target.value)} aria-invalid={!!errors.short} />}
              </Field>
            </div>
          </Panel>

          <Panel
            title="Price and stock"
            meta={d.options.length > 1 ? `${d.options.length} options` : "One size. Add options for bead sizes, volumes or weights."}
            id="ed-price"
            action={
              <button type="button" className="adm-btn" data-size="sm" onClick={() => set("options", [...d.options, { id: `opt-${d.options.length + 1}`, label: "", price: d.options[d.options.length - 1]?.price ?? 0, stock: 0 }])}>
                <Icon name="plus" />
                Add option
              </button>
            }
          >
            {d.options.length > 1 && (
              <Field label="Option name" className="" hint="Shown above the choices, e.g. “Bead size” or “Volume”.">
                {(id) => <input id={id} className="adm-input" value={d.optionName} onChange={(e) => set("optionName", e.target.value)} style={{ maxWidth: 280 }} />}
              </Field>
            )}
            <div className="adm-rows" data-err="options" style={{ marginTop: d.options.length > 1 ? 14 : 0 }}>
              <div className="adm-row adm-row-head adm-opthead" style={{ gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr) minmax(0,.8fr) minmax(0,1fr) 28px" }}>
                <span>Option</span>
                <span>Price</span>
                <span>In stock</span>
                <span>SKU</span>
                <span />
              </div>
              {d.options.map((o, i) => (
                <div key={i} className="adm-row adm-optrow" style={{ gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr) minmax(0,.8fr) minmax(0,1fr) 28px" }}>
                  <input className="adm-input" aria-label={`Option ${i + 1} label`} value={o.label} placeholder="e.g. 8 mm" onChange={(e) => setOption(i, { label: e.target.value })} />
                  <div className="adm-affix">
                    <span>₹</span>
                    <input className="adm-input num" inputMode="numeric" aria-label={`Option ${i + 1} price`} value={o.price || ""} onChange={(e) => setOption(i, { price: Number(e.target.value.replace(/\D/g, "")) })} />
                  </div>
                  <div className="adm-affix">
                    <input className="adm-input num" inputMode="numeric" aria-label={`Option ${i + 1} stock`} value={String(o.stock)} onChange={(e) => setOption(i, { stock: Number(e.target.value.replace(/\D/g, "")) || 0 })} />
                    <span data-end="">in stock</span>
                  </div>
                  <span className="adm-muted num" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {d.slug ? skuOf(d.slug, optId(o.label)) : "–"}
                  </span>
                  <button type="button" className="adm-btn" data-variant="ghost" data-size="icon-sm" aria-label={`Remove option ${o.label || i + 1}`} disabled={d.options.length === 1} onClick={() => set("options", d.options.filter((_, j) => j !== i))}>
                    <Icon name="close" />
                  </button>
                </div>
              ))}
            </div>
            {errors.options && <p className="adm-error">{errors.options}</p>}
            <p className="adm-hint" style={{ margin: "12px 0 0" }}>
              Prices include GST. Stock changes here are logged in Inventory.
            </p>
          </Panel>

          <Panel
            title="Photos"
            meta={`${d.photos.length} selected. The first is the cover.`}
            id="ed-photos"
            action={
              <button type="button" className="adm-btn" data-size="sm" onClick={() => setPicker(true)}>
                <Icon name="image" />
                Choose photos
              </button>
            }
          >
            <div data-err="photos">
              {d.photos.length ? (
                <div className="adm-photos">
                  {d.photos.map((p, i) => (
                    <div key={p.id} className="adm-photo">
                      <Photo p={photoById(p.id)} tone={p.tone} sizes="120px" />
                      {i === 0 && (
                        <span className="adm-tag adm-cover-tag" data-tone="ink">
                          Cover
                        </span>
                      )}
                      <div className="adm-photo-actions">
                        {i > 0 && (
                          <button type="button" aria-label="Make cover" title="Make cover" onClick={() => set("photos", [p, ...d.photos.filter((x) => x.id !== p.id)])}>
                            <Icon name="star" />
                          </button>
                        )}
                        <button type="button" aria-label="Remove photo" title="Remove" onClick={() => set("photos", d.photos.filter((x) => x.id !== p.id))}>
                          <Icon name="trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty icon="image" title="No photos yet" action={<button type="button" className="adm-btn" onClick={() => setPicker(true)}>Choose from the library</button>}>
                  Pick from the Maison&apos;s photo library.
                </Empty>
              )}
              {errors.photos && <p className="adm-error">{errors.photos}</p>}
              {d.wood === "white" && d.photos.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <Switch
                    checked={d.photos.every((p) => p.tone === "pale")}
                    onChange={(v) => set("photos", d.photos.map((p) => ({ ...p, tone: v ? "pale" : undefined })))}
                    label="Pale the placeholder photos to the white sandalwood tone"
                  />
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Story, details and care" id="ed-story">
            <div style={{ display: "grid", gap: 14 }}>
              <Field label="Story" hint="Two or three short paragraphs. Leave a blank line between paragraphs.">
                {(id) => <textarea id={id} className="adm-textarea" rows={6} value={d.story} onChange={(e) => set("story", e.target.value)} />}
              </Field>
              <div>
                <div className="adm-label" style={{ marginBottom: 6 }}>
                  <span>Details</span>
                  <button type="button" className="adm-btn" data-size="sm" data-variant="ghost" onClick={() => set("details", [...d.details, { label: "", value: "" }])}>
                    <Icon name="plus" />
                    Add row
                  </button>
                </div>
                <div className="adm-rows">
                  {d.details.map((x, i) => (
                    <div key={i} className="adm-row" style={{ gridTemplateColumns: "minmax(0,.7fr) minmax(0,1.6fr) 28px" }}>
                      <input className="adm-input" aria-label={`Detail ${i + 1} label`} placeholder="Label, e.g. Beads" value={x.label} onChange={(e) => set("details", d.details.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} />
                      <input className="adm-input" aria-label={`Detail ${i + 1} value`} placeholder="Value, e.g. 108 + 1 guru bead" value={x.value} onChange={(e) => set("details", d.details.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))} />
                      <button type="button" className="adm-btn" data-variant="ghost" data-size="icon-sm" aria-label={`Remove detail ${i + 1}`} onClick={() => set("details", d.details.filter((_, j) => j !== i))}>
                        <Icon name="close" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <Field label="Care">{(id) => <textarea id={id} className="adm-textarea" rows={2} value={d.care} onChange={(e) => set("care", e.target.value)} />}</Field>
            </div>
          </Panel>

          <Panel title="Merchandising" id="ed-merch">
            <div className="adm-form-grid">
              <Field label="Badge">
                {(id) => (
                  <select id={id} className="adm-select" value={d.badge} onChange={(e) => set("badge", e.target.value as Badge | "")}>
                    {BADGES.map((b) => (
                      <option key={b} value={b}>
                        {b || "No badge"}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Status" hint={d.status === "draft" ? "Hidden from the shop." : d.status === "archived" ? "Hidden, kept for past orders." : "Visible on the shop."}>
                {(id) => (
                  <select id={id} className="adm-select" value={d.status} onChange={(e) => set("status", e.target.value as ProductStatus)}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                )}
              </Field>
              <Field label="Edition size" hint="Numbered editions only. Leave empty otherwise." error={errors.edition}>
                {(id) => <input id={id} data-err="edition" className="adm-input num" inputMode="numeric" value={d.editionSize ?? ""} placeholder="e.g. 21" onChange={(e) => set("editionSize", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} />}
              </Field>
              <Field label="Pieces left">
                {(id) => <input id={id} className="adm-input num" inputMode="numeric" value={d.editionLeft ?? ""} disabled={d.editionSize === null} onChange={(e) => set("editionLeft", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} />}
              </Field>
              <div className="adm-span-2">
                <Switch
                  checked={d.featured}
                  disabled={!d.featured && placesFull}
                  onChange={(v) => set("featured", v)}
                  label={
                    <span>
                      Feature on the {d.wood === "red" ? "red" : "white"} sandalwood landing page{" "}
                      <span className="adm-muted num">
                        · {placesUsed} of {FEATURED_PLACES} places used
                      </span>
                    </span>
                  }
                />
                {!d.featured && placesFull && (
                  <p className="adm-hint" style={{ margin: "6px 0 0 48px" }}>
                    All {FEATURED_PLACES} places are taken.{" "}
                    <Link className="adm-link" href="/admin/content">
                      Free one in Storefront content
                    </Link>{" "}
                    to feature this piece.
                  </p>
                )}
                {d.featured && d.status !== "active" && (
                  <p className="adm-hint" style={{ margin: "6px 0 0 48px" }}>
                    It shows on the landing page once the piece is active.
                  </p>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="Search engine listing" id="ed-seo">
            <div style={{ display: "grid", gap: 14 }}>
              <Field label="Page title" count={`${(d.seoTitle || `${d.name} · Santalum Maison`).length}/60`}>
                {(id) => <input id={id} className="adm-input" value={d.seoTitle} placeholder={`${d.name || "Name"} · Santalum Maison`} onChange={(e) => set("seoTitle", e.target.value)} />}
              </Field>
              <Field label="Meta description" count={`${(d.seoDescription || d.short).length}/160`}>
                {(id) => <textarea id={id} className="adm-textarea" rows={2} value={d.seoDescription} placeholder={d.short} onChange={(e) => set("seoDescription", e.target.value)} />}
              </Field>
              <div className="adm-serp" aria-label="Search result preview">
                <div className="adm-serp-url">santalum.in › maison › shop › {d.slug || "…"}</div>
                <div className="adm-serp-title">{(d.seoTitle || `${d.name || "Name"} · Santalum Maison`).slice(0, 62)}</div>
                <div className="adm-serp-desc">{(d.seoDescription || d.short || "The short line appears here until a description is written.").slice(0, 160)}</div>
              </div>
            </div>
          </Panel>
        </div>

        <aside className="adm-stack adm-sticky" aria-label="Preview">
          <div className="adm-muted" style={{ fontSize: 12.5, display: "flex", justifyContent: "space-between" }}>
            <span>Live preview, as on the shop</span>
            <span>{d.status === "active" ? "Active" : d.status === "draft" ? "Draft" : "Archived"}</span>
          </div>
          <div className="adm-preview" data-wood={d.wood}>
            <div className="adm-preview-img">
              {cover ? <Photo p={photoById(cover.id)} tone={cover.tone} sizes="340px" priority /> : <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--a-ink-3)" }}><Icon name="image" width={28} height={28} /></div>}
              {d.badge && (
                <span className="adm-tag" data-tone={d.badge === "Edition" || d.badge === "Limited" ? "ink" : d.wood === "red" ? "red" : "gold"}>
                  {d.badge}
                </span>
              )}
            </div>
            {d.photos.length > 1 && (
              <div className="adm-preview-strip">
                {d.photos.slice(1, 5).map((p) => (
                  <div key={p.id}>
                    <Photo p={photoById(p.id)} tone={p.tone} sizes="48px" />
                  </div>
                ))}
              </div>
            )}
            <div className="adm-preview-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <h3 className="adm-preview-name">{d.name || "Untitled piece"}</h3>
                <span className="num" style={{ fontSize: 14, whiteSpace: "nowrap" }}>
                  {priceLabel}
                </span>
              </div>
              <p className="adm-ink2" style={{ margin: "6px 0 0", fontSize: 13.5 }}>
                {d.short || "The short line shows here."}
              </p>
              {d.editionSize !== null && (
                <p className="adm-muted num" style={{ margin: "8px 0 0", fontSize: 12.5 }}>
                  {d.editionLeft ?? d.editionSize} of {d.editionSize} left
                </p>
              )}
            </div>
          </div>
          <div className="adm-panel" style={{ padding: "12px 16px" }}>
            <dl className="adm-dl">
              <dt>In stock</dt>
              <dd className="num">
                {stockTotal} across {d.options.length} {d.options.length === 1 ? "option" : "options"}
              </dd>
              <dt>Category</dt>
              <dd>{CATEGORIES[d.wood].find((c) => c.id === d.category)?.label}</dd>
              {row && (
                <>
                  <dt>Reviews</dt>
                  <dd>
                    <Link className="adm-link" href="/admin/reviews">
                      {row.rating.count} published
                    </Link>
                  </dd>
                </>
              )}
            </dl>
          </div>
        </aside>
      </div>

      {(dirty || isNew) && (
        <div className="adm-savebar adm-noprint" role="region" aria-label="Unsaved changes">
          <Icon name="edit" width={16} height={16} />
          <span style={{ flex: 1 }}>{isNew ? "New product, not saved yet" : "Unsaved changes"}</span>
          <span className="adm-savebar-key">Ctrl + S</span>
          {!isNew && (
            <button type="button" className="adm-btn" data-variant="ghost" data-size="sm" onClick={() => setD(initial)}>
              Discard
            </button>
          )}
          <button type="button" className="adm-btn" data-size="sm" onClick={save}>
            {isNew ? "Create product" : "Save changes"}
          </button>
        </div>
      )}

      <PhotoPicker
        open={picker}
        onClose={() => setPicker(false)}
        chosen={d.photos.map((p) => p.id)}
        onDone={(ids) => {
          set(
            "photos",
            ids.map((id) => d.photos.find((p) => p.id === id) ?? { id, tone: d.wood === "white" && d.photos[0]?.tone === "pale" ? "pale" : undefined }),
          );
          setPicker(false);
        }}
      />
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete ${initial.name}?`}
        description="This removes the product you created in the preview. It cannot be undone."
        footer={
          <>
            <button type="button" className="adm-btn" onClick={() => setConfirmDelete(false)}>
              Keep it
            </button>
            <button
              type="button"
              className="adm-btn"
              data-variant="accent"
              onClick={() => {
                deleteCreated(initial.slug);
                toast("Product deleted");
                router.push("/admin/products");
              }}
            >
              Delete product
            </button>
          </>
        }
      >
        <p style={{ margin: 0 }} className="adm-ink2">
          Past orders keep their own copy of the name and price.
        </p>
      </Modal>
    </div>
  );
}

function PhotoPicker({ open, onClose, chosen, onDone }: { open: boolean; onClose: () => void; chosen: string[]; onDone: (ids: string[]) => void }) {
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Photo library" description="Placeholder photography until the Maison's own shoot. Click to add or remove; the order you pick is the order shown.">
      {open && <PickerBody chosen={chosen} onClose={onClose} onDone={onDone} />}
    </Modal>
  );
}
function PickerBody({ chosen, onClose, onDone }: { chosen: string[]; onClose: () => void; onDone: (ids: string[]) => void }) {
  const [sel, setSel] = useState<string[]>(chosen);
  const [q, setQ] = useState("");
  const list = PHOTO_LIST.filter((p) => !q || p.alt.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <SearchField label="Search photos" placeholder="Search by what is in the photo: beads, oil, carving…" value={q} onChange={setQ} />
      <div className="adm-photos" style={{ maxHeight: "52svh", overflowY: "auto", padding: 4 }}>
        {list.map((p) => {
          const i = sel.indexOf(p.id);
          return (
            <button key={p.id} type="button" className="adm-photo" aria-pressed={i >= 0} title={p.alt} aria-label={p.alt} onClick={() => setSel((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))}>
              <Photo p={p} sizes="120px" />
              {i >= 0 && <span className="adm-photo-check">{i + 1}</span>}
            </button>
          );
        })}
      </div>
      <div className="adm-modal-foot" style={{ padding: "6px 0 12px" }}>
        <span className="adm-muted" style={{ marginRight: "auto", alignSelf: "center", fontSize: 13 }}>
          {sel.length} selected
        </span>
        <button type="button" className="adm-btn" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="adm-btn" data-variant="primary" onClick={() => onDone(sel)}>
          Use {sel.length} {sel.length === 1 ? "photo" : "photos"}
        </button>
      </div>
    </>
  );
}
