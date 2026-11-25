import { useMemo } from "react";
import { getUser } from "./account";
import { seededQuestions, seededReviews, summarize, type Question, type Reply, type Review } from "./reviews-data";
import { createStore } from "./store";

/**
 * Client side of reviews: customers' own reviews, replies (comments), "helpful" votes and questions.
 * PREVIEW: stored in this browser until the backend exists. Seeds come from reviews-data.ts.
 */
export type { Review, Reply, Question };
export { summarize, seededRating } from "./reviews-data";

type Local = { reviews: Review[]; replies: Record<string, Reply[]>; helpful: string[]; questions: Question[]; answers: Record<string, Reply[]> };
const store = createStore<Local>("santalum-reviews", { reviews: [], replies: {}, helpful: [], questions: [], answers: {} });

let n = 0;
const uid = (p: string) => `${p}${Date.now().toString(36)}${(n++).toString(36)}`;

/** Reviews for a product: the customer's own first, then seeded; replies and helpful votes merged in. */
export function useReviews(slug: string) {
  const local = store.use();
  return useMemo(() => {
    const all = [...local.reviews.filter((r) => r.slug === slug), ...seededReviews(slug)].map((r) => ({
      ...r,
      replies: [...r.replies, ...(local.replies[r.id] ?? [])],
      helpful: r.helpful + (local.helpful.includes(r.id) ? 1 : 0),
      votedHelpful: local.helpful.includes(r.id),
    }));
    return { reviews: all, summary: summarize(all) };
  }, [local, slug]);
}

export type ReviewInput = { slug: string; rating: Review["rating"]; title: string; body: string };

/** Requires a signed-in customer. Returns an error message or null. */
export function addReview(input: ReviewInput): string | null {
  const u = getUser();
  if (!u) return "Please sign in to write a review.";
  if (input.body.trim().length < 20) return "Please write at least a couple of sentences.";
  const review: Review = {
    id: uid("r"),
    slug: input.slug,
    author: u.name.split(" ")[0] + " " + (u.name.split(" ")[1]?.[0] ?? "") + ".",
    city: u.addresses.find((a) => a.isDefault)?.city ?? "India",
    rating: input.rating,
    title: input.title.trim() || "Review",
    body: input.body.trim(),
    at: Date.now(),
    verified: false,
    helpful: 0,
    replies: [],
  };
  store.set((s) => ({ ...s, reviews: [review, ...s.reviews] }));
  return null;
}

export function replyToReview(reviewId: string, body: string): string | null {
  const u = getUser();
  if (!u) return "Please sign in to reply.";
  if (!body.trim()) return "Write a reply first.";
  const r: Reply = { id: uid("c"), author: u.name, body: body.trim(), at: Date.now() };
  store.set((s) => ({ ...s, replies: { ...s.replies, [reviewId]: [...(s.replies[reviewId] ?? []), r] } }));
  return null;
}

export function toggleHelpful(reviewId: string) {
  store.set((s) => ({ ...s, helpful: s.helpful.includes(reviewId) ? s.helpful.filter((x) => x !== reviewId) : [...s.helpful, reviewId] }));
}

export function useQuestions(slug: string): Question[] {
  const local = store.use();
  return useMemo(
    () => [...local.questions.filter((q) => q.slug === slug), ...seededQuestions(slug)].map((q) => ({ ...q, answers: [...q.answers, ...(local.answers[q.id] ?? [])] })),
    [local, slug],
  );
}

export function askQuestion(slug: string, body: string): string | null {
  const u = getUser();
  if (!u) return "Please sign in to ask a question.";
  if (body.trim().length < 8) return "Please write your question in a sentence.";
  const q: Question = { id: uid("q"), slug, author: u.name, body: body.trim(), at: Date.now(), answers: [] };
  store.set((s) => ({ ...s, questions: [q, ...s.questions] }));
  return null;
}

export function answerQuestion(questionId: string, body: string): string | null {
  const u = getUser();
  if (!u) return "Please sign in to answer.";
  if (!body.trim()) return "Write an answer first.";
  const a: Reply = { id: uid("a"), author: u.name, body: body.trim(), at: Date.now() };
  store.set((s) => ({ ...s, answers: { ...s.answers, [questionId]: [...(s.answers[questionId] ?? []), a] } }));
  return null;
}
