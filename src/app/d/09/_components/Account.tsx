"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { removeAddress, saveAddress, signOut, toggleWishlist, updateProfile, useUser, useWishlist, validate, type Address, type User } from "@/lib/shop/account";
import { CONTENT } from "@/lib/shop/content";
import { canCancel, canReturn, cancelOrder, formatDate, requestReturn, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { getProduct, priceLabel } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import s from "../styles";
import { DAY_END, DAY_START, hhmm, word } from "./data";
import { AddressForm, AddressLines, AuthPanel, Field } from "./forms";
import { HeldSky } from "./Held";
import { addPiece } from "./store";
import { SunArc } from "./SunArc";

/**
 * The visitor's own time of day: the account page's sky stands at the real hour, so the sundial and
 * the line above the greeting always agree. Outside the day (before 06:10, after 19:40) the sky holds
 * at first light or under the moon, and the line says so in words instead of showing a second clock.
 */
function timeOf(now: number | null) {
  if (now === null) return { min: 500, greeting: "Welcome", label: "", clock: false };
  const d = new Date(now);
  const m = d.getHours() * 60 + d.getMinutes();
  const greeting = m >= 300 && m < 720 ? "Good morning" : m >= 720 && m < 1020 ? "Good afternoon" : m >= 1020 && m < 1320 ? "Good evening" : "Welcome back";
  if (m >= DAY_START && m <= DAY_END) return { min: m, greeting, label: hhmm(m), clock: true };
  const early = m >= 240 && m < DAY_START;
  return { min: early ? DAY_START : DAY_END, greeting, label: early ? "Before first light" : "After the lamps are lit", clock: false };
}

export function AccountDawn() {
  const hydrated = useHydrated();
  const user = useUser();
  const now = useNow(30_000);
  const t = timeOf(now);
  return (
    <>
      <HeldSky min={t.min} />
      <div className={`${s.swap} relative mx-auto max-w-[1500px] px-5 pb-10 pt-28 sm:px-8 lg:px-10 lg:pt-36`}>
        {!hydrated ? <div className="min-h-[70svh]" /> : user ? <Dashboard user={user} t={t} now={now ?? 0} /> : <SignedOut t={t} />}
      </div>
    </>
  );
}

function Hour({ t, suffix = "" }: { t: ReturnType<typeof timeOf>; suffix?: string }) {
  if (!t.label) return <p className="min-h-[1.2em] text-[21px] lg:text-[25px]" />;
  return t.clock ? (
    <p className={`${s.num} min-h-[1.2em] text-[21px] tracking-[0.04em] text-[var(--muted)] lg:text-[25px]`}>
      {t.label}
      {suffix && <span className="font-[inherit] text-[15px] tracking-normal lg:text-[17px]">{suffix}</span>}
    </p>
  ) : (
    <p className="flex min-h-[1.2em] items-center gap-2.5 text-[15px] text-[var(--muted)] lg:min-h-[1.6em] lg:text-[17px]">
      <span aria-hidden className="size-2 rounded-full bg-[var(--m-accent)]" />
      {t.label}
    </p>
  );
}

/* ---------- signed out: the day is waiting; sign in at whatever hour it is ---------- */
function SignedOut({ t }: { t: ReturnType<typeof timeOf> }) {
  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-6">
        <Hour t={t} suffix=", where you are" />
        <h1 className={`${s.display} mt-1 text-[clamp(3rem,9vw,6.4rem)] leading-[0.92]`}>
          {t.greeting}.
          <br />
          Sign in to your day
        </h1>
        <p className="mt-6 max-w-[32rem] text-[17px] leading-[1.7] text-[var(--muted)]">
          Your orders and where the sun stands on each of them, the pieces you kept for later, and the addresses you send to, in one place.
        </p>
        <div className="relative mt-12 hidden h-[min(42svh,380px)] lg:block">
          <div className="absolute left-3 top-3 h-[calc(100%-12px)] w-[38%]">
            <div className={`${s.mask} ${s.arch} ${s.niche} size-full`}>
              <W red={<Photo p={PHOTOS.malaHand} sizes="260px" />} white={<Photo p={PHOTOS.diyaHands} sizes="260px" />} />
            </div>
          </div>
          <div className="absolute bottom-0 left-[34%] size-[min(20svh,180px)]">
            <div className={`${s.mask} ${s.circle} size-full`}>
              <W red={<Photo p={PHOTOS.redGrain} sizes="180px" />} white={<Photo p={PHOTOS.oilHands} sizes="180px" />} />
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-6 lg:pt-10">
        <div className={`${s.slip} px-6 pb-9 pt-8 sm:px-10`}>
          <AuthPanel />
        </div>
      </div>
    </div>
  );
}

