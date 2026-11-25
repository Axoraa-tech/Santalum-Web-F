"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, type Wood } from "@/lib/shop/products";
import { formatINR } from "../../_data/format";
import { useProducts, type ProductRow } from "../../_data/store";
import type { ProductStatus } from "../../_data/types";
import { BASE, Choice, Empty, Head, WoodMark } from "./kit";

const CAT_LABEL = new Map([...CATEGORIES.red, ...CATEGORIES.white].map((c) => [c.id, c.label]));
export const catLabel = (id: string) => CAT_LABEL.get(id as never) ?? id;

export function Swatch({ p }: { p: Pick<ProductRow, "photos" | "name"> }) {
  const ph = p.photos[0];
  return (
    <span className="a2-swatch">
      {ph ? <Photo p={{ id: ph.id, alt: "" }} sizes="48px" tone={ph.tone} /> : null}
      <span className="a2-sr">{p.name}</span>
    </span>
  );
}

/** The catalogue index: one line per card, grouped by wood. */
export function Catalogue() {
  const products = useProducts();
  const [wood, setWood] = useState<"both" | Wood>("both");
  const [status, setStatus] = useState<"all" | ProductStatus>("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products.filter((p) => (wood === "both" || p.wood === wood) && (status === "all" || p.status === status) && (!t || p.name.toLowerCase().includes(t) || p.slug.includes(t)));
  }, [products, wood, status, q]);
  const groups = (["red", "white"] as const).map((w) => ({ w, rows: list.filter((p) => p.wood === w) })).filter((g) => g.rows.length);

  return (
    <div>
      <Head
        kicker="Catalogue index"
        title="Products"
        aside={
          <Link href={`${BASE}/products/new`} className="a2-btn" data-kind="ink">
            New card
          </Link>
        }
      >
        <p className="a2-lede">
          {products.length} cards · {products.filter((p) => p.status === "active").length} on the shop · {products.filter((p) => p.status === "draft").length} in draft
        </p>
      </Head>
      <div className="a2-tools">
        <div className="a2-tools-row">
          <Choice label="Wood" value={wood} onChange={setWood} items={[{ id: "both", label: "Both woods" }, { id: "red", label: <WoodMark wood="red" /> }, { id: "white", label: <WoodMark wood="white" /> }]} />
          <Choice
            label="Status"
            value={status}
            onChange={setStatus}
            items={[
              { id: "all", label: "All" },
              { id: "active", label: "On the shop" },
              { id: "draft", label: "Draft" },
              { id: "archived", label: "Archived" },
            ]}
          />
          <input type="search" className="a2-search" data-a2-search placeholder="Find a piece  ( / )" aria-label="Find a product" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {groups.length === 0 ? <Empty>No cards match.</Empty> : null}
      {groups.map((g) => (
        <section key={g.w} className="a2-sec">
          <div className="a2-sec-h">
            <h2>
              <WoodMark wood={g.w} /> sandalwood
            </h2>
            <span className="a2-dim">{g.rows.length} cards</span>
          </div>
          <ul className="a2-cat">
            {g.rows.map((p) => (
              <li key={p.slug}>
                <Link href={`${BASE}/products/${p.slug}`} className="a2-cat-row" data-status={p.status}>
                  <Swatch p={p} />
                  <span className="a2-part">
                    {p.name}
                    <small>
                      {catLabel(p.category)} · {p.options.length} {p.options.length === 1 ? "option" : (p.optionName || "options").toLowerCase()}
                      {p.badge ? ` · ${p.badge}` : ""}
                      {p.edited ? " · edited" : ""}
                    </small>
                  </span>
                  <span className="a2-r a2-fig">{p.priceMin === p.priceMax ? formatINR(p.priceMin) : `${formatINR(p.priceMin)}–${formatINR(p.priceMax).replace("₹", "")}`}</span>
                  <span className="a2-r a2-stockword" data-stock={p.stock}>
                    {p.stock === "out" ? "Out" : p.stock === "low" ? "Low" : `${p.stockTotal} in`}
                  </span>
                  <span className="a2-r a2-statusword">{p.status === "active" ? "" : p.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
