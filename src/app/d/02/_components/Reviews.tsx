"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { useUser } from "@/lib/shop/account";
import { formatDate } from "@/lib/shop/orders";
import { addReview, answerQuestion, askQuestion, replyToReview, toggleHelpful, useQuestions, useReviews, type Reply, type Review } from "@/lib/shop/reviews";
import { useHydrated } from "@/lib/shop/store";
import { AuthPanel } from "./AuthForms";
import { EASE } from "./copy";
import { Stars } from "./Rating";
import { s } from "./cls";
import { CheckIcon, Field } from "./ui";

type Sort = "helpful" | "newest" | "highest" | "lowest";
const SORTS: { k: Sort; label: string }[] = [
  { k: "helpful", label: "Most helpful" },
  { k: "newest", label: "Newest" },
  { k: "highest", label: "Highest rated" },
  { k: "lowest", label: "Lowest rated" },
];
const STAR = "M12 2.6l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8 6.2 20.1l1.4-6.4L2.7 9.3l6.5-.7L12 2.6z";
const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** The live summary for a product header: stars, average, count. */
export function RatingSummaryLine({ slug }: { slug: string }) {
  const { summary } = useReviews(slug);
  if (!summary.count) return null;
  return (
    <a href="#reviews" className="group inline-flex items-center gap-2 text-[14px] tabular-nums text-[var(--o-ink-2)]">
      <Stars value={summary.avg} size={16} />
      <span className="font-semibold text-[var(--o-ink)]">{summary.avg.toFixed(1)}</span>
      <span className="underline-offset-4 group-hover:underline">
        {summary.count} {summary.count === 1 ? "review" : "reviews"}
      </span>
    </a>
  );
}

