import type { OrderLine, PaymentId } from "@/lib/shop/orders";
import { formatINR, PRODUCTS, productsFor, type CategoryId, type Product, type Wood } from "@/lib/shop/products";
import type { Review, Question } from "@/lib/shop/reviews-data";
import { hash, rng, type Rng } from "./prng";
import type { AdminCoupon, AdminCustomer, AdminOrder, AdminStatus, ContentDraft, PaymentState, Settings, TimelineEvent } from "./types";

/**
 * Deterministic preview data for the admin. Every list is drawn from one seeded stream, so the same
 * orders, customers and stock appear on every load. Timestamps are placed relative to `now`
 * (floored to the hour by the caller), which keeps the last 90 days filled whatever the date.
 */

export const MIN = 60_000;
export const HOUR = 3_600_000;
export const DAY = 86_400_000;

const FIRST = [
  "Aarav", "Ananya", "Vikram", "Meera", "Arjun", "Kavya", "Rohan", "Ishita", "Siddharth", "Lakshmi", "Karthik", "Nandini", "Aditya", "Priya",
  "Rahul", "Divya", "Harish", "Sneha", "Varun", "Pooja", "Nikhil", "Shreya", "Manish", "Radhika", "Suresh", "Gayatri", "Abhishek", "Tanvi",
  "Pranav", "Aparna", "Deepak", "Revathi", "Kiran", "Smita", "Rajesh", "Neha", "Akash", "Bhavana", "Sanjay", "Farah", "Imran", "Zoya",
  "Joseph", "Anita", "Gurpreet", "Simran",
];
const LAST = [
  "Rao", "Sharma", "Iyer", "Nair", "Menon", "Reddy", "Kulkarni", "Hegde", "Shetty", "Gowda", "Patil", "Desai", "Mehta", "Shah", "Kapoor",
  "Malhotra", "Banerjee", "Chatterjee", "Das", "Pillai", "Krishnan", "Bhat", "Joshi", "Agarwal", "Khan", "Fernandes", "D'Souza", "Singh",
  "Verma", "Mukherjee",
];

const CITIES = [
  { city: "Bengaluru", state: "Karnataka", pin: 560001, areas: ["Indiranagar", "Jayanagar 4th Block", "Koramangala 5th Block", "Malleshwaram", "Basavanagudi", "HSR Layout", "Sadashivanagar"], w: 16 },
  { city: "Mysuru", state: "Karnataka", pin: 570001, areas: ["Jayalakshmipuram", "Gokulam 3rd Stage", "Kuvempunagar", "VV Mohalla"], w: 6 },
  { city: "Mumbai", state: "Maharashtra", pin: 400001, areas: ["Bandra West", "Juhu", "Colaba", "Powai", "Dadar West"], w: 10 },
  { city: "Pune", state: "Maharashtra", pin: 411001, areas: ["Koregaon Park", "Kothrud", "Baner", "Aundh"], w: 5 },
  { city: "New Delhi", state: "Delhi", pin: 110001, areas: ["Defence Colony", "Vasant Vihar", "Hauz Khas", "Greater Kailash I"], w: 8 },
  { city: "Gurugram", state: "Haryana", pin: 122001, areas: ["DLF Phase 2", "Sector 56", "Golf Course Road"], w: 3 },
  { city: "Chennai", state: "Tamil Nadu", pin: 600001, areas: ["Mylapore", "Adyar", "T. Nagar", "Besant Nagar"], w: 7 },
  { city: "Hyderabad", state: "Telangana", pin: 500001, areas: ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Begumpet"], w: 7 },
  { city: "Kochi", state: "Kerala", pin: 682001, areas: ["Panampilly Nagar", "Kadavanthra", "Fort Kochi"], w: 3 },
  { city: "Kolkata", state: "West Bengal", pin: 700001, areas: ["Ballygunge", "Salt Lake Sector V", "Alipore"], w: 4 },
  { city: "Ahmedabad", state: "Gujarat", pin: 380001, areas: ["Navrangpura", "Satellite", "Bodakdev"], w: 3 },
  { city: "Jaipur", state: "Rajasthan", pin: 302001, areas: ["C-Scheme", "Malviya Nagar", "Vaishali Nagar"], w: 2 },
  { city: "Mangaluru", state: "Karnataka", pin: 575001, areas: ["Kadri", "Bejai", "Kodialbail"], w: 2 },
  { city: "Coimbatore", state: "Tamil Nadu", pin: 641001, areas: ["RS Puram", "Race Course", "Saibaba Colony"], w: 2 },
  { city: "Panaji", state: "Goa", pin: 403001, areas: ["Altinho", "Miramar", "Dona Paula"], w: 2 },
] as const;
const ROADS = ["2nd Cross", "4th Main", "12th Cross", "1st Main", "Temple Road", "Lake View Road", "Church Street", "Ring Road", "Park Lane", "Station Road"];

const COMPANIES = [
  { name: "Kaveri Hospitality", domain: "kaverihospitality.in" },
  { name: "Northbridge Advisory", domain: "northbridge.co.in" },
  { name: "Mandara Weddings", domain: "mandara.in" },
  { name: "Tulsi Hotels", domain: "tulsihotels.com" },
];

const CANCEL_REASONS = ["Customer changed the delivery city", "Ordered the wrong bead size", "Payment reversed by the bank", "Duplicate order"];
const RETURN_REASONS = ["Bead size smaller than expected", "Received two of the same gift", "Scent quieter than I hoped", "Colour lighter than the photos", "Clasp loosened within a week"];
const GIFT_NOTES = ["For Amma, on her sixtieth.", "Happy anniversary. Same wood as our first home.", "With thanks from all of us.", "For the new office. All the best.", "Shubh Deepavali!"];
const PAY_WORD: Record<PaymentId, string> = { upi: "UPI", card: "card", netbanking: "net banking", cod: "cash on delivery" };
export const STAFF_NAMES = ["Lakshmi V.", "Arjun R.", "Farah K."];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z]+/g, "");
}

