"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Wood } from "@/lib/shop/products";
import { skuOf, stockKey } from "../../_data/mock";
import { timeAgo } from "../../_data/format";
import { adjustStock, setThreshold, stockState, useNow, useProducts, useStock, type StockState } from "../../_data/store";
import { I } from "./icons";
import { BASE, Card, Empty, Head, Search, Seg, Thumb, WoodDot, say } from "./kit";
import { Split } from "./shell";

type Item = { key: string; slug: string; name: string; option: string; wood: Wood; photo: string; tone?: "red" | "pale"; level: number; min: number; state: StockState };

export function Inventory() {
  const products = useProducts();
  const stock = useStock();
  const [f, setF] = useState<"attention" | "all">("attention");
  const [wood, setWood] = useState<"all" | Wood>("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);

  const items = useMemo<Item[]>(
    () =>
      products
        .filter((p) => p.status !== "archived")
        .flatMap((p) =>
          p.options.map((o) => {
            const key = stockKey(p.slug, o.id);
            const level = stock.levels[key] ?? o.stock;
            const min = stock.thresholds[key] ?? 5;
            return { key, slug: p.slug, name: p.name, option: p.options.length > 1 ? o.label : "", wood: p.wood, photo: p.photos[0]?.id ?? "", tone: p.photos[0]?.tone, level, min, state: stockState(level, min) };
          }),
        ),
    [products, stock],
  );
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items
      .filter((i) => (f === "all" || i.state !== "in") && (wood === "all" || i.wood === wood) && (!t || i.name.toLowerCase().includes(t)))
      .sort((a, b) => (f === "attention" ? a.level - b.level : 0));
  }, [items, f, wood, q]);
  const cur = items.find((i) => i.key === sel);
  const out = items.filter((i) => i.state === "out").length;

  const list = (
    <>
      <Head eyebrow={`${out} out · ${items.filter((i) => i.state === "low").length} low`} title="Stock" back={<BackToMore />} />
      <div className="a5-sticky">
        <Seg
          label="Show"
          value={f}
          onChange={setF}
          items={[
            { id: "attention", label: "Needs stock", count: items.filter((i) => i.state !== "in").length },
            { id: "all", label: "Everything" },
          ]}
        />
        <div className="a5-chips">
          {(["all", "red", "white"] as const).map((w) => (
            <button key={w} type="button" className="a5-pill" aria-pressed={wood === w} onClick={() => setWood(w)}>
              {w === "all" ? "Both woods" : w === "red" ? "Red" : "White"}
            </button>
          ))}
        </div>
      </div>
      <Search value={q} onChange={setQ} placeholder="Search stock" />
      {rows.length === 0 && <Empty title="All stocked">Nothing is at or under its reorder level.</Empty>}
      <div className="a5-list">
        {rows.map((i) => (
          <div key={i.key} className="a5-row a5-srow" data-sel={sel === i.key ? "" : undefined}>
            <button type="button" className="a5-srow-open" onClick={() => setSel(i.key)}>
              <Thumb id={i.photo} tone={i.tone} wood={i.wood} size={44} />
              <span className="a5-row-main">
                {i.name}
                <small>
                  <WoodDot w={i.wood} /> {i.option ? `${i.option} · ` : ""}reorder at {i.min}
                </small>
              </span>
            </button>
            <span className="a5-level" data-s={i.state}>
              {i.level}
            </span>
            <button
              type="button"
              className="a5-round"
              aria-label={`Add one ${i.name}`}
              onClick={() => {
                adjustStock(i.key, 1, "Received");
                say(`${i.name}: ${i.level + 1}`);
              }}
            >
              <I n="plus" size={18} />
            </button>
          </div>
        ))}
      </div>
    </>
  );

  return <Split list={list} open={!!cur} onClose={() => setSel(null)} detail={cur && <StockDetail key={cur.key} i={cur} />} idle={<StockLog />} />;
}

export function BackToMore() {
  return (
    <Link href={`${BASE}/more`} className="a5-back a5-back-top">
      <I n="back" size={20} />
      More
    </Link>
  );
}

