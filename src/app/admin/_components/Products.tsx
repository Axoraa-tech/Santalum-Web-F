"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, type Wood } from "@/lib/shop/products";
import { formatINR } from "../_data/format";
import { stockKey } from "../_data/mock";
import { photoById, setProductStatus, stockState, useContent, useProducts, useStock, type ProductRow } from "../_data/store";
import type { ProductStatus } from "../_data/types";
import { Icon } from "./icons";
import { Empty, PageHead, Pager, SearchField, Seg, Stars, Thumb, toast, WoodLabel } from "./ui";

const STOCK_LABEL = { in: "In stock", low: "Low", out: "Out of stock" } as const;
const STOCK_TONE = { in: "good", low: "warn", out: "bad" } as const;
const STATUS_TONE: Record<ProductStatus, string> = { active: "good", draft: "muted", archived: "cancelled" };
const PER = 25;

export function categoryLabel(id: string) {
  return [...CATEGORIES.red, ...CATEGORIES.white].find((c) => c.id === id)?.label ?? id;
}
export function priceText(p: Pick<ProductRow, "priceMin" | "priceMax">) {
  return p.priceMin === p.priceMax ? formatINR(p.priceMin) : `${formatINR(p.priceMin)} – ${formatINR(p.priceMax)}`;
}

/** "Low" on its own next to a total of 53 reads as a contradiction, so a piece with several options
 *  says how many of them are short: "1 option low", "2 out · 1 low". */
function stockNote(p: ProductRow, thresholds: Record<string, number>) {
  if (p.options.length <= 1 || p.stock === "in") return STOCK_LABEL[p.stock];
  const states = p.options.map((o) => stockState(o.stock, thresholds[stockKey(p.slug, o.id)] ?? 5));
  const out = states.filter((s) => s === "out").length;
  const low = states.filter((s) => s === "low").length;
  if (out === p.options.length) return "All options out";
  const parts = [out && `${out} out`, low && `${low} low`].filter(Boolean);
  return parts.length === 1 ? `${out || low} ${out + low === 1 ? "option" : "options"} ${out ? "out" : "low"}` : parts.join(" · ");
}

