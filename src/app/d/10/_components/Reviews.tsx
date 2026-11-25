"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useUser } from "@/lib/shop/account";
import { getProduct } from "@/lib/shop/products";
import { addReview, answerQuestion, askQuestion, replyToReview, toggleHelpful, useQuestions, useReviews, type Reply, type Review } from "@/lib/shop/reviews";
import k from "../k";
import { Field, STAR, Stars } from "./bits";
import { AuthPanel, Submit } from "./forms";
import { fv, scrollToId, splitName } from "./lib";

const WORDS = ["One", "Two", "Three", "Four", "Five"];
const SAY = ["Poor", "Fair", "Good", "Very good", "Excellent"];
const NO_STARS = "Choose how many stars first.";
type Sort = "helpful" | "new" | "high" | "low";
const SORTS: { id: Sort; label: string }[] = [
  { id: "helpful", label: "Most helpful" },
  { id: "new", label: "Newest" },
  { id: "high", label: "Highest" },
  { id: "low", label: "Lowest" },
];
const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

/**
 * Reviews and questions, set as type. The average is one huge number; the five star counts are the words
 * One to Five, each stretched by its share of the reviews, so the distribution reads as width.
 */
export function Reviews({ slug }: { slug: string }) {
  const p = getProduct(slug);
  const { reviews, summary } = useReviews(slug);
  const questions = useQuestions(slug);
  const [sort, setSort] = useState<Sort>("helpful");
  const [star, setStar] = useState<number | null>(null);
  const [more, setMore] = useState(false);

  const list = useMemo(() => {
    const f = star ? reviews.filter((r) => r.rating === star) : reviews;
    const by: Record<Sort, (a: (typeof f)[number], b: (typeof f)[number]) => number> = {
      helpful: (a, b) => b.helpful - a.helpful || b.at - a.at,
      new: (a, b) => b.at - a.at,
      high: (a, b) => b.rating - a.rating || b.at - a.at,
      low: (a, b) => a.rating - b.rating || b.at - a.at,
    };
    return [...f].sort(by[sort]);
  }, [reviews, star, sort]);
  if (!p) return null;
  const head = splitName(p.name).head;
  const verified = reviews.filter((r) => r.verified).length;
  const shown = more ? list : list.slice(0, 4);

  return (
    <section id="reviews" aria-labelledby="k10-reviews" className="scroll-mt-16 border-t border-[var(--k10-ink)] pb-6 pt-10 md:pt-14">
      <div className={`${k.gut} grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8`}>
        <div className="md:col-span-5">
          <h2 id="k10-reviews" className={`${k.mono} text-[var(--k10-grey)]`}>
            Reviews of the {head}
          </h2>
          <p className={`${k.disp} mt-3 text-[length:clamp(120px,15vw,240px)] leading-[0.78] tabular-nums [font-variation-settings:'wdth'_150,'wght'_880]`}>
            {summary.count ? summary.avg.toFixed(1) : "New"}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Stars value={summary.avg} size={26} />
            <p className={k.monoL}>
              {summary.count} {summary.count === 1 ? "review" : "reviews"}, {verified} from verified purchases
            </p>
          </div>
        </div>
        <div className="md:col-span-7" role="group" aria-label="Filter by stars">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = summary.dist[n - 1];
            const share = summary.count ? c / summary.count : 0;
            return (
              <button
                key={n}
                type="button"
                aria-pressed={star === n}
                onClick={() => setStar(star === n ? null : n)}
                className="group grid w-full grid-cols-[minmax(0,1fr)_3rem] items-center gap-4 border-b border-[var(--k10-line)] py-1 text-left first:border-t aria-pressed:text-[var(--k10-accent)]"
                aria-label={`${n} stars: ${c} ${c === 1 ? "review" : "reviews"}${star === n ? ", showing only these" : ""}`}
              >
                <span className="min-w-0">
                  <span
                    className={`${k.disp} block text-[length:clamp(32px,3.8vw,60px)] leading-[0.9] transition-[font-variation-settings] duration-700 group-hover:!text-[var(--k10-accent)]`}
                    style={{ fontVariationSettings: fv(50 + 100 * share, 300 + 560 * share) }}
                  >
                    {WORDS[n - 1]}
                  </span>
                  <span className="mt-1 block h-[3px] rounded-full bg-[var(--k10-line)]">
                    <span className="block h-full rounded-full bg-[var(--k10-accent)]" style={{ width: `${share * 100}%` }} />
                  </span>
                </span>
                <span className={`${k.monoL} text-right tabular-nums`}>{c}</span>
              </button>
            );
          })}
          <p className={`${k.mono} mt-2 text-[var(--k10-grey)]`}>Each word is as wide as its share of the reviews. Choose one to read only those.</p>
        </div>
      </div>

      <div className={`${k.gut} mt-10 flex flex-wrap items-center gap-2 border-t border-[var(--k10-ink)] pt-4`}>
        <span className={`${k.mono} mr-2 text-[var(--k10-grey)]`}>Sort</span>
        {SORTS.map((s) => (
          <button key={s.id} type="button" aria-pressed={sort === s.id} onClick={() => setSort(s.id)} className={k.chip}>
            {s.label}
          </button>
        ))}
        <span className={`${k.mono} ml-auto text-[var(--k10-grey)]`} aria-live="polite">
          {star ? `${list.length} with ${star} ${star === 1 ? "star" : "stars"}. ` : ""}
          {star && (
            <button type="button" onClick={() => setStar(null)} className={`${k.link} text-[var(--k10-ink)]`}>
              Show all
            </button>
          )}
        </span>
      </div>

      <ul id="k10-review-list" className={`${k.gut} scroll-mt-24`}>
        {shown.map((r) => (
          <ReviewItem key={r.id} r={r} />
        ))}
        {!list.length && <li className={`${k.monoL} py-8`}>No reviews with that many stars yet.</li>}
      </ul>
      {list.length > 4 && (
        <div className={`${k.gut} pt-6`}>
          <button type="button" onClick={() => setMore(!more)} className={`${k.btn} ${k.ghost} w-full sm:w-auto sm:min-w-[340px]`}>
            <span className={k.btnLabel}>{more ? "Show fewer" : `Read all ${list.length}`}</span>
          </button>
        </div>
      )}

      <div className={`${k.gut} mt-14 grid grid-cols-1 gap-14 border-t border-[var(--k10-ink)] pt-8 lg:grid-cols-12 lg:gap-10`}>
        {/* once posted, the short thank-you slip travels with the questions instead of leaving a tall empty band (the forms are too tall to pin) */}
        <div className="min-w-0 lg:col-span-6 lg:self-start lg:has-[[data-k10-thanks]]:sticky lg:has-[[data-k10-thanks]]:top-24">
          <Write
            slug={slug}
            head={head}
            onPosted={() => {
              // newest first, every star: the review just posted is the first one in the list
              setSort("new");
              setStar(null);
            }}
          />
        </div>
        <div className="min-w-0 lg:col-span-6">
          <Questions slug={slug} questions={questions} />
        </div>
      </div>
    </section>
  );
}