/* ---------- signed in: the day so far ---------- */
function Dashboard({ user, t, now }: { user: User; t: ReturnType<typeof timeOf>; now: number }) {
  const orders = useOrders();
  const kept = useWishlist();
  const first = user.name.split(" ")[0];
  const nav = [
    { id: "orders", label: "Orders", n: orders.length },
    { id: "kept", label: "Kept for later", n: kept.length },
    { id: "addresses", label: "Addresses", n: user.addresses.length },
    { id: "profile", label: "Profile" },
  ];
  return (
    <>
      <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="lg:col-span-8">
          <Hour t={t} />
          <h1 className={`${s.display} mt-1 text-[clamp(3rem,9vw,6.4rem)] leading-[0.92]`}>
            {t.greeting}, {first}
          </h1>
        </div>
        <p className="text-[15px] leading-[1.6] text-[var(--muted)] lg:col-span-4 lg:pb-3 lg:text-right">
          Signed in as {user.email}.{" "}
          <button type="button" onClick={signOut} className={s.link}>
            Sign out
          </button>
        </p>
      </header>
      <nav aria-label="Your account" className={`${s.rail} mt-10`}>
        {nav.map((x) => (
          <a key={x.id} href={`#${x.id}`} className={s.chip}>
            {x.label}
            {x.n !== undefined && <span className={`${s.tab} text-[13px] text-[var(--muted)]`}>{x.n}</span>}
          </a>
        ))}
      </nav>
      <Orders orders={orders} now={now} />
      <Kept slugs={kept} />
      <Addresses user={user} />
      <Profile user={user} />
    </>
  );
}

