import { useMemo, useSyncExternalStore } from "react";
import type { Address, User } from "@/lib/shop/account";
import { CONTENT } from "@/lib/shop/content";
import { trackingFor, type Order } from "@/lib/shop/orders";
import { featured, PRODUCTS, type Product, type Wood } from "@/lib/shop/products";
import { allSeededReviews, seededQuestions, type Question, type Reply, type Review } from "@/lib/shop/reviews-data";
import { createStore } from "@/lib/shop/store";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { formatINR } from "./format";
import { baseStock, buildMock, DEFAULT_COUPONS, DEFAULT_SETTINGS, defaultContent, HOUR, optionsOf, stockKey } from "./mock";
import type {
  AdminCoupon,
  AdminCustomer,
  AdminOrder,
  AdminSession,
  AdminStatus,
  ContentDraft,
  CustomerStats,
  ModerationState,
  OrderPatch,
  ProductDraft,
  ProductStatus,
  Settings,
  StockAdjustment,
  TimelineEvent,
} from "./types";

/**
 * The admin's state. PREVIEW: everything the admin changes is kept in this browser under
 * santalum-admin-* keys and merged over the mock data and the shop's own preview orders and
 * accounts (santalum-orders, santalum-users). Swap these hooks for API calls when Santalum-B exists.
 */

/* ---------- stores ---------- */
const obj = <T>(r: unknown, fallback: T): T => (r && typeof r === "object" ? (r as T) : fallback);

export const sessionStore = createStore<AdminSession | null>("santalum-admin-session", null);
const orderPatches = createStore<Record<string, OrderPatch>>("santalum-admin-orders", {}, (r) => obj(r, {}));
const productStore = createStore<{ edits: Record<string, ProductDraft>; created: Record<string, ProductDraft> }>("santalum-admin-products", { edits: {}, created: {} }, (r) =>
  obj(r, { edits: {}, created: {} }),
);
const stockStore = createStore<{ levels: Record<string, number>; thresholds: Record<string, number>; log: StockAdjustment[] }>(
  "santalum-admin-stock",
  { levels: {}, thresholds: {}, log: [] },
  (r) => obj(r, { levels: {}, thresholds: {}, log: [] }),
);
type ReviewAdmin = { status: Record<string, ModerationState>; replies: Record<string, { body: string; at: number }>; featured: string[]; answers: Record<string, { body: string; at: number }> };
const reviewStore = createStore<ReviewAdmin>("santalum-admin-reviews", { status: {}, replies: {}, featured: [], answers: {} }, (r) => obj(r, { status: {}, replies: {}, featured: [], answers: {} }));
const couponStore = createStore<AdminCoupon[] | null>("santalum-admin-coupons", null, (r) => (Array.isArray(r) ? (r as AdminCoupon[]) : null));
const contentStore = createStore<Partial<Record<Wood, ContentDraft>>>("santalum-admin-content", {}, (r) => obj(r, {}));
const settingsStore = createStore<Partial<Settings>>("santalum-admin-settings", {}, (r) => obj(r, {}));
type CustomerNote = { at: number; body: string; by: string };
const customerStore = createStore<Record<string, { notes: CustomerNote[] }>>("santalum-admin-customers", {}, (r) => obj(r, {}));

/* the shop's own preview data, read only */
type StoredUser = User & { salt?: string; hash?: string };
const shopOrders = createStore<Order[]>("santalum-orders", [], (r) => (Array.isArray(r) ? (r as Order[]) : []));
const shopUsers = createStore<StoredUser[]>("santalum-users", [], (r) => (Array.isArray(r) ? (r as StoredUser[]) : []));
const shopReviews = createStore<{ reviews: Review[]; questions: Question[]; answers: Record<string, Reply[]> }>("santalum-reviews", { reviews: [], questions: [], answers: {} }, (r) =>
  obj(r, { reviews: [], questions: [], answers: {} }),
);

/* ---------- clock ---------- */
const subscribeMinute = (cb: () => void) => {
  const t = window.setInterval(cb, 60_000);
  return () => window.clearInterval(t);
};
/** Minute clock. 0 on the server; admin data is only rendered in the browser (see Gate). */
export function useNow(): number {
  return useSyncExternalStore(
    subscribeMinute,
    () => Math.floor(Date.now() / 60_000) * 60_000,
    () => 0,
  );
}
function useHour() {
  const now = useNow();
  return Math.floor(now / HOUR) * HOUR;
}
export function useMock() {
  const hour = useHour();
  return useMemo(() => buildMock(hour), [hour]);
}

