"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useUser } from "@/lib/shop/account";
import { addReview, answerQuestion, askQuestion, replyToReview, toggleHelpful, useQuestions, useReviews, type Reply, type Review } from "@/lib/shop/reviews";
import type { Product } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { s } from "./cx";
import { EASE } from "./data";
import { SignInForm } from "./forms";
import { Stars } from "./Stars";

const day = (ms: number) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(ms);

type Sort = "helpful" | "new" | "high" | "low";
const SORTS: { key: Sort; label: string }[] = [
  { key: "helpful", label: "Most helpful" },
  { key: "new", label: "Newest" },
  { key: "high", label: "Highest rating" },
  { key: "low", label: "Lowest rating" },
];

/** Live rating for the product header (includes this browser's own reviews). */
export function HeaderRating({ slug }: { slug: string }) {
  const { summary } = useReviews(slug);
  return (
    <a href="#reviews" className={`${s.mono} group inline-flex items-center gap-2.5 text-[12.5px] text-(--ink-2) transition-colors hover:text-(--ink)`}>
      <Stars value={summary.avg} size={14} />
      <span className="tabular-nums">{summary.avg.toFixed(1)}</span>
      <span className="border-b border-(--hair-2) transition-colors group-hover:border-(--ink)">
        {summary.count} {summary.count === 1 ? "review" : "reviews"}
      </span>
    </a>
  );
}

