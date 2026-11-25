"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent, type Ref } from "react";
import { useUser } from "@/lib/shop/account";
import { CONTENT } from "@/lib/shop/content";
import { formatDate } from "@/lib/shop/orders";
import type { Product } from "@/lib/shop/products";
import {
  addReview,
  answerQuestion,
  askQuestion,
  replyToReview,
  toggleHelpful,
  useQuestions,
  useReviews,
  type Reply,
  type Review,
} from "@/lib/shop/reviews";
import { v } from "./cls";
import { SignInForm } from "./forms";
import { cx } from "./ui";

/* ---------------- stars: five small engraved marks, filled to the average ---------------- */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cx(v.stars, className)} style={{ ["--fill" as string]: `${(value / 5) * 100}%` }} aria-hidden="true">
      <span className={v.starsBase}>★★★★★</span>
      <span className={v.starsFill}>★★★★★</span>
    </span>
  );
}

/** Stars and the number of entries, for wall labels and catalogue cards. */
export function Rating({ slug, href }: { slug: string; href?: string }) {
  const { summary } = useReviews(slug);
  if (!summary.count) return null;
  const label = `Rated ${summary.avg} out of 5 in ${summary.count} ${summary.count === 1 ? "review" : "reviews"}`;
  const body = (
    <>
      <Stars value={summary.avg} />
      <span className={v.ratingNum}>{summary.avg.toFixed(1)}</span>
      <span className={v.ratingCount}>({summary.count})</span>
    </>
  );
  return href ? (
    <a href={href} className={v.rating} aria-label={label}>
      {body}
    </a>
  ) : (
    <span className={v.rating} role="img" aria-label={label}>
      {body}
    </span>
  );
}

type Sort = "helpful" | "newest" | "high" | "low";
const SORTS: { key: Sort; label: string }[] = [
  { key: "helpful", label: "Most helpful" },
  { key: "newest", label: "Newest" },
  { key: "high", label: "Highest rated" },
  { key: "low", label: "Lowest rated" },
];
type Entry = Review & { votedHelpful: boolean };

