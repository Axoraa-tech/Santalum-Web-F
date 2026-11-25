"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { fmtDate } from "../../_data/format";
import { reviewActions, useReviews, type AdminQuestion, type AdminReview } from "../../_data/store";
import { BASE, Choice, Empty, Head, note, Stamp, Stars, WoodMark } from "./kit";

type Tab = "pending" | "published" | "hidden" | "questions";

/** Letters from customers: read, publish or hide, reply in the Maison's hand, answer questions. */
export function ReviewBook() {
  const params = useSearchParams();
  const { reviews, questions } = useReviews();
  const [tab, setTab] = useState<Tab>(params.get("t") === "questions" ? "questions" : "pending");
  const list = tab === "questions" ? [] : reviews.filter((r) => r.state === tab);
  const open = questions.filter((q) => !q.answer);
  return (
    <div>
      <Head kicker="Letters" title="Reviews and questions">
        <p className="a2-lede">
          {reviews.filter((r) => r.state === "pending").length} reviews waiting to be read · {open.length} questions unanswered
        </p>
      </Head>
      <div className="a2-tools">
        <Choice
          label="Show"
          value={tab}
          onChange={setTab}
          items={[
            { id: "pending", label: "To read", n: reviews.filter((r) => r.state === "pending").length },
            { id: "published", label: "Published", n: reviews.filter((r) => r.state === "published").length },
            { id: "hidden", label: "Hidden", n: reviews.filter((r) => r.state === "hidden").length },
            { id: "questions", label: "Questions", n: open.length },
          ]}
        />
      </div>
      {tab === "questions" ? (
        <ul className="a2-letters">
          {[...open, ...questions.filter((q) => q.answer)].slice(0, 40).map((q) => (
            <QuestionLetter key={q.id} q={q} />
          ))}
        </ul>
      ) : list.length === 0 ? (
        <Empty>Nothing here.</Empty>
      ) : (
        <ul className="a2-letters">
          {list.slice(0, 40).map((r) => (
            <ReviewLetter key={r.id} r={r} />
          ))}
        </ul>
      )}
    </div>
  );
}

function About({ slug }: { slug: string }) {
  const p = getProduct(slug);
  return (
    <Link href={`${BASE}/products/${slug}`} className="a2-about">
      {p ? <WoodMark wood={p.wood} /> : null} {p?.name ?? slug}
    </Link>
  );
}

function ReviewLetter({ r }: { r: AdminReview }) {
  const [reply, setReply] = useState(r.reply?.body ?? "");
  const [writing, setWriting] = useState(false);
  return (
    <li className="a2-letter" data-state={r.state}>
      <div className="a2-letter-h">
        <Stars n={r.rating} />
        <About slug={r.slug} />
        {r.featured ? <Stamp word="Featured" ink="blue" seed={r.id} size="sm" /> : null}
      </div>
      <h3>{r.title}</h3>
      <p>{r.body}</p>
      <p className="a2-dim a2-small">
        {r.author}, {r.city} · {fmtDate(r.at)}
        {r.verified ? " · bought from us" : ""}
      </p>
      {r.reply && !writing ? (
        <blockquote className="a2-reply">
          <span className="a2-f-l">The Maison replied</span>
          {r.reply.body}
        </blockquote>
      ) : null}
      {writing ? (
        <form
          className="a2-inline"
          onSubmit={(e) => {
            e.preventDefault();
            if (!reply.trim()) return;
            reviewActions.reply(r.id, reply.trim());
            setWriting(false);
            note("Reply written");
          }}
        >
          <label className="a2-f" data-wide>
            <span className="a2-f-l">Reply, in the Maison&apos;s hand</span>
            <textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} autoFocus />
          </label>
          <button type="submit" className="a2-btn" data-kind="ink" disabled={!reply.trim()}>
            Send reply
          </button>
          <button type="button" className="a2-link" onClick={() => setWriting(false)}>
            cancel
          </button>
        </form>
      ) : null}
      <div className="a2-acts">
        {r.state !== "published" ? (
          <button
            type="button"
            className="a2-btn"
            data-size="sm"
            data-kind="ink"
            onClick={() => {
              reviewActions.setState([r.id], "published");
              note("Published");
            }}
          >
            Publish
          </button>
        ) : null}
        {r.state !== "hidden" ? (
          <button
            type="button"
            className="a2-btn"
            data-size="sm"
            onClick={() => {
              reviewActions.setState([r.id], "hidden");
              note("Hidden from the shop");
            }}
          >
            Hide
          </button>
        ) : null}
        {!writing ? (
          <button type="button" className="a2-link" onClick={() => setWriting(true)}>
            {r.reply ? "edit reply" : "reply"}
          </button>
        ) : null}
        {r.state === "published" ? (
          <button type="button" className="a2-link" onClick={() => reviewActions.toggleFeatured(r.id)}>
            {r.featured ? "unfeature" : "feature"}
          </button>
        ) : null}
      </div>
    </li>
  );
}

function QuestionLetter({ q }: { q: AdminQuestion }) {
  const [body, setBody] = useState(q.answer?.body ?? "");
  const [open, setOpen] = useState(!q.answer);
  return (
    <li className="a2-letter" data-state={q.answer ? "published" : "pending"}>
      <div className="a2-letter-h">
        <About slug={q.slug} />
      </div>
      <h3>“{q.body}”</h3>
      <p className="a2-dim a2-small">
        {q.author} · {fmtDate(q.at)}
      </p>
      {q.answer && !open ? (
        <blockquote className="a2-reply">
          <span className="a2-f-l">Answered</span>
          {q.answer.body}
          <button type="button" className="a2-link" onClick={() => setOpen(true)}>
            edit
          </button>
        </blockquote>
      ) : (
        <form
          className="a2-inline"
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim()) return;
            reviewActions.answer(q.id, body.trim());
            setOpen(false);
            note("Answer written");
          }}
        >
          <label className="a2-f" data-wide>
            <span className="a2-f-l">Answer</span>
            <textarea rows={2} value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          <button type="submit" className="a2-btn" data-kind="ink" disabled={!body.trim()}>
            Answer
          </button>
        </form>
      )}
    </li>
  );
}
