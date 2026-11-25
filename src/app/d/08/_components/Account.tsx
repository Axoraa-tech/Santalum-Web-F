"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { removeAddress, saveAddress, signOut, toggleWishlist, updateProfile, useUser, useWishlist, validate, type Address, type User } from "@/lib/shop/account";
import { STAGES, canCancel, canReturn, cancelOrder, formatDate, requestReturn, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR, getProduct, priceLabel } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { addToBag } from "../_lib/ui";
import { AddressLegend, AuthLegend, KeyInput, LegendBox } from "./Legend";
import { Mark } from "./Mark";
import { PinGlyph } from "./Pins";
import { s } from "./styles";

const SECTIONS = [
  { id: "orders", label: "Orders", sym: "route" },
  { id: "wishlist", label: "Wishlist", sym: "mark" },
  { id: "addresses", label: "Addresses", sym: "pin" },
  { id: "profile", label: "Profile", sym: "dot" },
] as const;

function Sym({ k }: { k: string }) {
  if (k === "route")
    return (
      <svg viewBox="0 0 28 10" className="h-2.5 w-7" aria-hidden>
        <path d="M2 5h24" stroke="var(--a-accent)" strokeWidth="2.5" strokeDasharray="5 4" />
      </svg>
    );
  if (k === "pin") return <PinGlyph color="var(--a-accent)" className="h-6 w-[18px]" />;
  if (k === "mark")
    return (
      <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
        <path d="M5 2.8h10a.8.8 0 0 1 .8.8v13.2l-5.8-3.6-5.8 3.6V3.6a.8.8 0 0 1 .8-.8z" fill="var(--a-accent)" />
      </svg>
    );
  return <span className="size-3 rounded-full border-2 border-(--a-accent)" aria-hidden />;
}

