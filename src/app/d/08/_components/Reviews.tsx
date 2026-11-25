"use client";

import { useId, useState, type FormEvent } from "react";
import { useUser } from "@/lib/shop/account";
import { addReview, answerQuestion, askQuestion, replyToReview, toggleHelpful, useQuestions, useReviews, type Reply, type Review } from "@/lib/shop/reviews";
import { useHydrated } from "@/lib/shop/store";
import { AuthLegend, Key, LegendBox } from "./Legend";
import { Mark } from "./Mark";
import { PinGlyph } from "./Pins";
import { Stars } from "./ProductBits";
import { s } from "./styles";

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
type Sort = "helpful" | "new" | "high" | "low";
const SORTS: { k: Sort; label: string }[] = [
  { k: "helpful", label: "Most helpful" },
  { k: "new", label: "Newest" },
  { k: "high", label: "Highest rated" },
  { k: "low", label: "Lowest rated" },
];

/** A reply in the thread: the Maison answers as the house, with its mark and the wood's accent. */
function Thread({ items }: { items: Reply[] }) {
  if (!items.length) return null;
  return (
    <ul className="relative mt-4 grid gap-3 pl-6">
      <span className={`${s.vrouteMute} absolute bottom-2 left-2 top-0 w-[2px]`} aria-hidden />
      {items.map((r) => (
        <li key={r.id} className={`relative p-3 text-[15px] leading-relaxed ${r.fromMaison ? "border-l-2 border-(--a-accent) bg-(--a-accent-soft)/60" : "bg-(--a-paper)"}`}>
          <span className="absolute -left-[19px] top-4 h-px w-3 bg-(--a-line-2)" aria-hidden />
          <p className="flex items-center gap-2 text-[14px]">
            {r.fromMaison ? <Mark className="size-5" /> : <span className="size-1.5 rounded-full bg-(--a-ink-2)" aria-hidden />}
            <span className={r.fromMaison ? `${s.serif} text-[16px]` : "font-medium"}>{r.author}</span>
            <span className="text-(--a-muted)">{day.format(r.at)}</span>
          </p>
          <p className="mt-1 text-(--a-ink-2)">{r.body}</p>
        </li>
      ))}
    </ul>
  );
}