/** Reviews, replies and questions as the museum's visitors' book, kept on a lectern after the walk. */
export function VisitorsBook({ p }: { p: Product }) {
  const { reviews, summary } = useReviews(p.slug);
  const user = useUser();
  const [sort, setSort] = useState<Sort>("helpful");
  const [star, setStar] = useState<number | null>(null);
  const [shown, setShown] = useState(4);
  /** when this visitor last signed the book: their entry is turned to and marked */
  const [signedAt, setSignedAt] = useState<number | null>(null);
  const sortId = useId();
  const ct = CONTENT[p.wood];
  const freshRef = useRef<HTMLLIElement>(null);

  // a new entry goes in at the top of the page: read by newest, every star, and bring the page to it
  const onSigned = () => {
    setSort("newest");
    setStar(null);
    setShown(4);
    setSignedAt(Date.now() - 5000);
  };
  useEffect(() => {
    if (!signedAt) return;
    const el = freshRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 72 || r.bottom > window.innerHeight) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    }
  }, [signedAt]);

  const list = (reviews as Entry[])
    .filter((r) => !star || r.rating === star)
    .sort((a, b) =>
      sort === "newest" ? b.at - a.at : sort === "high" ? b.rating - a.rating || b.at - a.at : sort === "low" ? a.rating - b.rating || b.at - a.at : b.helpful - a.helpful || b.at - a.at,
    );

  return (
    <section id="reviews" className={v.book} aria-labelledby="c4v-title">
      <header className={v.head}>
        <div>
          <h2 id="c4v-title" className={v.title}>
            The visitors&apos; <i>book</i>
          </h2>
          <p className={v.lede}>
            What members wrote after living with <cite className="c4-title">{p.name}</cite>
            {p.wood === "red"
              ? ": the weight, the colour as it deepens, the record that came with it."
              : ": the fragrance, how long it stays, the lot on the label."}
          </p>
        </div>
        <p className={v.ink}>{ct.name}</p>
      </header>

      <div className={v.spread}>
        {/* left page: the tally */}
        <aside className={v.tally} aria-label="Ratings">
          <p className={v.avg}>
            {summary.count ? summary.avg.toFixed(1) : "No entries"}
            {summary.count > 0 && <span> of 5</span>}
          </p>
          <Stars value={summary.avg} className={v.starsLg} />
          <p className={v.tallyCount}>
            {summary.count} {summary.count === 1 ? "entry" : "entries"} in the book
          </p>
          <ul className={v.dist}>
            {[5, 4, 3, 2, 1].map((n) => {
              const c = summary.dist[n - 1];
              return (
                <li key={n}>
                  <button
                    type="button"
                    aria-pressed={star === n}
                    disabled={!c}
                    aria-label={`${n} star entries: ${c}. ${star === n ? "Show all" : "Show only these"}`}
                    onClick={() => {
                      setStar(star === n ? null : n);
                      setShown(4);
                    }}
                  >
                    <span>{n}</span>
                    <span className={v.bar}>
                      <span style={{ width: summary.count ? `${(c / summary.count) * 100}%` : 0 }} />
                    </span>
                    <span>{c}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Sign p={p} signedIn={!!user} onSigned={onSigned} />
        </aside>

        {/* right page: the entries */}
        <div className={v.entries}>
          <div className={v.toolbar}>
            <p className={v.showing}>
              {star ? `${list.length} ${list.length === 1 ? "entry" : "entries"} with ${star} stars` : `${list.length} entries`}
              {star && (
                <button type="button" className={v.linkBtn} onClick={() => setStar(null)}>
                  Show all
                </button>
              )}
            </p>
            <label htmlFor={sortId} className={v.sortLabel}>
              Read by
            </label>
            <select id={sortId} className={v.sort} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <ol className={v.list}>
            {list.slice(0, shown).map((r, i) => {
              const fresh = signedAt !== null && i === 0 && r.at >= signedAt;
              return <Entry key={r.id} r={r} signedIn={!!user} fresh={fresh} liRef={fresh ? freshRef : undefined} />;
            })}
          </ol>
          {list.length > shown && (
            <button type="button" className="c4-btnLine mt-6" onClick={() => setShown((n) => n + 4)}>
              Turn the page: {Math.min(4, list.length - shown)} more
            </button>
          )}
        </div>
      </div>

      <Questions p={p} signedIn={!!user} />
    </section>
  );
}

function Who({ r }: { r: Reply }) {
  return r.fromMaison ? (
    <span className={v.house}>
      <span className={v.houseMark} aria-hidden="true">
        S
      </span>
      The curator, Santalum Maison
    </span>
  ) : (
    <span className={v.who}>{r.author}</span>
  );
}

function Entry({
  r,
  signedIn,
  fresh = false,
  liRef,
}: {
  r: Entry;
  signedIn: boolean;
  fresh?: boolean;
  liRef?: Ref<HTMLLIElement>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className={v.entry} data-fresh={fresh ? "" : undefined} ref={liRef}>
      <div className={v.entryTop}>
        <Stars value={r.rating} />
        <span className="sr-only">{r.rating} out of 5</span>
        {r.verified && <span className={v.verified}>Verified purchase</span>}
        {fresh && <span className={v.fresh}>Your entry, just signed</span>}
      </div>
      <h3 className={v.entryTitle}>{r.title}</h3>
      <p className={v.entryBody}>{r.body}</p>
      <p className={v.sig}>
        <span>
          <span className={v.who}>{r.author}</span>, {r.city}
        </span>
        <span className={v.date}>{formatDate(r.at)}</span>
      </p>
      <div className={v.entryActions}>
        <button type="button" className={v.helpful} aria-pressed={r.votedHelpful} onClick={() => toggleHelpful(r.id)}>
          Helpful <span>{r.helpful}</span>
        </button>
        <button type="button" className={v.linkBtn} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {r.replies.length ? `Replies (${r.replies.length})` : "Reply"}
        </button>
      </div>
      {r.replies.length > 0 && !open && r.replies.some((x) => x.fromMaison) && (
        <Thread replies={r.replies.filter((x) => x.fromMaison)} />
      )}
      {open && (
        <>
          {r.replies.length > 0 && <Thread replies={r.replies} />}
          <Write
            signedIn={signedIn}
            label="Your reply"
            placeholder="Add to this entry"
            submit="Add the reply"
            onSubmit={(body) => replyToReview(r.id, body)}
          />
        </>
      )}
    </li>
  );
}

function Thread({ replies }: { replies: Reply[] }) {
  return (
    <ol className={v.thread}>
      {replies.map((x) => (
        <li key={x.id} className={v.reply} data-house={x.fromMaison ? "" : undefined}>
          <p className={v.replyWho}>
            <Who r={x} />
            <span className={v.date}>{formatDate(x.at)}</span>
          </p>
          <p className={v.replyBody}>{x.body}</p>
        </li>
      ))}
    </ol>
  );
}

/** A small reply or answer box; signed-out visitors get the desk's sign-in instead. */
function Write({
  signedIn,
  label,
  placeholder,
  submit,
  onSubmit,
}: {
  signedIn: boolean;
  label: string;
  placeholder: string;
  submit: string;
  onSubmit: (body: string) => string | null;
}) {
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const id = useId();
  if (!signedIn) return <SignPrompt what="write in the book" />;
  return (
    <form
      className={v.write}
      onSubmit={(e) => {
        e.preventDefault();
        const res = onSubmit(body);
        if (res) setErr(res);
        else {
          setBody("");
          setErr("");
        }
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        value={body}
        rows={2}
        placeholder={placeholder}
        aria-invalid={err ? true : undefined}
        aria-describedby={err ? `${id}-e` : undefined}
        onChange={(e) => setBody(e.target.value)}
      />
      {err && (
        <p id={`${id}-e`} className="c4r-err">
          {err}
        </p>
      )}
      <button type="submit" className={v.writeBtn}>
        {submit}
      </button>
    </form>
  );
}

function SignPrompt({ what }: { what: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={v.prompt}>
      <p>
        Members {what}.{" "}
        <button type="button" className={v.linkBtn} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          Sign in here
        </button>{" "}
        or{" "}
        <Link href="/d/04/account" className={v.linkBtn}>
          become a member
        </Link>
        .
      </p>
      {open && (
        <div className={v.promptForm}>
          <SignInForm submitLabel="Sign in and write" />
        </div>
      )}
    </div>
  );
}

/* ---------------- sign the book: a review ---------------- */
function Sign({ p, signedIn, onSigned }: { p: Product; signedIn: boolean; onSigned: () => void }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const ids = { t: useId(), b: useId(), s: useId() };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rating) return setErr("Choose a number of stars first.");
    const res = addReview({ slug: p.slug, rating: rating as Review["rating"], title, body });
    if (res) return setErr(res);
    setErr("");
    setDone(true);
    setRating(0);
    setTitle("");
    setBody("");
    onSigned();
  };

  return (
    <div className={v.sign}>
      <h3 className={v.signTitle}>Sign the book</h3>
      {!signedIn ? (
        <SignPrompt what="sign the book" />
      ) : done ? (
        <p className={v.thanks} role="status">
          Thank you. Your entry is in the book, first on the page, which now reads by newest.{" "}
          <button type="button" className={v.linkBtn} onClick={() => setDone(false)}>
            Write another
          </button>
        </p>
      ) : (
        <form onSubmit={submit} noValidate className={v.signForm}>
          <fieldset className={v.picker}>
            <legend id={ids.s}>Your stars</legend>
            <div>
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} data-on={n <= rating ? "" : undefined}>
                  <input
                    type="radio"
                    name={ids.s}
                    value={n}
                    checked={rating === n}
                    onChange={() => {
                      setRating(n);
                      if (err) setErr("");
                    }}
                  />
                  <span aria-hidden="true">★</span>
                  <span className="sr-only">
                    {n} {n === 1 ? "star" : "stars"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor={ids.t} className={v.fieldLabel}>
            Title
          </label>
          <input id={ids.t} className={v.input} value={title} maxLength={80} placeholder="In a few words" onChange={(e) => setTitle(e.target.value)} />
          <label htmlFor={ids.b} className={v.fieldLabel}>
            Your entry
          </label>
          <textarea
            id={ids.b}
            className={v.input}
            rows={4}
            value={body}
            placeholder={p.wood === "red" ? "The weight, the colour, how it wears" : "The fragrance, how long it stays, how you use it"}
            aria-invalid={err ? true : undefined}
            aria-describedby={err ? `${ids.b}-e` : undefined}
            onChange={(e) => {
              setBody(e.target.value);
              if (err && rating) setErr("");
            }}
          />
          {err && (
            <p id={`${ids.b}-e`} className="c4r-err" role="alert">
              {err}
            </p>
          )}
          <button type="submit" className={v.writeBtn}>
            Sign the book
          </button>
        </form>
      )}
    </div>
  );
}

/* ---------------- questions at the desk ---------------- */
function Questions({ p, signedIn }: { p: Product; signedIn: boolean }) {
  const qs = useQuestions(p.slug);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const id = useId();
  return (
    <div className={v.qa}>
      <div className={v.qaHead}>
        <h2 className={v.qaTitle}>Questions at the desk</h2>
        <p className={v.lede}>Asked by visitors, answered by the curator or by other members.</p>
      </div>
      <ol className={v.qList}>
        {qs.map((x) => (
          <QItem key={x.id} q={x} signedIn={signedIn} />
        ))}
      </ol>
      {signedIn ? (
        <form
          className={v.ask}
          onSubmit={(e) => {
            e.preventDefault();
            const res = askQuestion(p.slug, q);
            if (res) setErr(res);
            else {
              setQ("");
              setErr("");
            }
          }}
        >
          <label htmlFor={id} className={v.fieldLabel}>
            Ask about <cite className="c4-title">{p.name}</cite>
          </label>
          <div className={v.askRow}>
            <input
              id={id}
              className={v.input}
              value={q}
              placeholder={p.wood === "red" ? "Size, weight, how it is finished" : "Fragrance, use, how it is made"}
              aria-invalid={err ? true : undefined}
              aria-describedby={err ? `${id}-e` : undefined}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className={v.writeBtn}>
              Ask
            </button>
          </div>
          {err && (
            <p id={`${id}-e`} className="c4r-err">
              {err}
            </p>
          )}
        </form>
      ) : (
        <SignPrompt what="ask at the desk" />
      )}
    </div>
  );
}

function QItem({ q, signedIn }: { q: { id: string; author: string; body: string; at: number; answers: Reply[] }; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <li className={v.q}>
      <p className={v.qBody}>
        <span className={v.qMark} aria-hidden="true">
          Q.
        </span>
        {q.body}
      </p>
      <p className={v.sig}>
        <span className={v.who}>{q.author}</span>
        <span className={v.date}>{formatDate(q.at)}</span>
      </p>
      {q.answers.length > 0 && <Thread replies={q.answers} />}
      <button type="button" className={v.linkBtn} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Answer this
      </button>
      {open && <Write signedIn={signedIn} label="Your answer" placeholder="What you know from your own piece" submit="Add the answer" onSubmit={(b) => answerQuestion(q.id, b)} />}
    </li>
  );
}