function ReviewItem({ r }: { r: Review & { votedHelpful?: boolean } }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="group grid grid-cols-1 gap-x-8 gap-y-3 border-b border-[var(--k10-line)] py-6 md:grid-cols-[13rem_minmax(0,1fr)]">
      <div className={k.mono}>
        <Stars value={r.rating} size={16} />
        <p className="mt-2">{r.author}</p>
        <p className="text-[var(--k10-grey)]">
          {r.city}, {day.format(r.at)}
        </p>
        {r.verified && <span className={`${k.badge} mt-2`}>Verified purchase</span>}
      </div>
      <div className="min-w-0">
        <h3 className={`${k.disp} whitespace-normal text-[length:clamp(28px,2.8vw,44px)] leading-[0.92] transition-[font-variation-settings] duration-700 [font-variation-settings:'wdth'_66,'wght'_780] group-hover:[font-variation-settings:'wdth'_96,'wght'_820]`}>
          {r.title}
        </h3>
        <p className="mt-2 max-w-[68ch] text-[17px] leading-[1.55]">{r.body}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <button type="button" aria-pressed={!!r.votedHelpful} onClick={() => toggleHelpful(r.id)} className={k.wish} aria-label={`Helpful, ${r.helpful} ${r.helpful === 1 ? "person" : "people"} found this helpful`}>
            Helpful <span className="tabular-nums">{r.helpful}</span>
          </button>
          <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`${k.mono} ${k.link}`}>
            {open ? "Close" : "Reply"}
          </button>
          {r.replies.length > 0 && (
            <span className={`${k.mono} text-[var(--k10-grey)]`}>
              {r.replies.length} {r.replies.length === 1 ? "reply" : "replies"}
            </span>
          )}
        </div>
        {r.replies.length > 0 && (
          <ul className="mt-4 space-y-3">
            {r.replies.map((x) => (
              <ReplyItem key={x.id} x={x} />
            ))}
          </ul>
        )}
        {open && (
          <div className="mt-4">
            <Gate what="reply">
              <Compose label={`Reply to ${r.author}`} submitLabel="Post the reply" onSubmit={(b) => replyToReview(r.id, b)} onDone={() => setOpen(false)} />
            </Gate>
          </div>
        )}
      </div>
    </li>
  );
}