function ReplyBox({ onSend, label }: { onSend: (body: string) => string | null; label: string }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const id = useId();
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${s.link} text-[14px]`}>
        {label}
      </button>
    );
  return (
    <form
      className="mt-3 grid w-full gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const r = onSend(body);
        setErr(r);
        if (!r) {
          setBody("");
          setOpen(false);
        }
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea id={id} rows={2} value={body} onChange={(e) => setBody(e.target.value)} className={`${s.field} resize-y`} aria-describedby={err ? `${id}-e` : undefined} />
      {err && (
        <p id={`${id}-e`} className="text-[14px] italic text-[#b3261e]">
          {err}
        </p>
      )}
      <div className="flex gap-3">
        <button type="submit" className={`${s.btn} ${s.btnInk} h-10 px-4 text-[14px] font-medium`}>
          Post
        </button>
        <button type="button" onClick={() => setOpen(false)} className={`${s.link} text-[14px]`}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function ReviewCard({ r, i, pinned = false }: { r: Review & { votedHelpful?: boolean }; i: number; pinned?: boolean }) {
  return (
    <li
      className={`${s.card} ${s.flow} p-5 md:p-6 ${pinned ? "shadow-[0_0_0_2px_var(--a-accent),0_22px_44px_-30px_rgba(31,29,26,0.5)]" : ""}`}
      style={{ ["--rot" as string]: pinned ? "0deg" : `${[-0.5, 0.4, -0.3, 0.6][i % 4]}deg` }}
    >
      <span className={s.pinHead} style={pinned ? { opacity: 1, transform: "none" } : undefined} aria-hidden />
      {pinned && (
        <p className="-mt-1 mb-3 flex items-center gap-2 text-[13px] font-semibold text-(--a-accent-deep)">
          <PinGlyph color="var(--a-accent)" className="h-4 w-3" />
          Your report, pinned for now
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <Stars value={r.rating} />
          <span className="sr-only">{r.rating} out of 5</span>
          {r.verified && (
            <span className="inline-flex items-center gap-1 border border-(--a-accent) px-1.5 py-0.5 text-[12.5px] font-semibold text-(--a-accent-deep)">
              <PinGlyph color="var(--a-accent)" className="h-3.5 w-2.5" />
              Verified purchase
            </span>
          )}
        </span>
        <span className="text-[14px] text-(--a-muted)">{day.format(r.at)}</span>
      </div>
      <h4 className={`${s.serif} mt-3 text-[21px] leading-tight`}>{r.title}</h4>
      <p className="mt-2 text-[16px] leading-relaxed text-(--a-ink-2)">{r.body}</p>
      <p className="mt-3 text-[14px] text-(--a-muted)">
        {r.author}, {r.city}
      </p>
      <Thread items={r.replies} />
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dashed border-(--a-line-2) pt-3">
        <button
          type="button"
          aria-pressed={!!r.votedHelpful}
          onClick={() => toggleHelpful(r.id)}
          className={`${s.btn} h-9 gap-1.5 border px-3 text-[14px] ${r.votedHelpful ? "border-(--a-ink) bg-(--a-ink) text-(--a-paper)" : "border-(--a-line-2) hover:border-(--a-ink)"}`}
        >
          Helpful <span className="tabular-nums opacity-75">{r.helpful}</span>
        </button>
        <ReplyBox label="Reply" onSend={(b) => replyToReview(r.id, b)} />
      </div>
    </li>
  );
}

function WriteReview({ slug, onPosted }: { slug: string; onPosted: (since: number) => void }) {
  const [rating, setRating] = useState<Review["rating"]>(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const id = useId();
  function submit(e: FormEvent) {
    e.preventDefault();
    const since = Date.now();
    const err = addReview({ slug, rating, title, body });
    setMsg(err ? { ok: false, text: err } : { ok: true, text: "Thank you. Your report is pinned to the top of the list." });
    if (!err) {
      setTitle("");
      setBody("");
      onPosted(since);
    }
  }
  return (
    <LegendBox title="Write a field report">
      <form onSubmit={submit} noValidate className="grid gap-4">
        <fieldset>
          <legend className="text-[15px] text-(--a-ink-2)">Your rating</legend>
          <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <label key={n} className="cursor-pointer rounded-full p-1 transition-transform hover:-translate-y-0.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-(--a-accent)">
                <input type="radio" name={`${id}-r`} value={n} checked={rating === n} onChange={() => setRating(n)} className="sr-only" />
                <span className="sr-only">
                  {n} {n === 1 ? "star" : "stars"}
                </span>
                <svg viewBox="0 0 20 20" className="size-8" aria-hidden>
                  <path d="M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.8L10 14.6l-5.1 2.8 1.1-5.8-4.3-4 5.8-.7z" fill={n <= rating ? "var(--a-accent)" : "none"} stroke="var(--a-accent)" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </label>
            ))}
          </div>
        </fieldset>
        <Key label="Title" id={`${id}-t`}>
          <input id={`${id}-t`} value={title} onChange={(e) => setTitle(e.target.value)} className={s.field} maxLength={80} />
        </Key>
        <Key label="Your review" id={`${id}-b`} error={msg && !msg.ok ? msg.text : null} hint="A couple of sentences: how it looks, feels or smells after some use.">
          <textarea id={`${id}-b`} rows={4} value={body} onChange={(e) => setBody(e.target.value)} className={`${s.field} resize-y`} aria-invalid={!!(msg && !msg.ok)} aria-describedby={msg && !msg.ok ? `${id}-b-e` : undefined} />
        </Key>
        <button type="submit" className={`${s.btn} ${s.btnInk} h-12 text-[15px] font-medium`}>
          Pin the review
        </button>
        {msg?.ok && (
          <p role="status" className="text-[15px] text-(--a-accent-deep)">
            {msg.text}
          </p>
        )}
      </form>
    </LegendBox>
  );
}

/** Ratings, reviews with threaded replies, and questions in the margin. */
export function Reviews({ slug, name }: { slug: string; name: string }) {
  const { reviews, summary } = useReviews(slug);
  const questions = useQuestions(slug);
  const user = useUser();
  const hydrated = useHydrated();
  const [sort, setSort] = useState<Sort>("helpful");
  const [star, setStar] = useState<number | null>(null);
  const [shown, setShown] = useState(4);
  const [q, setQ] = useState("");
  const [qErr, setQErr] = useState<string | null>(null);
  // reports written in this visit stay pinned above the sort, so the writer sees theirs
  const [postedSince, setPostedSince] = useState<number | null>(null);
  const id = useId();
  const max = Math.max(1, ...summary.dist);
  const isPinned = (r: Review) => postedSince !== null && r.at >= postedSince;
  const list = reviews
    .filter((r) => !star || r.rating === star || isPinned(r))
    .sort(
      (a, b) =>
        Number(isPinned(b)) - Number(isPinned(a)) ||
        (sort === "helpful" ? b.helpful - a.helpful : sort === "new" ? b.at - a.at : sort === "high" ? b.rating - a.rating || b.at - a.at : a.rating - b.rating || b.at - a.at),
    );
  const visible = Math.max(shown, list.filter(isPinned).length + 1);
  const onPosted = (since: number) => {
    setPostedSince((p) => p ?? since);
    setStar(null);
    window.requestAnimationFrame(() => document.getElementById(`${id}-list`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const signedIn = hydrated && !!user;

  return (
    <section aria-labelledby={`${id}-h`} className="mt-24 border-t border-(--a-ink) pt-6" id="reviews">
      <h2 id={`${id}-h`} className={`${s.serif} text-[clamp(1.8rem,3.4vw,2.8rem)] leading-none`}>
        Field reports
      </h2>
      <p className="mt-2 text-[16px] text-(--a-ink-2)">What people who keep the {name.toLowerCase()} say about it.</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-14">
        <div className="grid content-start gap-6 lg:sticky lg:top-24 lg:self-start">
          <LegendBox title="The scale" aside={`${summary.count} reviews`}>
            <p className="flex items-end gap-3">
              <span className={`${s.serif} text-[64px] leading-[0.8]`}>{summary.avg.toFixed(1)}</span>
              <span className="pb-1">
                <Stars value={summary.avg} className="size-5" />
                <span className="mt-1 block text-[14px] text-(--a-muted)">out of 5</span>
              </span>
            </p>
            <ul className="mt-5 grid gap-1.5">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = summary.dist[n - 1];
                const on = star === n;
                return (
                  <li key={n}>
                    <button
                      type="button"
                      aria-pressed={on}
                      disabled={!c}
                      onClick={() => (setStar(on ? null : n), setShown(4))}
                      className={`grid w-full grid-cols-[3.2rem_1fr_2rem] items-center gap-2 rounded-[6px] px-1 py-1 text-[14px] transition-colors disabled:opacity-40 ${on ? "bg-(--a-accent-soft)" : "hover:bg-(--a-paper-2)"}`}
                    >
                      <span className="text-left">
                        {n} {n === 1 ? "star" : "stars"}
                      </span>
                      <span className="relative h-2.5 border border-(--a-ink)" aria-hidden>
                        <span className="absolute inset-y-0 left-0 bg-[repeating-linear-gradient(135deg,var(--a-accent)_0_3px,transparent_3px_5px)]" style={{ width: `${(c / max) * 100}%` }} />
                      </span>
                      <span className="text-right tabular-nums text-(--a-muted)">{c}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {star && (
              <button type="button" onClick={() => setStar(null)} className={`${s.link} mt-3 text-[14px]`}>
                Show every rating
              </button>
            )}
          </LegendBox>
          {signedIn ? <WriteReview slug={slug} onPosted={onPosted} /> : <AuthLegend title="Sign in to review" narrow />}
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[16px] text-(--a-ink-2)" aria-live="polite">
              {list.length} {list.length === 1 ? "report" : "reports"}
              {star ? ` at ${star} ${star === 1 ? "star" : "stars"}` : ""}
            </p>
            <div role="radiogroup" aria-label="Sort the reports" className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[15px]">
              <span className="mr-1 text-(--a-muted)">Order by</span>
              {SORTS.map((o) => {
                const on = sort === o.k;
                return (
                  <button
                    key={o.k}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSort(o.k)}
                    className={`relative rounded-full px-2.5 py-1.5 transition-colors hover:bg-(--a-ink)/[0.05] ${on ? "font-semibold text-(--a-ink)" : "text-(--a-ink-2)"}`}
                  >
                    {o.label}
                    {on && <span className="absolute inset-x-2.5 bottom-0.5 h-[2px] rounded-full bg-(--a-accent)" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </div>
          <ul id={`${id}-list`} className="mt-6 grid scroll-mt-28 gap-6">
            {list.slice(0, visible).map((r, i) => (
              <ReviewCard key={r.id} r={r} i={i} pinned={isPinned(r)} />
            ))}
          </ul>
          {list.length > visible && (
            <button type="button" onClick={() => setShown(visible + 4)} className={`${s.btn} ${s.btnLine} mt-6 h-11 px-5 text-[15px]`}>
              Show {Math.min(4, list.length - visible)} more
            </button>
          )}

          <div className="mt-14 border-t-2 border-(--a-ink) pt-4">
            <h3 className={`${s.serif} text-[28px]`}>Questions in the margin</h3>
            <ul className="mt-5 grid gap-5">
              {questions.map((qq) => (
                <li key={qq.id} className="border-l-2 border-(--a-ink) pl-4">
                  <p className="flex items-start gap-2 text-[17px] font-medium">
                    <span className={`${s.serif} text-(--a-accent-deep)`} aria-hidden>
                      Q.
                    </span>
                    {qq.body}
                  </p>
                  <p className="mt-0.5 text-[14px] text-(--a-muted)">
                    {qq.author}, {day.format(qq.at)}
                  </p>
                  <Thread items={qq.answers} />
                  <div className="mt-2">
                    <ReplyBox label="Answer this" onSend={(b) => answerQuestion(qq.id, b)} />
                  </div>
                </li>
              ))}
            </ul>
            <form
              className="mt-8 grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const r = askQuestion(slug, q);
                setQErr(r);
                if (!r) setQ("");
              }}
            >
              <Key label="Ask a question" id={`${id}-q`} error={qErr} hint={signedIn ? "The workshop answers most within a day." : "Sign in above to ask; questions carry your name."}>
                <input id={`${id}-q`} value={q} onChange={(e) => setQ(e.target.value)} className={s.field} placeholder="How heavy is it, how long does the scent last" />
              </Key>
              <button type="submit" className={`${s.btn} ${s.btnLine} h-11 justify-self-start px-5 text-[15px]`}>
                Ask the workshop
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
