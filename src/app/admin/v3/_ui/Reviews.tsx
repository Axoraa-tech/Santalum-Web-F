"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { fmtDateTime, timeAgo } from "../../_data/format";
import { reviewActions, useNow, useProducts, useReviews, type AdminQuestion, type AdminReview } from "../../_data/store";
import type { ModerationState } from "../../_data/types";
import { BASE, Btn, Filter, Head, Led, Seg, Split, say, useListKeys, Woods, keyBlocked } from "./kit";

type Tab = "pending" | "published" | "hidden" | "all" | "questions";
const ST_TONE: Record<ModerationState, string> = { pending: "amber", published: "green", hidden: "off" };
type Item = { kind: "r"; r: AdminReview } | { kind: "q"; q: AdminQuestion };

export function Reviews() {
  const { reviews, questions } = useReviews();
  const products = useProducts();
  const now = useNow();
  const [tab, setTab] = useState<Tab>("pending");
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<string | null>(null);
  const [focusDetail, setFocusDetail] = useState(false);
  const nameOf = useMemo(() => {
    const m = new Map(products.map((p) => [p.slug, p]));
    return (slug: string) => m.get(slug);
  }, [products]);

  const items = useMemo<Item[]>(() => {
    const n = q.trim().toLowerCase();
    const hit = (s: string) => !n || s.toLowerCase().includes(n);
    if (tab === "questions") return questions.filter((x) => hit(`${x.author} ${x.body} ${x.slug}`)).sort((a, b) => Number(!!a.answer) - Number(!!b.answer) || b.at - a.at).map((x) => ({ kind: "q" as const, q: x }));
    return reviews.filter((r) => (tab === "all" || r.state === tab) && hit(`${r.author} ${r.title} ${r.body} ${r.slug}`)).map((r) => ({ kind: "r" as const, r }));
  }, [reviews, questions, tab, q]);

  const idOf = (it: Item) => (it.kind === "r" ? it.r.id : it.q.id);
  const idx = items.findIndex((it) => idOf(it) === selId);
  const cursor = idx < 0 ? 0 : idx;
  const sel = items[cursor];

  const ref = useListKeys(items.length, {
    cursor,
    setCursor: (i) => setSelId(idOf(items[i])),
    onOpen: (i) => {
      setSelId(idOf(items[i]));
      setFocusDetail(true);
    },
    extra: (key, i) => {
      const it = items[i];
      if (!it || it.kind !== "r") return false;
      if (key === "p" || key === "h") {
        const state = key === "p" ? "published" : "hidden";
        reviewActions.setState([it.r.id], state);
        say(`${state}: ${it.r.title}`);
        // keep the cursor on the same index so the next row comes up
        const nextIt = items[i + 1] ?? items[i - 1];
        if (tab !== "all" && nextIt) setSelId(idOf(nextIt));
        return true;
      }
      if (key === "f") {
        reviewActions.toggleFeatured(it.r.id);
        say(it.r.featured ? "unfeatured" : "featured on the product page");
        return true;
      }
      return false;
    },
  });

  const counts = {
    pending: reviews.filter((r) => r.state === "pending").length,
    published: reviews.filter((r) => r.state === "published").length,
    hidden: reviews.filter((r) => r.state === "hidden").length,
    all: reviews.length,
    questions: questions.filter((x) => !x.answer).length,
  };

  return (
    <Split
      focus={focusDetail && sel ? "detail" : "list"}
      list={
        <div className="a3-listpane" ref={ref}>
          <div className="a3-listhead">
            <Filter value={q} onChange={setQ} placeholder="filter author, text, product" />
            <Seg
              value={tab}
              onChange={(t) => {
                setTab(t);
                setSelId(null);
              }}
              label="Queue"
              items={[
                { id: "pending", label: "pending", n: counts.pending },
                { id: "published", label: "live", n: counts.published },
                { id: "hidden", label: "hidden", n: counts.hidden },
                { id: "all", label: "all", n: counts.all },
                { id: "questions", label: "q&a open", n: counts.questions },
              ]}
            />
          </div>
          <ul className="a3-rows" role="listbox" aria-label="Reviews">
            {items.map((it, i) => (
              <li
                key={idOf(it)}
                role="option"
                aria-selected={i === cursor}
                data-a3-row={i}
                data-cur={i === cursor || undefined}
                onClick={() => {
                  setSelId(idOf(it));
                  setFocusDetail(true);
                }}
              >
                {it.kind === "r" ? (
                  <>
                    <Led tone={ST_TONE[it.r.state]} label={it.r.state} />
                    <span className="a3-mono a3-stars" data-low={it.r.rating <= 2 || undefined}>
                      {"★".repeat(it.r.rating)}
                      <span className="a3-dim">{"★".repeat(5 - it.r.rating)}</span>
                    </span>
                    <span className="a3-row-name">{it.r.title}</span>
                    {it.r.featured && <span className="a3-tag">feat</span>}
                    <span className="a3-mono a3-dim a3-row-age">{timeAgo(it.r.at, now).replace(" ago", "")}</span>
                  </>
                ) : (
                  <>
                    <Led tone={it.q.answer ? "green" : "amber"} label={it.q.answer ? "answered" : "open"} />
                    <span className="a3-mono a3-dim">q</span>
                    <span className="a3-row-name">{it.q.body}</span>
                    <span className="a3-mono a3-dim a3-row-age">{timeAgo(it.q.at, now).replace(" ago", "")}</span>
                  </>
                )}
              </li>
            ))}
            {items.length === 0 && <li className="a3-dim a3-empty">queue clear</li>}
          </ul>
        </div>
      }
      detail={
        sel ? (
          sel.kind === "r" ? (
            <ReviewDetail key={sel.r.id} r={sel.r} product={nameOf(sel.r.slug)} back={() => setFocusDetail(false)} />
          ) : (
            <QuestionDetail key={sel.q.id} q={sel.q} product={nameOf(sel.q.slug)} back={() => setFocusDetail(false)} />
          )
        ) : (
          <div className="a3-empty a3-dim">nothing selected</div>
        )
      }
    />
  );
}