/** Reviews as field reports on the piece, then questions to the workshop. */
export function Reviews({ p }: { p: Product }) {
  const { reviews, summary } = useReviews(p.slug);
  const [sort, setSort] = useState<Sort>("helpful");
  const [star, setStar] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
  const [filed, setFiled] = useState<number | null>(null);
  const shown = reviews
    .filter((r) => !star || r.rating === star)
    .sort((a, b) => (sort === "helpful" ? b.helpful - a.helpful : sort === "new" ? b.at - a.at : sort === "high" ? b.rating - a.rating || b.at - a.at : a.rating - b.rating || b.at - a.at));

  return (
    <section id="reviews" aria-labelledby="l01-reviews" className="mx-auto mt-24 max-w-[1400px] scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--ink) pb-3">
        <h2 id="l01-reviews" className={`${s.x125} text-[clamp(2rem,4vw,3.6rem)] font-[600] leading-[0.9] tracking-[-0.025em]`}>
          Reviews
        </h2>
        <p className={`${s.mono} text-[11.5px] text-(--steel)`}>Field reports on {p.name.toLowerCase()}</p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Summary: the average read off a gauge, then the reports tallied by rating */}
        <div className="lg:col-span-4">
          <div className={`${s.sheet} ${s.corners} border border-(--hair-2) p-5 md:p-6`}>
            <p className={`${s.mono} flex items-center justify-between text-[11px] text-(--steel)`}>
              <span>Average reading</span>
              <span>
                {summary.count} {summary.count === 1 ? "report" : "reports"}
              </span>
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className={`${s.x125} text-[64px] font-[620] leading-[0.8] tabular-nums tracking-[-0.03em]`}>{summary.avg.toFixed(1)}</span>
              <span className={`${s.mono} text-[12px] text-(--steel)`}>of 5</span>
            </p>
            <Gauge value={summary.avg} />
            <div className={`${s.mono} mt-6 grid grid-cols-[3.4rem_1fr_2rem] gap-3 border-b border-(--ink) pb-1.5 text-[10.5px] text-(--steel)`}>
              <span>Rating</span>
              <span>Tally</span>
              <span className="text-right">No.</span>
            </div>
            <ul className="grid" aria-label="Filter by rating">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = summary.dist[n - 1];
                const on = star === n;
                return (
                  <li key={n}>
                    <button
                      type="button"
                      aria-pressed={on}
                      aria-label={`${n} ${n === 1 ? "star" : "stars"}: ${c} ${c === 1 ? "report" : "reports"}${on ? ", showing only these" : ""}`}
                      disabled={!c}
                      onClick={() => setStar(on ? null : n)}
                      className={`${s.mono} grid w-full grid-cols-[3.4rem_1fr_2rem] items-center gap-3 border-b border-(--hair) py-2 text-[12px] transition-colors hover:bg-(--wash) disabled:cursor-default disabled:opacity-45 disabled:hover:bg-transparent ${on ? "bg-(--wash-2)" : ""}`}
                    >
                      <span className="tabular-nums">{n} of 5</span>
                      <Tally n={c} on={on} />
                      <span className="text-right tabular-nums text-(--ink-2)">{c}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => {
                setWriting((v) => !v);
                setFiled(null);
              }}
              aria-expanded={writing}
              className={`${s.btn} mt-6 w-full justify-center`}
            >
              {writing ? "Close the form" : "Write a review"}
            </button>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <AnimatePresence initial={false}>
            {writing && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                <WriteReview
                  p={p}
                  onDone={() => {
                    setWriting(false);
                    setStar(null);
                    setSort("new");
                    setFiled(Date.now());
                  }}
                />
              </motion.div>
            )}
            {!writing && filed !== null && (
              <motion.div key="filed" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                <FiledSlip name={p.name} onClose={() => setFiled(null)} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={star === null} onClick={() => setStar(null)} className={s.chip}>
                All {summary.count}
              </button>
              {star && (
                <button type="button" aria-pressed onClick={() => setStar(null)} className={s.chip}>
                  {star} stars only, clear
                </button>
              )}
            </div>
            <label className={`${s.field} w-[12rem]`}>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                {SORTS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span>Sort reviews</span>
              <svg aria-hidden className="pointer-events-none absolute bottom-3 right-1 text-(--steel)" width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </label>
          </div>

          <ol className="mt-4">
            {shown.map((r, i) => (
              <ReviewSlip key={r.id} r={r} n={i + 1} fresh={filed !== null && r.at <= filed && r.at > filed - 10_000} />
            ))}
          </ol>
          {shown.length === 0 && <p className="border-t border-(--hair-2) py-8 text-[16px] text-(--ink-2)">No {star}-star reviews yet.</p>}
        </div>
      </div>

      <Questions p={p} />
    </section>
  );
}

/** A dial-gauge scale from 1 to 5, ticked in tenths, with the carriage pointer at the average. */
function Gauge({ value }: { value: number }) {
  const x = ((Math.min(5, Math.max(1, value)) - 1) / 4) * 100;
  return (
    <div aria-hidden className="relative mt-5 h-10">
      <svg className="absolute inset-x-0 top-0 h-4 w-full overflow-visible text-(--ink)" preserveAspectRatio="none" viewBox="0 0 400 16">
        <line x1="0" y1="15" x2="400" y2="15" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {Array.from({ length: 41 }, (_, k) => (
          <line
            key={k}
            x1={k * 10}
            x2={k * 10}
            y1={k % 10 === 0 ? 3 : k % 5 === 0 ? 8 : 11}
            y2="15"
            stroke="currentColor"
            strokeOpacity={k % 10 === 0 ? 0.8 : 0.35}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <rect x="0" y="13" width={x * 4} height="3" fill="var(--accent)" />
      </svg>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`${s.mono} absolute top-[22px] -translate-x-1/2 text-[10px] tabular-nums text-(--steel)`} style={{ left: `${((n - 1) / 4) * 100}%` }}>
          {n}
        </span>
      ))}
      <svg width="12" height="10" viewBox="0 0 12 10" className="absolute -top-3 -translate-x-1/2 text-(--accent)" style={{ left: `${x}%` }}>
        <path d="M0 0 H12 L6 10 Z" fill="currentColor" />
      </svg>
    </div>
  );
}