function startOfDay(ms: number) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/* ---------- customers ---------- */
function makeCustomers(R: Rng, now: number): AdminCustomer[] {
  const out: AdminCustomer[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 60; i++) {
    let first = R.pick(FIRST);
    let last = R.pick(LAST);
    while (used.has(first + last)) {
      first = R.pick(FIRST);
      last = R.pick(LAST);
    }
    used.add(first + last);
    const corp = [3, 17, 29, 44].indexOf(i);
    const place = R.weighted(CITIES.map((c) => [c, c.w] as const));
    const email =
      corp >= 0
        ? `${slugify(first)}.${slugify(last)}@${COMPANIES[corp].domain}`
        : `${slugify(first)}${R.chance(0.5) ? "." : ""}${slugify(last)}${R.chance(0.3) ? R.int(7, 99) : ""}@${R.weighted([["gmail.com", 7], ["outlook.com", 2], ["yahoo.co.in", 1]] as const)}`;
    const phone = `${R.pick(["9", "8", "7"])}${String(R.int(100000000, 999999999))}`;
    const name = `${first} ${last}`;
    const addr = (label: string, p: (typeof CITIES)[number]) => ({
      id: `a${i}-${label.toLowerCase()}`,
      label,
      name,
      phone,
      line1: `${R.int(1, 240)}, ${R.pick(ROADS)}, ${R.pick(p.areas)}`,
      line2: R.chance(0.3) ? `Near ${R.pick(["the post office", "Ganesha temple", "the park", "City Hospital"])}` : undefined,
      city: p.city,
      state: p.state,
      pin: String(p.pin + R.int(1, 98)),
    });
    const addresses = [{ ...addr(corp >= 0 ? "Office" : "Home", place), isDefault: true }];
    if (R.chance(0.25)) addresses.push({ ...addr(corp >= 0 ? "Warehouse" : R.pick(["Office", "Parents"]), R.chance(0.6) ? place : R.weighted(CITIES.map((c) => [c, c.w] as const))), isDefault: false });
    const tags: string[] = [];
    if (corp >= 0) tags.push("Corporate");
    const circle = R.chance(0.35);
    if (circle) tags.push("Circle");
    out.push({
      id: `C-${1001 + i}`,
      source: "mock",
      name,
      email,
      phone,
      city: place.city,
      state: place.state,
      createdAt: now - R.int(10, 420) * DAY - R.int(0, 23) * HOUR,
      addresses,
      tags,
      newsletter: circle || R.chance(0.3),
      wishlist: [],
    });
  }
  return out;
}