/* ---------- session ---------- */
export const useSession = () => sessionStore.use();
export function adminSignIn(email: string) {
  const local = email.trim().split("@")[0] || "admin";
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  sessionStore.set({ email: email.trim().toLowerCase(), name, at: Date.now() });
}
export const adminSignOut = () => sessionStore.set(null);
const actor = () => sessionStore.get()?.name ?? "Admin";

/* ---------- orders ---------- */
const STAGE_STATUS: AdminStatus[] = ["new", "confirmed", "packed", "shipped", "shipped", "delivered"];

function fromShop(o: Order, now: number): AdminOrder {
  const tr = trackingFor(o, now);
  let status: AdminStatus = STAGE_STATUS[tr.current];
  if (o.status === "cancelled") status = "cancelled";
  if (o.status === "return-requested") status = "return-requested";
  const timeline: TimelineEvent[] = tr.stages
    .filter((s) => s.done && s.key !== "out")
    .map((s) => ({
      at: s.at,
      kind: s.key === "placed" ? "placed" : (s.key as TimelineEvent["kind"]),
      text: s.key === "placed" ? "Placed on the shop (preview order from this browser)" : s.key === "shipped" ? `Handed to ${o.courier.name}, AWB ${o.courier.awb}` : s.detail,
    }));
  if (o.status === "cancelled") timeline.push({ at: Math.min(now, o.placedAt + 2 * 60_000), kind: "cancelled", text: "Cancelled by the customer" });
  if (o.status === "return-requested") timeline.push({ at: now, kind: "return-requested", text: `Return requested: "${o.returnReason ?? ""}"` });
  return {
    id: o.id,
    source: "preview",
    customerId: o.userId,
    name: o.name,
    email: o.email,
    phone: o.phone,
    placedAt: o.placedAt,
    lines: o.lines,
    subtotal: o.subtotal,
    shipping: o.shipping,
    discount: o.discount ?? 0,
    coupon: o.coupon,
    total: o.total,
    address: o.address,
    delivery: o.delivery,
    payment: o.payment,
    paymentState: o.payment === "cod" ? (status === "delivered" ? "cod-collected" : "cod-pending") : "paid",
    paymentRef: o.payment === "cod" ? "Cash on delivery" : "Preview, no payment taken",
    refunded: 0,
    giftNote: o.giftNote,
    status,
    courier: tr.current >= 3 ? o.courier : undefined,
    timeline,
    returnReason: o.returnReason,
    woods: [...new Set(o.lines.map((l) => l.wood))],
  };
}

function applyPatch(o: AdminOrder, p: OrderPatch | undefined): AdminOrder {
  if (!p) return o;
  return {
    ...o,
    status: p.status ?? o.status,
    courier: p.courier ?? o.courier,
    paymentState: p.paymentState ?? o.paymentState,
    refunded: p.refunded ?? o.refunded,
    cancelReason: p.cancelReason ?? o.cancelReason,
    timeline: [...o.timeline, ...(p.events ?? [])].sort((a, b) => a.at - b.at),
  };
}

export function useOrders(): AdminOrder[] {
  const mock = useMock();
  const now = useNow();
  const shop = shopOrders.use();
  const patches = orderPatches.use();
  return useMemo(() => {
    const real = shop.map((o) => fromShop(o, now));
    return [...real, ...mock.orders].map((o) => applyPatch(o, patches[o.id])).sort((a, b) => b.placedAt - a.placedAt);
  }, [mock, shop, patches, now]);
}

export function useOrder(id: string) {
  const all = useOrders();
  return useMemo(() => all.find((o) => o.id === id), [all, id]);
}

function patch(id: string, fn: (p: OrderPatch) => OrderPatch) {
  orderPatches.set((all) => ({ ...all, [id]: fn(all[id] ?? {}) }));
}
function withEvent(p: OrderPatch, kind: TimelineEvent["kind"], text: string): OrderPatch {
  return { ...p, events: [...(p.events ?? []), { at: Date.now(), kind, text, by: actor() }] };
}