const REASONS = ["Received from the workshop", "Counted on the shelf", "Damaged", "Sent as a sample"];
function StockDetail({ i }: { i: Item }) {
  const stock = useStock();
  const now = useNow();
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState(REASONS[0]);
  const [min, setMin] = useState(String(i.min));
  const log = stock.log.filter((l) => l.key === i.key).slice(0, 8);
  return (
    <div className="a5-detail">
      <div className="a5-person">
        <Thumb id={i.photo} tone={i.tone} wood={i.wood} size={64} />
        <div>
          <div className="a5-eyebrow">{skuOf(i.slug, i.key.split("::")[1])}</div>
          <h2 className="a5-detail-title">
            {i.name}
            {i.option && <span className="a5-dim"> · {i.option}</span>}
          </h2>
        </div>
      </div>
      <Card>
        <div className="a5-stepper">
          <button type="button" aria-label="One less" onClick={() => setDelta(delta - 1)} disabled={i.level + delta <= 0}>
            <I n="minus" size={26} />
          </button>
          <div>
            <span className="a5-big" data-s={stockState(i.level + delta, i.min)}>
              {i.level + delta}
            </span>
            <small>{delta === 0 ? "on the shelf" : `${delta > 0 ? "+" : ""}${delta} from ${i.level}`}</small>
          </div>
          <button type="button" aria-label="One more" onClick={() => setDelta(delta + 1)}>
            <I n="plus" size={26} />
          </button>
        </div>
        <div className="a5-chips a5-chips-wrap">
          {[5, 10, 25].map((n) => (
            <button key={n} type="button" className="a5-pill" onClick={() => setDelta(delta + n)}>
              +{n}
            </button>
          ))}
        </div>
        <div className="a5-radios" role="radiogroup" aria-label="Reason">
          {REASONS.map((r) => (
            <button key={r} type="button" role="radio" aria-checked={reason === r} onClick={() => setReason(r)}>
              {r}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="a5-btn"
          data-v="primary"
          disabled={delta === 0}
          onClick={() => {
            adjustStock(i.key, delta, reason);
            say(`Stock now ${i.level + delta}`);
            setDelta(0);
          }}
        >
          Save count
        </button>
      </Card>
      <Card title="Reorder level">
        <form
          className="a5-inline"
          onSubmit={(e) => {
            e.preventDefault();
            setThreshold(i.key, Number(min) || 0);
            say("Reorder level saved");
          }}
        >
          <input inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} aria-label="Reorder level" />
          <button type="submit" className="a5-btn" data-v="soft">
            Set
          </button>
        </form>
        <p className="a5-muted">Shown as low at or under this number.</p>
      </Card>
      <Card title="History">
        {log.length === 0 ? (
          <p className="a5-muted">No changes in this browser yet.</p>
        ) : (
          log.map((l, k) => (
            <p key={k} className="a5-note">
              <strong>
                {l.delta > 0 ? "+" : ""}
                {l.delta}
              </strong>{" "}
              {l.reason}
              <small>
                {l.by} · {timeAgo(l.at, now)}
              </small>
            </p>
          ))
        )}
      </Card>
    </div>
  );
}

function StockLog() {
  const stock = useStock();
  const now = useNow();
  const products = useProducts();
  const name = (key: string) => products.find((p) => p.slug === key.split("::")[0])?.name ?? key;
  return (
    <div className="a5-detail">
      <div className="a5-eyebrow">Stock moves</div>
      <h2 className="a5-detail-title">Pick a line to count it</h2>
      <Card title="Recent changes">
        {stock.log.length === 0 ? (
          <p className="a5-muted">Changes made here are listed with who made them.</p>
        ) : (
          stock.log.slice(0, 20).map((l, k) => (
            <p key={k} className="a5-note">
              <strong>
                {l.delta > 0 ? "+" : ""}
                {l.delta}
              </strong>{" "}
              {name(l.key)} · {l.reason}
              <small>
                {l.by} · {timeAgo(l.at, now)}
              </small>
            </p>
          ))
        )}
      </Card>
    </div>
  );
}
