import { useMemo, useSyncExternalStore } from "react";
import { getUser, useUser, type Address } from "./account";
import { bag, bagSummary, DELIVERY, type BagLine, type DeliveryId } from "./bag";
import { createStore } from "./store";
import type { Wood } from "./products";

/**
 * Orders and tracking.
 *
 * PREVIEW ONLY: orders are saved in this browser and the tracking steps advance on a short
 * demo clock (a few minutes per step) so the tracker can be seen working. When the backend and a
 * courier integration exist, replace placeOrder / findOrder / trackingFor with API calls.
 */

export type PaymentId = "upi" | "card" | "netbanking" | "cod";
export const PAYMENTS: { id: PaymentId; label: string; note: string }[] = [
  { id: "upi", label: "UPI", note: "Any UPI app" },
  { id: "card", label: "Card", note: "Credit or debit" },
  { id: "netbanking", label: "Net banking", note: "All major banks" },
  { id: "cod", label: "Pay on delivery", note: "Orders under ₹10,000" },
];

export type OrderLine = { slug: string; name: string; wood: Wood; option?: string; optionLabel?: string; qty: number; unitPrice: number; photoId: string; note?: string };

export type Order = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  placedAt: number;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  address: Omit<Address, "id" | "isDefault">;
  delivery: DeliveryId;
  payment: PaymentId;
  giftNote?: string;
  coupon?: string;
  discount?: number;
  /** Set when the customer cancels (before shipping) or asks for a return (after delivery). */
  status?: "cancelled" | "return-requested";
  returnReason?: string;
  /** Courier and AWB appear once the order ships. */
  courier: { name: string; awb: string };
};

const orders = createStore<Order[]>("santalum-orders", [], (r) => (Array.isArray(r) ? (r as Order[]) : []));

/* ---------- tracking ---------- */
export type StageKey = "placed" | "confirmed" | "packed" | "shipped" | "out" | "delivered";
export const STAGES: { key: StageKey; label: string; detail: string; minutes: number }[] = [
  { key: "placed", label: "Order placed", detail: "We have your order and your payment details.", minutes: 0 },
  { key: "confirmed", label: "Confirmed", detail: "The workshop has checked every piece against its batch record.", minutes: 2 },
  { key: "packed", label: "Packed", detail: "Wrapped in linen, boxed, sealed, with the records inside.", minutes: 6 },
  { key: "shipped", label: "Shipped", detail: "Handed to the courier, insured to the full value.", minutes: 12 },
  { key: "out", label: "Out for delivery", detail: "With the delivery partner in your city today.", minutes: 20 },
  { key: "delivered", label: "Delivered", detail: "Signed for at the address on the order.", minutes: 30 },
];

export type Tracking = {
  current: number; // index into STAGES
  stages: { key: StageKey; label: string; detail: string; at: number; done: boolean; current: boolean }[];
  /** Real calendar estimate shown to customers (working days). */
  estimate: { from: number; to: number };
  delivered: boolean;
};

const MIN = 60_000;
const DAY = 86_400_000;

export function trackingFor(order: Order, now: number): Tracking {
  const elapsed = (now - order.placedAt) / MIN;
  let current = 0;
  STAGES.forEach((s, i) => {
    if (elapsed >= s.minutes) current = i;
  });
  const days = order.delivery === "express" ? [1, 2] : [3, 5];
  return {
    current,
    stages: STAGES.map((s, i) => ({ key: s.key, label: s.label, detail: s.detail, at: order.placedAt + s.minutes * MIN, done: i <= current, current: i === current })),
    estimate: { from: order.placedAt + days[0] * DAY, to: order.placedAt + days[1] * DAY },
    delivered: current === STAGES.length - 1,
  };
}

