"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { removeAddress, saveAddress, signOut, toggleWishlist, updateProfile, useUser, useWishlist, validate, type Address, type User } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import { cancelOrder, canCancel, canReturn, formatDate, requestReturn, STAGES, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR, getProduct, priceLabel } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { s } from "./cls";
import { cx, photoFor, plural, shotsOf } from "./data";
import { AddressTile, AuthTiles, Check, Field } from "./forms";
import { added } from "./store";
import { IconArrow, IconOut } from "./ui";

/** /d/06/account: sign in or create an account as tiles, then a dashboard board of tiles. */
export function AccountBento() {
  const hydrated = useHydrated();
  const user = useUser();
  if (!hydrated)
    return (
      <div className="grid gap-3 lg:grid-cols-12" aria-busy="true">
        <div className={cx(s.tile, "min-h-[320px] lg:col-span-5")} />
        <div className={cx(s.tile, "min-h-[320px] lg:col-span-7")} />
      </div>
    );
  return user ? <Dashboard user={user} /> : <SignedOut />;
}

function SignedOut() {
  return (
    <div className="grid gap-3 lg:grid-cols-12">
      <div className={cx(s.tile, "flex min-h-[360px] flex-col lg:col-span-4")}>
        <div className="p-6 sm:p-8">
          <h1 className={cx(s.display, "text-[clamp(44px,8cqw,76px)]")}>Your account</h1>
          <p className={cx(s.muted, "mt-4 max-w-[36ch] text-[16px] leading-[1.5]")}>Orders and their tracking, the pieces you are keeping an eye on, and where to send them.</p>
        </div>
        <div className="mt-auto grid grid-cols-3 gap-2 p-2">
          {["Orders", "Wishlist", "Addresses"].map((t, i) => (
            <div key={t} className={cx("relative flex aspect-square items-end overflow-hidden rounded-[20px] p-2.5", i === 1 ? "bg-accent-soft" : "bg-[var(--b-tile2)]")}>
              {i === 0 && <Photo p={PHOTOS.giftLinen} sizes="140px" />}
              {i === 2 && <Photo p={PHOTOS.temple} sizes="140px" />}
              <span className="relative rounded-full bg-[var(--b-tile)] px-2.5 py-1 text-[12.5px] font-medium">{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-8">
        <AuthTiles />
      </div>
    </div>
  );
}

/* ---------------- signed in ---------------- */

function Dashboard({ user }: { user: User }) {
  const orders = useOrders();
  const wish = useWishlist();
  const now = useNow() ?? 0;
  const moving = orders.filter((o) => !o.status && now && !trackingFor(o, now).delivered).length;
  const first = user.name.split(" ")[0];
  const stat = (n: number, label: string, tone = "", span = "lg:col-span-2") => (
    <div className={cx(s.tile, tone, span, "flex min-h-[140px] flex-col justify-between p-5")}>
      <p className={cx(s.mono, s.muted, "text-[11px]")}>{label}</p>
      <p className={cx(s.monoWide, "text-[52px] leading-none")}>{n}</p>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-12">
      <div className={cx(s.tile, "col-span-2 flex min-h-[200px] flex-col justify-between gap-6 p-6 sm:p-8 lg:col-span-6")}>
        <h1 className={cx(s.display, "text-[clamp(44px,8cqw,84px)]")}>Hello, {first}.</h1>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className={cx(s.mono, s.muted, "text-[11px] leading-[1.7]")}>
            {user.email}
            <br />
            With the Maison since {formatDate(user.createdAt)}
          </p>
          <button type="button" className={cx(s.ghost)} onClick={signOut}>
            <IconOut size={16} /> Sign out
          </button>
        </div>
      </div>
      {stat(orders.length, "Orders")}
      {stat(moving, "On the way", s.tint)}
      {stat(wish.length, "Wishlist", "", "col-span-2 lg:col-span-2")}

      <Orders orders={orders} now={now} />
      <Profile user={user} />
      <Wishlist slugs={wish} />
      <Addresses list={user.addresses} />
    </div>
  );
}

function Ring({ step, of, state }: { step: number; of: number; state?: Order["status"] }) {
  const off = state === "cancelled";
  const pct = off ? 0 : step / of;
  return (
    <span className="relative grid size-12 shrink-0 place-items-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="22" cy="22" r="19" fill="none" stroke="var(--b-track)" strokeWidth="3" strokeDasharray={off ? "3 4" : undefined} />
        {!off && <circle cx="22" cy="22" r="19" fill="none" stroke="var(--m-accent)" strokeWidth="3" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - pct * 100} />}
      </svg>
      {off ? (
        // a stopped ring: the track is broken and the centre is struck through
        <svg width="16" height="16" viewBox="0 0 16 16" aria-label="Cancelled" role="img">
          <path d="M3 13 13 3" stroke="var(--b-muted)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ) : (
        <span className={cx(s.mono, "text-[11px]")}>{`${step}/${of}`}</span>
      )}
    </span>
  );
}

function Orders({ orders, now }: { orders: Order[]; now: number }) {
  return (
    <section aria-label="Orders" className={cx(s.tile, "col-span-2 flex flex-col p-4 sm:p-6 lg:col-span-8")}>
      <h2 className="px-1 text-[22px] font-medium tracking-[-0.03em]">Orders</h2>
      {orders.length === 0 ? (
        <div className={cx(s.inner, "mt-4 flex flex-wrap items-center justify-between gap-4 p-5")}>
          <p className="text-[15px]">No orders yet. When you place one it appears here with its tracking.</p>
          <Link href="/d/06/shop" className={s.btn}>
            Go to the shop
          </Link>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {orders.map((o) => (
            <OrderRow key={o.id} o={o} now={now} />
          ))}
        </ul>
      )}
      {orders.length < 3 && (
        <div className="mt-auto pt-2">
        <Link
          href="/d/06/track"
          className="group flex items-center justify-between gap-4 rounded-[20px] border border-dashed border-[var(--b-dim)] p-4 transition-colors hover:border-[var(--b-ink)] focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span>
            <span className="block text-[15px] font-medium">Ordered as a guest, or on another device?</span>
            <span className={cx(s.muted, "block text-[13.5px]")}>Track any order with its number and the email or mobile on it.</span>
          </span>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--b-tile2)] transition-transform duration-500 group-hover:translate-x-1">
            <IconArrow size={16} />
          </span>
        </Link>
        </div>
      )}
    </section>
  );
}

function OrderRow({ o, now }: { o: Order; now: number }) {
  const t = trackingFor(o, now || o.placedAt);
  const [mode, setMode] = useState<"none" | "return" | "cancel">("none");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const stopped = o.status === "cancelled";
  const status = stopped ? "Cancelled" : o.status === "return-requested" ? "Return requested" : STAGES[t.current].label;
  const pieces = o.lines.reduce((n, l) => n + l.qty, 0);
  const doCancel = () => {
    const m = cancelOrder(o.id, now);
    setErr(m);
    setMode("none");
  };
  const doReturn = (e: FormEvent) => {
    e.preventDefault();
    const m = requestReturn(o.id, reason, now);
    setErr(m);
    if (!m) setMode("none");
  };
  return (
    <li className={cx(s.inner, "p-3 sm:p-4", stopped && "opacity-75")}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3">
        <Ring step={t.current + 1} of={STAGES.length} state={o.status} />
        <div className="min-w-0">
          <p className={cx(s.mono, "whitespace-nowrap text-[14px]")}>{o.id}</p>
          <p className={cx(s.muted, "text-[13.5px]")}>
            {formatDate(o.placedAt)}, {plural(pieces, "piece")}
          </p>
          <span className={cx(s.mono, "mt-1.5 inline-block rounded-full px-2.5 py-1 text-[10.5px]", o.status ? "bg-[var(--b-ink)] text-white" : "bg-accent-soft")}>{status}</span>
        </div>
        <div className="text-right">
          <p className={cx(s.monoWide, "whitespace-nowrap text-[17px]")}>{formatINR(o.total)}</p>
          {o.coupon && (
            <p className={cx(s.mono, s.muted, "text-[10.5px]")}>
              {o.coupon}, {formatINR(o.discount ?? 0)} off
            </p>
          )}
        </div>
      </div>
      {!o.status && (
        // the six stages as a strip of small cells, with the delivery estimate
        <div className="mt-3 flex items-center gap-3">
          <span className="flex flex-1 gap-[3px]" aria-hidden>
            {STAGES.map((st, i) => (
              <span key={st.key} className={cx("h-1.5 flex-1 rounded-full", i <= t.current ? "bg-accent" : "bg-[var(--b-dim)]")} />
            ))}
          </span>
          <span className={cx(s.mono, s.muted, "shrink-0 text-[10.5px]")}>
            {t.delivered ? "Delivered" : `Due ${formatDate(t.estimate.from)}–${formatDate(t.estimate.to)}`}
          </span>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="flex -space-x-2">
          {o.lines.slice(0, 4).map((l) => {
            const ph = photoFor(l.slug, l.photoId, l.name);
            return (
              <span key={l.slug + (l.option ?? "")} className="relative size-9 overflow-hidden rounded-[10px] ring-2 ring-[var(--b-tile2)]">
                <Photo p={ph.photo} tone={ph.tone} sizes="36px" />
              </span>
            );
          })}
        </span>
        <span className="ml-auto" />
        <Link href={`/d/06/track?o=${o.id}`} className={cx(s.btn, s.btnSm)}>
          Track
        </Link>
        {canCancel(o, now) && mode === "none" && (
          <button type="button" className={cx(s.ghost, s.btnSm, s.onWhite)} onClick={() => setMode("cancel")}>
            Cancel order
          </button>
        )}
        {canReturn(o, now) && mode === "none" && (
          <button type="button" className={cx(s.ghost, s.btnSm, s.onWhite)} onClick={() => setMode("return")}>
            Ask for a return
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {mode === "cancel" && (
          <motion.div
            key="cancel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div role="alertdialog" aria-label={`Cancel order ${o.id}?`} className="mt-3 flex flex-wrap items-center gap-3 rounded-[16px] bg-[var(--b-ink)] p-3 pl-4 text-white">
              <p className="min-w-[200px] flex-1 text-[14.5px] leading-snug">
                Cancel {o.id}? It has not shipped and nothing was charged. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button type="button" className={cx(s.ghost, s.btnSm, s.onWhite)} onClick={doCancel}>
                  Yes, cancel it
                </button>
                <button type="button" autoFocus className={cx("h-[38px] rounded-full px-3 text-[14px] text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-white")} onClick={() => setMode("none")}>
                  Keep the order
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {mode === "return" && (
          <motion.form onSubmit={doReturn} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap items-end gap-2 pt-3">
              <Field className="min-w-[220px] flex-1" label="Why are you returning it?" value={reason} onChange={(e) => setReason(e.target.value)} />
              <button type="submit" className={s.btn}>
                Request return
              </button>
              <button type="button" className={s.ghost} onClick={() => setMode("none")}>
                Keep it
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      {o.status === "return-requested" && o.returnReason && <p className={cx(s.muted, "mt-2 text-[13.5px]")}>Return reason: {o.returnReason}. We will write within two working days.</p>}
      {err && (
        <p role="alert" className="mt-2 text-[13.5px] text-[#a8322a]">
          {err}
        </p>
      )}
    </li>
  );
}

function Profile({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [news, setNews] = useState(user.newsletter);
  const [errs, setErrs] = useState<{ name?: string | null; phone?: string | null }>({});
  const [saved, setSaved] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = { name: validate.name(name), phone: validate.phone(phone) };
    setErrs(next);
    if (next.name || next.phone) return;
    updateProfile({ name: name.trim(), phone: phone.replace(/\s/g, ""), newsletter: news });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };
  return (
    <form onSubmit={submit} aria-label="Profile" className={cx(s.tile, s.tint, "col-span-2 flex flex-col gap-3 p-5 sm:p-6 lg:col-span-4")} noValidate>
      <h2 className="text-[22px] font-medium tracking-[-0.03em]">Profile</h2>
      <Field label="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errs.name} />
      <Field label="Mobile" type="tel" inputMode="numeric" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errs.phone} />
      <Check label="Letters from the Santalum Circle" checked={news} onChange={setNews} />
      <div className="mt-auto flex items-center gap-3 pt-2">
        <button type="submit" className={s.btn}>
          Save
        </button>
        <span role="status" className={cx(s.mono, "text-[11px]")}>
          {saved ? "Saved" : ""}
        </span>
      </div>
    </form>
  );
}

function Wishlist({ slugs }: { slugs: string[] }) {
  const items = slugs.map((x) => getProduct(x)).filter((p) => !!p);
  return (
    <section aria-label="Wishlist" className={cx(s.tile, "col-span-2 p-4 sm:p-6 lg:col-span-7")}>
      <h2 className="px-1 text-[22px] font-medium tracking-[-0.03em]">Wishlist</h2>
      {items.length === 0 ? (
        <p className={cx(s.inner, "mt-4 p-5 text-[15px]")}>Nothing saved yet. Tap the heart on any piece to keep it here.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((p) => (
            <li key={p.slug} className={cx(s.inner, "flex flex-col overflow-hidden")}>
              <Link href={`/d/06/p/${p.slug}`} className="relative block aspect-[4/3] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
                <Photo p={shotsOf(p)[0].photo} tone={shotsOf(p)[0].tone} sizes="240px" />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <p className="truncate text-[15px] font-medium">{p.name}</p>
                <p className={cx(s.mono, s.muted, "text-[11px]")}>{priceLabel(p)}</p>
                <div className="mt-auto flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className={cx(s.btn, s.btnSm)}
                    onClick={() => {
                      bag.add(p.slug);
                      added.bump();
                      toggleWishlist(p.slug);
                    }}
                  >
                    Move to bag
                  </button>
                  <button type="button" className={cx(s.ghost, s.btnSm, s.onWhite)} onClick={() => toggleWishlist(p.slug)}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Addresses({ list }: { list: Address[] }) {
  const [edit, setEdit] = useState<string | "new" | null>(null);
  const editing = edit && edit !== "new" ? list.find((a) => a.id === edit) : undefined;
  return (
    <section aria-label="Addresses" className={cx(s.tile, "col-span-2 p-4 sm:p-6 lg:col-span-5")}>
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-[22px] font-medium tracking-[-0.03em]">Addresses</h2>
        {!edit && (
          <button type="button" className={cx(s.ghost, s.btnSm)} onClick={() => setEdit("new")}>
            Add an address
          </button>
        )}
      </div>
      {edit ? (
        <div className="mt-4">
          <AddressTile key={edit} initial={editing} onDone={() => setEdit(null)} onCancel={() => setEdit(null)} />
        </div>
      ) : list.length === 0 ? (
        <p className={cx(s.inner, "mt-4 p-5 text-[15px]")}>No addresses yet. Add one here, or at checkout.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {list.map((a) => (
            <li key={a.id} className={cx(s.inner, "p-4")}>
              <p className="flex items-center gap-2 text-[15px] font-medium">
                {a.label}
                {a.isDefault && <span className={cx(s.mono, "rounded-full bg-[var(--b-ink)] px-2 py-0.5 text-[10px] text-white")}>Default</span>}
              </p>
              <p className="mt-1 text-[14.5px] leading-[1.45] text-[var(--b-ink2)]">
                {a.name}, {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pin}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button type="button" className={cx(s.chip, s.chipSm)} onClick={() => setEdit(a.id)}>
                  Edit
                </button>
                {!a.isDefault && (
                  <button type="button" className={cx(s.chip, s.chipSm)} onClick={() => saveAddress({ ...a, isDefault: true })}>
                    Set as default
                  </button>
                )}
                <button type="button" className={cx(s.chip, s.chipSm)} onClick={() => removeAddress(a.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
