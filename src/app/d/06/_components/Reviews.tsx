"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { useUser } from "@/lib/shop/account";
import { getProduct } from "@/lib/shop/products";
import { addReview, answerQuestion, askQuestion, replyToReview, toggleHelpful, useQuestions, useReviews, type Reply, type Review } from "@/lib/shop/reviews";
import { useHydrated } from "@/lib/shop/store";
import { s } from "./cls";
import { cx } from "./data";
import { AuthTiles } from "./forms";
import { IconCheck, Mark, StarIcon, Stars } from "./ui";

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const day = (ms: number) => DATE.format(ms);
const SHORT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

type Sort = "helpful" | "new" | "high" | "low";
const SORT_LABEL: Record<Sort, string> = { helpful: "Most helpful", new: "Newest", high: "Highest", low: "Lowest" };

/** Ratings, reviews with threaded replies, and questions: one bento under the product. */
export function Reviews({ slug }: { slug: string }) {
  const { reviews, summary } = useReviews(slug);
  const questions = useQuestions(slug);
  const hydrated = useHydrated();
  const user = useUser();
  const signedIn = hydrated && !!user;
  const [star, setStar] = useState<number | null>(null);
  const [sort, setSort] = useState<Sort>("helpful");
  const [limit, setLimit] = useState(4);
  // when the customer posts, their review is pinned to the top of the list, whatever the sort
  const [postedAt, setPostedAt] = useState<number | null>(null);
  const p = getProduct(slug)!;

  const isNew = (r: Review) => postedAt !== null && r.at >= postedAt;
  const list = reviews
    .filter((r) => isNew(r) || !star || r.rating === star)
    .sort(
      (a, b) =>
        Number(isNew(b)) - Number(isNew(a)) ||
        (sort === "helpful" ? b.helpful - a.helpful : sort === "new" ? b.at - a.at : sort === "high" ? b.rating - a.rating || b.at - a.at : a.rating - b.rating || b.at - a.at),
    );
  const max = Math.max(1, ...summary.dist);
  const verified = reviews.filter((r) => r.verified).length;
  const answered = questions.filter((q) => q.answers.length > 0).length;
  const posted = (at: number) => {
    setPostedAt(at);
    setStar(null);
    setLimit(4);
  };

  return (
    <section id="reviews" aria-label="Ratings and reviews" className={cx(s.section, "grid gap-3 lg:grid-cols-12")}>
      {/* the summary, which also filters */}
      <div className={cx(s.tile, "flex flex-col p-6 sm:p-7 lg:col-span-4")}>
        <h2 className="text-[22px] font-medium tracking-[-0.03em]">Ratings</h2>
        <div className="mt-5 flex items-end gap-4">
          <p className={cx(s.monoWide, "text-[72px] leading-[0.8]")}>{summary.avg.toFixed(1)}</p>
          <div className="pb-1">
            <Stars value={summary.avg} size={18} />
            <p className={cx(s.mono, s.muted, "mt-1.5 text-[11px]")}>
              {summary.count} {summary.count === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-1.5" role="group" aria-label="Filter by stars">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = summary.dist[n - 1];
            const on = star === n;
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                disabled={!c}
                onClick={() => {
                  setStar(on ? null : n);
                  setLimit(4);
                }}
                className={cx(
                  "grid grid-cols-[56px_minmax(0,1fr)_28px] items-center gap-3 rounded-[12px] px-2 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40",
                  on ? "bg-[var(--b-ink)] text-white" : "hover:bg-[var(--b-tile2)]",
                )}
              >
                <span className={cx(s.mono, "whitespace-nowrap text-[12px]")}>{n} star</span>
                <span className={cx("h-2 overflow-hidden rounded-full", on ? "bg-white/20" : "bg-[var(--b-track)]")}>
                  <span className={cx("block h-full rounded-full", on ? "bg-white" : "bg-accent")} style={{ width: `${(c / max) * 100}%` }} />
                </span>
                <span className={cx(s.mono, "text-right text-[12px]")}>{c}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-1.5">
          <div className={cx(s.inner, "p-3")}>
            <p className={cx(s.mono, s.muted, "text-[10px]")}>Verified</p>
            <p className={cx(s.monoWide, "mt-1 text-[22px] leading-none")}>
              {verified}
              <span className={cx(s.muted, "text-[12px]")}> of {summary.count}</span>
            </p>
          </div>
          <a href="#b6-questions" className={cx(s.inner, "block p-3 transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent")}>
            <p className={cx(s.mono, s.muted, "text-[10px]")}>Questions answered</p>
            <p className={cx(s.monoWide, "mt-1 text-[22px] leading-none")}>
              {answered}
              <span className={cx(s.muted, "text-[12px]")}> of {questions.length}</span>
            </p>
          </a>
        </div>
        <p className={cx(s.muted, "mt-auto pt-6 text-[13.5px] leading-[1.45]")}>
          {p.wood === "red" ? "Reviews are from customers of red sandalwood pieces." : "Reviews are from customers of white sandalwood pieces."} Verified means we can match the review to an order.
        </p>
      </div>

      {/* write one */}
      <div className={cx(s.tile, s.tint, "flex flex-col p-6 sm:p-7 lg:col-span-8")}>
        <h2 className="text-[22px] font-medium tracking-[-0.03em]">Write a review</h2>
        {signedIn ? (
          <ReviewForm slug={slug} onPosted={posted} />
        ) : (
          <div className="mt-4">
            <p className="mb-4 text-[15px]">Sign in to review this piece. Your bag and place on the page stay as they are.</p>
            {hydrated && <AuthTiles compact />}
          </div>
        )}
      </div>

      {/* the list */}
      <div id="b6-review-list" className={cx(s.tile, s.section, "p-4 sm:p-6 lg:col-span-8")}>
        <div className="flex flex-wrap items-center gap-2 px-1 pb-4">
          <h2 className="mr-auto text-[22px] font-medium tracking-[-0.03em]">
            Reviews <span className={cx(s.mono, s.muted, "text-[13px]")}>{list.length}</span>
          </h2>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sort reviews">
            {(Object.keys(SORT_LABEL) as Sort[]).map((k) => (
              <button key={k} type="button" aria-pressed={sort === k} onClick={() => setSort(k)} className={cx(s.chip, s.chipSm)}>
                {SORT_LABEL[k]}
              </button>
            ))}
          </div>
        </div>
        {list.length === 0 ? (
          <p className={cx(s.inner, "p-5 text-[15px]")}>No {star}-star reviews yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {list.slice(0, limit).map((r) => (
                <ReviewCard key={r.id} r={r} signedIn={signedIn} mine={isNew(r)} />
              ))}
            </AnimatePresence>
          </ul>
        )}
        {list.length > limit && (
          <button type="button" className={cx(s.ghost, "mt-3 w-full")} onClick={() => setLimit((n) => n + 4)}>
            Show {Math.min(4, list.length - limit)} more of {list.length}
          </button>
        )}
      </div>

      {/* questions */}
      <div id="b6-questions" className={cx(s.tile, s.section, "flex flex-col p-4 sm:p-6 lg:col-span-4")}>
        <h2 className="px-1 text-[22px] font-medium tracking-[-0.03em]">Questions</h2>
        <AskForm slug={slug} signedIn={signedIn} />
        <ul className="mt-4 flex flex-col gap-2">
          {questions.map((q) => (
            <li key={q.id} className={cx(s.inner, "p-4")}>
              <p className="text-[15.5px] font-medium leading-snug">{q.body}</p>
              <p className={cx(s.mono, s.muted, "mt-1 text-[10.5px]")}>
                {q.author}, {day(q.at)}
              </p>
              <Thread items={q.answers} />
              <ReplyBox label="Answer" signedIn={signedIn} send={(b) => answerQuestion(q.id, b)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ReviewCard({ r, signedIn, mine }: { r: Review & { votedHelpful?: boolean }; signedIn: boolean; mine: boolean }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cx(s.inner, "p-4 sm:p-5", mine && "bg-accent-soft shadow-[inset_0_0_0_2px_var(--b-ink)]")}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars value={r.rating} size={14} />
        <p className="text-[16px] font-medium leading-tight">{r.title}</p>
        {mine && <span className={cx(s.mono, "ml-auto rounded-full bg-[var(--b-ink)] px-2 py-0.5 text-[10px] text-white")}>Yours, just posted</span>}
      </div>
      <p className="mt-2 text-[16px] leading-[1.55] text-[var(--b-ink2)]">{r.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className={cx(s.mono, s.muted, "text-[10.5px]")}>
          {r.author}, {r.city}, {day(r.at)}
        </p>
        {r.verified && (
          <span className={cx(s.mono, "inline-flex items-center gap-1 rounded-full bg-[var(--b-tile)] px-2 py-0.5 text-[10px]")}>
            <IconCheck size={11} /> Verified purchase
          </span>
        )}
        <button
          type="button"
          aria-pressed={!!r.votedHelpful}
          onClick={() => toggleHelpful(r.id)}
          className={cx(s.chip, s.chipSm, "ml-auto")}
        >
          Helpful <span className={s.mono}>{r.helpful}</span>
        </button>
      </div>
      <Thread items={r.replies} />
      <ReplyBox label="Reply" signedIn={signedIn} send={(b) => replyToReview(r.id, b)} />
    </motion.li>
  );
}

/** Replies and answers. The house speaks from a dark tile with its mark. */
function Thread({ items }: { items: Reply[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-3 flex flex-col gap-1.5 border-l-2 border-[var(--b-line)] pl-3">
      {items.map((x) => (
        <li key={x.id} className={cx("rounded-[14px] px-3.5 py-2.5", x.fromMaison ? "bg-[var(--b-ink)] text-white" : "bg-[var(--b-tile)]")}>
          <p className={cx(s.mono, "flex items-center gap-1.5 text-[10.5px]", x.fromMaison ? "text-white/70" : s.muted)}>
            {x.fromMaison && <Mark size={12} />}
            {x.author}, {day(x.at)}
          </p>
          <p className="mt-1 text-[15px] leading-[1.5]">{x.body}</p>
        </li>
      ))}
    </ul>
  );
}

function ReplyBox({ label, signedIn, send }: { label: string; signedIn: boolean; send: (body: string) => string | null }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const id = useId();
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-2 rounded text-[13.5px] text-[var(--b-muted)] underline decoration-[var(--b-line)] underline-offset-4 hover:text-[var(--b-ink)] focus-visible:outline-2 focus-visible:outline-accent">
        {label}
      </button>
    );
  if (!signedIn) return <p className="mt-2 text-[13.5px] text-[var(--b-muted)]">Sign in above to {label.toLowerCase()}.</p>;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const m = send(body);
    setErr(m);
    if (!m) {
      setBody("");
      setOpen(false);
    }
  };
  return (
    <form onSubmit={submit} className="mt-3 flex flex-wrap gap-2">
      <label htmlFor={id} className={s.srOnly}>
        {label}
      </label>
      <input id={id} autoFocus value={body} onChange={(e) => setBody(e.target.value)} className={cx(s.field, s.fieldWhite, "h-11 min-w-0 flex-1")} aria-describedby={err ? `${id}-e` : undefined} />
      <button type="submit" className={cx(s.btn, s.btnSm, "h-11 shrink-0")}>
        Post
      </button>
      {err && (
        <p id={`${id}-e`} className="basis-full text-[13px] text-[#a8322a]">
          {err}
        </p>
      )}
    </form>
  );
}

function ReviewForm({ slug, onPosted }: { slug: string; onPosted: (at: number) => void }) {
  const [rating, setRating] = useState<Review["rating"] | 0>(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ rating: Review["rating"]; title: string; body: string; at: number } | null>(null);
  const bodyId = useId();
  const titleId = useId();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!rating) return setErr("Choose a number of stars.");
    const at = Date.now();
    const m = addReview({ slug, rating, title, body });
    setErr(m);
    if (!m) {
      setDone({ rating, title: title.trim() || "Review", body: body.trim(), at });
      onPosted(at);
      setTitle("");
      setBody("");
      setRating(0);
    }
  };
  if (done)
    return (
      // the two cards take the whole tile, so the row stays level with the ratings beside it
      <div className="mt-4 grid flex-1 gap-3 @min-[560px]:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]" role="status">
        <div className="flex min-h-[220px] flex-col justify-between gap-5 rounded-[20px] bg-[var(--b-ink)] p-5 text-white">
          <span className="grid size-11 place-items-center rounded-full bg-white/10">
            <IconCheck size={20} />
          </span>
          <div>
            <p className="text-[22px] font-medium leading-tight tracking-[-0.03em]">Thank you. It is posted.</p>
            <p className="mt-2 text-[14.5px] leading-[1.5] text-white/70">Your review is pinned at the top of the reviews below, marked as yours.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a href="#b6-review-list" className={cx(s.ghost, s.btnSm, s.onWhite)}>
                See it in the list
              </a>
              <button
                type="button"
                className="rounded text-[14px] text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                onClick={() => setDone(null)}
              >
                Write another
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-[20px] bg-[var(--b-tile)] p-5">
          <p className={cx(s.mono, s.muted, "text-[10.5px]")}>What you wrote</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Stars value={done.rating} size={15} />
            <p className="text-[17px] font-medium leading-tight">{done.title}</p>
          </div>
          <p className="mt-2 line-clamp-6 text-[15.5px] leading-[1.55] text-[var(--b-ink2)]">{done.body}</p>
          {/* the review's own record, as it now stands on the page */}
          <dl className="mt-auto grid grid-cols-3 gap-1.5 pt-5">
            {[
              ["Stars", `${done.rating} of 5`],
              ["Posted", SHORT.format(done.at)],
              ["In the list", "First"],
            ].map(([k, v]) => (
              <div key={k} className={cx(s.inner, "min-w-0 p-3")}>
                <dt className={cx(s.mono, s.muted, "text-[10px]")}>{k}</dt>
                <dd className="mt-1 truncate text-[13.5px] font-medium leading-tight">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  const show = hover || rating;
  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <p className={s.label} id={`${bodyId}-stars`}>
          Your rating
        </p>
        <div role="radiogroup" aria-labelledby={`${bodyId}-stars`} className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className={cx(
                "grid size-12 place-items-center rounded-[14px] transition-[background-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-accent active:scale-90",
                n <= show ? "bg-[var(--b-ink)] text-white" : "bg-[var(--b-tile)] text-[var(--b-dim)]",
              )}
            >
              <StarIcon size={20} />
            </button>
          ))}
          <span className={cx(s.mono, s.muted, "ml-2 text-[12px]")}>{show ? `${show} of 5` : "Tap a tile"}</span>
        </div>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={titleId} className={s.label}>
          Title
        </label>
        <input id={titleId} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className={cx(s.field, s.fieldWhite)} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={bodyId} className={s.label}>
          Your review
        </label>
        <textarea id={bodyId} rows={4} value={body} onChange={(e) => setBody(e.target.value)} className={cx(s.field, s.fieldWhite)} aria-describedby={err ? `${bodyId}-e` : undefined} />
        {err && (
          <p id={`${bodyId}-e`} className="mt-1.5 text-[13px] text-[#a8322a]">
            {err}
          </p>
        )}
      </div>
      <div className="sm:col-span-2">
        <button type="submit" className={s.btn}>
          Post review
        </button>
      </div>
    </form>
  );
}

function AskForm({ slug, signedIn }: { slug: string; signedIn: boolean }) {
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const id = useId();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const m = askQuestion(slug, q);
    setErr(m);
    if (!m) setQ("");
  };
  if (!signedIn) return <p className={cx(s.inner, "mt-4 p-4 text-[14.5px]")}>Sign in in the tile beside the reviews to ask or answer a question.</p>;
  return (
    <form onSubmit={submit} className="mt-4">
      <label htmlFor={id} className={s.label}>
        Ask about this piece
      </label>
      <div className="flex gap-2">
        <input id={id} value={q} onChange={(e) => setQ(e.target.value)} className={cx(s.field, "min-w-0")} aria-describedby={err ? `${id}-e` : undefined} />
        <button type="submit" className={cx(s.btn, "shrink-0")}>
          Ask
        </button>
      </div>
      {err && (
        <p id={`${id}-e`} className="mt-1.5 text-[13px] text-[#a8322a]">
          {err}
        </p>
      )}
    </form>
  );
}
