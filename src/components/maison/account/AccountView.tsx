"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useId, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { removeAddress, saveAddress, signOut, toggleWishlist, updateProfile, useUser, useWishlist, validate, type User } from "@/lib/shop/account";
import { canCancel, cancelOrder, canReturn, formatDate, requestReturn, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct, priceLabel, type Product } from "@/lib/shop/products";
import { PHOTOS } from "@/lib/photos";
import { useHydrated } from "@/lib/shop/store";
import { Switch, TextArea } from "../forms/Field";
import { WoodDisc } from "../Logo";
import { Pill } from "../Pill";
import { addToBag } from "../shop/addToBag";
import { firstShot } from "../shop/shots";
import { GrowthRings } from "../track/GrowthRings";
import { WT } from "../W";
import { AddressForm, AddressLines } from "./AddressForm";
import { AuthPanel } from "./AuthPanel";
import { MalaRail, MemberSlice, useActiveSection } from "./MalaRail";

const EASE = [0.22, 1, 0.36, 1] as const;
const SECTIONS = [
  { id: "orders", label: "Orders", note: "Each one a slice, ring by ring" },
  { id: "wishlist", label: "Wishlist", note: "Pieces you are keeping an eye on" },
  { id: "addresses", label: "Addresses", note: "Where the boxes go" },
  { id: "profile", label: "Profile", note: "Your member record" },
];
const IDS = SECTIONS.map((x) => x.id);
const DASH = "border-dashed border-(--mz-ink)/15";

/** A stable four-digit member number, printed on the record like a batch number. */
function memberNo(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return String(1000 + ((h >>> 0) % 9000));
}

export function AccountView() {
  const hydrated = useHydrated();
  const user = useUser();
  if (!hydrated) return <div className="min-h-[80svh]" aria-busy="true" />;
  return user ? <Dashboard key={user.id} user={user} /> : <SignedOut />;
}

/* ---------------- signed out ---------------- */

function SignedOut() {
  return (
    <div className="mx-auto grid max-w-[1500px] gap-14 px-5 pb-10 pt-28 md:px-10 md:pt-36 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-[350] leading-[0.92] tracking-[-0.035em]">Your account</h1>
        <p className="mt-6 max-w-md text-[17px] leading-relaxed text-(--mz-ink-2)">
          <WT
            red="One place for your orders and their batch records, the pieces you are keeping an eye on, and where to send them."
            white="One place for your orders and their lot numbers, the oils and pieces you are keeping an eye on, and where to send them."
          />
        </p>
        <ul className="mt-10 max-w-md space-y-4 border-t border-(--mz-line) pt-6 text-[15px] text-(--mz-ink-2)">
          {[
            ["Track every order", "From the workshop to your door, stage by stage."],
            ["Keep a wishlist", "Saved pieces follow you from this browser into your account."],
            ["Save addresses", "Home, office, family. Checkout remembers them."],
          ].map(([h, t]) => (
            <li key={h} className="grid grid-cols-[1.75rem_1fr] gap-3">
              <span className="mt-0.5 size-5 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]">
                <span className="w-red">
                  <span className="ring-red block size-full" />
                </span>
                <span className="w-white">
                  <span className="ring-white block size-full" />
                </span>
              </span>
              <span>
                <span className="block font-medium text-(--mz-ink)">{h}</span>
                {t}
              </span>
            </li>
          ))}
        </ul>
        <div className="relative mt-12 hidden aspect-[5/4] max-w-md overflow-hidden rounded-t-full rounded-b-[2.5rem] bg-(--mz-surface) lg:block">
          <Photo p={PHOTOS.malaHand} sizes="34vw" />
        </div>
      </div>
      <div className="lg:sticky lg:top-28 lg:col-span-6 lg:col-start-7 lg:self-start lg:pt-4">
        <div className="rounded-[2.5rem] bg-(--mz-bg) p-5 shadow-[0_30px_80px_-40px_rgb(23_19_15/0.35),inset_0_0_0_1px_var(--mz-line)] md:p-10">
          <AuthPanel />
        </div>
        <Link
          href="/maison/track"
          className="group mt-4 flex items-center gap-5 rounded-[2.5rem] bg-(--mz-surface) p-4 pr-7 transition-colors hover:bg-(--mz-surface-2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
        >
          <GrowthRings current={3} live={false} className="size-20 shrink-0 transition-transform duration-700 ease-out-soft group-hover:rotate-12" />
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[22px] leading-tight">Have an order number?</span>
            <span className="mt-1 block text-[15px] text-(--mz-ink-2)">Track it without signing in, with the email or mobile on the order.</span>
          </span>
        </Link>
      </div>
    </div>
  );
}

