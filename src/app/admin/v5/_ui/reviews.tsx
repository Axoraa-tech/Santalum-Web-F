"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { timeAgo } from "../../_data/format";
import { reviewActions, useNow, useReviews, type AdminQuestion, type AdminReview } from "../../_data/store";
import type { ModerationState } from "../../_data/types";
import { BASE, Card, Chip, Empty, Head, Seg, Stars, Thumb, WoodDot, say } from "./kit";
import { BackToMore } from "./inventory";
import { Split } from "./shell";
import Link from "next/link";

type Tab = ModerationState | "questions";

export function Reviews() {
  const params = useSearchParams();
  const { reviews, questions } = useReviews();
  const now = useNow();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "questions" ? "questions" : "pending");
  const [sel, setSel] = useState<string | null>(null);
  const shown = useMemo(() => (tab === "questions" ? [] : reviews.filter((r) => r.state === tab)), [reviews, tab]);
  const qs = useMemo(() => [...questions].sort((a, b) => Number(!!a.answer) - Number(!!b.answer) || b.at - a.at).slice(0, 60), [questions]);
  const pending = reviews.filter((r) => r.state === "pending").length;
  const open = questions.filter((q) => !q.answer).length;
  const curR = reviews.find((r) => r.id === sel);
  const curQ = questions.find((q) => q.id === sel);

  const list = (
    <>
      <Head eyebrow={`${pending} to read · ${open} to answer`} title="Reviews" back={<BackToMore />} />
      <div className="a5-sticky">
        <Seg
          label="Show"
          value={tab}
          onChange={(t) => {
            setTab(t);
            setSel(null);
          }}
          items={[
            { id: "pending", label: "To read", count: pending },
            { id: "published", label: "Live" },
            { id: "hidden", label: "Hidden" },
            { id: "questions", label: "Q&A", count: open },
          ]}
        />
      </div>
      {tab !== "questions" && shown.length === 0 && <Empty title="All read">New reviews from the shop land here first.</Empty>}
      <div className="a5-stack">
        {tab !== "questions" &&
          shown.slice(0, 60).map((r) => (
            <article key={r.id} className="a5-rcard" data-sel={sel === r.id ? "" : undefined}>
              <button type="button" className="a5-rcard-open" onClick={() => setSel(r.id)}>
                <span className="a5-ocard-top">
                  <Stars v={r.rating} />
                  <small className="a5-dim">{timeAgo(r.at, now)}</small>
                </span>
                <strong>{r.title}</strong>
                <span className="a5-clamp">{r.body}</span>
                <small className="a5-dim">
                  {r.author}, {r.city} · {getProduct(r.slug)?.name ?? r.slug}
                  {r.reply ? " · replied" : ""}
                </small>
              </button>
              {r.state === "pending" && (
                <div className="a5-rcard-acts">
                  <button type="button" className="a5-btn" data-v="soft" onClick={() => act([r.id], "hidden")}>
                    Hide
                  </button>
                  <button type="button" className="a5-btn" data-v="primary" onClick={() => act([r.id], "published")}>
                    Publish
                  </button>
                </div>
              )}
            </article>
          ))}
        {tab === "questions" &&
          qs.map((q) => (
            <button key={q.id} type="button" className="a5-rcard a5-rcard-open" data-sel={sel === q.id ? "" : undefined} onClick={() => setSel(q.id)}>
              <span className="a5-ocard-top">
                {q.answer ? <Chip>Answered</Chip> : <Chip tone="gold">Waiting</Chip>}
                <small className="a5-dim">{timeAgo(q.at, now)}</small>
              </span>
              <strong>{q.body}</strong>
              <small className="a5-dim">
                {q.author} · {getProduct(q.slug)?.name ?? q.slug}
              </small>
            </button>
          ))}
      </div>
      {tab === "pending" && shown.length > 1 && (
        <button type="button" className="a5-btn" data-v="soft" onClick={() => act(shown.filter((r) => r.rating >= 4).map((r) => r.id), "published")}>
          Publish all four and five star
        </button>
      )}
    </>
  );

  const detail = curR ? <ReviewDetail key={curR.id} r={curR} /> : curQ ? <QuestionDetail key={curQ.id} q={curQ} /> : null;
  return (
    <Split
      list={list}
      open={!!detail}
      onClose={() => setSel(null)}
      detail={detail}
      idle={
        <div className="a5-detail">
          <div className="a5-eyebrow">Reviews and questions</div>
          <h2 className="a5-detail-title">Pick one to read it in full, reply or answer</h2>
          <p className="a5-muted">Replies show on the product page under the Maison&apos;s name.</p>
        </div>
      }
    />
  );
}