/** A reply. The Maison answers in the house's display type, on its accent rule; customers reply in mono. */
function ReplyItem({ x }: { x: Reply }) {
  if (x.fromMaison) {
    return (
      <li className="border-l-[3px] border-[var(--k10-accent)] bg-[var(--k10-paper)] py-3 pl-5 pr-4">
        <p className={`${k.disp} text-[20px] leading-none text-[var(--k10-accent)] [font-variation-settings:'wdth'_130,'wght'_840]`}>Santalum Maison</p>
        <p className={`${k.disp} mt-2 whitespace-normal text-[length:clamp(19px,1.6vw,23px)] leading-[1.2] [font-variation-settings:'wdth'_86,'wght'_480]`}>{x.body}</p>
        <p className={`${k.mono} mt-1 text-[var(--k10-grey)]`}>{day.format(x.at)}</p>
      </li>
    );
  }
  return (
    <li className="border-l border-[var(--k10-line)] pl-5">
      <p className={k.mono}>
        {x.author} <span className="text-[var(--k10-grey)]">{day.format(x.at)}</span>
      </p>
      <p className="mt-1 text-[16px] leading-[1.5]">{x.body}</p>
    </li>
  );
}

/** Signed out, writing anything opens an inline sign-in in the same huge type. */
function Gate({ what, children, open: startOpen = false }: { what: string; children: ReactNode; open?: boolean }) {
  const user = useUser();
  const [open, setOpen] = useState(startOpen);
  if (user) return <>{children}</>;
  return (
    <div className="border-t border-[var(--k10-line)] pt-4">
      <p className={k.monoL}>
        Sign in to {what}. Reviews, replies and questions carry your name.{" "}
        {!open && (
          <button type="button" onClick={() => setOpen(true)} className={`${k.link} underline`}>
            Sign in here
          </button>
        )}
      </p>
      {open && (
        <div className="mt-6">
          <AuthPanel idBase={`k10-gate-${what.replace(/\W+/g, "-")}`} big={false} />
        </div>
      )}
    </div>
  );
}

