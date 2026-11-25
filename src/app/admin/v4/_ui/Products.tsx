"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES, type Wood } from "@/lib/shop/products";
import { formatINR } from "../../_data/format";
import { useProducts, type ProductRow } from "../../_data/store";
import type { ProductStatus } from "../../_data/types";
import { BASE, Chips, Empty, Head, Icon, Pinned, WoodTag } from "./kit";

const STOCK_LABEL = { in: "In stock", low: "Running low", out: "Out of stock" } as const;
const catLabel = (wood: Wood, id: string) => CATEGORIES[wood].find((c) => c.id === id)?.label ?? id;

export function Products() {
  const rows = useProducts();
  const [wood, setWood] = useState<"all" | Wood>("all");
  const [status, setStatus] = useState<"all" | ProductStatus>("active");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((p) => (wood === "all" || p.wood === wood) && (status === "all" || p.status === status) && (!s || `${p.name} ${p.slug}`.toLowerCase().includes(s)));
  }, [rows, wood, status, q]);

  const count = (s: ProductStatus) => rows.filter((p) => p.status === s && (wood === "all" || p.wood === wood)).length;

  return (
    <div className="a4-page a4-page-wide">
      <Head kicker="The pieces" title="Products" sub={`${rows.length} pieces across both woods. Click a photo to edit.`}>
        <Link href={`${BASE}/products/new`} className="a4-btn a4-btn-ink">
          <Icon name="plus" size={16} /> New product
        </Link>
      </Head>
      <div className="a4-toolbar">
        <input type="search" className="a4-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or slug" aria-label="Search products" />
        <Chips
          label="Wood"
          value={wood}
          onChange={setWood}
          items={[
            { id: "all", label: "Both woods" },
            { id: "red", label: "Red" },
            { id: "white", label: "White" },
          ]}
        />
        <Chips
          label="Status"
          value={status}
          onChange={setStatus}
          items={[
            { id: "active", label: "On sale", count: count("active") },
            { id: "draft", label: "Drafts", count: count("draft") },
            { id: "archived", label: "Archived", count: count("archived") },
            { id: "all", label: "All" },
          ]}
        />
      </div>
      {shown.length === 0 ? (
        <Empty>No pieces match.</Empty>
      ) : (
        <ul className="a4-grid">
          {shown.map((p, i) => (
            <li key={p.slug}>
              <ProductCard p={p} tilt={i % 5} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductCard({ p, tilt }: { p: ProductRow; tilt: number }) {
  const ph = p.photos[0];
  return (
    <Link href={`${BASE}/products/${p.slug}`} className="a4-paper a4-pcard" data-tilt={tilt} data-status={p.status}>
      <span className="a4-pcard-photo">
        {ph ? <Pinned photoId={ph.id} tone={ph.tone} size="fill" alt={p.name} /> : <span className="a4-nophoto">No photo yet</span>}
      </span>
      <span className="a4-pcard-body">
        <span className="a4-pcard-name">{p.name}</span>
        <span className="a4-muted">{catLabel(p.wood, p.category)}</span>
        <span className="a4-pcard-row">
          <WoodTag wood={p.wood} short />
          <span className="a4-strong">{p.priceMin === p.priceMax ? formatINR(p.priceMin) : `${formatINR(p.priceMin)}+`}</span>
        </span>
        <span className="a4-pcard-row">
          <span className="a4-stock" data-s={p.stock}>
            {STOCK_LABEL[p.stock]} · {p.stockTotal}
          </span>
          {p.status !== "active" && <span className="a4-tag">{p.status === "draft" ? "Draft" : "Archived"}</span>}
          {p.badge && p.status === "active" && <span className="a4-tag">{p.badge}</span>}
        </span>
      </span>
    </Link>
  );
}
