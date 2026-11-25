"use client";

import Link from "next/link";
import { useId, useMemo, useState, type FormEvent } from "react";
import { useUser } from "@/lib/shop/account";
import { addReview, answerQuestion, askQuestion, replyToReview, toggleHelpful, useQuestions, useReviews, type Reply, type Review } from "@/lib/shop/reviews";
import type { Wood } from "@/lib/wood";
import { AuthChoice } from "./AuthForms";
import { useHydrated } from "./bits";
import { reviewDate, Stars } from "./Rating";
import { fitReviews } from "./review-fit";

type Sort = "helpful" | "newest" | "highest" | "lowest";
const SORTS: { key: Sort; label: string }[] = [
  { key: "helpful", label: "Most helpful" },
  { key: "newest", label: "Newest" },
  { key: "highest", label: "Highest rated" },
  { key: "lowest", label: "Lowest rated" },
];
type R = Review & { votedHelpful?: boolean };

/** This piece's reviews, with every seeded line about this kind of piece (see review-fit.ts). Stars and counts are unchanged. */
function usePieceReviews(slug: string) {
  const { reviews, summary } = useReviews(slug);
  const fitted = useMemo(() => fitReviews(slug, reviews as R[]), [slug, reviews]);
  return { reviews: fitted, summary };
}

/** Stars and the count in the product header; jumps to the reviews. */
export function ProductRating({ slug }: { slug: string }) {
  const { summary } = usePieceReviews(slug);
  if (!summary.count) return null;
  return (
    <a href="#reviews" className="group mt-3 inline-flex items-center gap-3 text-[15px]">
      <Stars avg={summary.avg} size={15} />
      <span className="tabular-nums text-(--muted) transition-colors group-hover:text-(--ink)">
        {summary.avg.toFixed(1)} from {summary.count} {summary.count === 1 ? "review" : "reviews"}
      </span>
    </a>
  );
}