function Compose({ label, submitLabel, onSubmit, onDone, rows = 2 }: { label: string; submitLabel: string; onSubmit: (body: string) => string | null; onDone?: () => void; rows?: number }) {
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const id = `k10c-${label.replace(/\W+/g, "-").toLowerCase()}`;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = onSubmit(body);
    setErr(r);
    if (!r) {
      setBody("");
      onDone?.();
    }
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div>
        <label htmlFor={id} className={`${k.mono} block text-[var(--k10-grey)]`}>
          {label}
        </label>
        <textarea
          id={id}
          rows={rows}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${id}-e` : undefined}
          className={`${k.field} resize-none !text-[length:clamp(20px,2vw,28px)]`}
        />
        {err && (
          <p id={`${id}-e`} className={`${k.err} mt-2`}>
            {err}
          </p>
        )}
      </div>
      <button type="submit" className={`${k.mini} justify-self-start`}>
        {submitLabel}
      </button>
    </form>
  );
}

function Write({ slug, head, onPosted }: { slug: string; head: string; onPosted: () => void }) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [posted, setPosted] = useState<{ rating: number; title: string; body: string } | null>(null);
  const show = hover || rating;
  const rate = (n: number) => {
    setRating(n);
    // the stars were the missing piece: the error about them goes as soon as they are chosen
    setErr((e) => (e === NO_STARS ? null : e));
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rating) {
      setErr(NO_STARS);
      return;
    }
    const r = addReview({ slug, rating: rating as Review["rating"], title, body });
    setErr(r);
    if (!r) {
      setPosted({ rating, title: title.trim(), body: body.trim() });
      onPosted();
      setRating(0);
      setTitle("");
      setBody("");
    }
  };

  return (
    <div>
      <h3 className={`${k.disp} text-[length:clamp(34px,4vw,64px)] leading-[0.86] [font-variation-settings:'wdth'_120,'wght'_840]`}>Write a review</h3>
      <p className={`${k.mono} mt-2 text-[var(--k10-grey)]`}>Of the {head}. Saved in this browser in the preview.</p>
      <div className="mt-6">
        {posted ? (
          <div role="status" data-k10-thanks>
            <p className={`${k.disp} text-[length:clamp(40px,5vw,80px)] leading-[0.85] text-[var(--k10-accent)] [font-variation-settings:'wdth'_150,'wght'_860]`}>Thank you.</p>
            <p className={`${k.monoL} mt-3`}>Posted. The list above now shows the newest first, so yours leads it.</p>
            {/* the review as it went out, set the way the list sets it */}
            <div className={`${k.slip} mt-6 rounded-[22px] px-5 pb-6 pt-5 md:px-7`}>
              <div className="flex items-center justify-between gap-4">
                <Stars value={posted.rating} size={18} />
                <span className={`${k.mono} text-[var(--k10-grey)]`}>{SAY[posted.rating - 1]}</span>
              </div>
              <p className={`${k.disp} mt-4 whitespace-normal text-[length:clamp(26px,2.4vw,38px)] leading-[0.94] [font-variation-settings:'wdth'_66,'wght'_780]`}>
                {posted.title}
              </p>
              <p className="mt-2 text-[16px] leading-[1.55]">{posted.body}</p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button type="button" onClick={() => scrollToId("k10-review-list")} className={k.mini}>
                See it in the list
              </button>
              <button type="button" onClick={() => setPosted(null)} className={`${k.mono} ${k.link}`}>
                Write another
              </button>
            </div>
          </div>
        ) : (
          <Gate what="write a review" open>
            <form onSubmit={submit} noValidate className="grid gap-8">
              <fieldset onMouseLeave={() => setHover(0)}>
                <legend className={`${k.mono} text-[var(--k10-grey)]`}>Your rating</legend>
                <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <label key={n} className="cursor-pointer rounded-sm p-0.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--k10-accent)]" onMouseEnter={() => setHover(n)}>
                        <input type="radio" name={`k10-rate-${slug}`} value={n} checked={rating === n} onChange={() => rate(n)} className="sr-only" />
                        <span className="sr-only">
                          {n} {n === 1 ? "star" : "stars"}, {SAY[n - 1].toLowerCase()}
                        </span>
                        <span aria-hidden className="block size-[40px] transition-colors duration-300" style={{ clipPath: STAR, background: show >= n ? "var(--k10-accent)" : "color-mix(in srgb, var(--k10-grey) 38%, transparent)" }} />
                      </label>
                    ))}
                  </div>
                  <p
                    aria-hidden
                    className={`${k.disp} text-[length:clamp(30px,3.4vw,52px)] leading-[0.9] transition-[font-variation-settings] duration-500`}
                    style={{ fontVariationSettings: fv(50 + 20 * show, 300 + 110 * show), color: show ? "var(--k10-accent)" : "var(--k10-grey)" }}
                  >
                    {show ? SAY[show - 1] : "Choose"}
                  </p>
                </div>
              </fieldset>
              <Field small label="Title" name="title" autoComplete="off" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="In a few words" />
              <div>
                <label htmlFor={`k10-rev-${slug}`} className={`${k.mono} block text-[var(--k10-grey)]`}>
                  Your review, a couple of sentences or more
                </label>
                <textarea
                  id={`k10-rev-${slug}`}
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  aria-describedby={err ? `k10-rev-${slug}-e` : undefined}
                  className={`${k.field} resize-none !text-[length:clamp(20px,2vw,28px)]`}
                />
              </div>
              {err && (
                <p id={`k10-rev-${slug}-e`} role="alert" className={k.err}>
                  {err}
                </p>
              )}
              <Submit>Post the review</Submit>
            </form>
          </Gate>
        )}
      </div>
    </div>
  );
}

function Questions({ slug, questions }: { slug: string; questions: ReturnType<typeof useQuestions> }) {
  const [answering, setAnswering] = useState<string | null>(null);
  return (
    <div>
      <h3 className={`${k.disp} text-[length:clamp(34px,4vw,64px)] leading-[0.86] [font-variation-settings:'wdth'_120,'wght'_840]`}>Questions</h3>
      <p className={`${k.mono} mt-2 text-[var(--k10-grey)]`}>
        {questions.length} asked. The Maison answers; so can anyone who owns the piece.
      </p>
      <ul className="mt-6 border-t border-[var(--k10-ink)]">
        {questions.map((q) => (
          <li key={q.id} className="border-b border-[var(--k10-line)] py-5">
            <p className={`${k.disp} whitespace-normal text-[length:clamp(24px,2.3vw,34px)] leading-[0.98] [font-variation-settings:'wdth'_62,'wght'_720]`}>{q.body}</p>
            <p className={`${k.mono} mt-1 text-[var(--k10-grey)]`}>
              Asked by {q.author}, {day.format(q.at)}
            </p>
            {q.answers.length > 0 && (
              <ul className="mt-3 space-y-3">
                {q.answers.map((a) => (
                  <ReplyItem key={a.id} x={a} />
                ))}
              </ul>
            )}
            <button type="button" aria-expanded={answering === q.id} onClick={() => setAnswering(answering === q.id ? null : q.id)} className={`${k.mono} ${k.link} mt-3`}>
              {answering === q.id ? "Close" : "Answer"}
            </button>
            {answering === q.id && (
              <div className="mt-3">
                <Gate what="answer">
                  <Compose label="Your answer" submitLabel="Post the answer" onSubmit={(b) => answerQuestion(q.id, b)} onDone={() => setAnswering(null)} />
                </Gate>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Gate what="ask a question">
          <Compose label="Ask the Maison about this piece" submitLabel="Ask" rows={2} onSubmit={(b) => askQuestion(slug, b)} />
        </Gate>
      </div>
    </div>
  );
}
