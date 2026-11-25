"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, type Badge, type Wood } from "@/lib/shop/products";
import { blankDraft, PHOTO_LIST, photoById, revertProduct, saveProduct, useProducts } from "../../_data/store";
import type { DraftOption, ProductDraft, ProductStatus } from "../../_data/types";
import { BASE, Box, Btn, F, Head, Led, Seg, say, Toggle, typingIn, paletteStore } from "./kit";
import { STATUS_TONE } from "./Products";

export function ProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const rows = useProducts();
  const row = rows.find((r) => r.slug === slug);
  if (!row) {
    return (
      <div className="a3-page">
        <Head path="~/products/" title={slug} meta="not found" />
        <Link href={`${BASE}/products`}>← products</Link>
      </div>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { custom, edited, stockTotal, stock, priceMin, priceMax, rating, ...draft } = row;
  return <Editor key={`${slug}:${draft.updatedAt ?? 0}:${edited}`} initial={draft} isNew={false} edited={edited} custom={custom} />;
}

export function NewProduct() {
  return <Editor initial={blankDraft("red")} isNew edited={false} custom />;
}

const slugify = (wood: Wood, name: string) =>
  (wood === "red" ? "r-" : "w-") +
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

const BADGES: (Badge | "")[] = ["", "New", "Edition", "Studio favourite", "Limited"];

function Editor({ initial, isNew, edited, custom }: { initial: ProductDraft; isNew: boolean; edited: boolean; custom: boolean }) {
  const router = useRouter();
  const all = useProducts();
  const [d, setD] = useState<ProductDraft>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errs, setErrs] = useState<string[]>([]);
  const dirty = JSON.stringify(d) !== JSON.stringify(initial);
  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setD((x) => ({ ...x, [k]: v }));

  const save = () => {
    const e: string[] = [];
    if (!d.name.trim()) e.push("name is required");
    if (!/^[rw]-[a-z0-9-]+$/.test(d.slug)) e.push("slug: r- or w- then a-z, 0-9, -");
    if (isNew && all.some((p) => p.slug === d.slug)) e.push(`slug ${d.slug} is taken`);
    if (d.options.some((o) => !o.label.trim() || o.price <= 0)) e.push("each option needs a label and a price");
    if (d.photos.length === 0) e.push("pick at least one photo");
    if (d.status === "active" && !d.short.trim()) e.push("a live product needs a short line");
    setErrs(e);
    if (e.length) return;
    saveProduct({ ...d, name: d.name.trim() }, isNew);
    say(`${d.slug} saved`);
    if (isNew) router.replace(`${BASE}/products/${d.slug}`);
  };
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      } else if (e.key === "Escape" && !typingIn(e.target) && !paletteStore.get()) router.push(`${BASE}/products`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const setOpt = (i: number, patch: Partial<DraftOption>) => set("options", d.options.map((o, j) => (j === i ? { ...o, ...patch } : o)));
  const cats = CATEGORIES[d.wood];

  return (
    <div className="a3-page a3-editor">
      <Link href={`${BASE}/products`} className="a3-back">
        ← products
      </Link>
      <Head path="~/products/" title={isNew ? "new" : d.slug} meta={<span className="a3-st"><Led tone={STATUS_TONE[d.status]} /> {d.status}{dirty ? " · unsaved" : ""}</span>}>
        {!isNew && edited && !custom && (
          <Btn
            kind="ghost"
            onClick={() => {
              revertProduct(d.slug);
              say("reverted to catalogue");
            }}
          >
            revert
          </Btn>
        )}
        {!isNew && (
          <a className="a3-btn" data-kind="ghost" href={`/d/01/p/${d.slug}`} target="_blank" rel="noreferrer">
            view in shop ↗
          </a>
        )}
        <Btn kind="primary" hint="⌘S" onClick={save}>
          save
        </Btn>
      </Head>

      {errs.length > 0 && (
        <ul className="a3-errs" role="alert">
          {errs.map((e) => (
            <li key={e}>! {e}</li>
          ))}
        </ul>
      )}

      <div className="a3-ed-grid">
        <div className="a3-ed-col">
          <Box title="identity">
            <div className="a3-form">
              <F label="name" wide>
                <input
                  value={d.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setD((x) => ({ ...x, name, slug: slugTouched ? x.slug : slugify(x.wood, name), seoTitle: slugTouched ? x.seoTitle : name ? `${name} · Santalum Maison` : "" }));
                  }}
                  autoFocus={isNew}
                />
              </F>
              <F label="slug" wide>
                <input
                  className="a3-mono"
                  value={d.slug}
                  disabled={!isNew}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase());
                  }}
                />
              </F>
              <F label="wood">
                <Seg
                  value={d.wood}
                  label="Wood"
                  onChange={(w) => {
                    if (!isNew) return;
                    setD((x) => ({ ...x, wood: w, category: CATEGORIES[w][0].id, slug: slugTouched ? x.slug : slugify(w, x.name) }));
                  }}
                  items={[
                    { id: "red", label: "red" },
                    { id: "white", label: "white" },
                  ]}
                />
              </F>
              <F label="category">
                <select value={d.category} onChange={(e) => set("category", e.target.value as ProductDraft["category"])}>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </F>
              <F label="status">
                <Seg<ProductStatus> value={d.status} onChange={(v) => set("status", v)} label="Status" items={(["active", "draft", "archived"] as const).map((s) => ({ id: s, label: s }))} />
              </F>
              <F label="badge">
                <select value={d.badge} onChange={(e) => set("badge", e.target.value as ProductDraft["badge"])}>
                  {BADGES.map((b) => (
                    <option key={b} value={b}>
                      {b || "none"}
                    </option>
                  ))}
                </select>
              </F>
              <F label="edition size">
                <input inputMode="numeric" className="a3-mono" value={d.editionSize ?? ""} onChange={(e) => set("editionSize", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} placeholder="open" />
              </F>
              <F label="edition left">
                <input inputMode="numeric" className="a3-mono" value={d.editionLeft ?? ""} onChange={(e) => set("editionLeft", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} placeholder="–" />
              </F>
              <Toggle checked={d.featured} onChange={(v) => set("featured", v)} label="featured on the landing page" />
            </div>
          </Box>

          <Box title={`options · ${d.options.length}`} meta="price in ₹, incl. gst">
            <F label="option name" wide>
              <input value={d.optionName} onChange={(e) => set("optionName", e.target.value)} placeholder="Size, Weight… (blank for one option)" />
            </F>
            <table className="a3-t a3-opts">
              <thead>
                <tr>
                  <th>label</th>
                  <th className="r">price</th>
                  <th className="r">stock</th>
                  <th aria-label="Remove" />
                </tr>
              </thead>
              <tbody>
                {d.options.map((o, i) => (
                  <tr key={i}>
                    <td>
                      <input aria-label={`Option ${i + 1} label`} value={o.label} onChange={(e) => setOpt(i, { label: e.target.value, id: isNew || custom ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `opt-${i}` : o.id })} />
                    </td>
                    <td className="r">
                      <input aria-label={`Option ${i + 1} price`} className="a3-mono r" inputMode="numeric" value={o.price || ""} onChange={(e) => setOpt(i, { price: Number(e.target.value.replace(/\D/g, "")) })} />
                    </td>
                    <td className="r">
                      <input aria-label={`Option ${i + 1} stock`} className="a3-mono r" inputMode="numeric" value={o.stock} onChange={(e) => setOpt(i, { stock: Number(e.target.value.replace(/\D/g, "")) })} />
                    </td>
                    <td className="r">
                      <button type="button" className="a3-x" aria-label={`Remove option ${o.label}`} disabled={d.options.length < 2} onClick={() => set("options", d.options.filter((_, j) => j !== i))}>
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Btn kind="ghost" onClick={() => set("options", [...d.options, { id: `opt-${d.options.length + 1}`, label: "", price: d.options[0]?.price ?? 0, stock: 0 }])}>
              + option
            </Btn>
          </Box>

          <Box title="story">
            <div className="a3-form">
              <F label="short line (cards)" wide>
                <input value={d.short} onChange={(e) => set("short", e.target.value)} maxLength={140} />
              </F>
              <F label="story (blank line between paragraphs)" wide>
                <textarea rows={7} value={d.story} onChange={(e) => set("story", e.target.value)} />
              </F>
              <F label="care" wide>
                <textarea rows={3} value={d.care} onChange={(e) => set("care", e.target.value)} />
              </F>
            </div>
            <div className="a3-f-l">details</div>
            {d.details.map((x, i) => (
              <div key={i} className="a3-pair">
                <input aria-label="Detail label" value={x.label} placeholder="label" onChange={(e) => set("details", d.details.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} />
                <input aria-label="Detail value" value={x.value} placeholder="value" onChange={(e) => set("details", d.details.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))} />
                <button type="button" className="a3-x" aria-label="Remove detail" onClick={() => set("details", d.details.filter((_, j) => j !== i))}>
                  ×
                </button>
              </div>
            ))}
            <Btn kind="ghost" onClick={() => set("details", [...d.details, { label: "", value: "" }])}>
              + detail
            </Btn>
          </Box>
        </div>

        <div className="a3-ed-col">
          <Box title={`photos · ${d.photos.length}`} meta="first is the cover">
            <ol className="a3-photos">
              {d.photos.map((p, i) => (
                <li key={p.id + i}>
                  <span className="a3-ph">
                    <Photo p={photoById(p.id)} sizes="96px" tone={p.tone} />
                  </span>
                  <span className="a3-ph-ctl">
                    <span className="a3-mono a3-dim">{String(i + 1).padStart(2, "0")}</span>
                    <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => set("photos", swap(d.photos, i, i - 1))}>
                      ↑
                    </button>
                    <button type="button" aria-label="Toggle tone" onClick={() => set("photos", d.photos.map((x, j) => (j === i ? { ...x, tone: x.tone === "pale" ? undefined : "pale" } : x)))}>
                      {p.tone ?? "raw"}
                    </button>
                    <button type="button" aria-label="Remove photo" onClick={() => set("photos", d.photos.filter((_, j) => j !== i))}>
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ol>
            <details className="a3-pick">
              <summary>library · {PHOTO_LIST.length}</summary>
              <div className="a3-pick-grid">
                {PHOTO_LIST.map((p) => {
                  const on = d.photos.some((x) => x.id === p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={on}
                      title={p.alt}
                      onClick={() => set("photos", on ? d.photos.filter((x) => x.id !== p.id) : [...d.photos, { id: p.id, tone: d.wood === "white" ? "pale" : undefined }])}
                    >
                      <Photo p={p} sizes="72px" />
                    </button>
                  );
                })}
              </div>
            </details>
          </Box>

          <Box title="search">
            <div className="a3-form">
              <F label="seo title" wide>
                <input value={d.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
              </F>
              <F label={`seo description · ${d.seoDescription.length}/160`} wide>
                <textarea rows={3} maxLength={160} value={d.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
              </F>
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
}

function swap<T>(a: T[], i: number, j: number) {
  const b = [...a];
  [b[i], b[j]] = [b[j], b[i]];
  return b;
}
