"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useUser, type User } from "@/lib/shop/account";
import { formatDate, useOrders } from "@/lib/shop/orders";
import { getProduct } from "@/lib/shop/products";
import { addReview, answerQuestion, askQuestion, replyToReview, toggleHelpful, useQuestions, useReviews, type Reply, type Review } from "@/lib/shop/reviews";
import { useHydrated } from "@/lib/shop/store";
import { AuthPanel } from "./Forms";
import { fitLetters, fitQueries, nameInProse } from "./letters-fit";
import { Stars } from "./Stars";

/** How a letter is signed: first name and the initial of the second, as the review store signs it. */
const signature = (u: User) => `${u.name.split(" ")[0]} ${u.name.split(" ")[1]?.[0] ?? ""}.`;

type Sort = "helpful" | "newest" | "highest" | "lowest";
const SORTS: { id: Sort; label: string }[] = [
  { id: "helpful", label: "Most helpful" },
  { id: "newest", label: "Newest" },
  { id: "highest", label: "Highest" },
  { id: "lowest", label: "Lowest" },
];
const WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
const PAGE = 4;

type Shown = Review & { votedHelpful?: boolean };

/** A reply or an answer. The house's are set as the editor's note. */
function Note({ r }: { r: Reply }) {
  return (
    <li className="x5r-reply" data-house={r.fromMaison || undefined}>
      <p className="x5r-replyBy">{r.fromMaison ? "The house replies" : `${r.author} writes`}</p>
      <p className="x5r-replyBody">{r.body}</p>
      <p className="x5r-replyAt">{formatDate(r.at)}</p>
    </li>
  );
}

/** A short inline form for a reply or an answer. */
function Respond({ label, idBase, onSend }: { label: string; idBase: string; onSend: (body: string) => string | null }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  if (!open)
    return (
      <button type="button" className="x5-textBtn" onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  return (
    <form
      className="x5r-respond"
      onSubmit={(e) => {
        e.preventDefault();
        const r = onSend(body);
        if (r) return setErr(r);
        setBody("");
        setErr(null);
        setOpen(false);
      }}
    >
      <label htmlFor={`${idBase}-b`} className="x5c-label">
        {label}
      </label>
      <textarea
        id={`${idBase}-b`}
        className="x5c-input x5c-textarea"
        rows={2}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        aria-invalid={err ? true : undefined}
        aria-describedby={err ? `${idBase}-e` : undefined}
      />
      {err && (
        <p id={`${idBase}-e`} className="x5c-error" role="alert">
          {err}
        </p>
      )}
      <div className="x5c-formActions">
        <button type="submit" className="x5-addSmall">
          Post
        </button>
        <button type="button" className="x5-textBtn" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Letter({ r, no, signedIn }: { r: Shown; no: number; signedIn: boolean }) {
  return (
    <li className="x5r-letter">
      <p className="x5r-meta">
        <span>Letter {no}</span>
        <Stars value={r.rating} label={`${r.rating} of 5, ${WORDS[r.rating].toLowerCase()}`} />
        {r.verified && <span className="x5r-verified">Verified purchase</span>}
      </p>
      <h3 className="x5r-title">{r.title}</h3>
      <p className="x5r-body">{r.body}</p>
      <p className="x5r-sign">
        {r.author}, {r.city}. <span>{formatDate(r.at)}</span>
      </p>
      <div className="x5r-actions">
        <button type="button" className="x5r-helpful" aria-pressed={!!r.votedHelpful} onClick={() => toggleHelpful(r.id)}>
          Helpful <span>{r.helpful}</span>
        </button>
        {signedIn ? (
          <Respond label="Reply to this letter" idBase={`rp-${r.id}`} onSend={(b) => replyToReview(r.id, b)} />
        ) : (
          <a href="#write" className="x5-textBtn">
            Sign in to reply
          </a>
        )}
      </div>
      {r.replies.length > 0 && (
        <ol className="x5r-replies" aria-label={`Replies to letter ${no}`}>
          {r.replies.map((x) => (
            <Note key={x.id} r={x} />
          ))}
        </ol>
      )}
    </li>
  );
}

function WriteLetter({ slug, name, onPosted }: { slug: string; name: string; onPosted: () => void }) {
  const [rating, setRating] = useState<Review["rating"] | 0>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rating) return setErr("Choose a number of stars first.");
    const r = addReview({ slug, rating, title, body });
    if (r) return setErr(r);
    setErr(null);
    setRating(0);
    setTitle("");
    setBody("");
    setDone(true);
    onPosted();
  };

  return (
    <form className="x5r-write" onSubmit={submit} noValidate>
      <div className="x5r-pick" role="radiogroup" aria-label="Your rating">
        <span className="x5c-label">Your rating</span>
        <span className="x5r-pickStars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n === 1 ? "star" : "stars"}, ${WORDS[n].toLowerCase()}`}
              className="x5r-pickStar"
              data-on={n <= rating || undefined}
              onClick={() => {
                setRating(n as Review["rating"]);
                setErr(null);
                setDone(false);
              }}
            >
              ★
            </button>
          ))}
        </span>
        <span className="x5r-pickWord">{rating ? WORDS[rating] : "Not yet chosen"}</span>
      </div>
      <div className="x5c-field">
        <label htmlFor="rv-title" className="x5c-label">
          A headline for your letter
        </label>
        <input
          id="rv-title"
          className="x5c-input"
          value={title}
          maxLength={80}
          onChange={(e) => {
            setTitle(e.target.value);
            setDone(false);
          }}
          autoComplete="off"
        />
      </div>
      <div className="x5c-field">
        <label htmlFor="rv-body" className="x5c-label">
          Your letter about the {nameInProse(name)}
        </label>
        <textarea
          id="rv-body"
          className="x5c-input x5c-textarea"
          rows={4}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (err && err !== "Choose a number of stars first.") setErr(null);
            setDone(false);
          }}
          aria-describedby="rv-body-hint"
        />
        <span id="rv-body-hint" className="x5c-hint">
          What you noticed in the hand, and after a few weeks. Two or three sentences.
        </span>
      </div>
      {err && (
        <p className="x5c-formError" role="alert">
          {err}
        </p>
      )}
      <div className="x5c-formActions">
        <button type="submit" className="x5c-place x5c-placeSmall">
          <span>Send the letter</span>
          <span>{rating ? `${rating} of 5` : "Signed"}</span>
        </button>
        {done && (
          <span className="x5c-hint" role="status">
            Printed. Your letter now heads the column.
          </span>
        )}
      </div>
    </form>
  );
}

