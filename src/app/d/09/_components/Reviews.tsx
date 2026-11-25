"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { useUser } from "@/lib/shop/account";
import { formatDate } from "@/lib/shop/orders";
import { addReview, answerQuestion, askQuestion, replyToReview, toggleHelpful, useQuestions, useReviews, type Reply, type Review } from "@/lib/shop/reviews";
import { useHydrated } from "@/lib/shop/store";
import s from "../styles";
import { EASE } from "./data";
import { AuthPanel, Field } from "./forms";
import { fittedWords } from "./reviewWords";
import { Star, StarRow } from "./Stars";

type Sort = "helpful" | "newest" | "highest" | "lowest";
const SORT_LABEL: Record<Sort, string> = { helpful: "Most helpful", newest: "Newest", highest: "Highest", lowest: "Lowest" };
type Item = Review & { votedHelpful?: boolean };

/** The piece's reviews, with each seeded review's words written for this kind of piece (ratings unchanged). */
export function useFittedReviews(slug: string) {
  const { reviews, summary } = useReviews(slug);
  const fitted = useMemo(
    () =>
      reviews.map((r) => {
        const w = fittedWords(slug, r.id);
        return w ? { ...r, title: w.t, body: w.b } : r;
      }),
    [reviews, slug],
  );
  return { reviews: fitted, summary };
}

