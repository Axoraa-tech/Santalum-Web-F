"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { useUser } from "@/lib/shop/account";
import { formatDate } from "@/lib/shop/orders";
import { addReview, answerQuestion, askQuestion, replyToReview, toggleHelpful, useQuestions, useReviews, type Reply, type Review } from "@/lib/shop/reviews";
import { getProduct } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { AreaField, AuthPanel, Field, Submit } from "./forms";
import { IconCheck } from "./Icons";
import { QA } from "./qa";
import { STAR, Stars } from "./Stars";
import { EASE } from "./store";

type Sort = "helpful" | "new" | "high" | "low";
const SORTS: { id: Sort; label: string }[] = [
  { id: "helpful", label: "Most helpful" },
  { id: "new", label: "Newest" },
  { id: "high", label: "Highest" },
  { id: "low", label: "Lowest" },
];
type R = Review & { votedHelpful?: boolean };

const pill = (on: boolean) =>
  `inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition active:scale-95 ${
    on ? "bg-(--s7-ink) text-(--s7-page)" : "bg-(--s7-surface)/70 ring-1 ring-(--s7-ink)/10 hover:bg-(--s7-surface) hover:ring-(--s7-ink)/30"
  }`;

/** Ratings, reviews with threaded replies, and questions: a pile of cards beside the score card. */
export function Reviews({ slug, name }: { slug: string; name: string }) {
  const { reviews, summary } = useReviews(slug);
  const [sort, setSort] = useState<Sort>("helpful");
  const [star, setStar] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  const [writing, setWriting] = useState(false);
  // ids on the pile before the customer posted; the one that is new is laid on top, whatever the sort
  const [before, setBefore] = useState<Set<string> | null>(null);
  const fresh = before ? reviews.find((r) => !before.has(r.id))?.id : undefined;

  const sorted = (reviews as R[])
    .filter((r) => !star || r.rating === star)
    .sort((a, b) =>
      sort === "new" ? b.at - a.at : sort === "high" ? b.rating - a.rating || b.at - a.at : sort === "low" ? a.rating - b.rating || b.at - a.at : b.helpful - a.helpful || b.at - a.at,
    );
  const list = fresh ? [...sorted.filter((r) => r.id === fresh), ...sorted.filter((r) => r.id !== fresh)] : sorted;
  const shown = all ? list : list.slice(0, 5);
  const max = Math.max(1, ...summary.dist);

  return (
    <section id="reviews" aria-labelledby="s7-rev" className="mt-3 scroll-mt-4 rounded-[28px] bg-(--s7-stone) px-3 pb-6 pt-6 md:rounded-[40px] md:px-6 md:pb-8 md:pt-8 lg:mt-[14px] lg:rounded-[48px] lg:px-8">
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        {/* the score card */}
        <div className="min-w-0 lg:col-span-4">
          <div className="rounded-[24px] bg-(--s7-surface) p-5 shadow-[0_24px_50px_-36px_rgba(27,23,18,0.5)] md:rounded-[30px] md:p-7 lg:sticky lg:top-[14px]">
            <h2 id="s7-rev" className="d1 text-[clamp(2.6rem,5vw,4.4rem)]">
              What people say
            </h2>
            <div className="mt-5 flex items-end gap-4">
              <p className="d1 num text-[96px] leading-[0.8]">{summary.avg.toFixed(1)}</p>
              <div className="pb-1">
                <Stars value={summary.avg} size={20} className="text-(--s7-accent)" />
                <p className="num mt-1 text-[14px] text-(--s7-muted)">
                  {summary.count} {summary.count === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
            <ul className="mt-5 grid gap-1.5" aria-label="Filter by stars">
              {[5, 4, 3, 2, 1].map((s) => {
                const n = summary.dist[s - 1];
                const on = star === s;
                return (
                  <li key={s}>
                    <button
                      type="button"
                      aria-pressed={on}
                      disabled={!n}
                      onClick={() => setStar(on ? null : s)}
                      className={`grid w-full grid-cols-[48px_1fr_28px] items-center gap-3 rounded-full px-2 py-1.5 text-[14px] transition disabled:opacity-45 ${on ? "bg-(--s7-ink) text-(--s7-page)" : "hover:bg-(--s7-page)"}`}
                    >
                      <span className="num text-left">{s} star</span>
                      <span className={`relative h-2.5 overflow-hidden rounded-full ${on ? "bg-white/20" : "bg-(--s7-ink)/10"}`}>
                        <span className="absolute inset-y-0 left-0 rounded-full bg-(--s7-accent)" style={{ width: `${(n / max) * 100}%` }} />
                      </span>
                      <span className="num text-right">{n}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => setWriting(true)}
              className="mt-6 h-12 w-full rounded-full bg-(--s7-ink) text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-[0.98]"
            >
              Write a review
            </button>
            <p className="mt-3 text-[13px] text-(--s7-muted)">Preview: reviews you write are saved in this browser until our store opens.</p>
          </div>
        </div>

        {/* the pile of reviews */}
        <div className="min-w-0 lg:col-span-8">
          <div className="s7-noscroll -mx-3 flex items-center gap-1.5 overflow-x-auto px-3 pb-1 md:mx-0 md:px-0" role="group" aria-label="Sort reviews">
            {SORTS.map((s) => (
              <button key={s.id} type="button" aria-pressed={sort === s.id} onClick={() => setSort(s.id)} className={pill(sort === s.id)}>
                {s.label}
              </button>
            ))}
            {star && (
              <button type="button" onClick={() => setStar(null)} className={pill(true)}>
                {star} star only, clear
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {writing && (
              <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: EASE }} className="mt-4">
                <WriteReview
                  slug={slug}
                  name={name}
                  onClose={() => setWriting(false)}
                  onPosted={() => {
                    setBefore(new Set(reviews.map((r) => r.id)));
                    setStar(null);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <ol className="mt-4 grid">
            {shown.map((r, i) => (
              <ReviewCard key={r.id} r={r} first={i === 0} fresh={r.id === fresh} />
            ))}
          </ol>
          {list.length === 0 && <p className="mt-6 rounded-[24px] bg-(--s7-surface) p-6 text-[16px] text-(--s7-muted)">No reviews with {star} stars yet.</p>}
          {list.length > 5 && (
            <button type="button" onClick={() => setAll(!all)} className="mt-4 h-12 rounded-full px-6 text-[15px] font-medium ring-1 ring-(--s7-ink)/20 transition hover:bg-(--s7-surface)">
              {all ? "Show fewer" : `Show all ${list.length} reviews`}
            </button>
          )}
        </div>
      </div>

      <Questions slug={slug} />
    </section>
  );
}

function ReviewCard({ r, first, fresh }: { r: R; first: boolean; fresh: boolean }) {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  return (
    <motion.li
      layout="position"
      initial={fresh ? { y: -40, rotate: -1.5, opacity: 0 } : false}
      animate={{ y: 0, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={`s7-on-surface relative rounded-[24px] bg-(--s7-surface) p-5 shadow-[0_-16px_36px_-28px_rgba(27,23,18,0.45)] md:rounded-[30px] md:p-7 ${first ? "" : "-mt-3 pt-8 md:pt-9"} ${
        fresh ? "z-[1] ring-2 ring-(--s7-accent)" : ""
      }`}
    >
      {fresh && (
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-(--s7-accent) px-3 py-1 text-[12.5px] font-medium text-white">
          <IconCheck width={12} height={12} />
          Your review, just added
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Stars value={r.rating} size={16} className="text-(--s7-accent)" />
        <span className="num text-[13px] text-(--s7-muted)">{formatDate(r.at)}</span>
      </div>
      <h3 className="d3 mt-2 text-[22px]">{r.title}</h3>
      <p className="mt-2 max-w-[64ch] text-[16px] leading-relaxed text-(--s7-body)">{r.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
        <span className="font-medium">{r.author}</span>
        <span className="text-(--s7-muted)">{r.city}</span>
        {r.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-(--s7-accent-soft) px-2.5 py-0.5 text-[12.5px] text-(--s7-accent-deep)">
            <IconCheck width={12} height={12} />
            Verified purchase
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={hydrated && !!r.votedHelpful}
          onClick={() => toggleHelpful(r.id)}
          className={`num inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[13.5px] font-medium transition active:scale-95 ${
            hydrated && r.votedHelpful ? "bg-(--s7-ink) text-(--s7-page)" : "ring-1 ring-(--s7-ink)/15 hover:ring-(--s7-ink)/40"
          }`}
        >
          Helpful <span className="opacity-70">{r.helpful}</span>
        </button>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex h-9 items-center rounded-full px-3.5 text-[13.5px] font-medium ring-1 ring-(--s7-ink)/15 transition hover:ring-(--s7-ink)/40">
          {r.replies.length ? `${r.replies.length} ${r.replies.length === 1 ? "reply" : "replies"}` : "Reply"}
        </button>
      </div>
      {(open || r.replies.some((x) => x.fromMaison)) && r.replies.length > 0 && (
        <ul className="mt-4 grid gap-2 border-l-2 border-(--s7-ink)/10 pl-3 md:pl-5">
          {r.replies.map((x) => (
            <ReplyCard key={x.id} x={x} />
          ))}
        </ul>
      )}
      {open && <Composer label={`Reply to ${r.author}`} cta="Post the reply" onSend={(b) => replyToReview(r.id, b)} />}
    </motion.li>
  );
}

function ReplyCard({ x }: { x: Reply }) {
  return (
    <li className={`rounded-[18px] px-4 py-3 text-[15px] leading-relaxed ${x.fromMaison ? "bg-(--s7-ink) text-(--s7-page)" : "bg-(--s7-page)"}`}>
      <p className="flex flex-wrap items-center gap-2 text-[13px]">
        {x.fromMaison ? (
          <>
            <span aria-hidden className="size-2.5 rounded-full bg-(--s7-accent)" />
            <span className="font-medium">Santalum Maison</span>
            <span className="opacity-60">The house</span>
          </>
        ) : (
          <span className="font-medium">{x.author}</span>
        )}
        <span className="num opacity-60">{formatDate(x.at)}</span>
      </p>
      <p className="mt-1">{x.body}</p>
    </li>
  );
}

/** A small reply or answer box. Signed out, it says so and offers the account page's sign-in in place. */
function Composer({ label, cta, onSend }: { label: string; cta: string; onSend: (body: string) => string | null }) {
  const hydrated = useHydrated();
  const user = useUser();
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);
  if (hydrated && !user) {
    return (
      <div className="mt-4">
        {auth ? (
          <AuthPanel tint="var(--s7-page)" onDone={() => setAuth(false)} />
        ) : (
          <p className="rounded-[18px] bg-(--s7-slip) px-4 py-3 text-[14.5px]">
            Replies come from customers with an account.{" "}
            <button type="button" onClick={() => setAuth(true)} className="font-medium underline decoration-(--s7-ink)/30 underline-offset-4">
              Sign in to reply
            </button>
          </p>
        )}
      </div>
    );
  }
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = onSend(body);
    setErr(r);
    if (!r) setBody("");
  };
  return (
    <form onSubmit={submit} className="mt-4 grid gap-3">
      <AreaField label={label} value={body} onChange={(e) => setBody(e.target.value)} rows={2} error={err} />
      <Submit className="h-11">{cta}</Submit>
    </form>
  );
}

function WriteReview({ slug, name, onClose, onPosted }: { slug: string; name: string; onClose: () => void; onPosted: () => void }) {
  const hydrated = useHydrated();
  const user = useUser();
  const [rating, setRating] = useState<Review["rating"]>(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = addReview({ slug, rating, title, body });
    setErr(r);
    if (!r) {
      setDone(true);
      onPosted();
    }
  };

  return (
    <div className="rounded-[24px] bg-(--s7-sand) p-5 shadow-[0_24px_50px_-36px_rgba(27,23,18,0.5)] md:rounded-[30px] md:p-7">
      <div className="flex items-start justify-between gap-4">
        <p className="d2 text-[34px]">Your review of {name}</p>
        <button type="button" onClick={onClose} className="shrink-0 rounded-full px-3.5 py-2 text-[13.5px] font-medium ring-1 ring-(--s7-ink)/15 hover:bg-(--s7-surface)">
          Close
        </button>
      </div>
      {!hydrated ? null : !user ? (
        <div className="mt-4">
          <p className="mb-4 text-[16px] text-(--s7-body)">Reviews come from customers with an account. Sign in or create one here; the review card waits.</p>
          <AuthPanel tint="var(--s7-surface)" />
        </div>
      ) : done ? (
        <p role="status" className="mt-4 text-[16px]">
          Thank you. Your review is on top of the pile, just below this card, and it counts in the score.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 grid gap-4">
          <div role="radiogroup" aria-label="Your rating" className="flex items-center gap-1">
            {([1, 2, 3, 4, 5] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={rating === s}
                aria-label={`${s} ${s === 1 ? "star" : "stars"}`}
                onClick={() => setRating(s)}
                className={`grid size-11 place-items-center rounded-full transition hover:scale-110 active:scale-95 ${s <= rating ? "text-(--s7-accent)" : "text-(--s7-ink)/30"}`}
              >
                <svg width={28} height={28} viewBox="0 0 24 24" aria-hidden>
                  <path d={STAR} fill={s <= rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
            <span className="num ml-2 text-[15px] text-(--s7-muted)">{rating} of 5</span>
          </div>
          <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="In a few words" />
          <AreaField
            label="Your review"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            error={err}
            placeholder="How it looks, feels or smells, and how it has changed with use."
          />
          <Submit>Post the review</Submit>
        </form>
      )}
    </div>
  );
}

/** The seeded questions are the same for every piece of a wood; here each is rewritten for the kind of piece shown. */
function useQuestionsFor(slug: string) {
  const qs = useQuestions(slug);
  const p = getProduct(slug);
  const own = p ? QA[p.category] : undefined;
  if (!own) return qs;
  return qs.map((q) => {
    const m = q.id.match(/-q(\d+)$/);
    const k = m && q.id === `${slug}-q${m[1]}` ? own[Number(m[1])] : undefined;
    if (!k) return q;
    return { ...q, body: k.q, answers: q.answers.map((a) => (a.id === `${q.id}-a` ? { ...a, body: k.a } : a)) };
  });
}

function Questions({ slug }: { slug: string }) {
  const qs = useQuestionsFor(slug);
  const [answering, setAnswering] = useState<string | null>(null);
  return (
    <div className="mt-8 grid gap-4 border-t border-(--s7-ink)/10 pt-8 lg:grid-cols-12 lg:gap-6">
      <div className="min-w-0 lg:col-span-4">
        <h2 className="d1 text-[clamp(2.4rem,4.4vw,3.8rem)]">Questions and answers</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-(--s7-muted)">Ask the workshop anything about this piece. The house answers, and so can other customers.</p>
        <Composer label="Your question" cta="Ask the question" onSend={(b) => askQuestion(slug, b)} />
      </div>
      <ol className="grid min-w-0 content-start gap-2 lg:col-span-8">
        {qs.map((q) => (
          <li key={q.id} className="s7-on-surface rounded-[24px] bg-(--s7-surface) p-5 md:rounded-[30px] md:p-6">
            <p className="d3 text-[20px]">{q.body}</p>
            <p className="num mt-1 text-[13px] text-(--s7-muted)">
              {q.author}, {formatDate(q.at)}
            </p>
            {q.answers.length > 0 && (
              <ul className="mt-3 grid gap-2">
                {q.answers.map((a) => (
                  <ReplyCard key={a.id} x={a} />
                ))}
              </ul>
            )}
            {answering === q.id ? (
              <Composer label="Your answer" cta="Post the answer" onSend={(b) => answerQuestion(q.id, b)} />
            ) : (
              <button type="button" onClick={() => setAnswering(q.id)} className="mt-3 text-[14px] font-medium underline decoration-(--s7-ink)/25 underline-offset-4 hover:decoration-(--s7-ink)">
                Answer this
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The rating with the customer's own reviews counted in (the seeded figure on the server and the first paint). */
export function LiveRating({ slug, className = "" }: { slug: string; className?: string }) {
  const { summary } = useReviews(slug);
  if (!summary.count) return null;
  return (
    <span className={`num inline-flex items-center gap-1.5 text-[13px] text-(--s7-muted) ${className}`}>
      <Stars value={summary.avg} size={13} className="text-(--s7-accent)" />
      <span>
        {summary.avg.toFixed(1)} <span className="opacity-80">({summary.count})</span>
      </span>
    </span>
  );
}