export const NEXT_STAGE: Partial<Record<AdminStatus, { to: AdminStatus; label: string; text: string }>> = {
  new: { to: "confirmed", label: "Confirm order", text: "Confirmed, pieces matched to batch records" },
  confirmed: { to: "packed", label: "Mark packed", text: "Packed in linen with the batch records" },
  packed: { to: "shipped", label: "Mark shipped", text: "Handed to the courier" },
  shipped: { to: "delivered", label: "Mark delivered", text: "Delivered, signed for at the address" },
};

export const orderActions = {
  advance(o: AdminOrder) {
    const next = NEXT_STAGE[o.status];
    if (!next) return;
    patch(o.id, (p) => {
      let q: OrderPatch = { ...p, status: next.to };
      if (next.to === "delivered" && o.payment === "cod") q.paymentState = "cod-collected";
      const text = next.to === "shipped" && (q.courier ?? o.courier) ? `Handed to ${(q.courier ?? o.courier)!.name}, AWB ${(q.courier ?? o.courier)!.awb}` : next.to === "delivered" && o.payment === "cod" ? `Delivered, ${formatINR(o.total)} collected` : next.text;
      q = withEvent(q, next.to as TimelineEvent["kind"], text);
      return q;
    });
  },
  setAwb(o: AdminOrder, courier: { name: string; awb: string }, ship: boolean) {
    patch(o.id, (p) => {
      let q = withEvent({ ...p, courier }, "awb", `AWB ${courier.awb} added (${courier.name})`);
      if (ship) q = withEvent({ ...q, status: "shipped" }, "shipped", `Handed to ${courier.name}, AWB ${courier.awb}`);
      return q;
    });
  },
  cancel(o: AdminOrder, reason: string) {
    patch(o.id, (p) => withEvent({ ...p, status: "cancelled", cancelReason: reason }, "cancelled", `Cancelled: ${reason}`));
  },
  refund(o: AdminOrder, amount: number, note: string) {
    const refunded = Math.min(o.total, o.refunded + amount);
    patch(o.id, (p) =>
      withEvent({ ...p, refunded, paymentState: refunded >= o.total ? "refunded" : "part-refunded" }, "refund", `Refunded ${formatINR(amount)} to the original payment method${note ? `: ${note}` : ""}`),
    );
  },
  approveReturn(o: AdminOrder) {
    patch(o.id, (p) => withEvent({ ...p, status: "returned" }, "returned", "Return approved, pickup arranged"));
  },
  note(o: AdminOrder, body: string) {
    patch(o.id, (p) => withEvent(p, "note", body));
  },
};

/* ---------- customers ---------- */
function fromUser(u: StoredUser): AdminCustomer {
  const def = u.addresses.find((a) => a.isDefault) ?? u.addresses[0];
  return {
    id: u.id,
    source: "preview",
    name: u.name,
    email: u.email,
    phone: u.phone,
    city: def?.city ?? "",
    state: def?.state ?? "",
    createdAt: u.createdAt,
    addresses: u.addresses.map((a: Address) => ({ ...a })),
    tags: u.newsletter ? ["Circle"] : [],
    newsletter: u.newsletter,
    wishlist: u.wishlist ?? [],
  };
}

export function statsFor(orders: AdminOrder[]): CustomerStats {
  const live = orders.filter((o) => o.status !== "cancelled");
  const ltv = live.reduce((s, o) => s + o.total - o.refunded, 0);
  const times = orders.map((o) => o.placedAt);
  return { orders: live.length, ltv, aov: live.length ? Math.round(ltv / live.length) : 0, lastOrderAt: times.length ? Math.max(...times) : null, firstOrderAt: times.length ? Math.min(...times) : null };
}

export type CustomerRow = AdminCustomer & CustomerStats;

export function useCustomers(): CustomerRow[] {
  const mock = useMock();
  const users = shopUsers.use();
  const orders = useOrders();
  return useMemo(() => {
    const byCustomer = new Map<string, AdminOrder[]>();
    for (const o of orders) byCustomer.set(o.customerId, [...(byCustomer.get(o.customerId) ?? []), o]);
    const list: AdminCustomer[] = [...users.map(fromUser), ...mock.customers];
    // preview orders whose account is gone still get a row
    for (const o of orders) {
      if (o.source === "preview" && !list.some((c) => c.id === o.customerId)) {
        list.push({ id: o.customerId, source: "preview", name: o.name, email: o.email, phone: o.phone, city: o.address.city, state: o.address.state, createdAt: o.placedAt, addresses: [{ ...o.address, id: "a0", isDefault: true }], tags: [], newsletter: false, wishlist: [] });
      }
    }
    return list.map((c) => ({ ...c, ...statsFor(byCustomer.get(c.id) ?? []) }));
  }, [mock, users, orders]);
}