/** Ratings, reviews with replies, and questions for one piece, set like notes left at the end of a day. */
export function Reviews({ slug, name }: { slug: string; name: string }) {
  const { reviews, summary } = useFittedReviews(slug);
  const [sort, setSort] = useState<Sort>("helpful");
  const [star, setStar] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  const [writing, setWriting] = useState(false);
  // the review just posted: shown first, marked, and confirmed in words
  const [posted, setPosted] = useState<string | null>(null);
  const note = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (posted) note.current?.focus({ preventScroll: true });
  }, [posted]);

  const list = (star ? reviews.filter((r) => r.rating === star) : reviews).slice().sort((a, b) => {
    if (posted && (a.id === posted || b.id === posted)) return a.id === posted ? -1 : 1;
    if (sort === "newest") return b.at - a.at;
    if (sort === "highest") return b.rating - a.rating || b.at - a.at;
    if (sort === "lowest") return a.rating - b.rating || b.at - a.at;
    return b.helpful - a.helpful || b.at - a.at;
  });
  const shown = all ? list : list.slice(0, 4);
  const max = Math.max(1, ...summary.dist);

  return (
    <section id="reviews" aria-labelledby="d09-reviews-h" className="mt-28 scroll-mt-28 border-t border-[var(--hair)] pt-10">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <h2 id="d09-reviews-h" className={`${s.display} text-[clamp(2.2rem,5vw,3.4rem)] leading-none`}>
            In their words
          </h2>
          <div className="mt-8 flex items-end gap-5">
            <p className={`${s.num} text-[76px] font-extralight leading-[0.8] tracking-[-0.02em]`}>{summary.avg.toFixed(1)}</p>
            <div className="pb-1">
              <StarRow value={summary.avg} size={20} className="text-[var(--ink)]" />
              <p className="mt-1.5 text-[14px] text-[var(--muted)]">
                {summary.count} {summary.count === 1 ? "review" : "reviews"}
                <span className="sr-only">, average {summary.avg.toFixed(1)} out of 5</span>
              </p>
            </div>
          </div>
          <ul className="mt-8 grid gap-1.5" aria-label="Reviews by stars">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = summary.dist[n - 1];
              const on = star === n;
              return (
                <li key={n}>
                  <button
                    type="button"
                    aria-pressed={on}
                    disabled={!c}
                    onClick={() => {
                      setStar(on ? null : n);
                      setAll(false);
                    }}
                    className={`group grid w-full grid-cols-[3.2rem_1fr_2rem] items-center gap-3 rounded-full px-2 py-1.5 text-left text-[14px] transition-colors hover:bg-[var(--m-accent-soft)] disabled:cursor-default disabled:opacity-45 disabled:hover:bg-transparent ${
                      on ? "bg-[var(--m-accent-soft)]" : ""
                    }`}
                  >
                    <span className={s.tab}>
                      {n} {n === 1 ? "star" : "stars"}
                    </span>
                    <span className="relative h-[3px] overflow-hidden rounded-full bg-[var(--hair)]">
                      <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--m-accent)]" style={{ width: `${(c / max) * 100}%` }} />
                    </span>
                    <span className={`${s.tab} text-right text-[var(--muted)]`}>{c}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => setWriting((w) => !w)} aria-expanded={writing} className={`${s.btn} mt-8`}>
            Write a review
          </button>
        </div>

        <div className="lg:col-span-8">
          <AnimatePresence initial={false}>
            {writing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="overflow-hidden"
              >
                <div className={`${s.slip} mb-12 px-6 pb-8 pt-7 sm:px-8`}>
                  <WriteReview
                    slug={slug}
                    name={name}
                    onDone={(id) => {
                      setWriting(false);
                      if (!id) return;
                      setStar(null);
                      setSort("newest");
                      setPosted(id);
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {posted && (
              <motion.p
                key={posted}
                ref={note}
                tabIndex={-1}
                role="status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="mb-8 flex items-start gap-4 rounded-[2rem_2rem_0.5rem_0.5rem] border-b-2 border-[var(--m-accent)] bg-[radial-gradient(110%_120%_at_50%_120%,var(--m-accent-soft),transparent_75%)] px-6 py-5 outline-none"
              >
                <span aria-hidden className="relative mt-1 h-[18px] w-[30px] shrink-0 overflow-hidden border-b border-[var(--m-accent)]">
                  <span className="absolute bottom-[2px] left-1/2 size-[14px] -translate-x-1/2 rounded-full bg-[var(--m-accent)]" />
                </span>
                <span className="text-[16px] leading-[1.6]">
                  <span className={`${s.display} block text-[24px] leading-tight`}>Thank you. Your review is up.</span>
                  <span className="text-[var(--muted)]">It is first in the list below, sorted by newest, and it counts in the stars above.</span>
                </span>
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sort reviews">
            {(Object.keys(SORT_LABEL) as Sort[]).map((k) => (
              <button key={k} type="button" aria-pressed={sort === k} onClick={() => setSort(k)} className={`${s.chip} min-h-[2.5rem] px-3.5 text-[14px]`}>
                <span aria-hidden className={s.chipSun} />
                {SORT_LABEL[k]}
              </button>
            ))}
            {star && (
              <button type="button" onClick={() => setStar(null)} className={`${s.link} ml-2`}>
                Showing {star}-star reviews. Show all
              </button>
            )}
          </div>

          {list.length === 0 ? (
            <p className="mt-10 text-[16px] text-[var(--muted)]">No reviews with {star} stars yet.</p>
          ) : (
            <ol className="mt-6">
              {shown.map((r) => (
                <ReviewItem key={r.id} r={r} mine={r.id === posted} />
              ))}
            </ol>
          )}
          {list.length > 4 && !all && (
            <button type="button" onClick={() => setAll(true)} className={`${s.ghost} mt-8`}>
              Show all {list.length} reviews
            </button>
          )}
        </div>
      </div>

      <Questions slug={slug} />
    </section>
  );
}

function Who({ name, at, children }: { name: string; at: number; children?: ReactNode }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[var(--muted)]">
      <span className="text-[var(--ink)]">{name}</span>
      <span className={s.tab}>{formatDate(at)}</span>
      {children}
    </p>
  );
}

function ReviewItem({ r, mine = false }: { r: Item; mine?: boolean }) {
  const [replying, setReplying] = useState(false);
  return (
    <li className={`border-b border-[var(--hair)] py-8 first:pt-4 ${mine ? "relative" : ""}`}>
      {mine && (
        <p className="mb-3 flex items-center gap-2 text-[13px] text-[var(--m-accent)]">
          <span aria-hidden className="size-2 rounded-full bg-[var(--m-accent)]" />
          Your review, just posted
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <StarRow value={r.rating} size={15} className="text-[var(--ink)]" />
        <span className="sr-only">{r.rating} out of 5 stars.</span>
        <h3 className={`${s.display} text-[24px] leading-tight`}>{r.title}</h3>
      </div>
      <div className="mt-2">
        <Who name={`${r.author}, ${r.city}`} at={r.at}>
          {r.verified && (
            <span className="inline-flex items-center gap-1.5 text-[var(--m-accent)]">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <circle cx="7" cy="7" r="6.2" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M4.2 7.2l1.9 1.8 3.7-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Verified purchase
            </span>
          )}
        </Who>
      </div>
      <p className="mt-3 max-w-[44rem] text-[16px] leading-[1.7]">{r.body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button type="button" aria-pressed={!!r.votedHelpful} onClick={() => toggleHelpful(r.id)} className={`${s.chip} min-h-[2.4rem] px-3.5 text-[14px]`}>
          <span aria-hidden className={s.chipSun} />
          Helpful <span className={`${s.tab} text-[var(--muted)]`}>{r.helpful}</span>
        </button>
        <button type="button" onClick={() => setReplying((x) => !x)} aria-expanded={replying} className={s.link}>
          Reply
        </button>
      </div>
      {(r.replies.length > 0 || replying) && (
        <ol className="mt-5 grid gap-4 border-l border-[var(--hair)] pl-5 sm:ml-2">
          {r.replies.map((c) => (
            <ReplyItem key={c.id} c={c} />
          ))}
          {replying && (
            <li>
              <ReplyBox label="Your reply" cta="Post reply" onSend={(body) => replyToReview(r.id, body)} onDone={() => setReplying(false)} />
            </li>
          )}
        </ol>
      )}
    </li>
  );
}

/** A reply; the Maison's replies are set as the house: on its own tint, under its name. */
function ReplyItem({ c }: { c: Reply }) {
  if (c.fromMaison)
    return (
      <li className="rounded-[1.4rem] bg-[color-mix(in_srgb,var(--m-accent-soft)_75%,transparent)] px-5 py-4">
        <p className="flex items-center gap-2.5">
          <span aria-hidden className="size-2 rounded-full bg-[var(--m-accent)]" />
          <span className={`${s.display} text-[19px] leading-none`}>Santalum Maison</span>
          <span className={`${s.tab} text-[13px] text-[var(--muted)]`}>{formatDate(c.at)}</span>
        </p>
        <p className="mt-2 text-[15px] leading-[1.65]">{c.body}</p>
      </li>
    );
  return (
    <li>
      <Who name={c.author} at={c.at} />
      <p className="mt-1 text-[15px] leading-[1.65]">{c.body}</p>
    </li>
  );
}

/** Sign in where you are: the same tabs as the account, inside the section. */
function SignInHere({ what }: { what: string }) {
  return (
    <div className="grid gap-5">
      <p className="text-[16px] leading-[1.6] text-[var(--muted)]">Sign in to {what}. It takes a moment, and your note stays with your account.</p>
      <AuthPanel compact />
    </div>
  );
}

function ReplyBox({ label, cta, onSend, onDone }: { label: string; cta: string; onSend: (body: string) => string | null; onDone: () => void }) {
  const user = useUser();
  const hydrated = useHydrated();
  const id = useId();
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  if (!hydrated || !user) return <SignInHere what="reply" />;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const e2 = onSend(body);
    setErr(e2);
    if (!e2) {
      setBody("");
      onDone();
    }
  };
  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className={s.field} data-invalid={err ? "true" : undefined}>
        <label htmlFor={id} className={s.fieldLabel}>
          {label}
        </label>
        <textarea id={id} rows={2} maxLength={600} value={body} onChange={(e) => setBody(e.target.value)} aria-invalid={err ? true : undefined} aria-describedby={err ? `${id}-e` : undefined} />
        {err && (
          <span id={`${id}-e`} className={s.error}>
            {err}
          </span>
        )}
      </div>
      <div className="flex items-center gap-5">
        <button type="submit" className={`${s.btn} min-h-[2.75rem] px-5 text-[14px]`}>
          {cta}
        </button>
        <button type="button" onClick={onDone} className={s.link}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/** The id of the review just added for this piece (the reviews store keeps them in this browser). */
function readLatest(slug: string, before: Set<string>): string {
  try {
    const raw = JSON.parse(localStorage.getItem("santalum-reviews") ?? "null") as { reviews?: { id: string; slug: string }[] } | null;
    return raw?.reviews?.find((r) => r.slug === slug && !before.has(r.id))?.id ?? "new";
  } catch {
    return "new";
  }
}

const STAR_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Exceptional"];

function StarPicker({ value, onChange }: { value: number; onChange: (n: 1 | 2 | 3 | 4 | 5) => void }) {
  const id = useId();
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = Math.max(1, Math.min(5, (value || 0) + d)) as 1 | 2 | 3 | 4 | 5;
    onChange(n);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-n="${n}"]`)?.focus();
  };
  return (
    <div>
      <p id={`${id}-l`} className="text-[13px] text-[var(--muted)]">
        Your rating
      </p>
      <div className="mt-2 flex items-center gap-4">
        <div role="radiogroup" aria-labelledby={`${id}-l`} onKeyDown={onKey} onMouseLeave={() => setHover(0)} className="flex gap-1">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} ${n === 1 ? "star" : "stars"}, ${STAR_WORDS[n]}`}
              tabIndex={value === n || (!value && n === 1) ? 0 : -1}
              data-n={n}
              onMouseEnter={() => setHover(n)}
              onClick={() => onChange(n)}
              className="grid size-11 place-items-center rounded-full text-[var(--ink)] transition-transform hover:scale-110 active:scale-95"
            >
              <Star on={shown >= n} />
            </button>
          ))}
        </div>
        <span className={`${s.display} text-[22px] text-[var(--muted)]`} aria-hidden>
          {STAR_WORDS[shown]}
        </span>
      </div>
    </div>
  );
}