function OrderRow({ o, now }: { o: Order; now: number }) {
  const t = trackingFor(o, now);
  const [mode, setMode] = useState<"cancel" | "return" | null>(null);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const status = o.status === "cancelled" ? "Cancelled" : o.status === "return-requested" ? "Return requested" : STAGES[t.current].label;
  const pieces = o.lines.reduce((n, l) => n + l.qty, 0);
  return (
    <li className={`${s.card} ${s.flow} p-5`} style={{ ["--rot" as string]: "0deg" }}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className={`${s.serif} text-[22px] tabular-nums`}>{o.id}</p>
        <p className="text-[15px] text-(--a-muted)">
          {formatDate(o.placedAt)}, to {o.address.city}
        </p>
      </div>
      <div className="mt-4 flex items-center gap-0" aria-label={`Stage: ${status}`}>
        {STAGES.map((st, i) => (
          <span key={st.key} className="flex flex-1 items-center last:flex-none">
            <span className={`size-3 shrink-0 rounded-full border-2 ${o.status ? "border-(--a-line-2)" : i <= t.current ? (i === t.current ? "border-(--a-accent) bg-(--a-accent)" : "border-(--a-ink) bg-(--a-ink)") : "border-(--a-line-2) bg-(--a-card)"}`} title={st.label} />
            {i < STAGES.length - 1 && <span className={`h-[2px] flex-1 ${!o.status && i < t.current ? "bg-(--a-ink)" : "bg-[repeating-linear-gradient(90deg,var(--a-line-2)_0_4px,transparent_4px_8px)]"}`} />}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3 text-[15px]">
        <span className={o.status ? "font-semibold text-(--a-accent-deep)" : "font-medium"}>{status}</span>
        <span className="tabular-nums">
          {pieces} {pieces === 1 ? "piece" : "pieces"}, {formatINR(o.total)}
          {o.discount ? <span className="text-(--a-accent-deep)"> (code {o.coupon}, −{formatINR(o.discount)})</span> : null}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-dashed border-(--a-line-2) pt-3">
        <Link href={`/d/08/track?o=${o.id}`} className={`${s.btn} ${s.btnInk} h-10 px-4 text-[14px] font-medium`}>
          Track on the map
        </Link>
        {canCancel(o, now) && (
          <button type="button" onClick={() => setMode(mode === "cancel" ? null : "cancel")} className={`${s.btn} ${s.btnLine} h-10 px-4 text-[14px]`}>
            Cancel the order
          </button>
        )}
        {canReturn(o, now) && (
          <button type="button" onClick={() => setMode(mode === "return" ? null : "return")} className={`${s.btn} ${s.btnLine} h-10 px-4 text-[14px]`}>
            Ask for a return
          </button>
        )}
        {!o.status && !canCancel(o, now) && !canReturn(o, now) && <span className="text-[14px] text-(--a-muted)">Shipped. Returns open on delivery.</span>}
        {o.status === "cancelled" && <span className="text-[14px] italic text-(--a-muted)">The route is struck off: nothing will ship, and no money was taken in this preview.</span>}
        {o.status === "return-requested" && <span className="text-[14px] italic text-(--a-muted)">Return asked for. We will write about the collection.</span>}
      </div>
      {mode === "cancel" && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-l-2 border-(--a-accent) pl-3 text-[15px]">
          <span>Cancel {o.id}? Nothing will ship.</span>
          <button
            type="button"
            onClick={() => {
              const e = cancelOrder(o.id, now);
              setErr(e);
              if (!e) setMode(null);
            }}
            className={`${s.btn} ${s.btnInk} h-9 px-4 text-[14px]`}
          >
            Yes, cancel it
          </button>
          <button type="button" onClick={() => setMode(null)} className={`${s.link} text-[14px]`}>
            Keep it
          </button>
        </div>
      )}
      {mode === "return" && (
        <form
          className="mt-3 grid gap-2 border-l-2 border-(--a-accent) pl-3"
          onSubmit={(e) => {
            e.preventDefault();
            const e2 = requestReturn(o.id, reason, now);
            setErr(e2);
            if (!e2) setMode(null);
          }}
        >
          <KeyInput label="Why is it going back?" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button type="submit" className={`${s.btn} ${s.btnInk} h-10 justify-self-start px-4 text-[14px]`}>
            Request the return
          </button>
        </form>
      )}
      {err && (
        <p role="alert" className="mt-2 text-[14px] italic text-[#b3261e]">
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
  function submit(e: FormEvent) {
    e.preventDefault();
    const x = { name: validate.name(name), phone: validate.phone(phone) };
    setErrs(x);
    if (x.name || x.phone) return;
    updateProfile({ name: name.trim(), phone: phone.replace(/\s/g, ""), newsletter: news });
    setSaved(true);
  }
  return (
    <form onSubmit={submit} noValidate className="grid max-w-[560px] gap-4">
      <KeyInput label="Name" autoComplete="name" value={name} onChange={(e) => (setName(e.target.value), setSaved(false))} error={errs.name} />
      <KeyInput label="Mobile number" type="tel" autoComplete="tel" value={phone} onChange={(e) => (setPhone(e.target.value), setSaved(false))} error={errs.phone} />
      <p className="text-[15px] text-(--a-muted)">Email: {user.email}</p>
      <label className="flex items-center gap-3 text-[15px]">
        <input type="checkbox" checked={news} onChange={(e) => (setNews(e.target.checked), setSaved(false))} className={`${s.check} size-5`} />
        Letters from the Santalum Circle
      </label>
      <div className="flex items-center gap-4">
        <button type="submit" className={`${s.btn} ${s.btnInk} h-11 px-5 text-[15px] font-medium`}>
          Save the profile
        </button>
        {saved && (
          <span role="status" className="text-[15px] text-(--a-accent-deep)">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

function Addresses({ user }: { user: User }) {
  const [edit, setEdit] = useState<Address | "new" | null>(null);
  return (
    <div className="grid gap-4">
      {user.addresses.length === 0 && edit === null && <p className="text-[16px] text-(--a-ink-2)">No addresses yet. Add one and checkout fills itself in.</p>}
      <ul className="grid gap-4 md:grid-cols-2">
        {user.addresses.map((a) =>
          edit !== "new" && edit?.id === a.id ? null : (
            <li key={a.id} className="flex gap-3 border border-(--a-line-2) bg-(--a-card) p-4">
              <PinGlyph color="var(--a-accent)" filled={!!a.isDefault} className="h-7 w-5 shrink-0" />
              <div className="min-w-0 flex-1 text-[15px] leading-snug">
                <p className="font-semibold">
                  {a.label || "Address"} {a.isDefault && <span className="ml-1 text-[13px] font-normal text-(--a-accent-deep)">Default</span>}
                </p>
                <p className="mt-1 text-(--a-ink-2)">
                  {a.name}, {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pin}
                </p>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
                  <button type="button" onClick={() => setEdit(a)} className={s.link}>
                    Edit
                  </button>
                  {!a.isDefault && (
                    <button type="button" onClick={() => saveAddress({ ...a, isDefault: true })} className={s.link}>
                      Set as default
                    </button>
                  )}
                  <button type="button" onClick={() => removeAddress(a.id)} className={s.link}>
                    Remove
                  </button>
                </p>
              </div>
            </li>
          ),
        )}
      </ul>
      {edit ? (
        <LegendBox title={edit === "new" ? "A new address" : "Edit the address"}>
          <AddressLegend initial={edit === "new" ? undefined : edit} onDone={() => setEdit(null)} onCancel={() => setEdit(null)} />
        </LegendBox>
      ) : (
        <button type="button" onClick={() => setEdit("new")} className={`${s.btn} ${s.btnLine} h-11 justify-self-start px-5 text-[15px]`}>
          Add an address
        </button>
      )}
    </div>
  );
}

function Dashboard({ user }: { user: User }) {
  const orders = useOrders();
  const wish = useWishlist();
  const now = useNow();
  const counts: Record<string, number> = { orders: orders.length, wishlist: wish.length, addresses: user.addresses.length };
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-(--a-ink) pb-6">
        <div>
          <p className="flex items-center gap-2 text-[15px] text-(--a-muted)">
            <Mark className="size-6" /> Your sheet of the atlas
          </p>
          <h1 className={`${s.serif} mt-3 text-[clamp(2.4rem,5.6vw,4.4rem)] leading-[0.95] tracking-[-0.02em]`}>{user.name.split(" ")[0]}, welcome back.</h1>
        </div>
        <button type="button" onClick={signOut} className={`${s.btn} ${s.btnLine} h-11 px-5 text-[15px]`}>
          Sign out
        </button>
      </header>
      <div className="mt-8 grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
        <nav aria-label="Account sections" className="lg:sticky lg:top-24 lg:self-start">
          <LegendBox title="Legend">
            <ul className="grid gap-1">
              {SECTIONS.map((x) => (
                <li key={x.id}>
                  <a href={`#a8a-${x.id}`} className="flex items-center gap-3 rounded-[8px] px-2 py-2 text-[16px] hover:bg-(--a-paper-2)">
                    <span className="grid w-7 place-items-center">
                      <Sym k={x.sym} />
                    </span>
                    <span className="flex-1">{x.label}</span>
                    {x.id in counts && <span className="tabular-nums text-(--a-muted)">{counts[x.id]}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </LegendBox>
        </nav>
        <div className="grid gap-16">
          <section id="a8a-orders" aria-labelledby="a8a-orders-h" className="scroll-mt-28">
            <h2 id="a8a-orders-h" className={`${s.serif} flex items-center gap-3 text-[32px]`}>
              <Sym k="route" /> Orders
            </h2>
            {orders.length === 0 ? (
              <p className="mt-4 text-[16px] text-(--a-ink-2)">
                No routes yet.{" "}
                <Link href="/d/08/shop" className={s.link}>
                  Open the shop
                </Link>{" "}
                and your first order will appear here with its route.
              </p>
            ) : (
              <ul className="mt-5 grid gap-5">{now && orders.map((o) => <OrderRow key={o.id} o={o} now={now} />)}</ul>
            )}
          </section>
          <section id="a8a-wishlist" aria-labelledby="a8a-wishlist-h" className="scroll-mt-28">
            <h2 id="a8a-wishlist-h" className={`${s.serif} flex items-center gap-3 text-[32px]`}>
              <Sym k="mark" /> Wishlist
            </h2>
            {wish.length === 0 ? (
              <p className="mt-4 text-[16px] text-(--a-ink-2)">Nothing saved. The bookmark on any piece keeps it here.</p>
            ) : (
              <ul className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-3">
                {wish.map((slug) => {
                  const p = getProduct(slug);
                  if (!p) return null;
                  return (
                    <li key={slug} className={`${s.card} ${s.flow}`}>
                      <Link href={`/d/08/p/${slug}`} className="relative block aspect-[4/5] overflow-hidden bg-(--a-paper-2)">
                        <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="(min-width: 768px) 280px, 45vw" />
                      </Link>
                      <div className="p-3">
                        <p className={`${s.serif} text-[17px] leading-tight`}>{p.name}</p>
                        <p className="mt-1 text-[14px] tabular-nums text-(--a-muted)">{priceLabel(p)}</p>
                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[14px]">
                          <button type="button" onClick={() => (addToBag(slug), toggleWishlist(slug))} className={s.link}>
                            Move to bag
                          </button>
                          <button type="button" onClick={() => toggleWishlist(slug)} className={s.link}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          <section id="a8a-addresses" aria-labelledby="a8a-addresses-h" className="scroll-mt-28">
            <h2 id="a8a-addresses-h" className={`${s.serif} mb-5 flex items-center gap-3 text-[32px]`}>
              <Sym k="pin" /> Addresses
            </h2>
            <Addresses user={user} />
          </section>
          <section id="a8a-profile" aria-labelledby="a8a-profile-h" className="scroll-mt-28">
            <h2 id="a8a-profile-h" className={`${s.serif} mb-5 flex items-center gap-3 text-[32px]`}>
              <Sym k="dot" /> Profile
            </h2>
            <Profile user={user} />
          </section>
        </div>
      </div>
    </div>
  );
}

export function Account() {
  const hydrated = useHydrated();
  const user = useUser();
  if (!hydrated) return <div className={`${s.wait} mx-auto h-[60svh] max-w-[1320px]`} aria-busy="true" />;
  if (user) return <Dashboard user={user} />;
  return (
    <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-4 md:px-8 lg:grid-cols-[1fr_520px] lg:items-start lg:gap-16">
      <div>
        <h1 className={`${s.serif} text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.95] tracking-[-0.02em]`}>Your sheet of the atlas</h1>
        <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-(--a-ink-2)">An account keeps your part of the map: the route of every order, the pieces you have bookmarked, and the addresses they travel to.</p>
        <ul className="mt-8 grid max-w-[520px] gap-4 border-t border-(--a-ink) pt-5 text-[16px]">
          {[
            { k: "route", t: "Orders and their routes", d: "Each order drawn from the workshop to your door, live as it moves." },
            { k: "mark", t: "A wishlist", d: "Bookmark pieces from either wood; they wait here." },
            { k: "pin", t: "Saved addresses", d: "Checkout fills itself in." },
          ].map((x) => (
            <li key={x.t} className="flex gap-4">
              <span className="grid w-8 shrink-0 place-items-center pt-1">
                <Sym k={x.k} />
              </span>
              <span>
                <span className={`${s.serif} block text-[19px]`}>{x.t}</span>
                <span className="text-(--a-ink-2)">{x.d}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <AuthLegend />
    </div>
  );
}