export const useCustomerNotes = (id: string) => {
  const all = customerStore.use();
  return all[id]?.notes ?? EMPTY_NOTES;
};
const EMPTY_NOTES: CustomerNote[] = [];
export function addCustomerNote(id: string, body: string) {
  customerStore.set((all) => ({ ...all, [id]: { notes: [{ at: Date.now(), body, by: actor() }, ...(all[id]?.notes ?? [])] } }));
}

/* ---------- stock ---------- */
const BASE_STOCK = baseStock();
export function useStock() {
  const s = stockStore.use();
  return useMemo(
    () => ({
      levels: { ...BASE_STOCK.levels, ...s.levels } as Record<string, number>,
      thresholds: { ...BASE_STOCK.thresholds, ...s.thresholds } as Record<string, number>,
      log: s.log,
    }),
    [s],
  );
}
export function adjustStock(key: string, delta: number, reason: string) {
  stockStore.set((s) => {
    const cur = s.levels[key] ?? BASE_STOCK.levels[key] ?? 0;
    return { ...s, levels: { ...s.levels, [key]: Math.max(0, cur + delta) }, log: [{ at: Date.now(), key, delta, reason, by: actor() }, ...s.log].slice(0, 200) };
  });
}
export function setThreshold(key: string, n: number) {
  stockStore.set((s) => ({ ...s, thresholds: { ...s.thresholds, [key]: Math.max(0, n) } }));
}
function setLevels(levels: Record<string, number>, reason: string) {
  stockStore.set((s) => {
    const log: StockAdjustment[] = [];
    for (const [k, v] of Object.entries(levels)) {
      const cur = s.levels[k] ?? BASE_STOCK.levels[k] ?? 0;
      if (cur !== v) log.push({ at: Date.now(), key: k, delta: v - cur, reason, by: actor() });
    }
    return { ...s, levels: { ...s.levels, ...levels }, log: [...log, ...s.log].slice(0, 200) };
  });
}

export type StockState = "in" | "low" | "out";
export function stockState(level: number, threshold: number): StockState {
  return level <= 0 ? "out" : level <= threshold ? "low" : "in";
}

/* ---------- products ---------- */
export const PHOTO_LIST: PhotoRef[] = Object.values(PHOTOS);
const PHOTO_BY_ID = new Map(PHOTO_LIST.map((p) => [p.id, p]));
export const photoById = (id: string): PhotoRef => PHOTO_BY_ID.get(id) ?? { id, alt: "" };

export function toDraft(p: Product): ProductDraft {
  return {
    slug: p.slug,
    wood: p.wood,
    name: p.name,
    category: p.category,
    optionName: p.options?.name ?? "",
    options: optionsOf(p).map((o) => ({ id: o.id, label: o.label, price: o.price, stock: BASE_STOCK.levels[stockKey(p.slug, o.id)] ?? 0 })),
    photos: p.shots.map((s) => ({ id: s.photo.id, tone: s.tone })),
    short: p.short,
    story: p.story.join("\n\n"),
    details: p.details.map((d) => ({ ...d })),
    care: p.care,
    badge: p.badge ?? "",
    editionSize: p.edition?.size ?? null,
    editionLeft: p.edition?.left ?? null,
    featured: !!p.featured,
    status: "active",
    seoTitle: `${p.name} · Santalum Maison`,
    seoDescription: p.short,
  };
}

export function blankDraft(wood: Wood = "red"): ProductDraft {
  return {
    slug: "",
    wood,
    name: "",
    category: wood === "red" ? "beads" : "oil",
    optionName: "",
    options: [{ id: "standard", label: "Standard", price: 0, stock: 0 }],
    photos: [],
    short: "",
    story: "",
    details: [{ label: "", value: "" }],
    care: wood === "red" ? PRODUCTS[0].care : PRODUCTS.find((p) => p.wood === "white")!.care,
    badge: "New",
    editionSize: null,
    editionLeft: null,
    featured: false,
    status: "draft",
    seoTitle: "",
    seoDescription: "",
  };
}

