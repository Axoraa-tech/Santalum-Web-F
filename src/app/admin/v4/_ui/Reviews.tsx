"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { timeAgo } from "../../_data/format";
import { reviewActions, useNow, useReviews, type AdminQuestion, type AdminReview } from "../../_data/store";
import type { ModerationState } from "../../_data/types";
import { BASE, Chips, Empty, Head, Pinned, Stars, WoodTag, say } from "./kit";

type Tab = ModerationState | "questions";

export function Reviews() {
  const { reviews, questions } = useReviews();
  const [tab, setTab] = useState<Tab>("pending");
  const [limit, setLimit] = useState(30);
  const open = questions.filter((q) => !q.answer);
  const list = useMemo(() => (tab === "questions" ? [] : reviews.filter((r) => r.state === tab)), [reviews, tab]);
  const qs = useMemo(() => [...open, ...questions.filter((q) => q.answer)], [open, questions]);
  const n = (s: ModerationState) => reviews.filter((r) => r.state === s).length;

  return (
    <div className="a4-page a4-page-wide">
      <Head kicker="People" title="Review wall" sub="What customers wrote, pinned up for approval. Nothing pending shows on the shop until it is approved." />
      <Chips
        label="Show"
        value={tab}
        onChange={(t) => {
          setTab(t);
          setLimit(30);
        }}
        items={[
          { id: "pending", label: "Waiting", count: n("pending") },
          { id: "published", label: "On the shop", count: n("published") },
          { id: "hidden", label: "Hidden", count: n("hidden") },
          { id: "questions", label: "Questions", count: open.length },
        ]}
      />
      {tab === "questions" ? (
        qs.length === 0 ? (
          <Empty>No questions.</Empty>
        ) : (
          <ul className="a4-wall">
            {qs.slice(0, limit).map((q) => (
              <li key={q.id}>
                <QuestionCard q={q} />
              </li>
            ))}
          </ul>
        )
      ) : list.length === 0 ? (
        <Empty>{tab === "pending" ? "Nothing waiting for approval." : "Nothing here."}</Empty>
      ) : (
        <ul className="a4-wall">
          {list.slice(0, limit).map((r) => (
            <li key={r.id}>
              <ReviewCard r={r} />
            </li>
          ))}
        </ul>
      )}
      {(tab === "questions" ? qs.length : list.length) > limit && (
        <button type="button" className="a4-btn a4-more-btn" onClick={() => setLimit((x) => x + 30)}>
          Show more
        </button>
      )}
    </div>
  );
}

function ProductLine({ slug }: { slug: string }) {
  const p = getProduct(slug);
  if (!p) return <span className="a4-muted">{slug}</span>;
  return (
    <span className="a4-rv-product">
      <Pinned photoId={p.shots[0].photo.id} tone={p.shots[0].tone} size="xs" pin={false} alt="" />
      <Link href={`${BASE}/products/${slug}`}>{p.name}</Link>
      <WoodTag wood={p.wood} short />
    </span>
  );
}

function ReviewCard({ r }: { r: AdminReview }) {
  const now = useNow();
  const [replying, setReplying] = useState(false);
  const [body, setBody] = useState(r.reply?.body ?? "");
  return (
    <article className="a4-paper a4-rv" data-state={r.state} data-featured={r.featured || undefined}>
      <header className="a4-rv-head">
        <Stars n={r.rating} />
        <span className="a4-muted">{timeAgo(r.at, now)}</span>
      </header>
      <h3 className="a4-rv-title">{r.title}</h3>
      <p className="a4-rv-body">{r.body}</p>
      <p className="a4-muted">
        {r.author}, {r.city}
        {r.verified && " · bought it"}
        {r.source === "customer" && " · from this browser"}
      </p>
      <ProductLine slug={r.slug} />
      {r.reply && !replying && (
        <blockquote className="a4-rv-reply">
          <span className="a4-label">Maison replied</span>
          {r.reply.body}
        </blockquote>
      )}
      {replying && (
        <form
          className="a4-rv-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim()) return;
            reviewActions.reply(r.id, body.trim());
            setReplying(false);
            say("Reply saved");
          }}
        >
          <textarea aria-label={`Reply to ${r.author}`} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Thank you for writing…" autoFocus />
          <span className="a4-inline">
            <button type="submit" className="a4-btn a4-btn-sm a4-btn-ink" disabled={!body.trim()}>
              Save reply
            </button>
            <button type="button" className="a4-btn a4-btn-sm a4-btn-ghost" onClick={() => setReplying(false)}>
              Cancel
            </button>
          </span>
        </form>
      )}
      <footer className="a4-rv-actions">
        {r.state !== "published" && (
          <button
            type="button"
            className="a4-btn a4-btn-sm a4-btn-ink"
            onClick={() => {
              reviewActions.setState([r.id], "published");
              say("Approved, now on the shop");
            }}
          >
            Approve
          </button>
        )}
        {r.state !== "hidden" && (
          <button
            type="button"
            className="a4-btn a4-btn-sm"
            onClick={() => {
              reviewActions.setState([r.id], "hidden");
              say("Hidden from the shop");
            }}
          >
            Hide
          </button>
        )}
        {!replying && (
          <button type="button" className="a4-btn a4-btn-sm a4-btn-ghost" onClick={() => setReplying(true)}>
            {r.reply ? "Edit reply" : "Reply"}
          </button>
        )}
        {r.state === "published" && (
          <button type="button" className="a4-btn a4-btn-sm a4-btn-ghost" aria-pressed={r.featured} onClick={() => reviewActions.toggleFeatured(r.id)}>
            {r.featured ? "Featured" : "Feature"}
          </button>
        )}
      </footer>
    </article>
  );
}

function QuestionCard({ q }: { q: AdminQuestion }) {
  const now = useNow();
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(!q.answer);
  return (
    <article className="a4-paper a4-rv a4-q" data-open={!q.answer || undefined}>
      <header className="a4-rv-head">
        <span className="a4-label">Question</span>
        <span className="a4-muted">{timeAgo(q.at, now)}</span>
      </header>
      <p className="a4-rv-title">{q.body}</p>
      <p className="a4-muted">{q.author}</p>
      <ProductLine slug={q.slug} />
      {q.answer && !editing && (
        <blockquote className="a4-rv-reply">
          <span className="a4-label">Answered</span>
          {q.answer.body}
        </blockquote>
      )}
      {editing ? (
        <form
          className="a4-rv-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim()) return;
            reviewActions.answer(q.id, body.trim());
            setEditing(false);
            say("Answer posted on the product page");
          }}
        >
          <textarea aria-label={`Answer ${q.author}`} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the answer as it will appear on the product page" />
          <button type="submit" className="a4-btn a4-btn-sm a4-btn-ink" disabled={!body.trim()}>
            Post answer
          </button>
        </form>
      ) : (
        <footer className="a4-rv-actions">
          <button
            type="button"
            className="a4-btn a4-btn-sm a4-btn-ghost"
            onClick={() => {
              setBody(q.answer?.body ?? "");
              setEditing(true);
            }}
          >
            Edit answer
          </button>
        </footer>
      )}
    </article>
  );
}
