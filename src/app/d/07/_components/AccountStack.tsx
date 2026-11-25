"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { removeAddress, saveAddress, signOut, toggleWishlist, updateProfile, useUser, useWishlist, validate, type Address, type User } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import { canCancel, canReturn, cancelOrder, formatDate, requestReturn, STAGES, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR, getProduct, type Product } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { PHOTOS } from "@/lib/photos";
import { AddressEditor, addressLine, AreaField, AuthPanel, CardTabs, Check, Field, Submit } from "./forms";
import { IconArrow } from "./Icons";
import { LinePhoto } from "./shots";
import { ProductCard } from "./shop/ProductCard";
import { firstName, productHref, SHOP, TRACK } from "./store";

type Tab = "orders" | "wishlist" | "addresses" | "profile";

/** The account as a deck: a header card, then the four parts of the account as index cards in a file. */
export function AccountStack() {
  const hydrated = useHydrated();
  const user = useUser();
  return (
    <main className="px-2 pt-2 md:px-3 md:pt-3 lg:px-[14px] lg:pt-[14px]">
      {!hydrated ? <div className="h-[70svh] rounded-[28px] bg-(--s7-sand) md:rounded-[40px] lg:rounded-[48px]" /> : user ? <Dashboard user={user} /> : <SignedOut />}
    </main>
  );
}

const FAN = [
  { t: "Orders", d: "Every order, with its stage from the workshop to your door.", p: PHOTOS.giftLinen },
  { t: "Wishlist", d: "Pieces you are thinking about, kept here across visits.", p: PHOTOS.beadStrandsDark },
  { t: "Addresses", d: "Home, office, your parents' house. Chosen in one tap at checkout.", p: PHOTOS.diyaHands },
];