/** Rings of the dial, one per star count, outermost for five stars. Each arc is that share of the reviews. */
function RatingRings({ dist, count, avg, filter, onFilter }: { dist: number[]; count: number; avg: number; filter: number | null; onFilter: (n: number | null) => void }) {
  const reduced = !!useReducedMotion();
  return (
    <div>
      <div className="relative mx-auto aspect-square w-[min(78vw,280px)]">
        <svg viewBox="0 0 280 280" className="absolute inset-0 size-full -rotate-90" aria-hidden>
          {[5, 4, 3, 2, 1].map((star, i) => {
            const r = 130 - i * 18;
            const C = 2 * Math.PI * r;
            const share = count ? dist[star - 1] / count : 0;
            const dim = filter !== null && filter !== star;
            return (
              <g key={star} opacity={dim ? 0.3 : 1} style={{ transition: "opacity 0.3s" }}>
                <circle cx="140" cy="140" r={r} fill="none" stroke="var(--o-line)" strokeWidth="9" />
                <motion.circle
                  cx="140"
                  cy="140"
                  r={r}
                  fill="none"
                  stroke={star >= 4 ? "var(--m-accent)" : "var(--o-ink-2)"}
                  strokeOpacity={star >= 4 ? 1 - (5 - star) * 0.35 : 0.55}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  initial={reduced ? false : { strokeDashoffset: C }}
                  whileInView={{ strokeDashoffset: C * (1 - Math.max(share, 0.004)) }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: EASE, delay: i * 0.08 }}
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-[34%] grid place-items-center rounded-full text-center">
          <div>
            <p className={`${s.display} text-[44px] leading-none tabular-nums`}>{avg.toFixed(1)}</p>
            <p className="mt-1 text-[12px] tabular-nums text-[var(--o-muted)]">{count} reviews</p>
          </div>
        </div>
      </div>
      <ul className="mt-6 space-y-1.5" aria-label="Filter by stars">
        {[5, 4, 3, 2, 1].map((star) => {
          const on = filter === star;
          const n = dist[star - 1];
          return (
            <li key={star}>
              <button
                type="button"
                aria-pressed={on}
                disabled={!n}
                onClick={() => onFilter(on ? null : star)}
                className={`flex w-full items-center gap-3 rounded-full px-3 py-1.5 text-[14px] tabular-nums transition-colors disabled:opacity-40 ${on ? "bg-[var(--o-ink)] text-white" : "enabled:hover:bg-[var(--o-floor)]"}`}
              >
                <span className="w-14 text-left font-semibold">{star} star</span>
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--o-line)]">
                  <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--m-accent)]" style={{ width: `${count ? (n / count) * 100 : 0}%` }} />
                </span>
                <span className="w-6 text-right">{n}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A round star picker: five discs, the chosen ones filled. Native radios underneath. */
function StarPicker({ value, onChange }: { value: number; onChange: (n: Review["rating"]) => void }) {
  const name = useId();
  const words = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <fieldset>
      <legend className="mb-2 text-[14px] font-semibold">Your rating</legend>
      <div className="flex items-center gap-2">
        {([1, 2, 3, 4, 5] as const).map((n) => {
          const on = n <= value;
          return (
            <label
              key={n}
              className={`grid size-11 cursor-pointer place-items-center rounded-full border transition-[background-color,transform,border-color] duration-300 hover:scale-110 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--m-accent)] ${
                on ? "border-[var(--m-accent)] bg-[var(--m-accent)] text-white" : "border-[var(--o-line)] bg-[var(--o-card)] text-[var(--o-muted)]"
              }`}
            >
              <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="sr-only" aria-label={`${n} star${n > 1 ? "s" : ""}`} />
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                <path d={STAR} fill="currentColor" />
              </svg>
            </label>
          );
        })}
        <span className="ml-2 text-[14px] text-[var(--o-muted)]">{words[value]}</span>
      </div>
    </fieldset>
  );
}

/** When a signed-out visitor wants to write: Orbit's dial sign-in, inline. */
function SignInPrompt({ why, onCancel }: { why: string; onCancel: () => void }) {
  return (
    <div className="rounded-[32px] border border-[var(--o-line)] bg-[var(--o-card)] p-5 md:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <p className={`${s.syne} text-[18px] font-bold leading-snug`}>{why}</p>
        <button type="button" onClick={onCancel} className="shrink-0 text-[14px] font-semibold text-[var(--o-muted)] underline underline-offset-4 hover:text-[var(--o-ink)]">
          Not now
        </button>
      </div>
      <AuthPanel compact />
    </div>
  );
}

function Avatar({ name, house = false, size = "size-11" }: { name: string; house?: boolean; size?: string }) {
  if (house) return <span aria-hidden className={`${size} shrink-0 rounded-full ${s.seal}`} />;
  return (
    <span aria-hidden className={`${s.syne} grid ${size} shrink-0 place-items-center rounded-full bg-[var(--o-floor)] text-[13px] font-bold text-[var(--o-ink-2)]`}>
      {initials(name)}
    </span>
  );
}

/** A thread of replies hanging off its review, like moons on a line; the Maison's answers wear the seal. */
function Thread({ items }: { items: Reply[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-4 space-y-3 border-l-2 border-dashed border-[var(--o-line)] pl-4 md:pl-5">
      {items.map((r) => (
        <li key={r.id} className={`flex gap-3 rounded-[24px] p-3 ${r.fromMaison ? "bg-[var(--m-accent-soft)]" : "bg-[var(--o-stone)]"}`}>
          <Avatar name={r.author} house={r.fromMaison} size="size-9" />
          <div className="min-w-0">
            <p className="text-[13px] text-[var(--o-muted)]">
              <span className={`${s.syne} font-bold ${r.fromMaison ? "text-[var(--m-accent)]" : "text-[var(--o-ink)]"}`}>{r.fromMaison ? "Santalum Maison" : r.author}</span>, {formatDate(r.at)}
            </p>
            <p className="mt-0.5 text-[15px] leading-relaxed text-[var(--o-ink)]">{r.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ReplyBox({ label, onSend, onDone }: { label: string; onSend: (body: string) => string | null; onDone: () => void }) {
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const m = onSend(body);
    setErr(m);
    if (!m) {
      setBody("");
      onDone();
    }
  };
  return (
    <form onSubmit={submit} noValidate className="mt-3">
      <Field label={label} error={err}>
        {(a) => <textarea id={a.id} aria-describedby={a.describedBy} aria-invalid={a.invalid} rows={2} value={body} onChange={(e) => setBody(e.target.value)} className={s.field} />}
      </Field>
      <div className="mt-2 flex gap-2">
        <button type="submit" className="h-11 rounded-full bg-[var(--o-ink)] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-black active:scale-95">
          Send
        </button>
        <button type="button" onClick={onDone} className="h-11 rounded-full px-4 text-[14px] font-semibold text-[var(--o-muted)] hover:text-[var(--o-ink)]">
          Cancel
        </button>
      </div>
    </form>
  );
}

function ReviewCard({ r, signedIn }: { r: Review & { votedHelpful?: boolean }; signedIn: boolean }) {
  const [replying, setReplying] = useState(false);
  return (
    <li className="rounded-[32px] border border-[var(--o-line)] bg-[var(--o-card)] p-5 md:p-6">
      <div className="flex gap-4">
        <Avatar name={r.author} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Stars value={r.rating} size={15} />
            <h3 className={`${s.syne} text-[17px] font-bold leading-tight tracking-[-0.01em]`}>{r.title}</h3>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[var(--o-muted)]">
            <span>
              <span className="font-semibold text-[var(--o-ink-2)]">{r.author}</span>, {r.city}, {formatDate(r.at)}
            </span>
            {r.verified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--m-accent)] px-2 py-0.5 text-[12px] font-semibold text-[var(--m-accent)]">
                <CheckIcon className="size-3" />
                Verified purchase
              </span>
            )}
          </p>
          <p className="mt-3 text-[16px] leading-relaxed text-[var(--o-ink)]">{r.body}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={!!r.votedHelpful}
              onClick={() => toggleHelpful(r.id)}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold tabular-nums transition-colors active:scale-95 ${
                r.votedHelpful ? "border-[var(--o-ink)] bg-[var(--o-ink)] text-white" : "border-[var(--o-line)] hover:border-[var(--o-ink)]"
              }`}
            >
              <span aria-hidden className={`size-2 rounded-full ${r.votedHelpful ? "bg-[var(--m-accent)]" : "border border-current"}`} />
              Helpful ({r.helpful})
            </button>
            <button type="button" aria-expanded={replying} onClick={() => setReplying((v) => !v)} className="h-9 rounded-full px-3.5 text-[13px] font-semibold text-[var(--o-ink-2)] underline-offset-4 hover:underline">
              Reply
            </button>
          </div>
          <Thread items={r.replies} />
          {replying &&
            (signedIn ? (
              <ReplyBox label={`Reply to ${r.author}`} onSend={(b) => replyToReview(r.id, b)} onDone={() => setReplying(false)} />
            ) : (
              <div className="mt-4">
                <SignInPrompt why="Sign in to join the conversation." onCancel={() => setReplying(false)} />
              </div>
            ))}
        </div>
      </div>
    </li>
  );
}

function WriteReview({ slug, onDone }: { slug: string; onDone: () => void }) {
  const [rating, setRating] = useState<Review["rating"]>(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const m = addReview({ slug, rating, title, body });
    setErr(m);
    if (!m) onDone();
  };
  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-[32px] border border-[var(--o-ink)] bg-[var(--o-card)] p-5 md:p-7">
      <p className={`${s.syne} text-[20px] font-bold`}>Write a review</p>
      <StarPicker value={rating} onChange={setRating} />
      <Field label="Title">
        {(a) => <input id={a.id} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="In a few words" className={s.field} />}
      </Field>
      <Field label="Your review" error={err} hint="What you noticed in the hand, after a week or a month">
        {(a) => <textarea id={a.id} aria-describedby={a.describedBy} aria-invalid={a.invalid} rows={4} value={body} onChange={(e) => setBody(e.target.value)} className={s.field} />}
      </Field>
      <div className="flex gap-3">
        <button type="submit" className="h-12 rounded-full bg-[var(--o-ink)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-95">
          Post review
        </button>
        <button type="button" onClick={onDone} className="h-12 rounded-full px-4 text-[15px] font-semibold text-[var(--o-muted)] hover:text-[var(--o-ink)]">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Questions({ slug, signedIn }: { slug: string; signedIn: boolean }) {
  const questions = useQuestions(slug);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(false);
  const [answering, setAnswering] = useState<string | null>(null);
  const ask = (e: FormEvent) => {
    e.preventDefault();
    if (!signedIn) return setPrompt(true);
    const m = askQuestion(slug, q);
    setErr(m);
    if (!m) setQ("");
  };
  return (
    <div className="mt-20">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 className={`${s.display} text-[clamp(2.2rem,4vw,3.6rem)]`}>Questions</h2>
        <p className="text-[15px] text-[var(--o-muted)]">{questions.length} asked, answered by the workshop and by customers</p>
      </div>
      <form onSubmit={ask} noValidate className="mt-6 flex items-start gap-2 rounded-full border border-[var(--o-line)] bg-[var(--o-card)] p-2 focus-within:border-[var(--o-ink)]">
        <label htmlFor={`o2-ask-${slug}`} className="sr-only">
          Ask a question about this piece
        </label>
        <input
          id={`o2-ask-${slug}`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask about size, finish, care or delivery"
          aria-describedby={err ? `o2-ask-err-${slug}` : undefined}
          className="h-12 min-w-0 flex-1 bg-transparent px-4 text-[16px] outline-none placeholder:text-[var(--o-muted)]"
        />
        <button type="submit" className={`${s.syne} h-12 shrink-0 rounded-full bg-[var(--o-ink)] px-5 text-[15px] font-bold text-white transition-colors hover:bg-black active:scale-95`}>
          Ask
        </button>
      </form>
      {err && (
        <p id={`o2-ask-err-${slug}`} className="mt-2 pl-5 text-[13px] font-medium text-[#a3241b]">
          {err}
        </p>
      )}
      {prompt && !signedIn && (
        <div className="mt-4">
          <SignInPrompt why="Sign in to ask the workshop." onCancel={() => setPrompt(false)} />
        </div>
      )}
      <ul className="mt-8 grid gap-4 lg:grid-cols-2">
        {questions.map((x) => (
          <li key={x.id} className="rounded-[32px] border border-[var(--o-line)] p-5 md:p-6">
            <div className="flex gap-3">
              <span aria-hidden className={`${s.syne} grid size-10 shrink-0 place-items-center rounded-full bg-[var(--o-ink)] text-[15px] font-bold text-white`}>
                Q
              </span>
              <div className="min-w-0">
                <p className={`${s.syne} text-[17px] font-bold leading-snug`}>{x.body}</p>
                <p className="mt-0.5 text-[13px] text-[var(--o-muted)]">
                  {x.author}, {formatDate(x.at)}
                </p>
              </div>
            </div>
            <Thread items={x.answers} />
            {answering === x.id ? (
              signedIn ? (
                <ReplyBox label="Your answer" onSend={(b) => answerQuestion(x.id, b)} onDone={() => setAnswering(null)} />
              ) : (
                <div className="mt-4">
                  <SignInPrompt why="Sign in to answer." onCancel={() => setAnswering(null)} />
                </div>
              )
            ) : (
              <button type="button" onClick={() => setAnswering(x.id)} className="mt-3 h-9 rounded-full border border-[var(--o-line)] px-4 text-[13px] font-semibold transition-colors hover:border-[var(--o-ink)]">
                Answer
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Ratings, reviews, replies and questions for one piece. */
export function Reviews({ slug, name }: { slug: string; name: string }) {
  const { reviews, summary } = useReviews(slug);
  const user = useUser();
  const hydrated = useHydrated();
  const signedIn = hydrated && !!user;
  const [sort, setSort] = useState<Sort>("helpful");
  const [filter, setFilter] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
  const [all, setAll] = useState(false);
  const sortId = useId();

  const list = reviews
    .filter((r) => filter === null || r.rating === filter)
    .sort((a, b) => (sort === "helpful" ? b.helpful - a.helpful : sort === "newest" ? b.at - a.at : sort === "highest" ? b.rating - a.rating || b.at - a.at : a.rating - b.rating || b.at - a.at));
  const shown = all ? list : list.slice(0, 4);

  let writer: ReactNode = null;
  if (writing) writer = signedIn ? <WriteReview slug={slug} onDone={() => { setWriting(false); setSort("newest"); }} /> : <SignInPrompt why={`Sign in to review the ${name}.`} onCancel={() => setWriting(false)} />;

  return (
    <section id="reviews" aria-labelledby="o2-reviews" className="scroll-mt-24 px-5 pt-20 md:px-10 md:pt-28">
      <div className="mx-auto max-w-[1440px] border-t border-[var(--o-line)] pt-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h2 id="o2-reviews" className={`${s.display} text-[clamp(2.4rem,4.6vw,4.4rem)]`}>
                Reviews
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <Stars value={summary.avg} size={18} />
                <span className="text-[15px] text-[var(--o-ink-2)]">
                  {summary.avg.toFixed(1)} out of 5, from {summary.count} {summary.count === 1 ? "review" : "reviews"}
                </span>
              </div>
              <div className="mt-8">
                <RatingRings dist={summary.dist} count={summary.count} avg={summary.avg} filter={filter} onFilter={setFilter} />
              </div>
              <button
                type="button"
                onClick={() => setWriting(true)}
                className="group mt-8 flex h-14 w-full items-center justify-between rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.99]"
              >
                Write a review
                <span className="grid size-10 place-items-center rounded-full bg-[var(--m-accent)] text-[20px] leading-none transition-transform duration-300 group-hover:rotate-90">+</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence initial={false}>
              {writer && (
                <motion.div key="writer" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="mb-8">
                  {writer}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[15px] text-[var(--o-ink-2)]" aria-live="polite">
                {filter ? `${list.length} with ${filter} star${filter > 1 ? "s" : ""}` : `${list.length} reviews`}
                {filter && (
                  <button type="button" onClick={() => setFilter(null)} className="ml-3 font-semibold underline underline-offset-4">
                    Show all
                  </button>
                )}
              </p>
              <div className="w-[220px]">
                <label htmlFor={sortId} className="sr-only">
                  Sort reviews
                </label>
                <select id={sortId} value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={`${s.field} !h-11`}>
                  {SORTS.map((o) => (
                    <option key={o.k} value={o.k}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {shown.map((r) => (
                <ReviewCard key={r.id} r={r} signedIn={signedIn} />
              ))}
            </ul>
            {list.length > shown.length && (
              <button type="button" onClick={() => setAll(true)} className="mx-auto mt-6 block h-12 rounded-full border border-[var(--o-ink)] px-6 text-[15px] font-semibold transition-colors hover:bg-[var(--o-ink)] hover:text-white">
                Show all {list.length} reviews
              </button>
            )}
          </div>
        </div>

        <Questions slug={slug} signedIn={signedIn} />
      </div>
    </section>
  );
}
