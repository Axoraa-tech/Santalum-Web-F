import { formatINR } from "@/lib/shop/products";
import type { AdminStatus, PaymentState } from "./types";

export { formatINR };

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const shortFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });
const longFmt = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const num = new Intl.NumberFormat("en-IN");

export const fmtDate = (ms: number) => dateFmt.format(ms);
export const fmtShort = (ms: number) => shortFmt.format(ms);
export const fmtTime = (ms: number) => timeFmt.format(ms);
export const fmtLong = (ms: number) => longFmt.format(ms);
export const fmtDateTime = (ms: number) => `${shortFmt.format(ms)}, ${timeFmt.format(ms)}`;
export const fmtNum = (n: number) => num.format(n);
/** ₹12.5L, ₹40K */
export const inrCompact = (n: number) => "₹" + compact.format(n);
export const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;

export function timeAgo(ms: number, now: number) {
  const m = Math.max(0, Math.round((now - ms) / 60_000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d} d ago`;
  return fmtShort(ms);
}

/** yyyy-mm-dd in local time, for <input type="date">. */
export function isoDay(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function fromIsoDay(s: string, endOfDay = false) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0).getTime();
}

export const STATUS: Record<AdminStatus, { label: string; tone: string }> = {
  new: { label: "New", tone: "new" },
  confirmed: { label: "Confirmed", tone: "confirmed" },
  packed: { label: "Packed", tone: "packed" },
  shipped: { label: "Shipped", tone: "shipped" },
  delivered: { label: "Delivered", tone: "delivered" },
  cancelled: { label: "Cancelled", tone: "cancelled" },
  "return-requested": { label: "Return requested", tone: "return" },
  returned: { label: "Returned", tone: "returned" },
};

export const PAYMENT_STATE: Record<PaymentState, string> = {
  paid: "Paid",
  "cod-pending": "To collect",
  "cod-collected": "Collected",
  refunded: "Refunded",
  "part-refunded": "Part refunded",
};

export const PAYMENT_LABEL: Record<string, string> = { upi: "UPI", card: "Card", netbanking: "Net banking", cod: "Pay on delivery" };

/** Indian-system words for invoice totals: "Twelve thousand four hundred rupees only". */
export function rupeesInWords(n: number) {
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const two = (x: number) => (x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? "-" + ones[x % 10] : ""));
  const three = (x: number) => (x >= 100 ? ones[Math.floor(x / 100)] + " hundred" + (x % 100 ? " " + two(x % 100) : "") : two(x));
  let r = Math.round(n);
  if (r === 0) return "Zero rupees only";
  const parts: string[] = [];
  const crore = Math.floor(r / 1e7);
  r %= 1e7;
  const lakh = Math.floor(r / 1e5);
  r %= 1e5;
  const thousand = Math.floor(r / 1e3);
  r %= 1e3;
  if (crore) parts.push(three(crore) + " crore");
  if (lakh) parts.push(two(lakh) + " lakh");
  if (thousand) parts.push(two(thousand) + " thousand");
  if (r) parts.push(three(r));
  const s = parts.join(" ") + " rupees only";
  return s[0].toUpperCase() + s.slice(1);
}