/* ---------- orders ---------- */
function pickProduct(R: Rng, wood: Wood, exclude: Set<string>, category?: CategoryId[]): Product {
  const pool = productsFor(wood).filter((p) => !exclude.has(p.slug) && (!category || category.includes(p.category)));
  return R.weighted(pool.map((p) => [p, p.featured ? 3 : 1] as const));
}

function makeOrders(R: Rng, now: number, customers: AdminCustomer[]): AdminOrder[] {
  // 1. when and who, then sort so "first order" means first in time
  const seeds = Array.from({ length: 120 }, () => {
    const d = R.chance(0.55) ? Math.floor(90 * (1 - Math.sqrt(R.next()))) : R.int(0, 89);
    const placedAt = now - d * DAY - R.int(0, 22) * HOUR - R.int(1, 59) * MIN;
    const customer = R.chance(0.55) ? customers[R.int(0, 21)] : customers[R.int(0, customers.length - 1)];
    return { placedAt, customer };
  }).sort((a, b) => a.placedAt - b.placedAt);

  const seen = new Set<string>();
  const ids = new Set<string>();
  let corporateBulk = 0;
  const out: AdminOrder[] = [];

  for (const { placedAt, customer } of seeds) {
    const isFirst = !seen.has(customer.id);
    seen.add(customer.id);

    // lines
    const lines: OrderLine[] = [];
    const taken = new Set<string>();
    const wood: Wood = R.chance(0.56) ? "red" : "white";
    const corporate = customer.tags.includes("Corporate");
    if (corporate && corporateBulk < 4 && R.chance(0.7)) {
      corporateBulk++;
      const p = pickProduct(R, wood, taken, wood === "red" ? ["gifting", "objects"] : ["w-gifting", "incense"]);
      const opt = p.options?.values[0];
      lines.push(line(p, opt?.id, opt?.label, R.int(6, 24), opt?.price ?? p.price));
    } else {
      const n = R.weighted([[1, 60], [2, 30], [3, 10]] as const);
      for (let k = 0; k < n; k++) {
        const w: Wood = k > 0 && R.chance(0.3) ? (wood === "red" ? "white" : "red") : wood;
        const p = pickProduct(R, w, taken);
        taken.add(p.slug);
        const opt = p.options ? R.weighted(p.options.values.map((v, j) => [v, j === 0 ? 3 : j === 1 ? 2 : 1] as const)) : undefined;
        lines.push(line(p, opt?.id, opt?.label, R.weighted([[1, 86], [2, 12], [3, 2]] as const), opt?.price ?? p.price));
      }
    }
    const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);

    // coupon
    let coupon: string | undefined;
    let discount = 0;
    const daysAgo = (now - placedAt) / DAY;
    if (isFirst && R.chance(0.3)) [coupon, discount] = ["WELCOME10", Math.round(subtotal * 0.1)];
    else if (subtotal >= 15000 && R.chance(0.25)) [coupon, discount] = ["HEARTWOOD15", Math.round(subtotal * 0.15)];
    else if (subtotal >= 5000 && R.chance(0.16)) [coupon, discount] = ["CIRCLE500", 500];
    else if (daysAgo > 12 && daysAgo < 45 && subtotal >= 8000 && R.chance(0.3)) [coupon, discount] = ["FESTIVE12", Math.round(subtotal * 0.12)];

    const delivery = R.chance(0.18) ? "express" : "standard";
    const shipping = delivery === "express" ? 350 : 0;
    const total = subtotal - discount + shipping;
    const payment: PaymentId = total < 10000 && R.chance(0.2) ? "cod" : R.weighted([["upi", 48], ["card", 34], ["netbanking", 18]] as const);

    // the status this order has reached by now
    const h = (now - placedAt) / HOUR;
    let target: AdminStatus;
    if (h < 18) target = R.chance(0.7) ? "new" : "confirmed";
    else if (h < 48) target = R.weighted([["new", 10], ["confirmed", 45], ["packed", 45]] as const);
    else if (h < 96) target = R.weighted([["confirmed", 15], ["packed", 35], ["shipped", 50]] as const);
    else if (h < 24 * 7) target = R.weighted([["packed", 5], ["shipped", 50], ["delivered", 45]] as const);
    else if (h < 24 * 10) target = R.weighted([["shipped", 15], ["delivered", 85]] as const);
    else target = R.weighted([["delivered", 89], ["cancelled", 4], ["return-requested", 2.5], ["returned", 4.5]] as const);
    if (h > 6 && h < 24 * 8 && R.chance(0.04)) target = "cancelled";
    if (target === "return-requested" && h > 24 * 24) target = "returned";

    const courierName = delivery === "express" ? "Blue Dart" : R.weighted([["Delhivery", 70], ["DTDC", 20], ["India Post", 10]] as const);
    const awb = String(R.int(1000000000, 9999999999)) + R.int(0, 9);
    const by = () => R.pick(STAFF_NAMES);

    // timeline
    const cap = now - 5 * MIN;
    let t = placedAt;
    const tl: TimelineEvent[] = [{ at: placedAt, kind: "placed", text: payment === "cod" ? "Placed on the shop, to pay on delivery" : `Placed on the shop, paid by ${PAY_WORD[payment]}` }];
    const step = (kind: TimelineEvent["kind"], text: string, minH: number, maxH: number, who?: string) => {
      t = Math.min(t + R.int(minH * 60, maxH * 60) * MIN, cap);
      tl.push({ at: t, kind, text, by: who });
    };
    const flow: AdminStatus[] = ["new", "confirmed", "packed", "shipped", "delivered"];
    const reach = flow.includes(target) ? flow.indexOf(target) : target === "cancelled" ? R.int(0, 1) : 4;
    if (reach >= 1) step("confirmed", payment === "cod" ? "Confirmed with the customer by phone" : "Payment verified, pieces matched to batch records", 1, 8, by());
    if (reach >= 2) step("packed", "Packed in linen with the batch records", 4, 26, by());
    if (reach >= 3) step("shipped", `Handed to ${courierName}, AWB ${awb}`, 3, 20, by());
    if (reach >= 4) step("delivered", payment === "cod" ? `Delivered, ${formatINR(total)} collected` : "Delivered, signed for at the address", delivery === "express" ? 18 : 40, delivery === "express" ? 40 : 100);

    let paymentState: PaymentState = payment === "cod" ? (reach >= 4 ? "cod-collected" : "cod-pending") : "paid";
    let refunded = 0;
    let cancelReason: string | undefined;
    let returnReason: string | undefined;
    if (target === "cancelled") {
      cancelReason = R.pick(CANCEL_REASONS);
      step("cancelled", `Cancelled: ${cancelReason}`, 1, 20, by());
      if (payment !== "cod") {
        step("refund", `Refunded ${formatINR(total)} to the original payment method`, 4, 30, "Razorpay");
        paymentState = "refunded";
        refunded = total;
      }
    }
    if (target === "return-requested" || target === "returned") {
      returnReason = R.pick(RETURN_REASONS);
      step("return-requested", `Return requested: "${returnReason}"`, 40, 180);
      if (target === "returned") {
        step("returned", "Return approved, pickup arranged", 20, 60, by());
        const amount = lines.length > 1 && R.chance(0.5) ? lines[0].qty * lines[0].unitPrice : total;
        step("refund", `Refunded ${formatINR(amount)} to the original payment method`, 24, 72, "Razorpay");
        paymentState = amount < total ? "part-refunded" : "refunded";
        refunded = amount;
      }
    }

    const d = new Date(placedAt);
    let id: string;
    do id = `SM-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}-${R.int(1000, 9999)}`;
    while (ids.has(id));
    ids.add(id);

    const a = customer.addresses.find((x) => x.isDefault) ?? customer.addresses[0];
    const addr = { label: a.label, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pin: a.pin };
    out.push({
      id,
      source: "mock",
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      placedAt,
      lines,
      subtotal,
      shipping,
      discount,
      coupon,
      total,
      address: addr,
      delivery,
      payment,
      paymentState,
      paymentRef: payment === "cod" ? "Cash on delivery" : `pay_${base62(R, 14)}`,
      refunded,
      giftNote: R.chance(0.15) ? R.pick(GIFT_NOTES) : undefined,
      status: target,
      courier: reach >= 3 ? { name: courierName, awb } : undefined,
      timeline: tl,
      returnReason,
      cancelReason,
      woods: [...new Set(lines.map((l) => l.wood))],
    });
  }
  return out.reverse();
}

