"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useUser } from "@/lib/shop/account";
import { CONTENT } from "@/lib/shop/content";
import type { Product } from "@/lib/shop/products";
import { addReview, answerQuestion, askQuestion, replyToReview, toggleHelpful, useQuestions, useReviews, type Reply, type Review } from "@/lib/shop/reviews";
import { useHydrated } from "@/lib/shop/store";
import { AuthPanel } from "../account/AuthPanel";
import { Field, TextArea } from "../forms/Field";
import { WoodDisc } from "../Logo";
import { Pill } from "../Pill";
import { CheckIcon, ChevronIcon, CloseIcon } from "../shop/Icons";
import { OneStar, Stars } from "./Stars";
import { voiceQuestions, voiceReviews } from "./voices";

const EASE = [0.22, 1, 0.36, 1] as const;
const PAGE = 4;
type Sort = "helpful" | "newest" | "highest" | "lowest";
const SORTS: { key: Sort; label: string }[] = [
  { key: "helpful", label: "Most helpful" },
  { key: "newest", label: "Newest" },
  { key: "highest", label: "Highest rated" },
  { key: "lowest", label: "Lowest rated" },
];
const WORDS = ["Not for me", "Fair", "Good", "Very good", "Exceptional"];
const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const date = (ms: number) => fmt.format(ms);
const RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)";
const NO_RATING = "Choose a rating from one to five stars.";

/** Smoothly bring an element to just under the header, unless it is already comfortably in view. */
function scrollToEl(el: HTMLElement | null) {
  if (!el) return;
  const top = el.getBoundingClientRect().top;
  if (top > 90 && top < window.innerHeight * 0.55) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: window.scrollY + top - 112, behavior: reduce ? "auto" : "smooth" });
}

type Shown = Review & { votedHelpful?: boolean };

/**
 * Ratings, reviews with threaded replies, and questions, on the Maison's step rail:
 * the summary is a slice of stars, every thread hangs from a hairline, and the house answers in ink.
 */