/** Ratings, reviews with threaded replies, and questions: everything hangs from the page's brass thread. */
export function Reviews({ slug, wood }: { slug: string; wood: Wood }) {
  const { reviews, summary } = usePieceReviews(slug);
  const user = useUser();
  const [sort, setSort] = useState<Sort>("helpful");
  const [star, setStar] = useState<number | null>(null);
  const [shown, setShown] = useState(5);
  const [writing, setWriting] = useState(false);
  // when this visitor posted a review here: theirs hangs at the top of the thread whatever the sort
  const [posted, setPosted] = useState<number | null>(null);
  const id = useId();
  const isNew = (r: R) => posted !== null && !r.id.startsWith(`${slug}-s`) && r.at >= posted;
  const list = [...reviews]
    .filter((r) => !star || r.rating === star)
    .sort(
      (a, b) =>
        Number(isNew(b)) - Number(isNew(a)) ||
        (sort === "newest"
          ? b.at - a.at
          : sort === "highest"
            ? b.rating - a.rating || b.helpful - a.helpful
            : sort === "lowest"
              ? a.rating - b.rating || b.helpful - a.helpful
              : b.helpful - a.helpful),
    );
  const fresh = list.some(isNew);
  const max = Math.max(1, ...summary.dist);

  return (
    <section id="reviews" aria-labelledby={`${id}-h`} className="mt-28 scroll-mt-28 md:mt-36">
      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        {/* the summary */}
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <h2 id={`${id}-h`} className="s3-serif text-[clamp(2rem,4vw,3.4rem)] leading-none">
              {wood === "red" ? "In other hands" : "What it smelled like to them"}
            </h2>
            <div className="mt-6 flex items-end gap-4">
              <span className="s3-serif text-[72px] leading-[0.8] tabular-nums">{summary.count ? summary.avg.toFixed(1) : "–"}</span>
              <span className="pb-1">
                <Stars avg={summary.avg} size={18} />
                <span className="mt-1.5 block text-[14px] text-(--muted)">
                  {summary.count} {summary.count === 1 ? "review" : "reviews"}
                </span>
              </span>
            </div>
            <ul className="mt-7 space-y-1.5" aria-label="Reviews by star">
              {[5, 4, 3, 2, 1].map((s) => {
                const n = summary.dist[s - 1];
                const on = star === s;
                return (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => setStar(on ? null : s)}
                      aria-pressed={on}
                      disabled={!n}
                      className="group grid w-full grid-cols-[3.2rem_1fr_2rem] items-center gap-3 rounded-full px-1 py-1 text-left text-[14px] transition-colors hover:bg-(--ink)/5 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <span className={on ? "text-(--ink)" : "text-(--muted)"}>{s} star</span>
                      <span className="relative block h-3" aria-hidden>
                        <span className="absolute inset-x-0 top-1/2 h-px bg-(--thread)/40" />
                        <span className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-(--thread)" style={{ width: `${(n / max) * 100}%` }} />
                        <span
                          className={`s3-bead absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-125 ${on ? "scale-125" : ""}`}
                          style={{ left: `${(n / max) * 100}%` }}
                        />
                      </span>
                      <span className="text-right tabular-nums text-(--muted)">{n}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" className="s3-btn s3-btn-dark mt-8" onClick={() => setWriting((w) => !w)} aria-expanded={writing}>
              <span className="s3-bead s3-btn-bead" aria-hidden />
              {writing ? "Close the form" : "Write a review"}
            </button>
          </div>
        </div>

        {/* the list */}
        <div className="md:col-span-8">
          {writing && (
            <WriteReview
              slug={slug}
              onDone={(at) => {
                setWriting(false);
                setPosted(at);
                setStar(null);
              }}
            />
          )}
          {fresh && (
            <p role="status" className="mb-6 flex items-start gap-3 rounded-[22px] bg-(--m-accent-soft) px-5 py-4 text-[15px] leading-[1.55]">
              <span className="s3-bead mt-[5px] h-3 w-3 shrink-0" aria-hidden />
              <span>
                Thank you{user ? `, ${user.name.split(" ")[0]}` : ""}. Your review is on the thread, at the top while you are here.
                <span className="text-(--muted)"> It is kept in this browser until our store opens.</span>
              </span>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--line) pb-4">
            <p className="text-[15px] text-(--muted)" aria-live="polite">
              {star ? `${list.length} with ${star} ${star === 1 ? "star" : "stars"}` : `${list.length} reviews`}
              {star && (
                <button type="button" className="s3-link ml-3" onClick={() => setStar(null)}>
                  Show all
                </button>
              )}
            </p>
            <label className="flex items-center gap-2 text-[14px] text-(--muted)">
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="s3-input min-h-[42px] w-[180px]">
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ol className="relative mt-2 border-l border-(--thread) pl-7 md:pl-9">
            {list.slice(0, shown).map((r) => (
              <ReviewItem key={r.id} r={r} mine={isNew(r)} />
            ))}
          </ol>
          {list.length > shown && (
            <button type="button" className="s3-btn s3-btn-line mt-6" onClick={() => setShown((n) => n + 5)}>
              Read {Math.min(5, list.length - shown)} more
            </button>
          )}
        </div>
      </div>

      <Questions slug={slug} />
    </section>
  );
}

function ReviewItem({ r, mine = false }: { r: R; mine?: boolean }) {
  const [replying, setReplying] = useState(false);
  return (
    <li className="relative py-7">
      {mine ? (
        <span className="s3-bead absolute -left-[36px] top-[31px] h-[15px] w-[15px] md:-left-[44px]" aria-hidden />
      ) : (
        <span className="s3-knot absolute -left-[33px] top-[34px] md:-left-[41px]" aria-hidden />
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Stars avg={r.rating} size={13} />
        <h3 className="s3-serif text-[22px] leading-tight">{r.title}</h3>
        {mine && <span className="s3-badge">Your review</span>}
      </div>
      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-(--muted)">
        <span className="text-(--ink)">{r.author}</span>
        <span>{r.city}</span>
        <span>{reviewDate(r.at)}</span>
        {r.verified && (
          <span className="inline-flex items-center gap-1.5 text-(--ink)">
            <span className="s3-bead h-2.5 w-2.5" aria-hidden />
            Verified purchase
          </span>
        )}
      </p>
      <p className="mt-3 max-w-[44rem] text-[16px] leading-[1.65] text-(--ink)/85">{r.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className="s3-wish -ml-3" aria-pressed={Boolean(r.votedHelpful)} onClick={() => toggleHelpful(r.id)}>
          <span className="s3-wish-bead" aria-hidden />
          Helpful <span className="tabular-nums">({r.helpful})</span>
        </button>
        <button type="button" className="s3-wish" aria-expanded={replying} onClick={() => setReplying((x) => !x)}>
          Reply
        </button>
      </div>
      {r.replies.length > 0 && (
        <ul className="mt-3 space-y-3 border-l border-(--thread)/50 pl-5">
          {r.replies.map((c) => (
            <ReplyItem key={c.id} c={c} />
          ))}
        </ul>
      )}
      {replying && (
        <ReplyBox
          label={`Reply to ${r.author}`}
          submit={(body) => replyToReview(r.id, body)}
          onDone={() => setReplying(false)}
          button="Post the reply"
        />
      )}
    </li>
  );
}

function ReplyItem({ c }: { c: Reply }) {
  return (
    <li className={c.fromMaison ? "s3-house px-4 py-3" : "py-1"}>
      <p className="flex flex-wrap items-baseline gap-x-3 text-[14px] text-(--muted)">
        <span className={c.fromMaison ? "s3-serif text-[17px] text-(--ink)" : "text-(--ink)"}>{c.fromMaison ? "Santalum Maison" : c.author}</span>
        {c.fromMaison && <span>from the workshop</span>}
        <span>{reviewDate(c.at)}</span>
      </p>
      <p className="mt-1 text-[16px] leading-[1.6] text-(--ink)/85">{c.body}</p>
    </li>
  );
}

/** A reply or an answer box; signed-out visitors are sent to sign in. */
function ReplyBox({ label, submit, onDone, button }: { label: string; submit: (body: string) => string | null; onDone?: () => void; button: string }) {
  const user = useUser();
  const hydrated = useHydrated();
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const id = useId();
  if (hydrated && !user) {
    return (
      <p className="mt-3 text-[15px] text-(--muted)">
        <Link href="/d/03/account" className="s3-link">
          Sign in
        </Link>{" "}
        to join the conversation.
      </p>
    );
  }
  const send = (e: FormEvent) => {
    e.preventDefault();
    const m = submit(body);
    setErr(m);
    if (!m) {
      setBody("");
      onDone?.();
    }
  };
  return (
    <form onSubmit={send} className="mt-3 max-w-[40rem]" noValidate>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={label}
        aria-invalid={Boolean(err)}
        aria-describedby={err ? `${id}-e` : undefined}
        className="s3-input min-h-[72px]"
      />
      {err && (
        <p id={`${id}-e`} className="s3-err">
          {err}
        </p>
      )}
      <button type="submit" className="s3-btn s3-btn-line s3-btn-sm mt-2">
        {button}
      </button>
    </form>
  );
}

function WriteReview({ slug, onDone }: { slug: string; onDone: (at: number) => void }) {
  const user = useUser();
  const [rating, setRating] = useState<Review["rating"] | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // each error sits under the part of the form it is about
  const [starErr, setStarErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const id = useId();
  if (!user) {
    return (
      <div className="mb-8 rounded-[28px] bg-(--warm) p-6 md:p-8">
        <p className="s3-serif text-[26px] leading-tight">Sign in to write a review</p>
        <p className="mb-6 mt-2 text-[16px] text-(--ink)/75">Reviews come from people with an account, so we can mark the ones who bought the piece.</p>
        <AuthChoice />
      </div>
    );
  }
  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setStarErr("Choose a number of stars.");
      return;
    }
    const at = Date.now();
    const m = addReview({ slug, rating, title, body });
    setErr(m);
    if (!m) onDone(at);
  };
  return (
    <form onSubmit={send} noValidate className="mb-8 grid gap-5 rounded-[28px] bg-(--warm) p-6 md:p-8" aria-label="Write a review">
      <fieldset aria-describedby={starErr ? `${id}-se` : undefined}>
        <legend className="text-[14px] text-(--muted)">Your rating</legend>
        <div className="s3-pick mt-2" data-invalid={Boolean(starErr)}>
          {[5, 4, 3, 2, 1].map((n) => (
            <label key={n}>
              <input
                type="radio"
                name={`${id}-r`}
                className="sr-only"
                checked={rating === n}
                onChange={() => {
                  setRating(n as Review["rating"]);
                  setStarErr(null);
                }}
                aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
              />
              <span className="s3-star" aria-hidden />
            </label>
          ))}
        </div>
        {starErr && (
          <p id={`${id}-se`} className="s3-err">
            {starErr}
          </p>
        )}
      </fieldset>
      <div className="s3-field">
        <label htmlFor={`${id}-t`} className="mb-1.5 block text-[14px] text-(--muted)">
          A title
        </label>
        <input id={`${id}-t`} value={title} onChange={(e) => setTitle(e.target.value)} className="s3-input" maxLength={80} />
      </div>
      <div className="s3-field">
        <label htmlFor={`${id}-b`} className="mb-1.5 block text-[14px] text-(--muted)">
          Your review
        </label>
        <textarea
          id={`${id}-b`}
          rows={4}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (err) setErr(null);
          }}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? `${id}-e` : undefined}
          className="s3-input"
        />
        {err && (
          <p id={`${id}-e`} className="s3-err">
            {err}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="s3-btn s3-btn-dark">
          <span className="s3-bead s3-btn-bead" aria-hidden />
          Post the review
        </button>
        <span className="text-[14px] text-(--muted)">Preview: reviews are kept in this browser until our store opens.</span>
      </div>
    </form>
  );
}

function Questions({ slug }: { slug: string }) {
  const questions = useQuestions(slug);
  const [open, setOpen] = useState<string | null>(null);
  const id = useId();
  return (
    <div className="mt-24 grid gap-10 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-4">
        <h2 id={`${id}-q`} className="s3-serif text-[clamp(2rem,3.6vw,3rem)] leading-none">
          Questions
        </h2>
        <p className="mt-3 max-w-[24rem] text-[16px] leading-[1.6] text-(--ink)/75">Ask the workshop, or answer someone who asked before you.</p>
        <ReplyBox label="Your question" button="Ask the question" submit={(b) => askQuestion(slug, b)} />
      </div>
      <ol className="relative border-l border-(--thread) pl-7 md:col-span-8 md:pl-9" aria-labelledby={`${id}-q`}>
        {questions.map((q) => (
          <li key={q.id} className="relative py-6">
            <span className="s3-knot absolute -left-[33px] top-[31px] md:-left-[41px]" aria-hidden />
            <p className="s3-serif text-[22px] leading-snug">{q.body}</p>
            <p className="mt-1 text-[14px] text-(--muted)">
              {q.author}, {reviewDate(q.at)}
            </p>
            {q.answers.length > 0 && (
              <ul className="mt-3 space-y-3 border-l border-(--thread)/50 pl-5">
                {q.answers.map((a) => (
                  <ReplyItem key={a.id} c={a} />
                ))}
              </ul>
            )}
            <button type="button" className="s3-wish -ml-3 mt-2" aria-expanded={open === q.id} onClick={() => setOpen(open === q.id ? null : q.id)}>
              Answer
            </button>
            {open === q.id && <ReplyBox label="Your answer" button="Post the answer" submit={(b) => answerQuestion(q.id, b)} onDone={() => setOpen(null)} />}
          </li>
        ))}
      </ol>
    </div>
  );
}
