"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, type Badge, type Wood } from "@/lib/shop/products";
import { formatINR } from "../../_data/format";
import { blankDraft, deleteCreated, PHOTO_LIST, photoById, revertProduct, saveProduct, setProductStatus, useProducts, type ProductRow } from "../../_data/store";
import type { DraftOption, ProductDraft, ProductStatus } from "../../_data/types";
import { I } from "./icons";
import { BASE, Card, Chip, Empty, Field, Head, Money, Search, Seg, Sheet, Toggle, WoodDot, say } from "./kit";

const STOCK_LABEL = { in: "In stock", low: "Low", out: "Out" } as const;

export function ProductsList() {
  const products = useProducts();
  const path = usePathname();
  const sel = path.split("/products/")[1];
  const [wood, setWood] = useState<"all" | Wood>("all");
  const [status, setStatus] = useState<ProductStatus>("active");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products.filter((p) => (wood === "all" || p.wood === wood) && p.status === status && (!t || p.name.toLowerCase().includes(t) || p.slug.includes(t)));
  }, [products, wood, status, q]);
  const n = (s: ProductStatus) => products.filter((p) => p.status === s && (wood === "all" || p.wood === wood)).length;

  return (
    <>
      <Head
        eyebrow={`${products.filter((p) => p.status === "active").length} on sale`}
        title="Products"
        action={
          <Link href={`${BASE}/products/new`} className="a5-fab" aria-label="New product" scroll={false}>
            <I n="plus" size={22} />
          </Link>
        }
      />
      <div className="a5-sticky">
        <Seg
          label="Wood"
          value={wood}
          onChange={setWood}
          items={[
            { id: "all", label: "Both woods" },
            { id: "red", label: "Red" },
            { id: "white", label: "White" },
          ]}
        />
        <div className="a5-chips">
          {(["active", "draft", "archived"] as const).map((s) => (
            <button key={s} type="button" className="a5-pill" aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s === "active" ? "On sale" : s === "draft" ? "Drafts" : "Archived"} <span className="a5-dim">{n(s)}</span>
            </button>
          ))}
        </div>
      </div>
      <Search value={q} onChange={setQ} placeholder="Search products" />
      {rows.length === 0 && <Empty title="No products here">Try the other wood or another status.</Empty>}
      <div className="a5-pgrid">
        {rows.map((p) => (
          <Link key={p.slug} href={`${BASE}/products/${p.slug}`} scroll={false} className="a5-ptile" data-sel={p.slug === sel ? "" : undefined}>
            <span className="a5-ptile-img">
              {p.photos[0] && <Photo p={photoById(p.photos[0].id)} sizes="(min-width: 1024px) 220px, 45vw" tone={p.photos[0].tone} />}
              {p.stock !== "in" && (
                <span className="a5-ptile-flag" data-s={p.stock}>
                  {STOCK_LABEL[p.stock]}
                </span>
              )}
            </span>
            <span className="a5-ptile-body">
              <span className="a5-ptile-name">{p.name}</span>
              <span className="a5-ptile-foot">
                <Money v={p.priceMin} size="m" />
                <WoodDot w={p.wood} />
              </span>
              <small>
                {p.stockTotal} in stock{p.options.length > 1 ? ` · ${p.options.length} ${p.optionName.toLowerCase() || "options"}` : ""}
              </small>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}

export function ProductsIdle() {
  const products = useProducts();
  const active = products.filter((p) => p.status === "active");
  const low = active.filter((p) => p.stock !== "in");
  return (
    <div className="a5-detail">
      <div className="a5-eyebrow">Catalogue</div>
      <h2 className="a5-detail-title">Pick a product to edit it here</h2>
      <div className="a5-pipe">
        {(["red", "white"] as const).map((w) => (
          <div key={w} className="a5-pipe-step">
            <span className="a5-tile-n">{active.filter((p) => p.wood === w).length}</span>
            <span className="a5-tile-l">
              <WoodDot w={w} label /> on sale
            </span>
          </div>
        ))}
        <Link href={`${BASE}/inventory`} className="a5-pipe-step">
          <span className="a5-tile-n">{low.length}</span>
          <span className="a5-tile-l">Low or out</span>
        </Link>
      </div>
    </div>
  );
}

/* ---------- editor ---------- */
export function ProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const products = useProducts();
  const row = products.find((p) => p.slug === slug);
  if (!row) return <Empty title="No such product">There is no product at {slug}.</Empty>;
  return <Editor key={row.slug + (row.updatedAt ?? "")} row={row} />;
}

export function NewProduct() {
  return <Editor />;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

function Editor({ row }: { row?: ProductRow }) {
  const isNew = !row;
  const router = useRouter();
  const products = useProducts();
  const [d, setD] = useState<ProductDraft>(() => (row ? { ...row, options: row.options.map((o) => ({ ...o })), photos: [...row.photos], details: row.details.map((x) => ({ ...x })) } : blankDraft("red")));
  const [pick, setPick] = useState(false);
  const [tried, setTried] = useState(false);
  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const setOpt = (i: number, p: Partial<DraftOption>) => set("options", d.options.map((o, j) => (j === i ? { ...o, ...p } : o)));

  const errors = {
    name: !d.name.trim() ? "Give the piece a name." : null,
    price: d.options.some((o) => !(o.price > 0)) ? "Every option needs a price." : null,
    label: d.options.some((o) => !o.label.trim()) ? "Every option needs a label." : null,
    photos: d.photos.length === 0 ? "Add at least one photo." : null,
  };
  const valid = !Object.values(errors).some(Boolean);

  function save() {
    setTried(true);
    if (!valid) return;
    let slug = d.slug;
    if (isNew) {
      const base = `${d.wood === "red" ? "r" : "w"}-${slugify(d.name)}`;
      slug = base;
      for (let i = 2; products.some((p) => p.slug === slug); i++) slug = `${base}-${i}`;
    }
    const clean: ProductDraft = { ...d, slug, name: d.name.trim(), seoTitle: d.seoTitle || `${d.name.trim()} · Santalum Maison`, seoDescription: d.seoDescription || d.short };
    saveProduct(clean, isNew);
    say(isNew ? "Product created" : "Saved");
    if (isNew) router.replace(`${BASE}/products/${slug}`, { scroll: false });
  }

  const cats = CATEGORIES[d.wood];
  return (
    <div className="a5-detail" data-form="">
      <div className="a5-detail-top">
        <div>
          <div className="a5-eyebrow">{isNew ? "New product" : d.slug}</div>
          <h2 className="a5-detail-title">{d.name || "Untitled piece"}</h2>
        </div>
        {row && <Chip tone={row.stock === "in" ? undefined : row.stock === "low" ? "gold" : "red"}>{STOCK_LABEL[row.stock]}</Chip>}
      </div>

      <Card title="Basics">
        <Field label="Name" error={tried ? errors.name : null}>
          {(id) => <input id={id} value={d.name} onChange={(e) => set("name", e.target.value)} />}
        </Field>
        <div className="a5-field">
          <span className="a5-label">Wood</span>
          <Seg
            label="Wood"
            value={d.wood}
            onChange={(w) => setD((x) => ({ ...x, wood: w, category: CATEGORIES[w].some((c) => c.id === x.category) ? x.category : CATEGORIES[w][0].id }))}
            items={[
              { id: "red", label: <WoodDot w="red" label /> },
              { id: "white", label: <WoodDot w="white" label /> },
            ]}
          />
        </div>
        <Field label="Category">
          {(id) => (
            <select id={id} value={d.category} onChange={(e) => set("category", e.target.value as ProductDraft["category"])}>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <div className="a5-field">
          <span className="a5-label">Status</span>
          <Seg
            label="Status"
            value={d.status}
            onChange={(s) => set("status", s)}
            items={[
              { id: "active", label: "On sale" },
              { id: "draft", label: "Draft" },
              { id: "archived", label: "Archived" },
            ]}
          />
        </div>
      </Card>

      <Card title="Price and options">
        <Field label="Option name" hint="Size, Volume, Length… Leave empty for a single price.">
          {(id) => <input id={id} value={d.optionName} onChange={(e) => set("optionName", e.target.value)} placeholder="Size" />}
        </Field>
        <div className="a5-opts">
          <div className="a5-opt-head" aria-hidden>
            <span>Label</span>
            <span>Price</span>
            <span>Stock</span>
          </div>
          {d.options.map((o, i) => (
            <div key={o.id} className="a5-opt">
              <input aria-label="Option label" value={o.label} onChange={(e) => setOpt(i, { label: e.target.value })} placeholder="Label" />
              <label className="a5-opt-price">
                <span className="a5-rs">₹</span>
                <input aria-label="Price" inputMode="numeric" value={o.price || ""} onChange={(e) => setOpt(i, { price: Number(e.target.value.replace(/\D/g, "")) })} placeholder="0" />
              </label>
              <input aria-label="Stock" inputMode="numeric" value={o.stock} onChange={(e) => setOpt(i, { stock: Number(e.target.value.replace(/\D/g, "")) })} />
              <button type="button" className="a5-round" aria-label={`Remove ${o.label}`} disabled={d.options.length === 1} onClick={() => set("options", d.options.filter((_, j) => j !== i))}>
                <I n="minus" size={16} />
              </button>
            </div>
          ))}
        </div>
        {tried && (errors.price || errors.label) && <small className="a5-err">{errors.price ?? errors.label}</small>}
        <button type="button" className="a5-btn" data-v="soft" onClick={() => set("options", [...d.options, { id: `opt-${d.options.length + 1}-${slugify(d.name || "x").slice(0, 6)}`, label: "", price: d.options[0]?.price ?? 0, stock: 0 }])}>
          <I n="plus" size={18} />
          Add an option
        </button>
      </Card>

      <Card title="Photos" action={<button type="button" className="a5-textbtn" onClick={() => setPick(true)}>Add</button>}>
        <div className="a5-photos">
          {d.photos.map((p, i) => (
            <div key={p.id + i} className="a5-photo">
              <Photo p={photoById(p.id)} sizes="120px" tone={p.tone} />
              {i === 0 && <span className="a5-photo-tag">Cover</span>}
              <div className="a5-photo-acts">
                {i > 0 && (
                  <button type="button" aria-label="Make cover" onClick={() => set("photos", [p, ...d.photos.filter((_, j) => j !== i)])}>
                    <I n="back" size={14} />
                  </button>
                )}
                <button type="button" aria-label="Remove photo" onClick={() => set("photos", d.photos.filter((_, j) => j !== i))}>
                  <I n="close" size={14} />
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="a5-photo a5-photo-add" onClick={() => setPick(true)}>
            <I n="plus" size={22} />
            Photo
          </button>
        </div>
        {tried && errors.photos && <small className="a5-err">{errors.photos}</small>}
      </Card>

      <Card title="Story">
        <Field label="One line for cards">{(id) => <input id={id} value={d.short} onChange={(e) => set("short", e.target.value)} />}</Field>
        <Field label="Story" hint="Blank lines start a new paragraph.">
          {(id) => <textarea id={id} rows={7} value={d.story} onChange={(e) => set("story", e.target.value)} />}
        </Field>
        <Field label="Care">{(id) => <textarea id={id} rows={3} value={d.care} onChange={(e) => set("care", e.target.value)} />}</Field>
      </Card>

      <Card title="On the shop">
        <Field label="Badge">
          {(id) => (
            <select id={id} value={d.badge} onChange={(e) => set("badge", e.target.value as Badge | "")}>
              <option value="">None</option>
              {(["New", "Edition", "Studio favourite", "Limited"] as const).map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          )}
        </Field>
        <div className="a5-two">
          <Field label="Edition size">{(id) => <input id={id} inputMode="numeric" value={d.editionSize ?? ""} onChange={(e) => set("editionSize", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} placeholder="Not an edition" />}</Field>
          <Field label="Left in edition">{(id) => <input id={id} inputMode="numeric" value={d.editionLeft ?? ""} onChange={(e) => set("editionLeft", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} />}</Field>
        </div>
        <Toggle on={d.featured} set={(v) => set("featured", v)} label="Feature on the landing page" sub="Keep to six or eight per wood." />
      </Card>

      {row && !isNew && (
        <div className="a5-quiet">
          {row.edited && !row.custom && (
            <button
              type="button"
              className="a5-textbtn"
              onClick={() => {
                revertProduct(row.slug);
                say("Back to the original");
              }}
            >
              Undo all edits
            </button>
          )}
          {row.status !== "archived" && (
            <button
              type="button"
              className="a5-textbtn"
              onClick={() => {
                setProductStatus([row.slug], "archived", products);
                say("Archived");
              }}
            >
              Archive
            </button>
          )}
          {row.custom && (
            <button
              type="button"
              className="a5-textbtn"
              data-v="danger"
              onClick={() => {
                deleteCreated(row.slug);
                say("Deleted");
                router.replace(`${BASE}/products`);
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}

      <div className="a5-savebar">
        <span className="a5-muted">{d.options.length > 1 ? `${formatINR(Math.min(...d.options.map((o) => o.price)))} to ${formatINR(Math.max(...d.options.map((o) => o.price)))}` : d.options[0]?.price ? formatINR(d.options[0].price) : "No price yet"}</span>
        <button type="button" className="a5-btn" data-v="primary" onClick={save}>
          {isNew ? "Create" : "Save"}
        </button>
      </div>

      <Sheet open={pick} onClose={() => setPick(false)} title="Add a photo" wide>
        <div className="a5-photos a5-photos-pick">
          {PHOTO_LIST.map((p) => (
            <button
              key={p.id}
              type="button"
              className="a5-photo"
              aria-label={p.alt}
              onClick={() => {
                set("photos", [...d.photos, { id: p.id, tone: d.wood === "white" ? "pale" : undefined }]);
                setPick(false);
              }}
            >
              <Photo p={p} sizes="120px" tone={d.wood === "white" ? "pale" : undefined} />
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