/** A clock that ticks on the client so trackers update without a reload. `null` until hydrated. */
export function useNow(intervalMs = 15_000): number | null {
  return useSyncExternalStore(
    (cb) => {
      const t = window.setInterval(cb, intervalMs);
      return () => window.clearInterval(t);
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => null,
  );
}

/* ---------- placing an order ---------- */
function orderId() {
  const d = new Date();
  const a = new Uint16Array(1);
  crypto.getRandomValues(a);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `SM-${yy}${mm}-${String(a[0] % 10000).padStart(4, "0")}`;
}

export type PlaceOrderInput = {
  lines: BagLine[];
  address: Omit<Address, "id" | "isDefault">;
  delivery: DeliveryId;
  payment: PaymentId;
  giftNote?: string;
  coupon?: string;
};

export type PlaceResult = { ok: true; order: Order } | { ok: false; error: string };

/** Requires a signed-in customer. Saves the order, empties the bag and returns the order. */
export function placeOrder(input: PlaceOrderInput): PlaceResult {
  const user = getUser();
  if (!user) return { ok: false, error: "Please sign in to place your order." };
  const sum = bagSummary(input.lines, input.delivery);
  if (!sum.count) return { ok: false, error: "Your bag is empty." };
  const promo = input.coupon ? applyCoupon(input.coupon, sum.subtotal) : null;
  if (promo && !promo.ok) return { ok: false, error: promo.error };
  const discount = promo && promo.ok ? promo.discount : 0;
  if (input.payment === "cod" && sum.total - discount >= 10000) return { ok: false, error: "Pay on delivery is available for orders under ₹10,000." };
  const order: Order = {
    id: orderId(),
    userId: user.id,
    name: input.address.name || user.name,
    email: user.email,
    phone: input.address.phone || user.phone,
    placedAt: Date.now(),
    lines: sum.items.map((i) => ({
      slug: i.slug,
      name: i.product.name,
      wood: i.product.wood,
      option: i.option,
      optionLabel: i.optionValue?.label,
      qty: i.qty,
      unitPrice: i.unitPrice,
      photoId: i.product.shots[0].photo.id,
      ...(i.note ? { note: i.note } : {}),
    })),
    subtotal: sum.subtotal,
    shipping: DELIVERY[input.delivery].price,
    total: sum.total - discount,
    ...(discount ? { coupon: input.coupon!.trim().toUpperCase(), discount } : {}),
    address: input.address,
    delivery: input.delivery,
    payment: input.payment,
    ...(input.giftNote ? { giftNote: input.giftNote } : {}),
    courier: { name: input.delivery === "express" ? "Blue Dart" : "Delhivery", awb: String(Math.floor(1e10 + Math.random() * 9e10)) },
  };
  orders.set((all) => [order, ...all]);
  bag.clear();
  return { ok: true, order };
}

/** The signed-in customer's orders, newest first. */
export function useOrders(): Order[] {
  const user = useUser();
  const all = orders.use();
  return useMemo(() => (user ? all.filter((o) => o.userId === user.id) : []), [user, all]);
}

/** Look up one order of the signed-in customer. */
export function useOrder(id: string | null | undefined): Order | undefined {
  const mine = useOrders();
  return id ? mine.find((o) => o.id === id.trim().toUpperCase()) : undefined;
}

/**
 * Public tracking: order number plus the email or phone on the order.
 * The example order always resolves, so the tracker can be tried without buying anything.
 */
export function findOrder(id: string, emailOrPhone: string): Order | undefined {
  const key = id.trim().toUpperCase();
  const contact = emailOrPhone.trim().toLowerCase().replace(/\s/g, "");
  if (key === EXAMPLE.id && (contact === EXAMPLE.email || contact === EXAMPLE.phone)) return exampleOrder();
  return orders.get().find((o) => o.id === key && (o.email === contact || o.phone.replace(/\D/g, "").endsWith(contact.replace(/\D/g, "")) && contact.replace(/\D/g, "").length >= 10));
}

/** Shown on every track page as "Try the example". */
export const EXAMPLE = { id: "SM-2611-0412", email: "guest@example.com", phone: "9876543210" };

function exampleOrder(): Order {
  // Always 13 minutes old, so it reads "Shipped" with the rest still to come.
  return {
    id: EXAMPLE.id,
    userId: "example",
    name: "A. Guest",
    email: EXAMPLE.email,
    phone: EXAMPLE.phone,
    placedAt: Date.now() - 13 * MIN,
    lines: [
      { slug: "r-japa-mala-108", name: "Japa Mala, 108 beads", wood: "red", option: "8-mm", optionLabel: "8 mm", qty: 1, unitPrice: 5600, photoId: "photo-1742219335029-951834824ed2" },
      { slug: "w-chandan-attar", name: "Chandan Attar", wood: "white", option: "6-ml", optionLabel: "6 ml", qty: 1, unitPrice: 4200, photoId: "photo-1695049999693-bf4f95cfae6e" },
    ],
    subtotal: 9800,
    shipping: 0,
    total: 9800,
    address: { label: "Home", name: "A. Guest", phone: EXAMPLE.phone, line1: "12, 4th Cross, Jayalakshmipuram", city: "Mysuru", state: "Karnataka", pin: "570012" },
    delivery: "standard",
    payment: "upi",
    courier: { name: "Delhivery", awb: "48120039175" },
  };
}

export function formatDate(ms: number, withTime = false) {
  return new Intl.DateTimeFormat("en-IN", withTime ? { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" } : { weekday: "short", day: "numeric", month: "short" }).format(ms);
}

/* ---------- coupons (mock codes until the backend exists) ---------- */
export const COUPONS: Record<string, { label: string; pct?: number; flat?: number; min?: number }> = {
  WELCOME10: { label: "10% off your first order", pct: 10 },
  CIRCLE500: { label: "₹500 off orders of ₹5,000 or more", flat: 500, min: 5000 },
  HEARTWOOD15: { label: "15% off orders of ₹15,000 or more", pct: 15, min: 15000 },
};

export type CouponResult = { ok: true; code: string; label: string; discount: number } | { ok: false; error: string };

export function applyCoupon(code: string, subtotal: number): CouponResult {
  const key = code.trim().toUpperCase();
  const c = COUPONS[key];
  if (!c) return { ok: false, error: "That code isn't valid." };
  if (c.min && subtotal < c.min) return { ok: false, error: `This code needs a bag of ₹${c.min.toLocaleString("en-IN")} or more.` };
  const discount = Math.round(c.pct ? (subtotal * c.pct) / 100 : (c.flat ?? 0));
  return { ok: true, code: key, label: c.label, discount };
}

/* ---------- after the order ---------- */
function patchOrder(id: string, fn: (o: Order) => Order) {
  orders.set((all) => all.map((o) => (o.id === id ? fn(o) : o)));
}

/** Allowed until the order ships. Returns an error message or null. */
export function cancelOrder(id: string, now: number): string | null {
  const o = orders.get().find((x) => x.id === id);
  if (!o) return "Order not found.";
  if (o.status) return "This order can no longer be changed.";
  if (trackingFor(o, now).current >= 3) return "This order has shipped. You can ask for a return once it arrives.";
  patchOrder(id, (x) => ({ ...x, status: "cancelled" }));
  return null;
}

/** Allowed within 14 days of delivery. */
export function requestReturn(id: string, reason: string, now: number): string | null {
  const o = orders.get().find((x) => x.id === id);
  if (!o) return "Order not found.";
  if (o.status) return "This order can no longer be changed.";
  if (!trackingFor(o, now).delivered) return "Returns open once the order is delivered.";
  if (!reason.trim()) return "Tell us briefly why, so we can help.";
  patchOrder(id, (x) => ({ ...x, status: "return-requested", returnReason: reason.trim() }));
  return null;
}

/** True when the customer can still cancel. */
export function canCancel(o: Order, now: number) {
  return !o.status && trackingFor(o, now).current < 3;
}
export function canReturn(o: Order, now: number) {
  return !o.status && trackingFor(o, now).delivered;
}
