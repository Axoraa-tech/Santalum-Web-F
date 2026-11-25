import type { Address } from "@/lib/shop/account";
import type { DeliveryId } from "@/lib/shop/bag";
import type { OrderLine, PaymentId } from "@/lib/shop/orders";
import type { Badge, CategoryId, Tone, Wood } from "@/lib/shop/products";

/* ---------- orders ---------- */
export type AdminStatus = "new" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "return-requested" | "returned";
export type PaymentState = "paid" | "cod-pending" | "cod-collected" | "refunded" | "part-refunded";

export type EventKind =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "return-requested"
  | "returned"
  | "refund"
  | "awb"
  | "note";

export type TimelineEvent = { at: number; kind: EventKind; text: string; by?: string };

export type AdminOrder = {
  id: string;
  /** "mock" orders are generated for the preview; "preview" orders were placed on the shop in this browser. */
  source: "mock" | "preview";
  customerId: string;
  name: string;
  email: string;
  phone: string;
  placedAt: number;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  coupon?: string;
  total: number;
  address: Omit<Address, "id" | "isDefault">;
  delivery: DeliveryId;
  payment: PaymentId;
  paymentState: PaymentState;
  paymentRef: string;
  refunded: number;
  giftNote?: string;
  status: AdminStatus;
  courier?: { name: string; awb: string };
  timeline: TimelineEvent[];
  returnReason?: string;
  cancelReason?: string;
  woods: Wood[];
};

/** What the admin changed on an order (stored in santalum-admin-orders). */
export type OrderPatch = {
  status?: AdminStatus;
  courier?: { name: string; awb: string };
  paymentState?: PaymentState;
  refunded?: number;
  cancelReason?: string;
  events?: TimelineEvent[];
};

/* ---------- customers ---------- */
export type CustomerAddress = Omit<Address, "id"> & { id: string };
export type AdminCustomer = {
  id: string;
  source: "mock" | "preview";
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  createdAt: number;
  addresses: CustomerAddress[];
  tags: string[];
  newsletter: boolean;
  wishlist: string[];
};

export type CustomerStats = { orders: number; ltv: number; aov: number; lastOrderAt: number | null; firstOrderAt: number | null };

/* ---------- products ---------- */
export type ProductStatus = "active" | "draft" | "archived";
export type DraftPhoto = { id: string; tone?: Tone };
export type DraftOption = { id: string; label: string; price: number; stock: number };

export type ProductDraft = {
  slug: string;
  wood: Wood;
  name: string;
  category: CategoryId;
  optionName: string;
  /** At least one row. A product without options has one row labelled "Standard". */
  options: DraftOption[];
  photos: DraftPhoto[];
  short: string;
  story: string;
  details: { label: string; value: string }[];
  care: string;
  badge: Badge | "";
  editionSize: number | null;
  editionLeft: number | null;
  featured: boolean;
  status: ProductStatus;
  seoTitle: string;
  seoDescription: string;
  updatedAt?: number;
};

/* ---------- stock ---------- */
export type StockKey = string; // `${slug}::${optionId}`
export type StockAdjustment = { at: number; key: StockKey; delta: number; reason: string; by: string };

/* ---------- reviews ---------- */
export type ModerationState = "pending" | "published" | "hidden";

/* ---------- coupons ---------- */
export type AdminCoupon = {
  code: string;
  label: string;
  kind: "pct" | "flat";
  value: number;
  min: number | null;
  limit: number | null;
  /** yyyy-mm-dd, inclusive. */
  expires: string | null;
  active: boolean;
};

/* ---------- content ---------- */
export type ContentDraft = {
  heroTitle: string;
  heroSub: string;
  heroCta: string;
  editionName: string;
  editionSize: number;
  editionText: string;
  editionSlug: string;
  featured: string[];
};

/* ---------- settings ---------- */
export type StaffRole = "Owner" | "Manager" | "Fulfilment" | "Support";
export type Staff = { id: string; name: string; email: string; role: StaffRole; lastActive: string; invited?: boolean };
export type Settings = {
  store: { name: string; legalName: string; gstin: string; pan: string; email: string; phone: string; address: string; city: string; state: string; pin: string; invoicePrefix: string; gstRate: number; pricesIncludeGst: boolean; hsnRed: string; hsnWhite: string };
  shipping: { standardFree: boolean; standardPrice: number; expressPrice: number; codLimit: number; codFee: number; processingDays: number; insured: boolean };
  payments: { provider: "razorpay"; mode: "test" | "live"; keyId: string; upi: boolean; card: boolean; netbanking: boolean; cod: boolean };
  staff: Staff[];
  notifications: { newOrder: boolean; lowStock: boolean; review: boolean; returnRequest: boolean; dailySummary: boolean; recipients: string };
};

export type AdminSession = { email: string; name: string; at: number };