function line(p: Product, option: string | undefined, optionLabel: string | undefined, qty: number, unitPrice: number): OrderLine {
  return { slug: p.slug, name: p.name, wood: p.wood, option, optionLabel, qty, unitPrice, photoId: p.shots[0].photo.id };
}

function base62(R: Rng, n: number) {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < n; i++) s += A[R.int(0, 61)];
  return s;
}

/* ---------- traffic, for the conversion figure ---------- */
export type TrafficDay = { day: number; sessions: number };
function makeTraffic(R: Rng, now: number): TrafficDay[] {
  const out: TrafficDay[] = [];
  const today = startOfDay(now);
  for (let d = 179; d >= 0; d--) {
    const day = today - d * DAY;
    const dow = new Date(day).getDay();
    const growth = d > 89 ? 0 : (89 - d) * 0.55;
    const sessions = Math.max(30, Math.round(64 + growth + (dow === 0 || dow === 6 ? 18 : 0) + R.int(-12, 14)));
    out.push({ day, sessions });
  }
  return out;
}

/* ---------- stock ---------- */
export function optionsOf(p: Pick<Product, "options" | "price">) {
  return p.options?.values ?? [{ id: "standard", label: "Standard", price: p.price }];
}
export const stockKey = (slug: string, optionId: string) => `${slug}::${optionId}`;