/** Ratings and reviews as letters to the editor, with replies; then readers' queries and the house's answers. */
export function Letters({ slug, name }: { slug: string; name: string }) {
  const hydrated = useHydrated();
  const user = useUser();
  const signedIn = hydrated && !!user;
  const product = getProduct(slug)!;
  const { reviews: raw, summary } = useReviews(slug);
  const rawQuestions = useQuestions(slug);
  const reviews = useMemo(() => fitLetters(raw, product), [raw, product]);
  const questions = useMemo(() => fitQueries(rawQuestions, product), [rawQuestions, product]);
  // A reader who bought this piece and writes about it is a verified purchaser, though the letter was saved plain.
  const orders = useOrders();
  const bought = orders.some((o) => o.status !== "cancelled" && o.lines.some((l) => l.slug === slug));
  const mine = user ? signature(user) : null;
  const isVerified = (r: Review) => r.verified || (bought && !!mine && r.author === mine && !r.id.startsWith(`${slug}-s`));
  const [sort, setSort] = useState<Sort>("helpful");
  const [star, setStar] = useState<number | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [ask, setAsk] = useState("");
  const [askErr, setAskErr] = useState<string | null>(null);

  const list = (star ? reviews.filter((r) => r.rating === star) : reviews).slice().sort((a, b) => {
    if (sort === "newest") return b.at - a.at;
    if (sort === "highest") return b.rating - a.rating || b.at - a.at;
    if (sort === "lowest") return a.rating - b.rating || b.at - a.at;
    return b.helpful - a.helpful || b.at - a.at;
  });
  const max = Math.max(1, ...summary.dist);

  return (
    <>
      <section id="letters" className="x5a-block x5r-block" aria-labelledby="letters-title">
        <div className="x5a-side">
          <h2 id="letters-title" className="x5a-blockTitle">
            Letters
          </h2>
          <p className="x5r-avg">
            <b>{summary.avg.toFixed(1)}</b>
            <span>of 5</span>
          </p>
          <Stars value={summary.avg} />
          <p className="x5a-sideNote">
            From {summary.count} {summary.count === 1 ? "letter" : "letters"} to the editor about this piece. We print them all, the quiet ones too.
          </p>
          <ol className="x5r-dist" aria-label="Letters by stars">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = summary.dist[n - 1];
              return (
                <li key={n}>
                  <button type="button" className="x5r-distBtn" aria-pressed={star === n} disabled={!c} onClick={() => setStar(star === n ? null : n)}>
                    <span className="x5r-distN">{n} ★</span>
                    <span className="x5r-distBar" aria-hidden>
                      <span style={{ width: `${(c / max) * 100}%` }} />
                    </span>
                    <span className="x5r-distC">{c}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="x5a-blockBody">
          <div className="x5s-choice" role="group" aria-label="Order the letters">
            <span className="x5s-choiceLabel">Order</span>
            {SORTS.map((s) => (
              <button key={s.id} type="button" className="x5s-choiceBtn" aria-pressed={sort === s.id} onClick={() => setSort(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
          {star && (
            <p className="x5r-filter">
              {list.length} {list.length === 1 ? "letter" : "letters"} with {star} {star === 1 ? "star" : "stars"}.{" "}
              <button type="button" className="x5-textBtn" onClick={() => setStar(null)}>
                Show every letter
              </button>
            </p>
          )}
          <ol className="x5r-letters">
            {list.slice(0, shown).map((r) => (
              <Letter key={r.id} r={{ ...r, verified: isVerified(r) }} no={reviews.indexOf(r) + 1} signedIn={signedIn} />
            ))}
          </ol>
          {list.length > shown && (
            <button type="button" className="x5s-more" onClick={() => setShown(shown + PAGE)}>
              <span>Read {Math.min(PAGE, list.length - shown)} more letters</span>
              <span>
                {shown} of {list.length}
              </span>
            </button>
          )}

          <div id="write" className="x5r-writeWrap">
            <h3 className="x5r-writeHead">Write to the editor</h3>
            {!hydrated ? null : user ? (
              <WriteLetter
                slug={slug}
                name={name}
                onPosted={() => {
                  setSort("newest");
                  setStar(null);
                }}
              />
            ) : (
              <>
                <p className="x5r-writeLead">Letters are signed. Sign in with your reader&apos;s slip, or open a file in a minute, and your letter goes to the top of the column.</p>
                <AuthPanel idBase="rv-auth" />
              </>
            )}
          </div>
        </div>
      </section>

      <section id="queries" className="x5a-block" aria-labelledby="queries-title">
        <div className="x5a-side">
          <h2 id="queries-title" className="x5a-blockTitle">
            Queries
          </h2>
          <p className="x5a-sideNote">Readers ask, and the house answers. Anyone signed in may add what they know.</p>
        </div>
        <div className="x5a-blockBody">
          <ol className="x5r-queries">
            {questions.map((q) => (
              <li key={q.id} className="x5r-query">
                <p className="x5r-q">
                  <span aria-hidden>Q.</span>
                  {q.body}
                </p>
                <p className="x5r-sign">
                  {q.author}, <span>{formatDate(q.at)}</span>
                </p>
                {q.answers.length > 0 ? (
                  <ol className="x5r-replies">
                    {q.answers.map((a) => (
                      <Note key={a.id} r={a} />
                    ))}
                  </ol>
                ) : (
                  <p className="x5r-waiting">Not answered yet. The studio replies within a working day.</p>
                )}
                {signedIn && <Respond label="Answer this query" idBase={`an-${q.id}`} onSend={(b) => answerQuestion(q.id, b)} />}
              </li>
            ))}
          </ol>
          {signedIn ? (
            <form
              className="x5r-ask"
              onSubmit={(e) => {
                e.preventDefault();
                const r = askQuestion(slug, ask);
                if (r) return setAskErr(r);
                setAsk("");
                setAskErr(null);
              }}
            >
              <label htmlFor="q-ask" className="x5c-label">
                Your query about the {nameInProse(name)}
              </label>
              <textarea
                id="q-ask"
                className="x5c-input x5c-textarea"
                rows={2}
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                aria-invalid={askErr ? true : undefined}
                aria-describedby={askErr ? "q-ask-e" : undefined}
              />
              {askErr && (
                <p id="q-ask-e" className="x5c-error" role="alert">
                  {askErr}
                </p>
              )}
              <button type="submit" className="x5-addSmall">
                Send the query
              </button>
            </form>
          ) : (
            <p className="x5r-writeLead">
              To ask or answer, <a href="#write" className="x5-inlineLink">sign in on the reader&apos;s slip above</a>.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