/* ---------------- signed in ---------------- */

function Dashboard({ user }: { user: User }) {
  const orders = useOrders();
  const first = user.name.split(/\s+/)[0];
  const [active, setActive] = useActiveSection(IDS);
  const counts: Record<string, number | undefined> = { orders: orders.length, wishlist: user.wishlist.length, addresses: user.addresses.length };
  const since = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(user.createdAt);
  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-28 md:px-10 md:pt-36">
      <div className="grid items-end gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-[350] leading-[0.92] tracking-[-0.035em]">Hello, {first}</h1>
          <p className="mt-4 text-[16px] text-(--mz-ink-2) [overflow-wrap:anywhere]">
            Signed in as {user.email}.{" "}
            <button type="button" onClick={() => signOut()} className="rounded-sm text-(--mz-ink) underline decoration-(--mz-line) underline-offset-4 hover:decoration-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)">
              Sign out
            </button>
          </p>
        </div>
        <div className="flex items-center gap-5 lg:col-span-5 lg:justify-end">
          <MemberSlice rings={orders.length} className="size-24 shrink-0 md:size-28" />
          <p className="max-w-[15rem] text-[14px] leading-snug text-(--mz-ink-3)">
            <span className="block font-display text-[20px] leading-tight text-(--mz-ink)">Member since {since}</span>
            {orders.length ? `${orders.length} ${orders.length === 1 ? "ring" : "rings"} so far, one for each order.` : "Your slice grows a ring with every order."}
          </p>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <MalaRail beads={SECTIONS.map((x) => ({ id: x.id, label: x.label, count: counts[x.id] }))} active={active} onPick={setActive} initial={first.charAt(0).toUpperCase()} />
        </div>

        <div className="space-y-20 lg:col-span-9">
          {SECTIONS.map((x, i) => (
            <Section key={x.id} id={x.id} title={x.label} note={x.note} n={i + 1}>
              {x.id === "orders" ? <Orders orders={orders} /> : x.id === "wishlist" ? <Wishlist /> : x.id === "addresses" ? <Addresses user={user} /> : <Profile user={user} orders={orders.length} />}
            </Section>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Each section opens on its bead number and a dashed rule, like a page of the batch record. */
function Section({ id, title, note, n, children }: { id: string; title: string; note: string; n: number; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28">
      <div className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b pb-4 ${DASH}`}>
        <h2 id={`${id}-h`} className="flex items-baseline gap-4 font-display text-[clamp(2rem,3.4vw,3rem)] font-[350] leading-none tracking-[-0.025em]">
          <span className="text-[15px] tabular-nums tracking-normal text-(--mz-accent)">{String(n).padStart(2, "0")}</span>
          {title}
        </h2>
        <p className="text-[14px] italic text-(--mz-ink-3)">{note}</p>
      </div>
      <div className="pt-8">{children}</div>
    </section>
  );
}

function Orders({ orders }: { orders: Order[] }) {
  const now = useNow();
  if (!orders.length)
    return (
      <div className={`flex flex-col items-start gap-6 rounded-[2rem] border p-6 sm:flex-row sm:items-center md:p-8 ${DASH}`}>
        <GrowthRings current={0} live={false} className="size-20 shrink-0 opacity-60" />
        <p className="flex-1 text-[16px] leading-relaxed text-(--mz-ink-2)">No orders yet. When you place one, it appears here with its tracking, ring by ring.</p>
        <Pill href="/maison/shop">Go to the shop</Pill>
      </div>
    );
  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id}>
          <OrderRow o={o} now={now} />
        </li>
      ))}
    </ul>
  );
}

const STATUS: Record<NonNullable<Order["status"]>, { label: string; line: string }> = {
  cancelled: { label: "Cancelled", line: "Cancelled before it shipped. Nothing was charged in this preview." },
  "return-requested": { label: "Return requested", line: "The workshop will write within a working day to arrange a collection." },
};

function OrderRow({ o, now }: { o: Order; now: number | null }) {
  const [mode, setMode] = useState<"cancel" | "return" | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const t = trackingFor(o, now ?? o.placedAt);
  const stage = t.stages[t.current];
  const status = o.status ? STATUS[o.status] : null;
  const cancellable = now !== null && canCancel(o, now);
  const returnable = now !== null && canReturn(o, now);

  const confirm = () => {
    if (now === null) return;
    const err = mode === "cancel" ? cancelOrder(o.id, now) : requestReturn(o.id, reason, now);
    if (err) return setError(err);
    setMode(null);
    setError(null);
  };

  return (
    <article className={`rounded-[2rem] p-4 pr-5 md:p-5 md:pr-8 ${status ? "bg-(--mz-surface)/60 shadow-[inset_0_0_0_1px_var(--mz-line)]" : "bg-(--mz-surface)"}`}>
      <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr_auto]">
        <GrowthRings current={t.current} live={!status} className={`size-20 shrink-0 md:size-24 ${status ? "opacity-40 grayscale" : ""}`} />
        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-display text-[24px] leading-none tabular-nums">{o.id}</span>
            <span className="text-[14px] text-(--mz-ink-3)">Placed {formatDate(o.placedAt)}</span>
          </p>
          <p className="mt-2 text-[15px]">
            {status ? (
              <>
                <span className="rounded-full bg-(--mz-ink) px-2.5 py-0.5 text-[13px] text-(--mz-bg)">{status.label}</span>
                <span className="ml-2 text-(--mz-ink-2)">{status.line}</span>
              </>
            ) : (
              <>
                <span className="text-(--mz-accent)">{stage.label}</span>
                <span className="text-(--mz-ink-2)">. {t.delivered ? `Delivered ${formatDate(stage.at)}` : `Expected ${formatDate(t.estimate.from)} to ${formatDate(t.estimate.to)}`}</span>
              </>
            )}
          </p>
          <p className="mt-1 truncate text-[14px] text-(--mz-ink-3)">{o.lines.map((l) => (l.qty > 1 ? `${l.name} × ${l.qty}` : l.name)).join(", ")}</p>
          {o.returnReason && <p className="mt-1 text-[14px] italic text-(--mz-ink-3)">Your reason: {o.returnReason}</p>}
        </div>
        <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end sm:gap-1">
          <span className="text-right">
            <span className={`block font-display text-[22px] tabular-nums ${o.status === "cancelled" ? "text-(--mz-ink-3) line-through" : ""}`}>{formatINR(o.total)}</span>
            {o.discount ? (
              <span className="block text-[13px] text-(--mz-accent-deep)">
                {o.coupon} saved {formatINR(o.discount)}
              </span>
            ) : null}
          </span>
          <Link
            href={`/maison/track?o=${o.id}`}
            className="rounded-full text-[14px] text-(--mz-ink-2) underline decoration-(--mz-line) underline-offset-4 hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
          >
            Track
          </Link>
        </div>
      </div>

      {(cancellable || returnable) && (
        <div className="mt-4 border-t border-dashed border-(--mz-ink)/15 pt-4 sm:ml-[6.25rem] md:ml-[7.25rem]">
          {mode ? (
            <div className="space-y-3">
              <p className="text-[15px] text-(--mz-ink-2)">
                {mode === "cancel"
                  ? `Cancel ${o.id}? The workshop stops packing it, and it cannot be undone.`
                  : "Returns are open for 14 days after delivery, unused and in the original packaging. Numbered editions are final."}
              </p>
              {mode === "return" && <TextArea label="Why are you returning it?" rows={3} maxLength={400} value={reason} onChange={(e) => setReason(e.target.value)} />}
              {error && (
                <p role="alert" className="text-[14px] text-(--mz-accent-deep)">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Pill size="sm" onClick={confirm}>
                  {mode === "cancel" ? "Yes, cancel the order" : "Send the return request"}
                </Pill>
                <Pill
                  size="sm"
                  variant="line"
                  onClick={() => {
                    setMode(null);
                    setError(null);
                  }}
                >
                  {mode === "cancel" ? "Keep the order" : "Not now"}
                </Pill>
              </div>
            </div>
          ) : (
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-(--mz-ink-3)">
              {cancellable ? "You can cancel until it ships." : "Delivered. Returns are open for 14 days."}
              <TextButton onClick={() => setMode(cancellable ? "cancel" : "return")}>{cancellable ? "Cancel order" : "Request a return"}</TextButton>
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function Wishlist() {
  const slugs = useWishlist();
  const items = slugs.map((s) => getProduct(s)).filter((p): p is Product => !!p);
  if (!items.length)
    return (
      <div className={`flex flex-col items-start gap-6 rounded-[2rem] border p-6 sm:flex-row sm:items-center md:p-8 ${DASH}`}>
        <span aria-hidden className="relative block size-20 shrink-0">
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--mz-bg),var(--mz-surface-2)_75%)] shadow-[inset_0_0_0_1px_var(--mz-line)]" />
          <span className="absolute inset-[38%] rounded-full bg-(--mz-bg) shadow-[inset_0_0_0_1px_var(--mz-line)]" />
        </span>
        <p className="flex-1 text-[16px] leading-relaxed text-(--mz-ink-2)">Nothing on the string yet. Tap the heart on any piece in the shop to keep it here.</p>
        <Pill href="/maison/shop">Browse the shop</Pill>
      </div>
    );
  return (
    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence initial={false}>
        {items.map((p) => (
          <motion.li key={p.slug} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4, ease: EASE }}>
            <WishCard p={p} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function WishCard({ p }: { p: Product }) {
  const btn = useRef<HTMLButtonElement>(null);
  const s = firstShot(p);
  const move = () => {
    addToBag(btn.current, p);
    toggleWishlist(p.slug);
  };
  return (
    <div>
      <Link href={`/maison/shop/${p.slug}`} className="group block rounded-t-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent)">
        <span className="relative block aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2rem] bg-(--mz-surface)">
          <Photo p={s.photo} tone={s.tone} sizes="(min-width: 1280px) 22vw, (min-width: 640px) 34vw, 90vw" className="transition-transform duration-[1400ms] ease-out-soft group-hover:scale-105" />
        </span>
        <span className="mt-4 block font-display text-[22px] leading-tight">{p.name}</span>
      </Link>
      <p className="mt-1 text-[14px] text-(--mz-ink-3)">
        {CONTENT[p.wood].name}, {priceLabel(p)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Pill ref={btn} size="sm" onClick={move}>
          Move to bag
        </Pill>
        <Pill size="sm" variant="line" onClick={() => toggleWishlist(p.slug)}>
          Remove
        </Pill>
      </div>
      {p.options && (
        <p className="mt-2 text-[13px] text-(--mz-ink-3)">
          Goes to the bag in {p.options.values[0].label}. Open the piece to choose another {p.options.name.toLowerCase()}.
        </p>
      )}
    </div>
  );
}

function Addresses({ user }: { user: User }) {
  const [editing, setEditing] = useState<string | null>(null); // address id or "new"
  const list = user.addresses;
  return (
    <div className="space-y-3">
      <ul className="grid gap-3 md:grid-cols-2">
        {list.map((a) => (
          <li key={a.id} className={`relative rounded-[2rem] p-6 md:p-7 ${editing === a.id ? "bg-(--mz-surface)" : "bg-(--mz-bg) shadow-[inset_0_0_0_1px_var(--mz-line)]"}`}>
            {editing === a.id ? (
              <AddressForm
                initial={a}
                submitLabel="Save address"
                defaultOption
                onCancel={() => setEditing(null)}
                onSubmit={(d, { makeDefault }) => {
                  saveAddress({ ...d, id: a.id, isDefault: makeDefault || a.isDefault });
                  setEditing(null);
                }}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] text-(--mz-ink-3)">Deliver to</p>
                    <p className="mt-1 font-display text-[26px] leading-none tracking-[-0.01em]">{a.label}</p>
                  </div>
                  {a.isDefault && (
                    <span className="relative grid size-16 shrink-0 place-items-center rounded-full border border-(--mz-accent)/40" title="The address checkout offers first">
                      <WoodDisc className="size-11" />
                      <span className="absolute -bottom-2 rounded-full bg-(--mz-bg) px-2 text-[11px] text-(--mz-accent)">Default</span>
                    </span>
                  )}
                </div>
                <div className={`mt-5 border-t pt-4 ${DASH}`}>
                  <AddressLines a={a} className="text-[15px]" />
                </div>
                <div className={`mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-[14px] ${DASH}`}>
                  <TextButton onClick={() => setEditing(a.id)}>Edit</TextButton>
                  {!a.isDefault && <TextButton onClick={() => saveAddress({ ...a, isDefault: true })}>Set as default</TextButton>}
                  <TextButton onClick={() => removeAddress(a.id)}>Remove</TextButton>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {editing === "new" ? (
        <div className="rounded-[2rem] border border-(--mz-line) p-5 md:p-7">
          <AddressForm
            initial={{ name: user.name, phone: user.phone }}
            submitLabel="Add address"
            defaultOption
            onCancel={() => setEditing(null)}
            onSubmit={(d, { makeDefault }) => {
              saveAddress({ ...d, isDefault: makeDefault });
              setEditing(null);
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex w-full items-center gap-4 rounded-[2rem] border border-dashed border-(--mz-ink)/20 p-6 text-left text-[15px] text-(--mz-ink-2) transition-colors hover:border-(--mz-ink)/40 hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
        >
          <span className="grid size-10 place-items-center rounded-full bg-(--mz-ink) text-[20px] leading-none text-(--mz-bg)">+</span>
          {list.length ? "Add another address" : "Add your first address. Checkout will offer it next time."}
        </button>
      )}
    </div>
  );
}

function TextButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm text-(--mz-ink-2) underline decoration-(--mz-line) underline-offset-4 transition-colors hover:text-(--mz-ink) hover:decoration-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
    >
      {children}
    </button>
  );
}

/** A line of the member record whose value can be written straight onto the dashed rule. */
function RecordInput({ label, error, ...input }: { label: string; error?: string | null } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={`grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b py-2.5 text-[15px] sm:grid-cols-[8rem_1fr] ${DASH}`}>
      <label htmlFor={id} className="text-(--mz-ink-3)">
        {label}
      </label>
      <div className="min-w-0">
        <input
          id={id}
          {...input}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className="-mx-2.5 w-[calc(100%+1.25rem)] rounded-xl bg-transparent px-2.5 py-1.5 text-[16px] text-(--mz-ink) outline-none ring-1 ring-transparent transition-[background-color,box-shadow] duration-300 hover:bg-(--mz-bg)/70 focus:bg-(--mz-bg) focus:ring-2 focus:ring-(--mz-accent) aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-(--mz-accent-deep)/55"
        />
        {error && (
          <p id={`${id}-err`} className="mt-1 text-[13px] leading-snug text-(--mz-accent-deep)">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function RecordLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={`grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b py-3.5 text-[15px] sm:grid-cols-[8rem_1fr] ${DASH}`}>
      <dt className="text-(--mz-ink-3)">{label}</dt>
      <dd className="min-w-0 [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

/** The profile is the member's own record, drawn like the paper that ships with every piece. */
function Profile({ user, orders }: { user: User; orders: number }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState<{ name?: string | null; phone?: string | null }>({});
  const [saved, setSaved] = useState(false);
  const changed = name.trim() !== user.name || phone.replace(/\s/g, "") !== user.phone;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = { name: validate.name(name), phone: validate.phone(phone) };
    setErrors(next);
    if (next.name || next.phone) return;
    updateProfile({ name: name.trim(), phone: phone.replace(/\s/g, "") });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };
  return (
    <div className="grid gap-6 md:grid-cols-[1.25fr_1fr]">
      <form onSubmit={submit} noValidate className="relative overflow-hidden rounded-[2rem] bg-(--mz-surface) p-6 md:p-9">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[13px] text-(--mz-ink-3)">Santalum Maison</p>
            <p className="mt-1 font-display text-[30px] leading-none tracking-[-0.02em]">Member record</p>
          </div>
          <div className="relative grid size-20 shrink-0 place-items-center rounded-full border border-(--mz-accent)/40">
            <WoodDisc className="size-14" />
            <span className="absolute -bottom-2 rounded-full bg-(--mz-surface) px-2 text-[11px] tabular-nums text-(--mz-accent)">No. {memberNo(user.id)}</span>
          </div>
        </div>
        <div className={`mt-8 border-t ${DASH}`}>
          <RecordInput label="Name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <RecordInput label="Mobile" type="tel" name="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
          <dl>
            <RecordLine label="Email">
              {user.email}
              <span className="block text-[13px] text-(--mz-ink-3)">Your email signs you in, so it stays as it is.</span>
            </RecordLine>
            <RecordLine label="Joined">{formatDate(user.createdAt)}</RecordLine>
            <RecordLine label="Orders">
              <span className="tabular-nums">{orders}</span>
            </RecordLine>
          </dl>
        </div>
        <div className="flex items-center gap-4 pt-6">
          <Pill type="submit" size="lg" disabled={!changed && !saved}>
            Save the record
          </Pill>
          <AnimatePresence>
            {saved && (
              <motion.span role="status" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[14px] text-(--mz-accent)">
                Saved
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </form>
      <div className={`flex flex-col rounded-[2rem] border p-6 md:p-8 ${DASH}`}>
        <WoodDisc className="size-10" />
        <p className="mt-5 font-display text-[24px] leading-tight">The Santalum Circle</p>
        <p className="mt-2 text-[15px] leading-relaxed text-(--mz-ink-2)">
          <WT red={CONTENT.red.circle.text} white={CONTENT.white.circle.text} />
        </p>
        <Switch on={user.newsletter} onChange={(v) => updateProfile({ newsletter: v })} label={user.newsletter ? "You are on the list" : "Send me the letters"} sub="A few a year. Leave whenever you like." className="mt-6" />
      </div>
    </div>
  );
}