export function baseStock(): { levels: Record<string, number>; thresholds: Record<string, number> } {
  const levels: Record<string, number> = {};
  const thresholds: Record<string, number> = {};
  for (const p of PRODUCTS) {
    for (const o of optionsOf(p)) {
      const key = stockKey(p.slug, o.id);
      const R = rng(hash(key));
      const r = R.next();
      levels[key] = p.edition ? p.edition.left : r < 0.08 ? 0 : r < 0.2 ? R.int(1, 4) : R.int(6, 30);
      thresholds[key] = p.edition ? 2 : 5;
    }
  }
  return { levels, thresholds };
}

export function skuOf(slug: string, optionId: string) {
  const [w, ...rest] = slug.split("-");
  const word = rest
    .filter((x) => !/^\d+$/.test(x))
    .slice(0, 2)
    .map((x) => x.slice(0, 4))
    .join("")
    .toUpperCase();
  return `${w.toUpperCase()}-${word}${optionId === "standard" ? "" : "-" + optionId.replace(/-/g, "").toUpperCase()}`;
}

/* ---------- reviews and questions waiting on the Maison ---------- */
const PENDING: { r: Review["rating"]; t: string; b: string; wood: Wood }[] = [
  { r: 5, t: "Exactly as described", b: "Arrived in two days to Bengaluru. The beads are heavier and darker than I expected, in a good way.", wood: "red" },
  { r: 4, t: "Lovely oil, small dropper", b: "The attar is beautiful and lasts all day. The dropper is a little fiddly; a roller would be easier.", wood: "white" },
  { r: 2, t: "Box was dented", b: "The piece itself is fine but the outer box arrived crushed at one corner. For a gift this mattered.", wood: "red" },
  { r: 5, t: "Second order, same quality", b: "Ordered again for my sister. Same depth of colour, same care in packing. Batch card included again.", wood: "red" },
  { r: 3, t: "Took a while to arrive", b: "Seven days to Guwahati. The product is good but please mention longer timelines for the north-east.", wood: "white" },
  { r: 5, t: "Wedding return gifts", b: "We ordered forty sets. Every one came with its card and the team helped with the note. Guests loved them.", wood: "white" },
  { r: 4, t: "Burns slowly, not harsh", b: "The sticks burn slowly and the smoke is soft. Would like a smaller trial pack before buying the large box.", wood: "white" },
  { r: 1, t: "Wrong size sent", b: "I ordered 8 mm and received 6 mm beads. Have raised a return, waiting to hear back.", wood: "red" },
  { r: 5, t: "The record convinced me", b: "I was unsure about buying red sandalwood online. The lot paperwork in the box settled it.", wood: "red" },
];
const HIDDEN: { r: Review["rating"]; t: string; b: string }[] = [
  { r: 5, t: "Best price", b: "Get the same mala for half the price, message me on WhatsApp for the link." },
  { r: 1, t: "All fake", b: "All sandalwood online is fake. Do not buy anything from anyone." },
];
const OPEN_QUESTIONS: { q: string; match: (p: Product) => boolean }[] = [
  { q: "Do you ship to Singapore? I would like to send this to my daughter.", match: (p) => p.featured === true && p.wood === "red" },
  { q: "Is the 8 mm size comfortable for a child's wrist?", match: (p) => p.category === "beads" },
  { q: "Can the attar go on skin directly, or should it be diluted first?", match: (p) => p.category === "oil" },
  { q: "Can you engrave initials on this?", match: (p) => p.category === "objects" },
  { q: "If I add a gift note, is the box wrapped as well?", match: (p) => p.category === "w-gifting" },
  { q: "Is this powder suitable for abhishekam at home?", match: (p) => p.category === "skin" || p.category === "powder" },
  { q: "How do I check the CITES paperwork that comes with it?", match: (p) => p.category === "jewellery" },
];

