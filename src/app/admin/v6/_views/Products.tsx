"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES, type Wood } from "@/lib/shop/products";
import { formatINR } from "../../_data/format";
import { setProductStatus, useProducts } from "../../_data/store";
import type { ProductStatus } from "../../_data/types";
import { BASE, Empty, Head, say, Search, Tabs, Thumb, WoodMark } from "../_ui/kit";

const STATUS_LABEL: Record<ProductStatus, string> = { active: "On sale", draft: "Draft", archived: "Archived" };
const catLabel = (wood: Wood, id: string) => CATEGORIES[wood].find((c) => c.id === id)?.label ?? id;

export function Products() {
  const products = useProducts();
  const [wood, setWood] = useState<"all" | Wood>("all");
  const [status, setStatus] = useState<"all" | ProductStatus>("all");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products.filter((p) => (wood === "all" || p.wood === wood) && (status === "all" || p.status === status) && (!t || `${p.name} ${p.slug} ${p.category}`.toLowerCase().includes(t)));
  }, [products, wood, status, q]);

  const groups = (["red", "white"] as Wood[]).map((w) => ({ wood: w, rows: list.filter((p) => p.wood === w) })).filter((g) => g.rows.length);
  const toggle = (slug: string) => setPicked((x) => (x.includes(slug) ? x.filter((s) => s !== slug) : [...x, slug]));
  function bulk(s: ProductStatus) {
    setProductStatus(picked, s, products);
    say(`${picked.length} product${picked.length === 1 ? "" : "s"} set to ${STATUS_LABEL[s].toLowerCase()}`);
    setPicked([]);
  }

  return (
    <>
      <Head
        no="03"
        title="Products"
        lede={`${products.filter((p) => p.status === "active").length} on sale across both woods, ${products.filter((p) => p.status === "draft").length} in draft.`}
        actions={
          <Link href={`${BASE}/products/new`} className="a6-btn" data-primary>
            New product
          </Link>
        }
      />
      <div className="a6-filters">
        <div className="a6-filters-row">
          <Tabs label="Wood" value={wood} onChange={setWood} items={[{ id: "all", label: "Both woods" }, { id: "red", label: "Red" }, { id: "white", label: "White" }]} />
          <Tabs label="Status" value={status} onChange={setStatus} items={[{ id: "all", label: "Any status" }, { id: "active", label: "On sale" }, { id: "draft", label: "Draft" }, { id: "archived", label: "Archived" }]} />
          <Search label="Search products" value={q} onChange={setQ} />
        </div>
        {picked.length > 0 && (
          <div className="a6-bulk">
            <span className="a6-num">{picked.length} selected</span>
            <button type="button" className="a6-link" onClick={() => bulk("active")}>
              Put on sale
            </button>
            <button type="button" className="a6-link" onClick={() => bulk("draft")}>
              Move to draft
            </button>
            <button type="button" className="a6-link" onClick={() => bulk("archived")}>
              Archive
            </button>
            <button type="button" className="a6-link" onClick={() => setPicked([])}>
              Clear
            </button>
          </div>
        )}
      </div>

      {groups.length === 0 && <Empty>No products match.</Empty>}
      {groups.map((g, gi) => (
        <section key={g.wood} className="a6-group">
          <h2 className="a6-group-head">
            <WoodMark wood={g.wood} /> sandalwood <span className="a6-muted a6-num">{g.rows.length}</span>
          </h2>
          <table className="a6-table">
            <thead>
              <tr>
                <th className="a6-col-n">
                  <span className="a6-sr">Select</span>
                </th>
                <th>Product</th>
                <th className="a6-hide-md">Category</th>
                <th className="a6-r">Price</th>
                <th className="a6-r a6-hide-sm">Stock</th>
                <th className="a6-hide-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map((p, i) => {
                const n = groups.slice(0, gi).reduce((s, x) => s + x.rows.length, 0) + i + 1;
                return (
                  <tr key={p.slug} data-picked={picked.includes(p.slug) || undefined}>
                    <td className="a6-col-n">
                      <label className="a6-pick">
                        <input type="checkbox" checked={picked.includes(p.slug)} onChange={() => toggle(p.slug)} aria-label={`Select ${p.name || p.slug}`} />
                        <span className="a6-num">{String(n).padStart(2, "0")}</span>
                      </label>
                    </td>
                    <td>
                      <div className="a6-prod">
                        {p.photos[0] ? <Thumb photoId={p.photos[0].id} tone={p.photos[0].tone} size={44} /> : <span className="a6-thumb" style={{ width: 44, height: 44 }} />}
                        <div>
                          <Link href={`${BASE}/products/${p.slug}`} className="a6-rowlink">
                            {p.name || "Untitled"}
                          </Link>
                          <div className="a6-muted">
                            {p.options.length > 1 ? `${p.options.length} ${p.optionName.toLowerCase() || "options"}` : p.short}
                            {p.edited && " · edited"}
                            {p.custom && " · new"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="a6-hide-md">{catLabel(p.wood, p.category)}</td>
                    <td className="a6-r a6-num">{p.priceMin === p.priceMax ? formatINR(p.priceMin) : `${formatINR(p.priceMin)}–${formatINR(p.priceMax).replace("₹", "")}`}</td>
                    <td className="a6-r a6-num a6-hide-sm" data-bad={p.stock === "out" || undefined} data-warn={p.stock === "low" || undefined}>
                      {p.stock === "out" ? "Out" : p.stockTotal}
                    </td>
                    <td className="a6-hide-sm" data-off={p.status !== "active" || undefined}>
                      {STATUS_LABEL[p.status]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </>
  );
}
