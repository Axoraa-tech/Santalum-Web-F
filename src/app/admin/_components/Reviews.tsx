"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getProduct, type Wood } from "@/lib/shop/products";
import { fmtDate, timeAgo } from "../_data/format";
import { reviewActions, useNow, useProducts, useReviews, type AdminQuestion, type AdminReview } from "../_data/store";
import type { ModerationState } from "../_data/types";
import { Icon } from "./icons";
import { Empty, PageHead, Pager, SearchField, Seg, Stars, Tabs, Thumb, toast } from "./ui";

type Tab = ModerationState | "questions";
const PER = 15;

export function ReviewsView() {
  const params = useSearchParams();
  const now = useNow();
  const { reviews, questions } = useReviews();
  const focus = params.get("reply");
  const focused = focus ? reviews.find((r) => r.id === focus) : undefined;
  const [tab, setTab] = useState<Tab>(focused ? focused.state : params.get("tab") === "questions" ? "questions" : "pending");
  const [rating, setRating] = useState<"all" | "1" | "2" | "3" | "4" | "5">("all");
  const [wood, setWood] = useState<"all" | Wood>("all");
  const [q, setQ] = useState("");
  const [needsReply, setNeedsReply] = useState(false);
  const [page, setPage] = useState(1);
  const [replying, setReplying] = useState<string | null>(focus);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const counts = {
    pending: reviews.filter((r) => r.state === "pending").length,
    published: reviews.filter((r) => r.state === "published").length,
    hidden: reviews.filter((r) => r.state === "hidden").length,
    questions: questions.filter((x) => !x.answer).length,
  };

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    const out = reviews.filter((r) => {
      if (r.state !== tab) return false;
      if (rating !== "all" && r.rating !== Number(rating)) return false;
      if (needsReply && r.reply) return false;
      const p = getProduct(r.slug);
      if (wood !== "all" && p?.wood !== wood) return false;
      return !n || `${r.title} ${r.body} ${r.author} ${p?.name ?? ""}`.toLowerCase().includes(n);
    });
    // a review opened from the dashboard goes first
    return focus ? [...out.filter((r) => r.id === focus), ...out.filter((r) => r.id !== focus)] : out;
  }, [reviews, tab, rating, wood, q, needsReply, focus]);

  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PER, cur * PER);

  useEffect(() => {
    if (focus) document.getElementById(`rv-${focus}`)?.scrollIntoView({ block: "center" });
  }, [focus]);

  const changeTab = (t: Tab) => {
    setTab(t);
    setPage(1);
    setSelected(new Set());
  };
  const bulk = (state: ModerationState) => {
    reviewActions.setState([...selected], state);
    toast(`${selected.size} ${selected.size === 1 ? "review" : "reviews"} ${state === "published" ? "published" : "hidden"}`);
    setSelected(new Set());
  };

  return (
    <div className="adm-page">
      <PageHead
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Reviews & Q&A" }]}
        title="Reviews and questions"
        sub="New reviews wait here until published. Replies appear under the review on the product page, signed by the Maison."
      />

      <section className="adm-panel">
        <div>
          <Tabs
            label="Moderation"
            value={tab}
            onChange={changeTab}
            items={[
              { id: "pending", label: "Pending", count: counts.pending },
              { id: "published", label: "Published", count: counts.published },
              { id: "hidden", label: "Hidden", count: counts.hidden },
              { id: "questions", label: "Questions", count: counts.questions },
            ]}
          />
        </div>

        {tab === "questions" ? (
          <Questions questions={questions} now={now} />
        ) : (
          <>
            <div className="adm-toolbar">
              <SearchField
                label="Search reviews"
                placeholder="Words, author or product"
                value={q}
                onChange={(v) => {
                  setQ(v);
                  setPage(1);
                }}
              />
              <Seg
                label="Rating"
                value={rating}
                onChange={(r) => {
                  setRating(r);
                  setPage(1);
                }}
                items={[
                  { id: "all", label: "Any rating" },
                  ...(["5", "4", "3", "2", "1"] as const).map((n) => ({ id: n, label: <>{n}<Icon name="star" width={11} height={11} fill="currentColor" style={{ color: "var(--a-gold)" }} /></>, title: `${n} stars` })),
                ]}
              />
              <Seg label="Wood" value={wood} onChange={(w) => { setWood(w); setPage(1); }} items={[{ id: "all", label: "Both" }, { id: "red", label: "Red" }, { id: "white", label: "White" }]} />
              <label className="adm-check" style={{ fontSize: 13 }}>
                <input type="checkbox" checked={needsReply} onChange={(e) => { setNeedsReply(e.target.checked); setPage(1); }} />
                No reply yet
              </label>
            </div>

            {selected.size > 0 && (
              <div className="adm-bulk" role="region" aria-label="Bulk actions">
                <strong style={{ fontWeight: 500 }}>{selected.size} selected</strong>
                <span style={{ opacity: 0.4 }}>|</span>
                {tab !== "published" && (
                  <button type="button" className="adm-btn" data-size="sm" onClick={() => bulk("published")}>
                    Publish
                  </button>
                )}
                {tab !== "hidden" && (
                  <button type="button" className="adm-btn" data-size="sm" onClick={() => bulk("hidden")}>
                    Hide
                  </button>
                )}
                <button type="button" className="adm-btn" data-size="sm" style={{ marginLeft: "auto" }} onClick={() => setSelected(new Set())}>
                  Clear
                </button>
              </div>
            )}

            {rows.length ? (
              <div>
                {rows.map((r) => (
                  <ReviewRow
                    key={r.id}
                    r={r}
                    now={now}
                    selected={selected.has(r.id)}
                    onSelect={() =>
                      setSelected((s) => {
                        const n = new Set(s);
                        if (n.has(r.id)) n.delete(r.id);
                        else n.add(r.id);
                        return n;
                      })
                    }
                    replying={replying === r.id}
                    onReply={(v) => setReplying(v ? r.id : null)}
                  />
                ))}
              </div>
            ) : (
              <Empty icon={tab === "pending" ? "check" : "reviews"} title={tab === "pending" ? "Nothing waiting" : "No reviews match"}>
                {tab === "pending" ? "New reviews from customers will appear here before they go live." : "Try another rating or clear the search."}
              </Empty>
            )}
            <Pager page={cur} pages={pages} total={list.length} per={PER} onPage={setPage} noun="reviews" />
          </>
        )}
      </section>
    </div>
  );
}