export type ExtraReview = Review & { initial: "pending" | "hidden" };

function makeReviews(R: Rng, now: number) {
  const names = ["Ritu S.", "Mohan K.", "Asha P.", "Dev N.", "Leela R.", "Tarun B.", "Sunita G.", "Vivek M.", "Hema J.", "Omkar D.", "Rekha A."];
  const cities = ["Bengaluru", "Pune", "Guwahati", "Chennai", "Mumbai", "Mysuru", "Hyderabad", "Kochi"];
  const reviews: ExtraReview[] = [];
  PENDING.forEach((x, i) => {
    const p = R.pick(productsFor(x.wood));
    reviews.push({ id: `mock-p${i}`, slug: p.slug, author: R.pick(names), city: R.pick(cities), rating: x.r, title: x.t, body: x.b, at: now - R.int(2, 12 * 24) * HOUR, verified: R.chance(0.8), helpful: 0, replies: [], initial: "pending" });
  });
  HIDDEN.forEach((x, i) => {
    const p = R.pick(PRODUCTS);
    reviews.push({ id: `mock-h${i}`, slug: p.slug, author: R.pick(names), city: R.pick(cities), rating: x.r, title: x.t, body: x.b, at: now - R.int(3, 30) * DAY, verified: false, helpful: 0, replies: [], initial: "hidden" });
  });
  const questions: Question[] = OPEN_QUESTIONS.map((x, i) => {
    const p = PRODUCTS.find(x.match) ?? PRODUCTS[i];
    return { id: `mock-q${i}`, slug: p.slug, author: R.pick(names), body: x.q, at: now - R.int(4, 20 * 24) * HOUR, answers: [] };
  });
  return { reviews, questions };
}

/* ---------- everything, memoised per hour ---------- */
export type Mock = {
  now: number;
  customers: AdminCustomer[];
  orders: AdminOrder[];
  traffic: TrafficDay[];
  extraReviews: ExtraReview[];
  openQuestions: Question[];
};

let memo: Mock | null = null;
export function buildMock(now: number): Mock {
  if (memo && memo.now === now) return memo;
  const R = rng(20261125);
  const customers = makeCustomers(R, now);
  const orders = makeOrders(R, now, customers);
  // nobody signs up after their first order
  for (const c of customers) {
    const first = orders.reduce((m, o) => (o.customerId === c.id ? Math.min(m, o.placedAt) : m), Infinity);
    if (first < c.createdAt) c.createdAt = first - R.int(1, 30) * HOUR;
  }
  const traffic = makeTraffic(R, now);
  const { reviews, questions } = makeReviews(R, now);
  memo = { now, customers, orders, traffic, extraReviews: reviews, openQuestions: questions };
  return memo;
}