/** Reports counted the shop-floor way: four strokes and a fifth across them. */
function Tally({ n, on }: { n: number; on: boolean }) {
  const groups = Math.floor(n / 5);
  const rest = n % 5;
  const ink = on ? "bg-(--accent)" : "bg-(--ink)";
  return (
    <span aria-hidden className="flex min-h-4 flex-wrap items-center gap-x-2.5 gap-y-1">
      {Array.from({ length: groups }, (_, g) => (
        <span key={g} className="relative flex h-4 gap-[3px]">
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className={`h-4 w-[1.5px] ${ink}`} />
          ))}
          <span className={`absolute -left-[3px] -right-[3px] top-1/2 h-[1.5px] -rotate-[28deg] ${ink}`} />
        </span>
      ))}
      {rest > 0 && (
        <span className="flex h-4 gap-[3px]">
          {Array.from({ length: rest }, (_, k) => (
            <span key={k} className={`h-4 w-[1.5px] ${ink}`} />
          ))}
        </span>
      )}
      {n === 0 && <span className="h-px w-6 bg-(--hair-2)" />}
    </span>
  );
}

/** The receipt left where the form was: the report is filed, and where to find it. */
function FiledSlip({ name, onClose }: { name: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, []);
  return (
    <div ref={ref} role="status" className={`${s.sheet} relative mb-8 grid gap-4 border border-(--ink) p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center md:p-6`}>
      <span className={`${s.stamp} ${s.mono} inline-block justify-self-start rotate-[-6deg] rounded-[3px] px-2.5 py-1 text-[13px] font-medium`}>Filed</span>
      <div>
        <p className={`${s.x110} text-[18px] font-[600] leading-tight`}>Your report on {name.toLowerCase()} is filed.</p>
        <p className="mt-1 text-[15px] leading-[1.5] text-(--ink-2)">It is Report 01 below, with the list now sorted newest first. The rating above includes it.</p>
      </div>
      <button type="button" onClick={onClose} className={`${s.link} justify-self-start`}>
        Close
      </button>
    </div>
  );
}