export type ProductRow = ProductDraft & {
  custom: boolean;
  edited: boolean;
  stockTotal: number;
  stock: StockState;
  priceMin: number;
  priceMax: number;
  rating: { avg: number; count: number };
};

export function useProducts(): ProductRow[] {
  const ps = productStore.use();
  const stock = useStock();
  const reviews = useReviews();
  return useMemo(() => {
    const ratings = new Map<string, { sum: number; count: number }>();
    for (const r of reviews.reviews) {
      if (r.state !== "published") continue;
      const x = ratings.get(r.slug) ?? { sum: 0, count: 0 };
      x.sum += r.rating;
      x.count++;
      ratings.set(r.slug, x);
    }
    const drafts = [...PRODUCTS.map((p) => ps.edits[p.slug] ?? toDraft(p)), ...Object.values(ps.created)];
    return drafts.map((d) => {
      const options = d.options.map((o) => ({ ...o, stock: stock.levels[stockKey(d.slug, o.id)] ?? o.stock }));
      const states = options.map((o) => stockState(o.stock, stock.thresholds[stockKey(d.slug, o.id)] ?? 5));
      const prices = options.map((o) => o.price);
      const r = ratings.get(d.slug);
      return {
        ...d,
        options,
        custom: !!ps.created[d.slug],
        edited: !!ps.edits[d.slug],
        stockTotal: options.reduce((s, o) => s + o.stock, 0),
        stock: states.includes("out") && states.every((s) => s === "out") ? "out" : states.some((s) => s !== "in") ? "low" : "in",
        priceMin: Math.min(...prices),
        priceMax: Math.max(...prices),
        rating: r ? { avg: Math.round((r.sum / r.count) * 10) / 10, count: r.count } : { avg: 0, count: 0 },
      } satisfies ProductRow;
    });
  }, [ps, stock, reviews]);
}

export function saveProduct(d: ProductDraft, isNew: boolean) {
  const clean: ProductDraft = { ...d, updatedAt: Date.now() };
  productStore.set((s) =>
    isNew || s.created[d.slug] ? { ...s, created: { ...s.created, [d.slug]: clean } } : { ...s, edits: { ...s.edits, [d.slug]: clean } },
  );
  setLevels(Object.fromEntries(d.options.map((o) => [stockKey(d.slug, o.id), o.stock])), isNew ? "Opening stock" : "Edited in the product editor");
}
export function setProductStatus(slugs: string[], status: ProductStatus, rows: ProductRow[]) {
  productStore.set((s) => {
    const next = { edits: { ...s.edits }, created: { ...s.created } };
    for (const slug of slugs) {
      const row = rows.find((r) => r.slug === slug);
      if (!row) continue;
      const d: ProductDraft = { ...row, status, updatedAt: Date.now() };
      if (row.custom) next.created[slug] = d;
      else next.edits[slug] = d;
    }
    return next;
  });
}
export function revertProduct(slug: string) {
  productStore.set((s) => {
    const edits = { ...s.edits };
    delete edits[slug];
    return { ...s, edits };
  });
}
export function deleteCreated(slug: string) {
  productStore.set((s) => {
    const created = { ...s.created };
    delete created[slug];
    return { ...s, created };
  });
}

/* ---------- reviews ---------- */
export type AdminReview = Review & {
  state: ModerationState;
  featured: boolean;
  reply?: { body: string; at: number; edited: boolean };
  source: "seed" | "mock" | "customer";
};
export type AdminQuestion = Question & { answer?: { body: string; at: number }; source: "seed" | "mock" | "customer" };

const SEEDED = allSeededReviews();
const SEEDED_QUESTIONS = PRODUCTS.flatMap((p) => seededQuestions(p.slug));