function SignedOut() {
  return (
    <div className="grid gap-3 lg:grid-cols-12 lg:gap-[14px]">
      <section className="relative overflow-hidden rounded-[28px] bg-(--s7-sand) px-5 pb-8 pt-6 md:rounded-[40px] md:px-8 lg:col-span-5 lg:rounded-[48px] lg:px-10 lg:pt-8">
        <h1 className="d1 text-[clamp(3.6rem,9vw,8rem)]">Your account</h1>
        <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-(--s7-body)">
          One account holds three cards: your orders, your wishlist and your addresses. You need it to place an order, so the workshop knows where each
          piece is going.
        </p>
        {/* the three cards the account holds, fanned */}
        <div aria-hidden className="relative mx-auto mt-8 h-[300px] max-w-[420px] md:h-[340px]">
          {FAN.map((c, i) => (
            <div
              key={c.t}
              className="absolute left-1/2 top-0 w-[62%] rounded-[24px] bg-(--s7-surface) p-2 shadow-[0_24px_40px_-28px_rgba(27,23,18,0.6)]"
              style={{ transform: `translateX(${-50 + (i - 1) * 42}%) translateY(${Math.abs(i - 1) * 18}px) rotate(${(i - 1) * 8}deg)`, zIndex: i === 1 ? 3 : 1 }}
            >
              <div className="relative h-[150px] overflow-hidden rounded-[18px] md:h-[180px]">
                <Photo p={c.p} sizes="240px" />
              </div>
              <p className="d3 px-2 pt-3 text-[20px]">{c.t}</p>
              <p className="px-2 pb-2 pt-1 text-[13px] leading-snug text-(--s7-muted)">{c.d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="lg:col-span-7">
        <AuthPanel tint="var(--s7-surface)" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[28px] bg-(--s7-sage) px-5 py-5 md:rounded-[36px] md:px-8">
          <p className="max-w-[40ch] text-[16px] text-(--s7-body)">Looking for an order placed by someone else? Track it with the order number.</p>
          <Link href={TRACK} className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-[15px] font-medium ring-1 ring-(--s7-ink)/20 transition hover:bg-(--s7-surface)">
            Track an order
            <IconArrow width={16} height={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Dashboard({ user }: { user: User }) {
  const orders = useOrders();
  const wish = useWishlist();
  const [tab, setTab] = useState<Tab>("orders");
  const since = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(user.createdAt);
  const stats: [number, string][] = [
    [orders.length, orders.length === 1 ? "order" : "orders"],
    [wish.length, "saved"],
    [user.addresses.length, user.addresses.length === 1 ? "address" : "addresses"],
  ];

  return (
    <>
      <section className="rounded-[28px] bg-(--s7-sand) px-5 pb-7 pt-6 md:rounded-[40px] md:px-8 lg:rounded-[48px] lg:px-10 lg:pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-[14px] text-(--s7-muted)">
            {user.email}, with us since {since}
          </p>
          <button type="button" onClick={signOut} className="rounded-full px-4 py-2 text-[14px] font-medium ring-1 ring-(--s7-ink)/20 transition hover:bg-(--s7-surface) active:scale-95">
            Sign out
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="d1 text-[clamp(3.6rem,10vw,9rem)]">Hello, {firstName(user.name)}</h1>
          <dl className="grid grid-cols-3 gap-6 lg:pb-3">
            {stats.map(([n, t]) => (
              <div key={t} className="flex flex-col-reverse justify-end">
                <dt className="text-[13px] text-(--s7-muted)">{t}</dt>
                <dd className="d1 num text-[52px]">{n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mt-5">
        <CardTabs
          label="Your account"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "orders", label: `Orders ${orders.length}` },
            { id: "wishlist", label: `Wishlist ${wish.length}` },
            { id: "addresses", label: "Addresses" },
            { id: "profile", label: "Profile" },
          ]}
        >
          <div className="p-3 md:p-6">
            {tab === "orders" && <Orders orders={orders} />}
            {tab === "wishlist" && <Wishlist slugs={wish} />}
            {tab === "addresses" && <Addresses user={user} />}
            {tab === "profile" && <Profile user={user} />}
          </div>
        </CardTabs>
      </div>
    </>
  );
}

/* ---------- orders: a pile of order cards, newest on top ---------- */

function Orders({ orders }: { orders: Order[] }) {
  if (!orders.length)
    return (
      <EmptyCard title="No orders yet" text="When you place an order it lands here, with its stage from the workshop to your door.">
        <Link href={SHOP} className="inline-flex h-12 items-center rounded-full bg-(--s7-ink) px-6 text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent)">
          Open the shop
        </Link>
      </EmptyCard>
    );
  return (
    <ol className="grid">
      {orders.map((o, i) => (
        <OrderCard key={o.id} order={o} first={i === 0} />
      ))}
    </ol>
  );
}

function OrderCard({ order: o, first }: { order: Order; first: boolean }) {
  const now = useNow() ?? o.placedAt;
  const t = trackingFor(o, now);
  const [mode, setMode] = useState<"idle" | "cancel" | "return">("idle");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const status = o.status === "cancelled" ? "Cancelled" : o.status === "return-requested" ? "Return requested" : STAGES[t.current].label;

  const cancel = () => {
    const r = cancelOrder(o.id, Date.now());
    setErr(r);
    if (!r) setMode("idle");
  };
  const ret = (e: FormEvent) => {
    e.preventDefault();
    const r = requestReturn(o.id, reason, Date.now());
    setErr(r);
    if (!r) setMode("idle");
  };

  return (
    <li
      className={`relative rounded-[24px] bg-(--s7-page) p-4 shadow-[0_-16px_36px_-28px_rgba(27,23,18,0.5)] md:rounded-[30px] md:p-6 ${first ? "" : "-mt-3 pt-7 md:pt-9"} ${
        o.status === "cancelled" ? "opacity-75" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="d2 num text-[34px] md:text-[40px]">{o.id}</p>
          <p className="num text-[14px] text-(--s7-muted)">Placed {formatDate(o.placedAt, true)}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium ${
            o.status ? "bg-(--s7-ink)/10" : t.delivered ? "bg-(--s7-sage)" : "bg-(--s7-accent-soft) text-(--s7-accent-deep)"
          }`}
        >
          {!o.status && !t.delivered && <span aria-hidden className="s7-live size-2 rounded-full bg-(--s7-accent)" />}
          {status}
        </span>
      </div>

      {!o.status && (
        <div aria-hidden className="mt-4 grid grid-cols-6 gap-1">
          {STAGES.map((s, i) => (
            <span key={s.key} className={`h-1.5 rounded-full ${i <= t.current ? "bg-(--s7-accent)" : "bg-(--s7-ink)/10"}`} />
          ))}
        </div>
      )}

      <ul className="mt-4 flex flex-wrap gap-2">
        {o.lines.map((l) => (
          <li key={`${l.slug}-${l.option ?? ""}-${l.note ?? ""}`} className="flex items-center gap-2 rounded-full bg-(--s7-surface) py-1 pl-1 pr-3 text-[14px]">
            <span className="relative size-9 shrink-0 overflow-hidden rounded-full">
              <LinePhoto line={l} sizes="36px" />
            </span>
            {l.name}
            {l.qty > 1 && <span className="num text-(--s7-muted)">&times; {l.qty}</span>}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-(--s7-ink)/10 pt-4">
        <dl className="num flex flex-wrap gap-x-6 gap-y-1 text-[14.5px]">
          <div>
            <dt className="text-[13px] text-(--s7-muted)">Total</dt>
            <dd className="d3 text-[22px]">{formatINR(o.total)}</dd>
          </div>
          {o.discount ? (
            <div>
              <dt className="text-[13px] text-(--s7-muted)">Code {o.coupon}</dt>
              <dd className="text-[16px]">&minus;{formatINR(o.discount)}</dd>
            </div>
          ) : null}
          {!o.status && (
            <div>
              <dt className="text-[13px] text-(--s7-muted)">{t.delivered ? "Delivered" : "Expected"}</dt>
              <dd className="text-[16px]">{t.delivered ? formatDate(t.stages[5].at) : `${formatDate(t.estimate.from)} to ${formatDate(t.estimate.to)}`}</dd>
            </div>
          )}
        </dl>
        <div className="flex flex-wrap gap-2">
          <Link href={`${TRACK}?o=${o.id}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-(--s7-ink) px-4 text-[14px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent)">
            Track
            <IconArrow width={14} height={14} />
          </Link>
          {canCancel(o, now) && mode === "idle" && (
            <button type="button" onClick={() => setMode("cancel")} className="h-10 rounded-full px-4 text-[14px] font-medium ring-1 ring-(--s7-ink)/20 transition hover:bg-(--s7-surface)">
              Cancel order
            </button>
          )}
          {canReturn(o, now) && mode === "idle" && (
            <button type="button" onClick={() => setMode("return")} className="h-10 rounded-full px-4 text-[14px] font-medium ring-1 ring-(--s7-ink)/20 transition hover:bg-(--s7-surface)">
              Ask for a return
            </button>
          )}
        </div>
      </div>

      {o.status === "return-requested" && o.returnReason && (
        <p className="mt-3 rounded-[16px] bg-(--s7-surface) px-4 py-3 text-[14.5px] text-(--s7-body)">
          Your reason: {o.returnReason}. The workshop writes back within two working days with a pickup time.
        </p>
      )}
      {o.status === "cancelled" && <p className="mt-3 text-[14.5px] text-(--s7-muted)">Cancelled before it shipped. No money was taken in this preview.</p>}

      {mode === "cancel" && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[18px] bg-(--s7-accent-soft) p-4">
          <p className="flex-1 text-[15px]">Cancel {o.id}? It has not left the workshop yet.</p>
          <button type="button" onClick={cancel} className="h-10 rounded-full bg-(--s7-ink) px-4 text-[14px] font-medium text-(--s7-page) hover:bg-(--s7-accent)">
            Yes, cancel it
          </button>
          <button type="button" onClick={() => setMode("idle")} className="h-10 rounded-full px-4 text-[14px] font-medium ring-1 ring-(--s7-ink)/20">
            Keep the order
          </button>
        </div>
      )}
      {mode === "return" && (
        <form onSubmit={ret} className="mt-4 grid gap-3 rounded-[18px] bg-(--s7-accent-soft) p-4">
          <AreaField label="What went wrong?" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="A line is enough. Unused pieces, within 14 days." />
          <div className="flex flex-wrap gap-2">
            <Submit className="h-11">Ask for the return</Submit>
            <button type="button" onClick={() => setMode("idle")} className="h-11 rounded-full px-4 text-[14px] font-medium ring-1 ring-(--s7-ink)/20">
              Not now
            </button>
          </div>
        </form>
      )}
      {err && (
        <p role="alert" className="s7-err mt-3">
          {err}
        </p>
      )}
    </li>
  );
}

/* ---------- wishlist ---------- */

function Wishlist({ slugs }: { slugs: string[] }) {
  const items = slugs.map((s) => getProduct(s)).filter((p): p is Product => !!p);
  if (!items.length)
    return (
      <EmptyCard title="Nothing saved yet" text="Tap the heart on any piece and it waits here, signed in or out.">
        <Link href={SHOP} className="inline-flex h-12 items-center rounded-full bg-(--s7-ink) px-6 text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent)">
          Open the shop
        </Link>
      </EmptyCard>
    );
  return (
    <ul className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
      {items.map((p) => (
        <li key={p.slug}>
          <ProductCard
            product={p}
            footer={
              <span className="flex gap-1">
                {p.options ? (
                  <Link href={productHref(p.slug)} className="inline-flex h-9 items-center rounded-full bg-(--s7-ink) px-3 text-[13px] font-medium text-(--s7-page) hover:bg-(--s7-accent)">
                    Choose
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      bag.add(p.slug);
                      toggleWishlist(p.slug);
                    }}
                    className="h-9 rounded-full bg-(--s7-ink) px-3 text-[13px] font-medium text-(--s7-page) hover:bg-(--s7-accent)"
                  >
                    Move to bag
                  </button>
                )}
                <button type="button" onClick={() => toggleWishlist(p.slug)} aria-label={`Remove ${p.name}`} className="h-9 rounded-full px-2.5 text-[13px] font-medium ring-1 ring-(--s7-ink)/15 hover:ring-(--s7-ink)/40">
                  Remove
                </button>
              </span>
            }
          />
        </li>
      ))}
    </ul>
  );
}

/* ---------- addresses ---------- */

function Addresses({ user }: { user: User }) {
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  if (editing)
    return (
      <div className="s7-on-page rounded-[24px] bg-(--s7-page) p-4 md:p-6">
        <p className="d2 mb-5 text-[34px]">{editing === "new" ? "A new address" : `Edit ${editing.label}`}</p>
        <AddressEditor address={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />
      </div>
    );
  return (
    <div className="grid gap-2 md:grid-cols-2 md:gap-3">
      {user.addresses.map((a) => (
        <div key={a.id} className="flex flex-col rounded-[24px] bg-(--s7-page) p-5">
          <p className="flex items-center gap-2">
            <span className="d3 text-[22px]">{a.label}</span>
            {a.isDefault && <span className="rounded-full bg-(--s7-accent-soft) px-2.5 py-0.5 text-[12.5px] text-(--s7-accent-deep)">Default</span>}
          </p>
          <p className="mt-2 text-[15.5px] leading-relaxed text-(--s7-body)">
            {a.name}
            <br />
            {addressLine(a)}
            <br />
            <span className="num">{a.phone}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!a.isDefault && (
              <button type="button" onClick={() => saveAddress({ ...a, isDefault: true })} className="h-9 rounded-full px-3.5 text-[13.5px] font-medium ring-1 ring-(--s7-ink)/20 hover:bg-(--s7-surface)">
                Make default
              </button>
            )}
            <button type="button" onClick={() => setEditing(a)} className="h-9 rounded-full px-3.5 text-[13.5px] font-medium ring-1 ring-(--s7-ink)/20 hover:bg-(--s7-surface)">
              Edit
            </button>
            <button type="button" onClick={() => removeAddress(a.id)} className="h-9 rounded-full px-3.5 text-[13.5px] font-medium text-(--s7-muted) hover:text-(--s7-ink)">
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setEditing("new")}
        className="grid min-h-[180px] place-items-center rounded-[24px] border-2 border-dashed border-(--s7-ink)/20 p-5 text-[16px] font-medium transition hover:border-(--s7-ink)/50 hover:bg-(--s7-page)"
      >
        Add an address
      </button>
    </div>
  );
}

/* ---------- profile: the form beside the customer's own record card ---------- */

function Profile({ user }: { user: User }) {
  const orders = useOrders();
  const wish = useWishlist();
  const [errs, setErrs] = useState<{ name?: string; phone?: string }>({});
  const [letters, setLetters] = useState(user.newsletter);
  const [draft, setDraft] = useState({ name: user.name, phone: user.phone });
  const [saved, setSaved] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const name = String(d.get("name") ?? "");
    const phone = String(d.get("phone") ?? "");
    const next = { name: validate.name(name) ?? undefined, phone: validate.phone(phone) ?? undefined };
    setErrs(next);
    if (next.name || next.phone) return;
    updateProfile({ name: name.trim(), phone: phone.replace(/\s/g, ""), newsletter: letters });
    setSaved(true);
  };
  const since = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(user.createdAt);
  const rows: [string, string][] = [
    ["Name", draft.name.trim() || "Your name"],
    ["Email", user.email],
    ["Mobile", draft.phone.trim() || "Not given"],
    ["With us since", since],
    ["Orders", `${orders.length}`],
    ["Saved pieces", `${wish.length}`],
    ["Letters", letters ? "From the Santalum Circle" : "None"],
  ];

  return (
    <div className="grid gap-3 md:gap-4 lg:grid-cols-12">
      <form onSubmit={submit} noValidate className="s7-on-page grid content-start gap-4 rounded-[24px] bg-(--s7-page) p-4 md:p-6 lg:col-span-7">
        <div>
          <p className="d2 text-[34px]">Your details</p>
          <p className="mt-1 text-[15px] text-(--s7-muted)">What the courier and the workshop see. The card beside it changes as you type.</p>
        </div>
        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          defaultValue={user.name}
          error={errs.name}
          onChange={(e) => {
            setDraft((d) => ({ ...d, name: e.target.value }));
            setSaved(false);
          }}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={user.email} readOnly hint="Your sign-in. It cannot be changed in the preview." />
          <Field
            label="Mobile"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={user.phone}
            error={errs.phone}
            hint="Ten digits, for the courier."
            onChange={(e) => {
              setDraft((d) => ({ ...d, phone: e.target.value }));
              setSaved(false);
            }}
          />
        </div>
        <Check
          checked={letters}
          onChange={(v) => {
            setLetters(v);
            setSaved(false);
          }}
          label="Letters from the Santalum Circle"
          sub="A few times a year, when a batch is turned or distilled, and when an edition number comes back."
        />
        <div className="flex flex-wrap items-center gap-4">
          <Submit>Save the profile</Submit>
          {saved && (
            <span role="status" className="text-[15px] text-(--s7-accent-deep)">
              Saved. The record is up to date.
            </span>
          )}
        </div>
      </form>

      {/* the customer's record, on a card in a small pile, like a piece's batch record */}
      <div className="relative px-2 pb-3 pt-4 md:px-4 lg:col-span-5 lg:pt-6">
        <div aria-hidden className="absolute inset-x-6 bottom-0 top-8 rotate-[3deg] rounded-[26px] bg-(--s7-clay) md:inset-x-8 lg:top-10" />
        <div aria-hidden className="absolute inset-x-4 bottom-1 top-6 -rotate-[2deg] rounded-[26px] bg-(--s7-sand) md:inset-x-6 lg:top-8" />
        <section aria-label="Your record" className="relative rounded-[26px] bg-(--s7-page) p-5 shadow-[0_30px_50px_-34px_rgba(27,23,18,0.55)] ring-1 ring-(--s7-ink)/8 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="d3 text-[17px]">Santalum Maison</p>
              <p className="text-[13px] text-(--s7-muted)">Customer record</p>
            </div>
            <span className="rounded-full bg-(--s7-accent-soft) px-3 py-1.5 text-[12px] font-medium text-(--s7-accent-deep)">{saved ? "Saved" : "Live"}</span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="d1 num text-[56px] md:text-[64px]">
              <span className="text-[0.45em] text-(--s7-muted)">No. </span>
              {memberNo(user)}
            </p>
            <span aria-hidden className="mb-2 flex shrink-0 -space-x-3">
              <span className="ring-red size-11 rounded-full ring-2 ring-(--s7-page)" />
              <span className="ring-white size-11 rounded-full ring-2 ring-(--s7-page)" />
            </span>
          </div>
          <dl className="mt-4 grid gap-x-6 gap-y-2.5 border-t border-(--s7-ink)/12 pt-4 sm:grid-cols-2">
            {rows.map(([t, v]) => (
              <div key={t} className="min-w-0">
                <dt className="text-[12.5px] text-(--s7-muted)">{t}</dt>
                <dd className="truncate text-[15px] leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-(--s7-ink)/20 pt-3 text-[12.5px] text-(--s7-muted)">
            <span>Kept in this browser while the store is in preview</span>
            <span className="d3 text-[15px] text-(--s7-ink)">{initials(draft.name || user.name)}</span>
          </p>
        </section>
      </div>
    </div>
  );
}

/** A four-digit customer number that stays the same for an account. */
function memberNo(u: User) {
  let h = 7;
  for (const ch of u.id) h = (h * 31 + ch.charCodeAt(0)) % 9000;
  return String(1000 + h);
}
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => `${w[0]?.toUpperCase() ?? ""}.`)
    .join(" ");

function EmptyCard({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="rounded-[24px] bg-(--s7-page) px-5 py-10 md:px-8">
      <p className="d2 text-[clamp(2.4rem,4.4vw,3.8rem)]">{title}</p>
      <p className="mt-3 max-w-[46ch] text-[16px] text-(--s7-muted)">{text}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