export function ProductsView() {
  const params = useSearchParams();
  const router = useRouter();
  const products = useProducts();
  const { thresholds } = useStock();
  // the star means "in the landing page's featured list", as Storefront content shows it
  const redFeatured = useContent("red").featured;
  const whiteFeatured = useContent("white").featured;
  const isFeatured = (p: ProductRow) => (p.wood === "red" ? redFeatured : whiteFeatured).includes(p.slug);
  const [view, setView] = useState<"list" | "grid">("list");
  const [q, setQ] = useState("");
  const [wood, setWood] = useState<"all" | Wood>("all");
  const [cat, setCat] = useState("all");
  const [stock, setStock] = useState(params.get("stock") ?? "any");
  const [status, setStatus] = useState("any");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (wood === "all" || p.wood === wood) &&
        (cat === "all" || p.category === cat) &&
        (stock === "any" || p.stock === stock) &&
        (status === "any" ? p.status !== "archived" : p.status === status) &&
        (!n || p.name.toLowerCase().includes(n) || p.slug.includes(n) || categoryLabel(p.category).toLowerCase().includes(n)),
    );
  }, [products, q, wood, cat, stock, status]);

  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const rows = view === "list" ? list.slice((cur - 1) * PER, cur * PER) : list;
  const allOnPage = rows.length > 0 && rows.every((p) => selected.has(p.slug));
  const counts = { red: products.filter((p) => p.wood === "red" && p.status !== "archived").length, white: products.filter((p) => p.wood === "white" && p.status !== "archived").length };
  const cats = wood === "all" ? null : CATEGORIES[wood];
  const filtered = q || wood !== "all" || cat !== "all" || stock !== "any" || status !== "any";
  const clear = () => {
    setQ("");
    setWood("all");
    setCat("all");
    setStock("any");
    setStatus("any");
    setPage(1);
  };
  const bulk = (s: ProductStatus) => {
    setProductStatus([...selected], s, products);
    toast(`${selected.size} ${selected.size === 1 ? "product" : "products"} set to ${s}`);
    setSelected(new Set());
  };

  return (
    <div className="adm-page">
      <PageHead
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Products" }]}
        title="Products"
        sub={`${counts.red} red sandalwood and ${counts.white} white sandalwood pieces`}
        actions={
          <Link href="/admin/products/new" className="adm-btn" data-variant="primary">
            <Icon name="plus" />
            New product
          </Link>
        }
      />

      <section className="adm-panel">
        <div className="adm-toolbar">
          <SearchField
            label="Search products"
            placeholder="Name, slug or category"
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1);
            }}
          />
          <Seg
            label="Wood"
            value={wood}
            onChange={(w) => {
              setWood(w);
              setCat("all");
              setPage(1);
            }}
            items={[
              { id: "all", label: "Both woods" },
              { id: "red", label: <><i className="ring-red" style={{ width: 9, height: 9, borderRadius: 9, display: "inline-block" }} />Red</> },
              { id: "white", label: <><i className="ring-white" style={{ width: 9, height: 9, borderRadius: 9, display: "inline-block" }} />White</> },
            ]}
          />
          <select className="adm-select" data-size="sm" style={{ width: "auto" }} aria-label="Category" value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }}>
            <option value="all">All categories</option>
            {cats
              ? cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))
              : (["red", "white"] as const).map((w) => (
                  <optgroup key={w} label={w === "red" ? "Red sandalwood" : "White sandalwood"}>
                    {CATEGORIES[w].map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
          </select>
          <select className="adm-select" data-size="sm" style={{ width: "auto" }} aria-label="Stock" value={stock} onChange={(e) => { setStock(e.target.value); setPage(1); }}>
            <option value="any">Any stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select className="adm-select" data-size="sm" style={{ width: "auto" }} aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="any">Active and drafts</option>
            <option value="active">Active</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
          {filtered && (
            <button type="button" className="adm-btn" data-variant="ghost" data-size="sm" onClick={clear}>
              Clear
            </button>
          )}
          <span style={{ marginLeft: "auto" }}>
            <Seg
              label="View"
              value={view}
              onChange={setView}
              items={[
                { id: "list", label: <Icon name="list" />, title: "List" },
                { id: "grid", label: <Icon name="grid" />, title: "Grid" },
              ]}
            />
          </span>
        </div>

        {selected.size > 0 && (
          <div className="adm-bulk" role="region" aria-label="Bulk actions">
            <strong style={{ fontWeight: 500 }}>{selected.size} selected</strong>
            <span style={{ opacity: 0.4 }}>|</span>
            <button type="button" className="adm-btn" data-size="sm" onClick={() => bulk("active")}>
              Set active
            </button>
            <button type="button" className="adm-btn" data-size="sm" onClick={() => bulk("draft")}>
              Move to drafts
            </button>
            <button type="button" className="adm-btn" data-size="sm" onClick={() => bulk("archived")}>
              Archive
            </button>
            <button type="button" className="adm-btn" data-size="sm" style={{ marginLeft: "auto" }} onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        )}

        {!list.length ? (
          <Empty icon="products" title="No products match" action={filtered ? <button type="button" className="adm-btn" onClick={clear}>Clear filters</button> : undefined}>
            Try another category, or include archived pieces.
          </Empty>
        ) : view === "list" ? (
          <>
            <div className="adm-tablewrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th className="w-check">
                      <label className="adm-check">
                        <input
                          type="checkbox"
                          checked={allOnPage}
                          aria-label="Select all products on this page"
                          onChange={() =>
                            setSelected((s) => {
                              const n = new Set(s);
                              rows.forEach((p) => (allOnPage ? n.delete(p.slug) : n.add(p.slug)));
                              return n;
                            })
                          }
                        />
                      </label>
                    </th>
                    <th>Product</th>
                    <th>Wood</th>
                    <th>Category</th>
                    <th className="num">Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.slug} data-selected={selected.has(p.slug)} style={{ cursor: "pointer" }} onClick={(e) => !(e.target as HTMLElement).closest("a,input,label") && router.push(`/admin/products/${p.slug}`)}>
                      <td className="w-check">
                        <label className="adm-check">
                          <input
                            type="checkbox"
                            checked={selected.has(p.slug)}
                            aria-label={`Select ${p.name}`}
                            onChange={() =>
                              setSelected((s) => {
                                const n = new Set(s);
                                if (n.has(p.slug)) n.delete(p.slug);
                                else n.add(p.slug);
                                return n;
                              })
                            }
                          />
                        </label>
                      </td>
                      <td style={{ maxWidth: 340 }}>
                        <div className="adm-cell-main">
                          {p.photos[0] ? <Thumb photoId={p.photos[0].id} tone={p.photos[0].tone} /> : <span className="adm-thumb" />}
                          <div>
                            <Link href={`/admin/products/${p.slug}`} className="adm-rowlink adm-cell-title" style={{ display: "block" }}>
                              {p.name || "Untitled"}
                            </Link>
                            <div className="adm-cell-sub" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              {isFeatured(p) && (
                                <span title="Featured on the landing page" style={{ color: "var(--a-gold)", display: "inline-flex" }}>
                                  <Icon name="star" width={12} height={12} fill="currentColor" />
                                </span>
                              )}
                              {p.badge && <span>{p.badge}</span>}
                              {p.badge && <span aria-hidden>·</span>}
                              <span>{p.options.length > 1 ? `${p.options.length} options` : "One size"}</span>
                              {p.edited && <span className="adm-tag" style={{ height: 17 }}>Edited</span>}
                              {p.custom && <span className="adm-tag" data-tone="gold" style={{ height: 17 }}>New</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <WoodLabel wood={p.wood} />
                      </td>
                      <td className="adm-ink2">{categoryLabel(p.category)}</td>
                      <td className="num">{priceText(p)}</td>
                      <td>
                        <div style={{ display: "grid", gap: 1 }}>
                          <span className="adm-pill" data-tone={STOCK_TONE[p.stock]}>
                            {stockNote(p, thresholds)}
                          </span>
                          <span className="num adm-muted" style={{ fontSize: 12.5, paddingLeft: 18 }}>
                            {p.stockTotal} {p.options.length > 1 ? `pieces across ${p.options.length} options` : p.stockTotal === 1 ? "piece" : "pieces"}
                          </span>
                        </div>
                      </td>
                      <td>
                        {p.rating.count ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <Stars value={p.rating.avg} />
                            <span className="adm-muted num" style={{ fontSize: 12 }}>
                              ({p.rating.count})
                            </span>
                          </span>
                        ) : (
                          <span className="adm-muted">No reviews</span>
                        )}
                      </td>
                      <td>
                        <span className="adm-pill" data-tone={STATUS_TONE[p.status]}>
                          {p.status[0].toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={cur} pages={pages} total={list.length} per={PER} onPage={setPage} noun="products" />
          </>
        ) : (
          <div className="adm-pgrid">
            {rows.map((p) => (
              <Link key={p.slug} href={`/admin/products/${p.slug}`} className="adm-pcard">
                <div className="adm-pcard-img">
                  {p.photos[0] && <Photo p={photoById(p.photos[0].id)} tone={p.photos[0].tone} sizes="240px" />}
                  <div className="adm-pcard-badges">
                    <span className="adm-pill" data-tone={STOCK_TONE[p.stock]} style={{ background: "rgb(255 253 249 / 0.92)" }}>
                      {p.stock === "in" ? `${p.stockTotal} in stock` : stockNote(p, thresholds)}
                    </span>
                    {p.status !== "active" && <span className="adm-tag" data-tone="ink">{p.status}</span>}
                  </div>
                </div>
                <div className="adm-pcard-body">
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <WoodLabel wood={p.wood} />
                    {isFeatured(p) && (
                      <span title="Featured" style={{ color: "var(--a-gold)" }}>
                        <Icon name="star" width={14} height={14} fill="currentColor" />
                      </span>
                    )}
                  </span>
                  <span className="adm-pcard-name">{p.name}</span>
                  <span className="num adm-ink2" style={{ fontSize: 13 }}>
                    {priceText(p)}
                  </span>
                  {p.rating.count > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Stars value={p.rating.avg} />
                      <span className="adm-muted" style={{ fontSize: 12 }}>
                        ({p.rating.count})
                      </span>
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