function WriteReview({ slug, name, onDone }: { slug: string; name: string; onDone: (postedId: string | null) => void }) {
  const user = useUser();
  const hydrated = useHydrated();
  const { reviews } = useReviews(slug);
  const [rating, setRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [err, setErr] = useState<{ rating?: string | null; body?: string | null }>({});
  const bodyId = useId();
  if (!hydrated || !user) return <SignInHere what={`review the ${name}`} />;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (!rating) {
      setErr({ rating: "Choose a rating from one to five stars." });
      return;
    }
    const before = new Set(reviews.map((r) => r.id));
    const msg = addReview({ slug, rating, title: String(d.get("title") ?? ""), body: String(d.get("body") ?? "") });
    if (msg) {
      setErr({ body: msg });
      return;
    }
    setErr({});
    // the store has the new review now; find it by the id that was not there before
    onDone(readLatest(slug, before));
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-7">
      <p className={`${s.display} text-[30px] leading-none`}>Your review of the {name}</p>
      <div>
        <StarPicker value={rating} onChange={setRating} />
        {err.rating && <span className={s.error}>{err.rating}</span>}
      </div>
      <Field label="Title" name="title" autoComplete="off" maxLength={80} placeholder="In a few words" />
      <div className={s.field} data-invalid={err.body ? "true" : undefined}>
        <label htmlFor={bodyId} className={s.fieldLabel}>
          Your review
        </label>
        <textarea id={bodyId} name="body" rows={4} maxLength={1200} aria-invalid={err.body ? true : undefined} aria-describedby={err.body ? `${bodyId}-e` : undefined} />
        {err.body && (
          <span id={`${bodyId}-e`} className={s.error}>
            {err.body}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" className={s.btn}>
          Post the review
        </button>
        <p className="text-[13px] text-[var(--muted)]">Preview: reviews are saved in this browser until our store opens.</p>
      </div>
    </form>
  );
}

function Questions({ slug }: { slug: string }) {
  const qs = useQuestions(slug);
  const [asking, setAsking] = useState(false);
  const [answering, setAnswering] = useState<string | null>(null);
  return (
    <div className="mt-24 grid gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-4">
        <h2 className={`${s.display} text-[clamp(2.2rem,5vw,3.4rem)] leading-none`}>Questions</h2>
        <p className="mt-4 max-w-[24rem] text-[16px] leading-[1.65] text-[var(--muted)]">
          Ask the workshop anything about the wood, the making or the care. Other customers can answer too.
        </p>
        <button type="button" onClick={() => setAsking((a) => !a)} aria-expanded={asking} className={`${s.ghost} mt-6`}>
          Ask a question
        </button>
      </div>
      <div className="lg:col-span-8">
        {asking && (
          <div className={`${s.slip} mb-10 px-6 pb-7 pt-7 sm:px-8`}>
            <ReplyBox label="Your question" cta="Ask" onSend={(b) => askQuestion(slug, b)} onDone={() => setAsking(false)} />
          </div>
        )}
        <ol className="border-t border-[var(--hair)]">
          {qs.map((q) => (
            <li key={q.id} className="border-b border-[var(--hair)] py-7">
              <p className={`${s.display} text-[23px] leading-snug`}>{q.body}</p>
              <div className="mt-1.5">
                <Who name={q.author} at={q.at} />
              </div>
              {q.answers.length > 0 && (
                <ol className="mt-4 grid gap-4 border-l border-[var(--hair)] pl-5 sm:ml-2">
                  {q.answers.map((a) => (
                    <ReplyItem key={a.id} c={a} />
                  ))}
                </ol>
              )}
              <div className="mt-4 pl-5 sm:ml-2">
                {answering === q.id ? (
                  <ReplyBox label="Your answer" cta="Answer" onSend={(b) => answerQuestion(q.id, b)} onDone={() => setAnswering(null)} />
                ) : (
                  <button type="button" onClick={() => setAnswering(q.id)} className={s.link}>
                    Answer
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