function ReviewRow({ r, now, selected, onSelect, replying, onReply }: { r: AdminReview; now: number; selected: boolean; onSelect: () => void; replying: boolean; onReply: (open: boolean) => void }) {
  const products = useProducts();
  const p = products.find((x) => x.slug === r.slug);
  const [text, setText] = useState(r.reply?.body ?? "");
  return (
    <article className="adm-review" id={`rv-${r.id}`} style={{ background: selected ? "var(--a-gold-soft)" : undefined }}>
      <div style={{ display: "grid", gap: 8, justifyItems: "center", alignContent: "start" }}>
        <label className="adm-check">
          <input type="checkbox" checked={selected} onChange={onSelect} aria-label={`Select review by ${r.author}`} />
        </label>
        {p?.photos[0] && <Thumb photoId={p.photos[0].id} tone={p.photos[0].tone} size="lg" />}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 10px" }}>
          <Stars value={r.rating} label={false} />
          <span className="adm-review-title">{r.title}</span>
          {r.featured && (
            <span className="adm-tag" data-tone="gold">
              Featured
            </span>
          )}
        </div>
        <p className="adm-review-body">{r.body}</p>
        <div className="adm-cell-sub" style={{ marginTop: 6, whiteSpace: "normal" }}>
          {r.author}, {r.city} · {r.verified ? "Verified buyer" : "Not verified"} · {timeAgo(r.at, now)} ·{" "}
          {p ? (
            <Link href={`/admin/products/${p.slug}`} className="adm-link">
              {p.name}
            </Link>
          ) : (
            r.slug
          )}
          {r.source === "customer" && " · written on the shop in this browser"}
        </div>
        {r.reply && !replying && (
          <div className="adm-reply">
            <div style={{ fontSize: 12, color: "var(--a-ink-3)", marginBottom: 2 }}>
              Santalum Maison replied · {fmtDate(r.reply.at)}
            </div>
            {r.reply.body}
          </div>
        )}
        {replying && (
          <form
            style={{ marginTop: 10, display: "grid", gap: 8, maxWidth: "70ch" }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              reviewActions.reply(r.id, text.trim());
              if (r.state === "pending") reviewActions.setState([r.id], "published");
              toast(r.state === "pending" ? "Reply posted and review published" : "Reply posted");
              onReply(false);
            }}
          >
            <label className="adm-sr" htmlFor={`reply-${r.id}`}>
              Reply as Santalum Maison
            </label>
            <textarea id={`reply-${r.id}`} className="adm-textarea" rows={3} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={`Thank you, ${r.author.split(" ")[0]}. …`} />
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button type="submit" className="adm-btn" data-variant="primary" data-size="sm" disabled={!text.trim()}>
                {r.state === "pending" ? "Reply and publish" : "Post reply"}
              </button>
              <button type="button" className="adm-btn" data-size="sm" onClick={() => onReply(false)}>
                Cancel
              </button>
              <span className="adm-hint">Signed “Santalum Maison”. Shown under the review.</span>
            </div>
          </form>
        )}
      </div>
      <div className="adm-review-actions">
        {r.state !== "published" && (
          <button
            type="button"
            className="adm-btn"
            data-size="sm"
            data-variant={r.state === "pending" ? "primary" : undefined}
            onClick={() => {
              reviewActions.setState([r.id], "published");
              toast("Review published");
            }}
          >
            <Icon name="check" />
            Publish
          </button>
        )}
        {r.state !== "hidden" && (
          <button
            type="button"
            className="adm-btn"
            data-size="sm"
            onClick={() => {
              reviewActions.setState([r.id], "hidden");
              toast("Review hidden from the shop");
            }}
          >
            <Icon name="eyeOff" />
            Hide
          </button>
        )}
        {!replying && (
          <button type="button" className="adm-btn" data-size="sm" onClick={() => onReply(true)}>
            <Icon name="reply" />
            {r.reply ? "Edit reply" : "Reply"}
          </button>
        )}
        {r.state === "published" && (
          <button
            type="button"
            className="adm-btn"
            data-size="sm"
            data-variant="ghost"
            aria-pressed={r.featured}
            onClick={() => {
              reviewActions.toggleFeatured(r.id);
              toast(r.featured ? "No longer featured" : "Featured at the top of the product page");
            }}
          >
            <Icon name="star" fill={r.featured ? "currentColor" : "none"} style={{ color: r.featured ? "var(--a-gold)" : undefined }} />
            {r.featured ? "Featured" : "Feature"}
          </button>
        )}
      </div>
    </article>
  );
}

