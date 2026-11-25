"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { fmtDate } from "../../_data/format";
import { reviewActions, useProducts, useReviews, type AdminQuestion, type AdminReview } from "../../_data/store";
import type { ModerationState } from "../../_data/types";
import { BASE, Empty, Head, say, Search, Tabs } from "../_ui/kit";

type Tab = ModerationState | "questions";

export function Reviews() {
  const { reviews, questions } = useReviews();
  const products = useProducts();
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "questions" ? "questions" : "pending");
  const [q, setQ] = useState("");
  const name = (slug: string) => products.find((p) => p.slug === slug)?.name ?? getProduct(slug)?.name ?? slug;
  const t = q.trim().toLowerCase();
  const match = (s: string) => !t || s.toLowerCase().includes(t);

  const list = useMemo(() => reviews.filter((r) => r.state === tab), [reviews, tab]);
  const shown = list.filter((r) => match(`${r.title} ${r.body} ${r.author} ${name(r.slug)}`));
  const openQs = [...questions].sort((a, b) => Number(!!a.answer) - Number(!!b.answer)).filter((x) => match(`${x.body} ${x.author} ${name(x.slug)}`));
  const count = (s: ModerationState) => reviews.filter((r) => r.state === s).length;
  const published = reviews.filter((r) => r.state === "published");
  const avg = published.length ? published.reduce((s, r) => s + r.rating, 0) / published.length : 0;

  return (
    <>
      <Head
        no="06"
        title="Reviews"
        lede={
          <>
            Average <span className="a6-num">{avg.toFixed(2)}</span> from <span className="a6-num">{published.length}</span> published reviews. New reviews wait here until someone publishes them.
          </>
        }
      />
      <div className="a6-filters">
        <div className="a6-filters-row">
          <Tabs
            label="Queue"
            value={tab}
            onChange={setTab}
            items={[
              { id: "pending", label: "To moderate", count: count("pending") },
              { id: "published", label: "Published", count: count("published") },
              { id: "hidden", label: "Hidden", count: count("hidden") },
              { id: "questions", label: "Questions", count: questions.filter((x) => !x.answer).length },
            ]}
          />
          <Search label="Search reviews" value={q} onChange={setQ} />
        </div>
      </div>

      {tab === "questions" ? (
        openQs.length ? (
          <ol className="a6-entries">
            {openQs.map((x) => (
              <QuestionEntry key={x.id} x={x} product={name(x.slug)} />
            ))}
          </ol>
        ) : (
          <Empty>No questions.</Empty>
        )
      ) : shown.length ? (
        <ol className="a6-entries">
          {shown.slice(0, 60).map((r) => (
            <ReviewEntry key={r.id} r={r} product={name(r.slug)} />
          ))}
        </ol>
      ) : (
        <Empty>{tab === "pending" ? "Nothing waiting. Every review has been read." : "No reviews here."}</Empty>
      )}
    </>
  );
}

function ReviewEntry({ r, product }: { r: AdminReview; product: string }) {
  const [replying, setReplying] = useState(false);
  const [body, setBody] = useState(r.reply?.body ?? "");
  function set(s: ModerationState) {
    reviewActions.setState([r.id], s);
    say(s === "published" ? "Review published" : s === "hidden" ? "Review hidden" : "Moved back to the queue");
  }
  return (
    <li className="a6-entry">
      <div className="a6-entry-fig" data-low={r.rating <= 2 || undefined}>
        <span className="a6-figure">{r.rating}</span>
        <span className="a6-muted">of 5</span>
      </div>
      <div className="a6-entry-body">
        <h3 className="a6-h3">{r.title}</h3>
        <p>{r.body}</p>
        <p className="a6-muted">
          {r.author}, {r.city} · {fmtDate(r.at)} · {r.verified ? "verified buyer" : "not verified"} ·{" "}
          <Link href={`${BASE}/products/${r.slug}`} className="a6-rowlink">
            {product}
          </Link>
          {r.featured && " · featured"}
        </p>
        {r.reply && !replying && (
          <blockquote className="a6-reply">
            <span>Maison reply</span>
            {r.reply.body}
          </blockquote>
        )}
        {replying && (
          <form
            className="a6-stack"
            onSubmit={(e) => {
              e.preventDefault();
              if (!body.trim()) return;
              reviewActions.reply(r.id, body.trim());
              setReplying(false);
              say("Reply saved");
            }}
          >
            <label className="a6-sr" htmlFor={`rep-${r.id}`}>
              Reply
            </label>
            <textarea id={`rep-${r.id}`} className="a6-input" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Thank them plainly; fix what went wrong." autoFocus />
            <div className="a6-actions">
              <button type="submit" className="a6-btn" data-primary>
                Save reply
              </button>
              <button type="button" className="a6-link" onClick={() => setReplying(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
        <div className="a6-entry-actions">
          {r.state !== "published" && (
            <button type="button" className="a6-btn" data-primary onClick={() => set("published")}>
              Publish
            </button>
          )}
          {r.state !== "hidden" && (
            <button type="button" className="a6-btn" onClick={() => set("hidden")}>
              Hide
            </button>
          )}
          {r.state === "hidden" && (
            <button type="button" className="a6-link" onClick={() => set("pending")}>
              Back to queue
            </button>
          )}
          {!replying && (
            <button type="button" className="a6-link" onClick={() => setReplying(true)}>
              {r.reply ? "Edit reply" : "Reply"}
            </button>
          )}
          {r.state === "published" && (
            <button type="button" className="a6-link" onClick={() => reviewActions.toggleFeatured(r.id)}>
              {r.featured ? "Unfeature" : "Feature on the product page"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function QuestionEntry({ x, product }: { x: AdminQuestion; product: string }) {
  const [body, setBody] = useState(x.answer?.body ?? "");
  const [editing, setEditing] = useState(!x.answer);
  return (
    <li className="a6-entry">
      <div className="a6-entry-fig" data-low={!x.answer || undefined}>
        <span className="a6-figure">Q</span>
        <span className="a6-muted">{x.answer ? "answered" : "open"}</span>
      </div>
      <div className="a6-entry-body">
        <h3 className="a6-h3">{x.body}</h3>
        <p className="a6-muted">
          {x.author} · {fmtDate(x.at)} ·{" "}
          <Link href={`${BASE}/products/${x.slug}`} className="a6-rowlink">
            {product}
          </Link>
        </p>
        {editing ? (
          <form
            className="a6-stack"
            onSubmit={(e) => {
              e.preventDefault();
              if (!body.trim()) return;
              reviewActions.answer(x.id, body.trim());
              setEditing(false);
              say("Answer published on the product page");
            }}
          >
            <label className="a6-sr" htmlFor={`ans-${x.id}`}>
              Answer
            </label>
            <textarea id={`ans-${x.id}`} className="a6-input" rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Answer as the Maison" />
            <div className="a6-actions">
              <button type="submit" className="a6-btn" data-primary disabled={!body.trim()}>
                Publish answer
              </button>
              {x.answer && (
                <button type="button" className="a6-link" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <>
            <blockquote className="a6-reply">
              <span>Maison answer</span>
              {x.answer?.body}
            </blockquote>
            <div className="a6-entry-actions">
              <button type="button" className="a6-link" onClick={() => setEditing(true)}>
                Edit answer
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