function ReviewSlip({ r, n, fresh = false }: { r: Review & { votedHelpful?: boolean }; n: number; fresh?: boolean }) {
  const [replying, setReplying] = useState(false);
  const hydrated = useHydrated();
  return (
    <li className={`relative grid gap-4 border-t py-6 md:grid-cols-[11rem_1fr] md:gap-8 ${fresh ? "border-(--ink)" : "border-(--hair-2)"}`}>
      {fresh && <span aria-hidden className="absolute -left-3 top-6 bottom-6 w-[2px] bg-(--accent) md:-left-4" />}
      <div className={`${s.mono} text-[11.5px] leading-[1.6] text-(--steel)`}>
        <span className="block text-[10.5px]">
          Report {String(n).padStart(2, "0")}
          {fresh && <span className="ml-2 text-(--accent)">filed just now</span>}
        </span>
        <span className="block text-[13px] text-(--ink)">{r.author}</span>
        <span className="block">{r.city}</span>
        <span className="block">{day(r.at)}</span>
        {r.verified && (
          <span className="mt-2 inline-flex items-center gap-1.5 border border-(--accent) px-1.5 py-0.5 text-[10.5px] text-(--accent)">
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d="M1.5 5.2 L4 7.6 L8.6 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Verified purchase
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <Stars value={r.rating} size={13} />
          <h3 className={`${s.x110} text-[18px] font-[600] leading-tight`}>{r.title}</h3>
        </div>
        <p className="mt-2 max-w-[44rem] text-[16px] leading-[1.6] text-(--ink-2)">{r.body}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => toggleHelpful(r.id)}
            aria-pressed={hydrated && !!r.votedHelpful}
            className={`${s.chip} min-h-8!`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M1.5 6.3 L4.5 9.2 L10.5 2.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            Helpful <span className="tabular-nums opacity-70">{r.helpful}</span>
          </button>
          <button type="button" onClick={() => setReplying((v) => !v)} aria-expanded={replying} className={s.link}>
            {replying ? "Cancel reply" : "Reply"}
          </button>
        </div>
        {r.replies.length > 0 && (
          <ul className="mt-4 grid gap-3">
            {r.replies.map((c) => (
              <ReplyNote key={c.id} c={c} />
            ))}
          </ul>
        )}
        {replying && <ReplyBox label="Your reply" onSend={(b) => replyToReview(r.id, b)} onDone={() => setReplying(false)} />}
      </div>
    </li>
  );
}

/** A reply hangs off its review on a leader line. The house replies on its own letterhead. */
function ReplyNote({ c }: { c: Reply }) {
  return (
    <li className="relative pl-7">
      <span aria-hidden className="absolute left-1 top-0 h-5 w-5 border-b border-l border-(--hair-2)" />
      {c.fromMaison ? (
        <div className="border border-(--accent) bg-(--accent-soft) px-4 py-3">
          <p className={`${s.mono} flex items-center gap-2 text-[11px] text-(--accent)`}>
            <span className={`${s.x110} font-[family-name:var(--f01-archivo)] text-[13px] font-[650] text-(--ink)`}>Santalum Maison</span>
            <span>The workshop replies, {day(c.at)}</span>
          </p>
          <p className="mt-1.5 text-[15px] leading-[1.55]">{c.body}</p>
        </div>
      ) : (
        <div className="border-l-2 border-(--hair-2) py-1 pl-3">
          <p className={`${s.mono} text-[11px] text-(--steel)`}>
            {c.author}, {day(c.at)}
          </p>
          <p className="mt-1 text-[15px] leading-[1.55] text-(--ink-2)">{c.body}</p>
        </div>
      )}
    </li>
  );
}

function SignInPrompt({ what }: { what: string }) {
  return (
    <div className={`${s.sheet} border border-dashed border-(--ink) p-5`}>
      <p className={`${s.mono} text-[11px] text-(--steel)`}>Work-order file required</p>
      <p className="mt-1 text-[16px] leading-[1.5]">Sign in to {what}. New here? <Link href="/d/01/account" className={`${s.link} text-(--ink)`}>Create an account</Link></p>
      <div className="mt-5 max-w-[28rem]">
        <SignInForm submitLabel="Sign in" />
      </div>
    </div>
  );
}

function ReplyBox({ label, onSend, onDone }: { label: string; onSend: (body: string) => string | null; onDone?: () => void }) {
  const user = useUser();
  const hydrated = useHydrated();
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const id = useId();
  if (!hydrated) return null;
  if (!user)
    return (
      <div className="mt-4">
        <SignInPrompt what="reply" />
      </div>
    );
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const e2 = onSend(body);
    setErr(e2);
    if (!e2) {
      setBody("");
      onDone?.();
    }
  };
  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 pl-7">
      <label className={s.field} htmlFor={id} data-error={err ? "" : undefined}>
        <textarea id={id} rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder=" " aria-describedby={err ? `${id}-e` : undefined} />
        <span>{label}</span>
      </label>
      {err && (
        <span id={`${id}-e`} className={s.err}>
          {err}
        </span>
      )}
      <button type="submit" className={`${s.btnLine} justify-self-start`}>
        Post
      </button>
    </form>
  );
}