function Section({ id, title, children, aside }: { id: string; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-20 scroll-mt-28 border-t border-[var(--hair)] pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 id={`${id}-h`} className={`${s.display} text-[clamp(2.2rem,5vw,3.4rem)] leading-none`}>
          {title}
        </h2>
        {aside}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Orders({ orders, now }: { orders: Order[]; now: number }) {
  return (
    <Section id="orders" title="Your orders">
      {orders.length === 0 ? (
        <p className="max-w-[32rem] text-[16px] leading-[1.7] text-[var(--muted)]">
          No orders yet. When you place one, it appears here with the sun at its stage.{" "}
          <Link href="/d/09/shop" className={s.link}>
            Go to the shop
          </Link>
        </p>
      ) : (
        <ol className="grid gap-6">
          {orders.map((o) => (
            <OrderRow key={o.id} o={o} now={now} />
          ))}
        </ol>
      )}
    </Section>
  );
}

function OrderRow({ o, now }: { o: Order; now: number }) {
  const [mode, setMode] = useState<null | "cancel" | "return">(null);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const tr = trackingFor(o, now);
  const stage = o.status === "cancelled" ? "Cancelled" : o.status === "return-requested" ? "Return requested" : tr.stages[tr.current].label;
  const count = o.lines.reduce((n, l) => n + l.qty, 0);
  const act = (fn: () => string | null) => {
    const e = fn();
    setErr(e);
    if (!e) setMode(null);
  };
  return (
    <li className={`${s.slip} grid gap-6 px-6 pb-7 pt-7 sm:px-8 md:grid-cols-12 md:items-center`}>
      <div className={`md:col-span-3 ${o.status ? "opacity-40 grayscale" : ""}`}>
        <SunArc current={o.status === "cancelled" ? 0 : tr.current} compact labelled={!o.status} className="max-w-[16rem]" />
      </div>
      <div className="md:col-span-5">
        <p className={`${s.tab} text-[14px] text-[var(--muted)]`}>
          {o.id}, {formatDate(o.placedAt)}
        </p>
        <p className={`${s.display} mt-1 text-[30px] leading-none ${o.status ? "text-[var(--m-accent)]" : ""}`}>{stage}</p>
        <p className="mt-2 text-[15px] leading-[1.6]">
          {o.lines.map((l) => l.name).join(", ")}
          <span className="block text-[var(--muted)]">
            {word(count)} {count === 1 ? "piece" : "pieces"}, ₹{o.total.toLocaleString("en-IN")}
            {o.coupon && o.discount ? ` after ${o.coupon}, saving ₹${o.discount.toLocaleString("en-IN")}` : ""}
          </span>
          {o.status === "return-requested" && o.returnReason && <span className="block text-[14px] text-[var(--muted)]">Reason: {o.returnReason}</span>}
        </p>
      </div>
      <div className="flex flex-col items-start gap-3 md:col-span-4 md:items-end">
        {!o.status && (
          <Link href={`/d/09/track?o=${o.id}`} className={`${s.ghost} min-h-[2.75rem] px-5 text-[14px]`}>
            Track this order
          </Link>
        )}
        {canCancel(o, now) && mode !== "cancel" && (
          <button type="button" onClick={() => setMode("cancel")} className={s.link}>
            Cancel the order
          </button>
        )}
        {canReturn(o, now) && mode !== "return" && (
          <button type="button" onClick={() => setMode("return")} className={s.link}>
            Ask for a return
          </button>
        )}
      </div>
      {mode === "cancel" && (
        <div className="flex flex-wrap items-center gap-4 border-t border-dotted border-[rgb(42_36_32/0.22)] pt-5 md:col-span-12">
          <p className="text-[15px]">Cancel {o.id}? It has not shipped, so nothing leaves the workshop.</p>
          <button type="button" onClick={() => act(() => cancelOrder(o.id, Date.now()))} className={`${s.btn} min-h-[2.75rem] px-5 text-[14px]`}>
            Yes, cancel it
          </button>
          <button type="button" onClick={() => setMode(null)} className={s.link}>
            Keep the order
          </button>
        </div>
      )}
      {mode === "return" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            act(() => requestReturn(o.id, reason, Date.now()));
          }}
          className="grid gap-4 border-t border-dotted border-[rgb(42_36_32/0.22)] pt-5 md:col-span-12"
        >
          <div className={s.field} data-invalid={err ? "true" : undefined}>
            <label htmlFor={`ret-${o.id}`} className={s.fieldLabel}>
              Why are you returning it?
            </label>
            <textarea id={`ret-${o.id}`} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} aria-invalid={err ? true : undefined} />
          </div>
          <div className="flex items-center gap-5">
            <button type="submit" className={`${s.btn} min-h-[2.75rem] px-5 text-[14px]`}>
              Ask for the return
            </button>
            <button type="button" onClick={() => setMode(null)} className={s.link}>
              Not now
            </button>
          </div>
        </form>
      )}
      {err && (
        <p role="alert" className={`${s.error} md:col-span-12`}>
          {err}
        </p>
      )}
    </li>
  );
}