type P = ReturnType<typeof useProducts>[number] | undefined;

function ProductLine({ slug, product }: { slug: string; product: P }) {
  return (
    <div className="a3-kv">
      <div>
        <span>product</span>
        <span>
          <Link href={`${BASE}/products/${slug}`}>{product?.name ?? slug}</Link> {product && <Woods ws={[product.wood]} />}
        </span>
      </div>
    </div>
  );
}

function useFocusKey(ref: RefObject<HTMLTextAreaElement | null>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "e" || keyBlocked(e)) return;
      e.preventDefault();
      ref.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ref]);
}

function ReviewDetail({ r, product, back }: { r: AdminReview; product: P; back: () => void }) {
  const [reply, setReply] = useState(r.reply?.body ?? "");
  const ta = useRef<HTMLTextAreaElement>(null);
  useFocusKey(ta);
  const set = (s: ModerationState) => {
    reviewActions.setState([r.id], s);
    say(`${s}: ${r.title}`);
  };
  return (
    <article className="a3-detail">
      <button type="button" className="a3-back" onClick={back}>
        ← queue
      </button>
      <Head path="~/reviews/" title={r.title} meta={<span className="a3-st"><Led tone={ST_TONE[r.state]} /> {r.state}</span>} />
      <div className="a3-actions">
        <Btn kind={r.state === "published" ? "ghost" : "primary"} hint="p" onClick={() => set("published")} disabled={r.state === "published"}>
          publish
        </Btn>
        <Btn hint="h" onClick={() => set("hidden")} disabled={r.state === "hidden"}>
          hide
        </Btn>
        <Btn hint="f" onClick={() => reviewActions.toggleFeatured(r.id)}>
          {r.featured ? "unfeature" : "feature"}
        </Btn>
      </div>
      <ProductLine slug={r.slug} product={product} />
      <div className="a3-kv">
        <div>
          <span>by</span>
          <span>
            {r.author}, {r.city} {r.verified ? <span className="a3-tag">verified buyer</span> : <span className="a3-tag" data-warn>unverified</span>}
          </span>
        </div>
        <div>
          <span>rating</span>
          <span className="a3-mono a3-stars" data-low={r.rating <= 2 || undefined}>
            {"★".repeat(r.rating)}
            <span className="a3-dim">{"★".repeat(5 - r.rating)}</span> {r.rating}/5
          </span>
        </div>
        <div>
          <span>at</span>
          <span className="a3-mono">{fmtDateTime(r.at)}</span>
        </div>
      </div>
      <blockquote className="a3-quote-block">{r.body}</blockquote>
      <h2 className="a3-h2">reply from the maison {r.reply && <span className="a3-dim">· {fmtDateTime(r.reply.at)}</span>}</h2>
      <form
        className="a3-replyform"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reply.trim()) return;
          reviewActions.reply(r.id, reply.trim());
          say("reply saved");
        }}
      >
        <textarea ref={ta} rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="press e · public reply, signed by the Maison" aria-label="Reply" onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && e.currentTarget.form?.requestSubmit()} />
        <Btn type="submit" kind="primary" hint="⌘↵">
          {r.reply ? "update reply" : "post reply"}
        </Btn>
      </form>
    </article>
  );
}

function QuestionDetail({ q, product, back }: { q: AdminQuestion; product: P; back: () => void }) {
  const [ans, setAns] = useState(q.answer?.body ?? "");
  const ta = useRef<HTMLTextAreaElement>(null);
  useFocusKey(ta);
  return (
    <article className="a3-detail">
      <button type="button" className="a3-back" onClick={back}>
        ← queue
      </button>
      <Head path="~/reviews/q/" title="question" meta={<span className="a3-st"><Led tone={q.answer ? "green" : "amber"} /> {q.answer ? "answered" : "open"}</span>} />
      <ProductLine slug={q.slug} product={product} />
      <div className="a3-kv">
        <div>
          <span>asked by</span>
          <span>
            {q.author} · <span className="a3-mono">{fmtDateTime(q.at)}</span>
          </span>
        </div>
      </div>
      <blockquote className="a3-quote-block">{q.body}</blockquote>
      <h2 className="a3-h2">answer</h2>
      <form
        className="a3-replyform"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ans.trim()) return;
          reviewActions.answer(q.id, ans.trim());
          say("answer published");
        }}
      >
        <textarea ref={ta} rows={4} value={ans} onChange={(e) => setAns(e.target.value)} placeholder="press e · shown under the question on the product page" aria-label="Answer" onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && e.currentTarget.form?.requestSubmit()} />
        <Btn type="submit" kind="primary" hint="⌘↵">
          {q.answer ? "update answer" : "publish answer"}
        </Btn>
      </form>
    </article>
  );
}