function WriteReview({ p, onDone }: { p: Product; onDone: () => void }) {
  const user = useUser();
  const hydrated = useHydrated();
  const [rating, setRating] = useState<0 | Review["rating"]>(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const ids = useId();
  if (!hydrated) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!rating) return setErr("Choose a rating from one to five stars.");
    const e2 = addReview({ slug: p.slug, rating, title, body });
    setErr(e2);
    if (!e2) onDone();
  };
  const shown = hover || rating;

  return (
    <div className="mb-8">
      {!user ? (
        <SignInPrompt what="write a review" />
      ) : (
        <form onSubmit={submit} className={`${s.sheet} border border-(--ink) p-5 md:p-6`} noValidate>
          <p className={`${s.mono} text-[11px] text-(--steel)`}>New report on {p.name}, by {user.name}</p>
          <fieldset className="mt-4">
            <legend className={`${s.x110} text-[18px] font-[600]`}>Your rating</legend>
            <div className="mt-2 flex items-center gap-1" onPointerLeave={() => setHover(0)}>
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <label key={n} className="cursor-pointer p-0.5" onPointerEnter={() => setHover(n)}>
                  <input type="radio" name={`${ids}-rate`} value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" />
                  <span className="sr-only">
                    {n} {n === 1 ? "star" : "stars"}
                  </span>
                  <svg width="28" height="28" viewBox="0 0 12 12" aria-hidden className={`block transition-transform duration-300 peer-focus-visible:outline-2 peer-focus-visible:outline-(--accent) ${n <= shown ? "scale-105 text-(--accent)" : "text-(--hair-2)"}`}>
                    <path d="M6 0.8 L7.55 4.1 L11.1 4.5 L8.45 6.9 L9.2 10.5 L6 8.7 L2.8 10.5 L3.55 6.9 L0.9 4.5 L4.45 4.1 Z" fill={n <= shown ? "currentColor" : "none"} stroke="currentColor" strokeWidth="0.8" />
                  </svg>
                </label>
              ))}
              <span className={`${s.mono} ml-3 text-[12px] text-(--ink-2)`}>{shown ? ["", "Poor", "Fair", "Good", "Very good", "Excellent"][shown] : "Choose"}</span>
            </div>
          </fieldset>
          <div className="mt-5 grid gap-5">
            <label className={s.field}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder=" " />
              <span>Title</span>
            </label>
            <label className={s.field} data-error={err ? "" : undefined}>
              <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} maxLength={1200} placeholder=" " aria-describedby={err ? `${ids}-err` : undefined} />
              <span>What you noticed: weight, finish, scent, how it wears</span>
            </label>
          </div>
          {err && (
            <span id={`${ids}-err`} role="alert" className={s.err}>
              {err}
            </span>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" className={s.btn}>
              File the review
            </button>
            <span className="text-[14px] text-(--steel)">Saved in this browser for the preview.</span>
          </div>
        </form>
      )}
    </div>
  );
}

function Questions({ p }: { p: Product }) {
  const qs = useQuestions(p.slug);
  const [asking, setAsking] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="mt-20">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--ink) pb-3">
        <h2 className={`${s.x110} text-[clamp(1.6rem,2.6vw,2.3rem)] font-[600] leading-none tracking-[-0.015em]`}>Questions to the workshop</h2>
        <button type="button" onClick={() => setAsking((v) => !v)} aria-expanded={asking} className={s.btnLine}>
          {asking ? "Close" : "Ask a question"}
        </button>
      </div>
      {asking && (
        <div className="mt-6 max-w-[44rem]">
          <ReplyBox label={`Your question about ${p.name.toLowerCase()}`} onSend={(b) => askQuestion(p.slug, b)} onDone={() => setAsking(false)} />
        </div>
      )}
      <ol className="mt-2 grid lg:grid-cols-2 lg:gap-x-14">
        {qs.map((q, i) => (
          <li key={q.id} className="border-b border-(--hair) py-6">
            <p className={`${s.mono} text-[11px] text-(--steel)`}>
              Q{String(i + 1).padStart(2, "0")}, {q.author}, {day(q.at)}
            </p>
            <p className={`${s.x110} mt-1.5 text-[18px] font-[600] leading-snug`}>{q.body}</p>
            <ul className="mt-3 grid gap-3">
              {q.answers.map((a) => (
                <ReplyNote key={a.id} c={a} />
              ))}
            </ul>
            <button type="button" onClick={() => setOpen(open === q.id ? null : q.id)} aria-expanded={open === q.id} className={`${s.link} mt-3`}>
              {open === q.id ? "Cancel" : "Answer this"}
            </button>
            {open === q.id && <ReplyBox label="Your answer" onSend={(b) => answerQuestion(q.id, b)} onDone={() => setOpen(null)} />}
          </li>
        ))}
      </ol>
    </div>
  );
}