export function useReviews() {
  const mock = useMock();
  const local = shopReviews.use();
  const admin = reviewStore.use();
  return useMemo(() => {
    const base: (Review & { initial: ModerationState; source: AdminReview["source"] })[] = [
      ...(local.reviews ?? []).map((r) => ({ ...r, initial: "pending" as const, source: "customer" as const })),
      ...mock.extraReviews.map((r) => ({ ...r, source: "mock" as const })),
      ...SEEDED.map((r) => ({ ...r, initial: "published" as const, source: "seed" as const })),
    ];
    const reviews: AdminReview[] = base
      .map(({ initial, ...r }) => {
        const own = admin.replies[r.id];
        const seeded = r.replies.find((x) => x.fromMaison);
        return {
          ...r,
          state: admin.status[r.id] ?? initial,
          featured: admin.featured.includes(r.id),
          reply: own ? { ...own, edited: true } : seeded ? { body: seeded.body, at: seeded.at, edited: false } : undefined,
        };
      })
      .sort((a, b) => b.at - a.at);
    const questions: AdminQuestion[] = [
      ...(local.questions ?? []).map((q) => ({ ...q, source: "customer" as const })),
      ...mock.openQuestions.map((q) => ({ ...q, source: "mock" as const })),
      ...SEEDED_QUESTIONS.map((q) => ({ ...q, source: "seed" as const })),
    ]
      .map((q) => {
        const own = admin.answers[q.id];
        const seeded = q.answers.find((a) => a.fromMaison);
        return { ...q, answer: own ?? (seeded ? { body: seeded.body, at: seeded.at } : undefined) };
      })
      .sort((a, b) => b.at - a.at);
    return { reviews, questions };
  }, [mock, local, admin]);
}

export const reviewActions = {
  setState(ids: string[], state: ModerationState) {
    reviewStore.set((s) => ({ ...s, status: { ...s.status, ...Object.fromEntries(ids.map((id) => [id, state])) } }));
  },
  reply(id: string, body: string) {
    reviewStore.set((s) => ({ ...s, replies: { ...s.replies, [id]: { body, at: Date.now() } } }));
  },
  toggleFeatured(id: string) {
    reviewStore.set((s) => ({ ...s, featured: s.featured.includes(id) ? s.featured.filter((x) => x !== id) : [...s.featured, id] }));
  },
  answer(id: string, body: string) {
    reviewStore.set((s) => ({ ...s, answers: { ...s.answers, [id]: { body, at: Date.now() } } }));
  },
};

/* ---------- coupons ---------- */
export function useCoupons(): AdminCoupon[] {
  return couponStore.use() ?? DEFAULT_COUPONS;
}
export function saveCoupon(c: AdminCoupon, original?: string) {
  couponStore.set((list) => {
    const cur = list ?? DEFAULT_COUPONS;
    return original ? cur.map((x) => (x.code === original ? c : x)) : [c, ...cur];
  });
}
export function deleteCoupon(code: string) {
  couponStore.set((list) => (list ?? DEFAULT_COUPONS).filter((x) => x.code !== code));
}
export function couponState(c: AdminCoupon, used: number, now: number): "active" | "off" | "expired" | "used-up" {
  if (!c.active) return "off";
  if (c.expires && new Date(c.expires + "T23:59:59").getTime() < now) return "expired";
  if (c.limit && used >= c.limit) return "used-up";
  return "active";
}

/* ---------- content ---------- */
export function contentDefaults(wood: Wood): ContentDraft {
  return defaultContent(CONTENT[wood], featured(wood, 8).map((p) => p.slug));
}
export function useContent(wood: Wood): ContentDraft {
  const all = contentStore.use();
  return useMemo(() => all[wood] ?? contentDefaults(wood), [all, wood]);
}
export function useContentEdited(wood: Wood) {
  return !!contentStore.use()[wood];
}
export function saveContent(wood: Wood, d: ContentDraft) {
  contentStore.set((all) => ({ ...all, [wood]: d }));
}
export function resetContent(wood: Wood) {
  contentStore.set((all) => {
    const next = { ...all };
    delete next[wood];
    return next;
  });
}

/* ---------- settings ---------- */
export function useSettings(): Settings {
  const s = settingsStore.use();
  return useMemo(() => ({ ...DEFAULT_SETTINGS, ...s }), [s]);
}
export function saveSettings<K extends keyof Settings>(key: K, value: Settings[K]) {
  settingsStore.set((s) => ({ ...s, [key]: value }));
}

/** Clears every santalum-admin-* key (Settings → Reset preview data). */
export function resetAdminData() {
  for (const k of Object.keys(localStorage)) if (k.startsWith("santalum-admin-") && k !== "santalum-admin-session") localStorage.removeItem(k);
  window.location.reload();
}