function Questions({ questions, now }: { questions: AdminQuestion[]; now: number }) {
  const [filter, setFilter] = useState<"open" | "answered" | "all">("open");
  const [page, setPage] = useState(1);
  const list = questions.filter((x) => filter === "all" || (filter === "open" ? !x.answer : !!x.answer));
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  return (
    <>
      <div className="adm-toolbar">
        <Seg
          label="Questions"
          value={filter}
          onChange={(f) => {
            setFilter(f);
            setPage(1);
          }}
          items={[
            { id: "open", label: "Unanswered" },
            { id: "answered", label: "Answered" },
            { id: "all", label: "All" },
          ]}
        />
        <span className="adm-hint">Answers show on the product page under “Questions”.</span>
      </div>
      {list.length ? (
        list.slice((cur - 1) * PER, cur * PER).map((x) => <QuestionRow key={x.id} x={x} now={now} />)
      ) : (
        <Empty icon="check" title="Every question has an answer" />
      )}
      <Pager page={cur} pages={pages} total={list.length} per={PER} onPage={setPage} noun="questions" />
    </>
  );
}

function QuestionRow({ x, now }: { x: AdminQuestion; now: number }) {
  const p = getProduct(x.slug);
  const [open, setOpen] = useState(!x.answer);
  const [text, setText] = useState(x.answer?.body ?? "");
  return (
    <article className="adm-review" style={{ gridTemplateColumns: "56px minmax(0,1fr)" }}>
      <div>{p && <Thumb photoId={p.shots[0].photo.id} tone={p.shots[0].tone} size="lg" />}</div>
      <div style={{ minWidth: 0 }}>
        <div className="adm-review-title" style={{ fontFamily: "var(--font-display)", fontWeight: 420, fontSize: 16 }}>
          {x.body}
        </div>
        <div className="adm-cell-sub" style={{ marginTop: 4, whiteSpace: "normal" }}>
          {x.author} · {timeAgo(x.at, now)} ·{" "}
          {p && (
            <Link className="adm-link" href={`/admin/products/${p.slug}`}>
              {p.name}
            </Link>
          )}
        </div>
        {x.answer && !open && (
          <div className="adm-reply">
            <div style={{ fontSize: 12, color: "var(--a-ink-3)", marginBottom: 2 }}>Answered by Santalum Maison · {fmtDate(x.answer.at)}</div>
            {x.answer.body}
            <div>
              <button type="button" className="adm-btn" data-variant="ghost" data-size="sm" style={{ marginTop: 4, marginLeft: -10 }} onClick={() => setOpen(true)}>
                <Icon name="edit" />
                Edit answer
              </button>
            </div>
          </div>
        )}
        {open && (
          <form
            style={{ marginTop: 10, display: "grid", gap: 8, maxWidth: "70ch" }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              reviewActions.answer(x.id, text.trim());
              toast("Answer published");
              setOpen(false);
            }}
          >
            <label className="adm-sr" htmlFor={`ans-${x.id}`}>
              Answer
            </label>
            <textarea id={`ans-${x.id}`} className="adm-textarea" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Answer as the Maison" />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="adm-btn" data-variant="primary" data-size="sm" disabled={!text.trim()}>
                Publish answer
              </button>
              {x.answer && (
                <button type="button" className="adm-btn" data-size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </article>
  );
}