export function ProductReviews({ p }: { p: Product }) {
  const raw = useReviews(p.slug);
  const reviews = useMemo(() => voiceReviews(p, raw.reviews), [p, raw.reviews]);
  const summary = raw.summary;
  const [sort, setSort] = useState<Sort>("helpful");
  const [star, setStar] = useState<number | null>(null);
  const [pages, setPages] = useState(1);
  const [writing, setWriting] = useState(false);
  const [posted, setPosted] = useState(false);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const writer = useRef<HTMLDivElement>(null);
  const listTop = useRef<HTMLDivElement>(null);

  /** The newest review this browser wrote for the piece (customers' own come first, newest first). */
  const fresh = posted ? reviews.find((r) => !r.id.startsWith(`${p.slug}-s`)) : undefined;

  // The button lives in the sticky rail, the form at the head of the list: bring the form to the reader.
  useEffect(() => {
    if (!writing) return;
    const t = window.setTimeout(() => scrollToEl(writer.current), 60);
    return () => window.clearTimeout(t);
  }, [writing]);

  const onPosted = () => {
    setWriting(false);
    setStar(null);
    setPages(1);
    setSort("newest");
    setPosted(true);
    window.setTimeout(() => scrollToEl(listTop.current), 120);
  };

  const list = (reviews as Shown[])
    .filter((r) => !star || r.rating === star)
    .sort((a, b) =>
      sort === "newest" ? b.at - a.at : sort === "highest" ? b.rating - a.rating || b.at - a.at : sort === "lowest" ? a.rating - b.rating || b.at - a.at : b.helpful - a.helpful || b.at - a.at,
    );
  const shown = list.slice(0, pages * PAGE);
  const wood = CONTENT[p.wood].name.toLowerCase();

  return (
    <section id="reviews" aria-labelledby="reviews-h" className="mx-auto max-w-[1500px] scroll-mt-24 px-5 pt-32 md:px-10">
      <div className="grid gap-14 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 id="reviews-h" className="font-display text-[clamp(2.2rem,4vw,3.6rem)] font-[350] leading-none tracking-[-0.03em]">
              Reviews
            </h2>
            <div className="mt-8 flex items-end gap-5">
              <p className="font-display text-[88px] font-[350] leading-[0.8] tracking-[-0.04em] tabular-nums">{summary.avg.toFixed(1)}</p>
              <div className="pb-1.5">
                <Stars value={summary.avg} size={22} />
                <p className="mt-2 text-[15px] text-(--mz-ink-2)">
                  from {summary.count} {summary.count === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
            <ul className="mt-8 space-y-1.5" aria-label="Filter by rating">
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
                        setPages(1);
                      }}
                      className={`grid w-full grid-cols-[3.25rem_1fr_2rem] items-center gap-3 rounded-full px-3 py-1.5 text-left text-[14px] transition-colors disabled:opacity-40 ${RING} ${
                        on ? "bg-(--mz-ink) text-(--mz-bg)" : "hover:bg-(--mz-surface)"
                      }`}
                    >
                      <span className="tabular-nums">{n} star</span>
                      <span className={`relative h-2 overflow-hidden rounded-full ${on ? "bg-(--mz-bg)/25" : "bg-(--mz-surface-2)"}`}>
                        <motion.span
                          className={`absolute inset-y-0 left-0 rounded-full ${on ? "bg-(--mz-bg)" : "bg-(--mz-accent)"}`}
                          initial={false}
                          animate={{ width: `${summary.count ? (c / summary.count) * 100 : 0}%` }}
                          transition={{ duration: 0.8, ease: EASE }}
                        />
                      </span>
                      <span className={`text-right tabular-nums ${on ? "" : "text-(--mz-ink-3)"}`}>{c}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <Pill size="lg" onClick={() => setWriting((w) => !w)} className="mt-8" aria-expanded={writing}>
              {writing ? "Close the form" : "Write a review"}
            </Pill>
            <p className="mt-4 max-w-xs text-[13px] leading-snug text-(--mz-ink-3)">
              Early reviews are placeholder voices until the store opens. Yours is saved in this browser.
            </p>
          </div>
        </aside>

        <div className="lg:col-span-8">
          <AnimatePresence initial={false}>
            {writing && (
              <motion.div key="write" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.55, ease: EASE }} className="overflow-hidden">
                <div ref={writer} className="mb-10 scroll-mt-28">
                  <Writer p={p} onDone={onPosted} onClose={() => setWriting(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={listTop} className="scroll-mt-28" />
          <AnimatePresence initial={false}>
            {fresh && (
              <motion.div
                key="posted"
                role="status"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="overflow-hidden"
              >
                <p className="mb-6 flex items-center gap-3 rounded-full bg-(--mz-accent-soft) py-2 pl-2 pr-5 text-[15px] text-(--mz-accent-deep)">
                  <WoodDisc className="size-8 shrink-0" />
                  <span className="min-w-0 flex-1">Thank you. Your review is on the string, first under Newest.</span>
                  <button type="button" onClick={() => setPosted(false)} className={`shrink-0 rounded-full text-[14px] underline underline-offset-4 ${RING}`}>
                    Done
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--mz-line) pb-5">
            <p className="text-[15px] text-(--mz-ink-2)" aria-live="polite">
              {list.length} {list.length === 1 ? "review" : "reviews"}
              {star ? ` with ${star} ${star === 1 ? "star" : "stars"}` : ` of the ${wood} piece`}
              {star && (
                <button type="button" onClick={() => setStar(null)} className={`ml-3 rounded-full text-(--mz-ink) underline decoration-(--mz-line) underline-offset-4 ${RING}`}>
                  Show all
                </button>
              )}
            </p>
            <div className="relative h-11">
              <label htmlFor={`rsort-${uid}`} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[14px] text-(--mz-ink-3)">
                Sort
              </label>
              <select
                id={`rsort-${uid}`}
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className={`mz-select h-11 cursor-pointer rounded-full border border-(--mz-line) bg-transparent pl-14 pr-11 text-[15px] text-(--mz-ink) outline-none hover:border-(--mz-ink)/25 ${RING}`}
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--mz-ink-3)" />
            </div>
          </div>

          <ol className="mt-8 space-y-4">
            <AnimatePresence initial={false} mode="popLayout">
              {shown.map((r) => (
                <motion.li key={r.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
                  <ReviewCard r={r} wood={p.wood} fresh={r.id === fresh?.id} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {shown.length < list.length && (
            <div className="mt-8 flex justify-center">
              <Pill variant="line" onClick={() => setPages((n) => n + 1)}>
                Show {Math.min(PAGE, list.length - shown.length)} more of {list.length}
              </Pill>
            </div>
          )}

          <Questions p={p} />
        </div>
      </div>
    </section>
  );
}

/* ---------------- one review and its thread ---------------- */

function Avatar({ name, wood }: { name: string; wood: Product["wood"] }) {
  return (
    <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full">
      <span className={`absolute inset-0 opacity-70 ${wood === "red" ? "ring-red" : "ring-white"}`} />
      <span className="relative grid size-7 place-items-center rounded-full bg-(--mz-bg) text-[13px] font-medium">{name.charAt(0)}</span>
    </span>
  );
}

function ReviewCard({ r, wood, fresh = false }: { r: Shown; wood: Product["wood"]; fresh?: boolean }) {
  const [replying, setReplying] = useState(false);
  return (
    <article className={`rounded-[2rem] p-6 transition-[background-color,box-shadow] duration-700 md:p-8 ${fresh ? "bg-(--mz-bg) shadow-[inset_0_0_0_1.5px_var(--mz-accent)]" : "bg-(--mz-surface)"}`}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={r.author} wood={wood} />
          <div className="leading-tight">
            <p className="text-[15px] font-medium">
              {r.author}
              {fresh && <span className="ml-2 rounded-full bg-(--mz-accent) px-2 py-0.5 text-[12px] font-normal text-(--mz-bg)">Just posted</span>}
            </p>
            <p className="text-[13px] text-(--mz-ink-3)">
              {r.city}, {date(r.at)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Stars value={r.rating} size={15} />
          {r.verified && (
            <span className="flex items-center gap-1.5 text-[12px] text-(--mz-accent-deep)">
              <CheckIcon className="size-3" /> Verified purchase
            </span>
          )}
        </div>
      </header>
      <h3 className="mt-5 font-display text-[22px] leading-tight tracking-[-0.01em]">{r.title}</h3>
      <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-(--mz-ink-2)">{r.body}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={!!r.votedHelpful}
          onClick={() => toggleHelpful(r.id)}
          className={`flex h-10 items-center gap-2 rounded-full px-4 text-[14px] transition-colors ${RING} ${
            r.votedHelpful ? "bg-(--mz-ink) text-(--mz-bg)" : "border border-(--mz-line) text-(--mz-ink-2) hover:border-(--mz-ink)/25 hover:text-(--mz-ink)"
          }`}
        >
          {r.votedHelpful && <CheckIcon className="size-3.5" />}
          Helpful
          <span className="tabular-nums opacity-70">{r.helpful}</span>
        </button>
        <button
          type="button"
          aria-expanded={replying}
          onClick={() => setReplying((v) => !v)}
          className={`h-10 rounded-full px-3 text-[14px] text-(--mz-ink-2) underline decoration-(--mz-line) underline-offset-4 hover:text-(--mz-ink) ${RING}`}
        >
          {replying ? "Cancel reply" : "Reply"}
        </button>
        {r.replies.length > 0 && (
          <span className="text-[13px] text-(--mz-ink-3)">
            {r.replies.length} {r.replies.length === 1 ? "reply" : "replies"}
          </span>
        )}
      </div>

      {(r.replies.length > 0 || replying) && (
        <ol className="mt-5 ml-5 space-y-4 border-l border-(--mz-line) pl-5 md:ml-6 md:pl-7">
          {r.replies.map((x) => (
            <ReplyItem key={x.id} x={x} />
          ))}
          {replying && (
            <li>
              <ReplyBox label="Your reply" cta="Post reply" onSubmit={(b) => replyToReview(r.id, b)} onDone={() => setReplying(false)} />
            </li>
          )}
        </ol>
      )}
    </article>
  );
}

function ReplyItem({ x }: { x: Reply }) {
  if (x.fromMaison)
    return (
      <li className="relative rounded-[1.5rem] bg-(--mz-ink) p-5 text-(--mz-bg)">
        <span aria-hidden className="absolute -left-[1.6rem] top-6 h-px w-5 bg-(--mz-line) md:-left-[2.1rem] md:w-7" />
        <p className="flex items-center gap-2.5 text-[13px]">
          <WoodDisc className="size-5" />
          <span className="font-medium">Santalum Maison</span>
          <span className="opacity-60">{date(x.at)}</span>
        </p>
        <p className="mt-2 text-[15px] leading-relaxed opacity-90">{x.body}</p>
      </li>
    );
  return (
    <li className="relative">
      <span aria-hidden className="absolute -left-[1.6rem] top-3 h-px w-5 bg-(--mz-line) md:-left-[2.1rem] md:w-7" />
      <p className="text-[13px] text-(--mz-ink-3)">
        <span className="font-medium text-(--mz-ink)">{x.author}</span> {date(x.at)}
      </p>
      <p className="mt-1 text-[15px] leading-relaxed text-(--mz-ink-2)">{x.body}</p>
    </li>
  );
}

/* ---------------- writing ---------------- */

/** Signed out: a quiet prompt that opens the Maison's own sign-in panel in place. */
function SignInGate({ children, what }: { children: ReactNode; what: string }) {
  const hydrated = useHydrated();
  const user = useUser();
  const [open, setOpen] = useState(false);
  if (hydrated && user) return <>{children}</>;
  return (
    <div className="rounded-[1.75rem] border border-dashed border-(--mz-ink)/15 p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <WoodDisc className="size-9 shrink-0" />
        <p className="min-w-0 flex-1 text-[15px] leading-snug text-(--mz-ink-2)">Sign in to {what}. It takes a moment, and your account keeps it with your orders.</p>
        {!open && (
          <Pill size="sm" onClick={() => setOpen(true)}>
            Sign in
          </Pill>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
            <div className="max-w-xl pt-6">
              <AuthPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StarPicker({ value, onChange, name }: { value: number; onChange: (n: number) => void; name: string }) {
  const [hover, setHover] = useState(0);
  const show = hover || value;
  return (
    <fieldset>
      <legend className="mb-3 text-[14px] font-medium">Your rating</legend>
      <div className="flex flex-wrap items-center gap-4" onMouseLeave={() => setHover(0)}>
        <div role="radiogroup" aria-label="Your rating" className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              onMouseEnter={() => setHover(n)}
              className="grid size-11 cursor-pointer place-items-center rounded-full transition-transform duration-300 ease-out-soft hover:scale-110 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-(--mz-accent)"
            >
              <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="sr-only" aria-label={`${n} ${n === 1 ? "star" : "stars"}, ${WORDS[n - 1]}`} />
              <OneStar on={show >= n} />
            </label>
          ))}
        </div>
        <span className="min-w-[7rem] font-display text-[20px] italic text-(--mz-ink-2)">{show ? WORDS[show - 1] : "Pick a star"}</span>
      </div>
    </fieldset>
  );
}

function Writer({ p, onDone, onClose }: { p: Product; onDone: () => void; onClose: () => void }) {
  const [rating, setRatingRaw] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBodyRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  // An error describes what was wrong at the last submit; once that part is put right, it goes.
  const setRating = (n: number) => {
    setRatingRaw(n);
    if (error === NO_RATING) setError(null);
  };
  const setBody = (v: string) => {
    setBodyRaw(v);
    if (error && error !== NO_RATING) setError(null);
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rating) return setError(NO_RATING);
    const err = addReview({ slug: p.slug, rating: rating as Review["rating"], title, body });
    if (err) return setError(err);
    setRatingRaw(0);
    setTitle("");
    setBodyRaw("");
    setError(null);
    onDone();
  };
  return (
    <div className="rounded-[2.25rem] bg-(--mz-bg) p-5 shadow-[inset_0_0_0_1px_var(--mz-line)] md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <p className="font-display text-[28px] leading-none tracking-[-0.02em]">Your review of the {p.name.toLowerCase()}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the review form"
          className={`grid size-10 shrink-0 place-items-center rounded-full border border-(--mz-line) text-(--mz-ink-2) hover:border-(--mz-ink)/25 hover:text-(--mz-ink) ${RING}`}
        >
          <CloseIcon />
        </button>
      </div>
      <SignInGate what="write a review">
        <form onSubmit={submit} noValidate className="space-y-4">
          <StarPicker value={rating} onChange={setRating} name={`stars-${uid}`} />
          <Field label="A title, in a few words" name="title" autoComplete="off" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextArea
            label="What did you notice? The weight, the scent, the finish, the delivery"
            rows={5}
            maxLength={1200}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            aria-describedby={error ? `rev-err-${uid}` : undefined}
          />
          {error && (
            <p id={`rev-err-${uid}`} role="alert" className="text-[14px] text-(--mz-accent-deep)">
              {error}
            </p>
          )}
          <Pill type="submit" size="lg">
            Post review
          </Pill>
        </form>
      </SignInGate>
    </div>
  );
}

function ReplyBox({ label, cta, onSubmit, onDone }: { label: string; cta: string; onSubmit: (body: string) => string | null; onDone?: () => void }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = onSubmit(body);
    if (err) return setError(err);
    setBody("");
    setError(null);
    onDone?.();
  };
  return (
    <SignInGate what={cta.toLowerCase().replace("post ", "post a ")}>
      <form onSubmit={submit} noValidate className="space-y-3">
        <TextArea label={label} rows={3} maxLength={600} value={body} onChange={(e) => setBody(e.target.value)} />
        {error && (
          <p role="alert" className="text-[14px] text-(--mz-accent-deep)">
            {error}
          </p>
        )}
        <Pill type="submit" size="sm">
          {cta}
        </Pill>
      </form>
    </SignInGate>
  );
}

/* ---------------- questions ---------------- */

function Questions({ p }: { p: Product }) {
  const local = useQuestions(p.slug);
  const qs = useMemo(() => voiceQuestions(p, local), [p, local]);
  const [asking, setAsking] = useState(false);
  const [answering, setAnswering] = useState<string | null>(null);
  return (
    <div className="mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--mz-line) pb-5">
        <h2 className="font-display text-[clamp(2rem,3.4vw,3rem)] font-[350] leading-none tracking-[-0.025em]">Questions</h2>
        <Pill variant="line" onClick={() => setAsking((a) => !a)} aria-expanded={asking}>
          {asking ? "Close" : "Ask a question"}
        </Pill>
      </div>
      <AnimatePresence initial={false}>
        {asking && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
            <div className="pt-6">
              <ReplyBox label={`Your question about the ${p.name.toLowerCase()}`} cta="Post question" onSubmit={(b) => askQuestion(p.slug, b)} onDone={() => setAsking(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ol className="mt-6 divide-y divide-(--mz-line)">
        {qs.map((q) => (
          <li key={q.id} className="py-6">
            <div className="grid grid-cols-[2.25rem_1fr] gap-3">
              <span className="font-display text-[26px] leading-none text-(--mz-accent)">Q</span>
              <div>
                <p className="font-display text-[21px] leading-snug tracking-[-0.01em]">{q.body}</p>
                <p className="mt-1 text-[13px] text-(--mz-ink-3)">
                  {q.author}, {date(q.at)}
                </p>
                {q.answers.length > 0 && (
                  <ol className="mt-4 ml-1 space-y-4 border-l border-(--mz-line) pl-5">
                    {q.answers.map((a) => (
                      <ReplyItem key={a.id} x={a} />
                    ))}
                  </ol>
                )}
                <div className="mt-3">
                  {answering === q.id ? (
                    <div className="pt-2">
                      <ReplyBox label="Your answer" cta="Post answer" onSubmit={(b) => answerQuestion(q.id, b)} onDone={() => setAnswering(null)} />
                      <button type="button" onClick={() => setAnswering(null)} className={`mt-3 rounded-full text-[14px] text-(--mz-ink-3) hover:text-(--mz-ink) ${RING}`}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAnswering(q.id)}
                      className={`rounded-full text-[14px] text-(--mz-ink-2) underline decoration-(--mz-line) underline-offset-4 hover:text-(--mz-ink) ${RING}`}
                    >
                      Answer this
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