function Kept({ slugs }: { slugs: string[] }) {
  const items = slugs.flatMap((x) => {
    const p = getProduct(x);
    return p ? [p] : [];
  });
  return (
    <Section id="kept" title="Kept for later">
      {items.length === 0 ? (
        <p className="max-w-[32rem] text-[16px] leading-[1.7] text-[var(--muted)]">
          Nothing kept yet. Touch the small sun on any piece to keep it here.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {items.map((p, i) => (
            <li key={p.slug}>
              <Link href={`/d/09/p/${p.slug}`} className={`${s.press} block`}>
                <span className={`${s.mask} ${s[(["arch", "egg", "pebble"] as const)[i % 3]]} block aspect-[4/5] w-full`}>
                  <span className={`${s.zoom} absolute inset-0`}>
                    <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="(min-width: 768px) 22vw, 46vw" />
                  </span>
                </span>
              </Link>
              <p className="mt-3 text-[12px] text-[var(--muted)]">{CONTENT[p.wood].name}</p>
              <p className={`${s.display} text-[22px] leading-tight`}>{p.name}</p>
              <p className={`${s.tab} mt-0.5 text-[14px]`}>{priceLabel(p)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  type="button"
                  onClick={() => {
                    addPiece(p.slug);
                    toggleWishlist(p.slug);
                  }}
                  className={`${s.ghost} min-h-[2.5rem] px-4 text-[14px]`}
                >
                  Move to tray
                </button>
                <button type="button" onClick={() => toggleWishlist(p.slug)} className={s.link}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Addresses({ user }: { user: User }) {
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  return (
    <Section
      id="addresses"
      title="Addresses"
      aside={
        editing === null && (
          <button type="button" onClick={() => setEditing("new")} className={s.link}>
            Add an address
          </button>
        )
      }
    >
      {editing !== null ? (
        <div className={`${s.slip} max-w-[46rem] px-6 pb-8 pt-7 sm:px-8`}>
          <AddressForm
            initial={editing === "new" ? undefined : editing}
            defaultName={user.name}
            defaultPhone={user.phone}
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : user.addresses.length === 0 ? (
        <p className="text-[16px] text-[var(--muted)]">No saved addresses yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {user.addresses.map((a) => (
            <li key={a.id} className="rounded-[1.6rem] border border-[var(--hair)] bg-[rgb(255_255_255/0.3)] px-5 py-5">
              <p className="flex items-center gap-2 text-[13px] text-[var(--muted)]">
                {a.isDefault && <span aria-hidden className="size-2 rounded-full bg-[var(--m-accent)]" />}
                {a.label}
                {a.isDefault ? ", default" : ""}
              </p>
              <div className="mt-2">
                <AddressLines a={a} />
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                <button type="button" onClick={() => setEditing(a)} className={s.link}>
                  Edit
                </button>
                {!a.isDefault && (
                  <button type="button" onClick={() => saveAddress({ ...a, isDefault: true })} className={s.link}>
                    Make default
                  </button>
                )}
                <button type="button" onClick={() => removeAddress(a.id)} className={s.link}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Profile({ user }: { user: User }) {
  const [err, setErr] = useState<{ name?: string | null; phone?: string | null }>({});
  const [saved, setSaved] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const name = String(d.get("name") ?? "");
    const phone = String(d.get("phone") ?? "");
    const next = { name: validate.name(name), phone: validate.phone(phone) };
    setErr(next);
    setSaved(false);
    if (next.name || next.phone) return;
    updateProfile({ name: name.trim(), phone: phone.replace(/\s/g, ""), newsletter: d.get("newsletter") === "on" });
    setSaved(true);
  };
  return (
    <Section id="profile" title="Profile">
      <form onSubmit={submit} noValidate className="grid max-w-[46rem] gap-x-8 gap-y-7 sm:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" defaultValue={user.name} error={err.name} />
        <Field label="Mobile" name="phone" type="tel" autoComplete="tel" defaultValue={user.phone} error={err.phone} />
        <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={user.email} readOnly hint="Your sign-in; it cannot be changed in the preview" className="sm:col-span-2" />
        <label className={`${s.check} sm:col-span-2`}>
          <input type="checkbox" name="newsletter" defaultChecked={user.newsletter} />
          <span>Letters from the Santalum Circle, only when there is something to say.</span>
        </label>
        <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
          <button type="submit" className={s.btn}>
            Save
          </button>
          {saved && (
            <p role="status" className="text-[15px] text-[var(--muted)]">
              Saved.
            </p>
          )}
        </div>
      </form>
    </Section>
  );
}
