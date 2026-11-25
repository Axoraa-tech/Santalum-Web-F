"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/shop/products";
import { formatINR } from "../../_data/format";
import { useProducts } from "../../_data/store";
import type { ProductStatus } from "../../_data/types";
import { BASE, Btn, Filter, Head, Led, Seg, useListKeys, Woods } from "./kit";

const CAT_LABEL = Object.fromEntries([...CATEGORIES.red, ...CATEGORIES.white].map((c) => [c.id, c.label]));
export const STATUS_TONE: Record<ProductStatus, string> = { active: "green", draft: "amber", archived: "off" };

export function Products() {
  const rows = useProducts();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [wood, setWood] = useState<"all" | "red" | "white">("all");
  const [status, setStatus] = useState<"all" | ProductStatus>("all");
  const [cursor, setCursor] = useState(0);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return rows.filter((p) => (wood === "all" || p.wood === wood) && (status === "all" || p.status === status) && (!n || `${p.name} ${p.slug} ${CAT_LABEL[p.category]}`.toLowerCase().includes(n)));
  }, [rows, q, wood, status]);
  const cur = Math.min(cursor, Math.max(0, list.length - 1));

  const ref = useListKeys(list.length, {
    cursor: cur,
    setCursor,
    onOpen: (i) => router.push(`${BASE}/products/${list[i].slug}`),
    extra: (key) => {
      if (key === "n") router.push(`${BASE}/products/new`);
      const w = ({ "1": "all", "2": "red", "3": "white" } as const)[key as "1" | "2" | "3"];
      if (w) {
        setWood(w);
        setCursor(0);
      }
      return key === "n" || !!w;
    },
  });

  return (
    <div className="a3-page" ref={ref}>
      <Head path="~/products" title="products" meta={`${rows.length} pieces · ${rows.filter((r) => r.status === "active").length} live`}>
        <Btn kind="primary" hint="n" onClick={() => router.push(`${BASE}/products/new`)}>
          new product
        </Btn>
      </Head>
      <div className="a3-toolbar">
        <Filter value={q} onChange={(v) => (setQ(v), setCursor(0))} placeholder="filter name, slug, category" />
        <Seg value={wood} onChange={(v) => (setWood(v), setCursor(0))} label="Wood" items={[{ id: "all", label: "1 both" }, { id: "red", label: "2 red" }, { id: "white", label: "3 white" }]} />
        <Seg
          value={status}
          onChange={(v) => (setStatus(v), setCursor(0))}
          label="Status"
          items={(["all", "active", "draft", "archived"] as const).map((s) => ({ id: s, label: s, n: s === "all" ? rows.length : rows.filter((r) => r.status === s).length }))}
        />
      </div>
      <div className="a3-scroll">
        <table className="a3-t">
          <thead>
            <tr>
              <th>st</th>
              <th>name</th>
              <th className="a3-hide-sm">slug</th>
              <th>wood</th>
              <th className="a3-hide-sm">category</th>
              <th className="r">price</th>
              <th className="r">stock</th>
              <th className="r a3-hide-sm">rating</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p, i) => (
              <tr key={p.slug} data-a3-row={i} data-cur={i === cur || undefined} onClick={() => router.push(`${BASE}/products/${p.slug}`)}>
                <td>
                  <span className="a3-st">
                    <Led tone={STATUS_TONE[p.status]} />
                    <span className="a3-hide-sm">{p.status}</span>
                  </span>
                </td>
                <td>
                  <Link href={`${BASE}/products/${p.slug}`}>{p.name}</Link>
                  {p.edited && <span className="a3-tag">edited</span>}
                  {p.custom && <span className="a3-tag">new</span>}
                </td>
                <td className="a3-mono a3-dim a3-hide-sm">{p.slug}</td>
                <td>
                  <Woods ws={[p.wood]} />
                </td>
                <td className="a3-dim a3-hide-sm">{CAT_LABEL[p.category]}</td>
                <td className="r a3-mono">{p.priceMin === p.priceMax ? formatINR(p.priceMin) : `${formatINR(p.priceMin)}+`}</td>
                <td className="r a3-mono">
                  <span className="a3-st">
                    <Led tone={p.stock === "out" ? "red" : p.stock === "low" ? "amber" : "green"} />
                    {p.stockTotal}
                  </span>
                </td>
                <td className="r a3-mono a3-dim a3-hide-sm">{p.rating.count ? `${p.rating.avg.toFixed(1)} (${p.rating.count})` : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="a3-empty a3-dim">nothing matches</p>}
      </div>
    </div>
  );
}