function act(ids: string[], s: ModerationState) {
  if (!ids.length) return;
  reviewActions.setState(ids, s);
  say(ids.length > 1 ? `${ids.length} reviews ${s}` : s === "published" ? "Published" : s === "hidden" ? "Hidden" : "Moved back");
}

function ProductLine({ slug }: { slug: string }) {
  const p = getProduct(slug);
  if (!p) return null;
  return (
    <Link href={`${BASE}/products/${slug}`} className="a5-row">
      <Thumb id={p.shots[0].photo.id} tone={p.shots[0].tone} size={40} />
      <span className="a5-row-main">
        {p.name}
        <small>
          <WoodDot w={p.wood} label />
        </small>
      </span>
    </Link>
  );
}

function ReviewDetail({ r }: { r: AdminReview }) {
  const now = useNow();
  const [body, setBody] = useState(r.reply?.body ?? "");
  return (
    <div className="a5-detail">
      <div className="a5-detail-top">
        <Stars v={r.rating} />
        <Chip tone={r.state === "published" ? undefined : r.state === "pending" ? "gold" : "red"}>{r.state === "published" ? "Live" : r.state === "pending" ? "To read" : "Hidden"}</Chip>
      </div>
      <h2 className="a5-detail-title">{r.title}</h2>
      <p className="a5-quote">{r.body}</p>
      <p className="a5-muted">
        {r.author}, {r.city} · {timeAgo(r.at, now)}
        {r.verified ? " · verified buyer" : ""}
      </p>
      <div className="a5-list">
        <ProductLine slug={r.slug} />
      </div>
      <div className="a5-actions-row">
        {r.state !== "published" && (
          <button type="button" className="a5-btn" data-v="primary" onClick={() => act([r.id], "published")}>
            Publish
          </button>
        )}
        {r.state !== "hidden" && (
          <button type="button" className="a5-btn" data-v="soft" onClick={() => act([r.id], "hidden")}>
            Hide
          </button>
        )}
        <button
          type="button"
          className="a5-btn"
          data-v="soft"
          aria-pressed={r.featured}
          onClick={() => {
            reviewActions.toggleFeatured(r.id);
            say(r.featured ? "No longer featured" : "Featured on the product page");
          }}
        >
          {r.featured ? "Featured" : "Feature"}
        </button>
      </div>
      <Card title={r.reply ? "Your reply" : "Reply as the Maison"}>
        <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Reply" placeholder={r.rating <= 3 ? "Thank them, say what you will do about it." : "Thank them, briefly."} />
        <button
          type="button"
          className="a5-btn"
          data-v="primary"
          disabled={!body.trim() || body.trim() === r.reply?.body}
          onClick={() => {
            reviewActions.reply(r.id, body.trim());
            say("Reply posted");
          }}
        >
          {r.reply ? "Update reply" : "Post reply"}
        </button>
      </Card>
    </div>
  );
}

function QuestionDetail({ q }: { q: AdminQuestion }) {
  const now = useNow();
  const [body, setBody] = useState(q.answer?.body ?? "");
  return (
    <div className="a5-detail">
      <div className="a5-eyebrow">
        {q.author} asked {timeAgo(q.at, now)}
      </div>
      <h2 className="a5-detail-title">{q.body}</h2>
      <div className="a5-list">
        <ProductLine slug={q.slug} />
      </div>
      {q.answers
        .filter((a) => !a.fromMaison)
        .map((a) => (
          <p key={a.id} className="a5-note">
            {a.body}
            <small>{a.author}</small>
          </p>
        ))}
      <Card title={q.answer ? "Your answer" : "Answer"}>
        <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Answer" />
        <button
          type="button"
          className="a5-btn"
          data-v="primary"
          disabled={!body.trim() || body.trim() === q.answer?.body}
          onClick={() => {
            reviewActions.answer(q.id, body.trim());
            say("Answer posted");
          }}
        >
          {q.answer ? "Update answer" : "Post answer"}
        </button>
      </Card>
    </div>
  );
}