/* ---------- defaults for things the admin edits ---------- */
export const DEFAULT_COUPONS: AdminCoupon[] = [
  { code: "WELCOME10", label: "10% off your first order", kind: "pct", value: 10, min: null, limit: null, expires: null, active: true },
  { code: "CIRCLE500", label: "₹500 off orders of ₹5,000 or more", kind: "flat", value: 500, min: 5000, limit: null, expires: null, active: true },
  { code: "HEARTWOOD15", label: "15% off orders of ₹15,000 or more", kind: "pct", value: 15, min: 15000, limit: 200, expires: "2027-03-31", active: true },
  { code: "FESTIVE12", label: "Deepavali: 12% off orders of ₹8,000 or more", kind: "pct", value: 12, min: 8000, limit: 150, expires: "2026-11-15", active: true },
  { code: "CORPORATE20", label: "Corporate gifting, 20 pieces or more", kind: "pct", value: 20, min: 50000, limit: 10, expires: "2027-06-30", active: true },
  { code: "MYSURU1000", label: "₹1,000 off at the Mysuru pop-up", kind: "flat", value: 1000, min: 12000, limit: 50, expires: "2027-01-31", active: false },
];

/** HSN code and GST rate by category (placeholders; confirm with the accountant before launch). */
export const GST_BY_CATEGORY: Record<CategoryId, { hsn: string; rate: number; label: string }> = {
  beads: { hsn: "4420", rate: 12, label: "Wooden articles" },
  objects: { hsn: "4420", rate: 12, label: "Wooden articles" },
  powder: { hsn: "1211", rate: 5, label: "Plant parts, powdered" },
  gifting: { hsn: "4420", rate: 12, label: "Wooden articles" },
  jewellery: { hsn: "7117", rate: 3, label: "Imitation jewellery" },
  oil: { hsn: "3301", rate: 18, label: "Essential oils" },
  incense: { hsn: "3307", rate: 5, label: "Agarbatti and dhoop" },
  skin: { hsn: "3304", rate: 18, label: "Beauty preparations" },
  "w-beads": { hsn: "4420", rate: 12, label: "Wooden articles" },
  carvings: { hsn: "4420", rate: 12, label: "Wooden articles" },
  "w-gifting": { hsn: "4420", rate: 12, label: "Wooden articles" },
};

export const DEFAULT_SETTINGS: Settings = {
  store: {
    name: "Santalum Maison",
    legalName: "Santalum Maison Private Limited",
    gstin: "29AAKCS4127M1Z3",
    pan: "AAKCS4127M",
    email: "care@santalum.in",
    phone: "+91 80 4718 2200",
    address: "18 Sayyaji Rao Road, 1st Floor",
    city: "Mysuru",
    state: "Karnataka",
    pin: "570001",
    invoicePrefix: "SMI/26-27/",
    gstRate: 12,
    pricesIncludeGst: true,
    hsnRed: "4420",
    hsnWhite: "3301",
  },
  shipping: { standardFree: true, standardPrice: 0, expressPrice: 350, codLimit: 10000, codFee: 0, processingDays: 1, insured: true },
  payments: { provider: "razorpay", mode: "test", keyId: "", upi: true, card: true, netbanking: true, cod: true },
  staff: [
    { id: "s1", name: "Lakshmi V.", email: "lakshmi@santalum.in", role: "Fulfilment", lastActive: "Today" },
    { id: "s2", name: "Arjun R.", email: "arjun@santalum.in", role: "Manager", lastActive: "Yesterday" },
    { id: "s3", name: "Farah K.", email: "farah@santalum.in", role: "Support", lastActive: "Invited", invited: true },
  ],
  notifications: { newOrder: true, lowStock: true, review: true, returnRequest: true, dailySummary: false, recipients: "orders@santalum.in" },
};

export function defaultContent(c: { hero: { title: string; sub: string; cta: string }; edition: { name: string; size: number; text: string; productSlug: string } }, featuredSlugs: string[]): ContentDraft {
  return {
    heroTitle: c.hero.title,
    heroSub: c.hero.sub,
    heroCta: c.hero.cta,
    editionName: c.edition.name,
    editionSize: c.edition.size,
    editionText: c.edition.text,
    editionSlug: c.edition.productSlug,
    featured: featuredSlugs,
  };
}

export { startOfDay };
