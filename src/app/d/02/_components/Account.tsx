"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { removeAddress, saveAddress, signOut, toggleWishlist, updateProfile, useUser, useWishlist, validate, type Address, type User } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import { STAGES, canCancel, canReturn, cancelOrder, formatDate, requestReturn, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR, getProduct, priceLabel, type Product } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { AddressForm } from "./AddressForm";
import { AuthPanel } from "./AuthForms";
import { EASE, SHOP, WOOD_LABEL, productHref, splitName, trackHref } from "./copy";
import { OrderSeal } from "./StageDial";
import { Station } from "./Station";
import { bagUI } from "./store";
import { s } from "./cls";
import { ArrowIcon, Field, Loader, PillLink, Toggle } from "./ui";

/* ---------------- signed out: three overlapping circles say what an account holds ---------------- */
function SignedOut() {
  const circles = [
    { t: "Orders", d: "Every order, followed round its six stages", x: "0%", y: "0%", bg: "var(--m-accent-soft)" },
    { t: "Wishlist", d: "Pieces you saved, in either wood", x: "42%", y: "0%", bg: "var(--o-floor)" },
    { t: "Addresses", d: "Home, office, family", x: "21%", y: "38%", bg: "var(--o-stone)" },
  ];
  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <h1 className={`${s.display} text-[clamp(2.8rem,4.8vw,4.6rem)]`}>Your account</h1>
        <p className="mt-6 max-w-[440px] text-[17px] leading-relaxed text-[var(--o-ink-2)]">Sign in to place orders, follow them to your door, and keep the pieces you have saved.</p>
        <div className="relative mt-10 aspect-[1.4] w-full max-w-[460px]">
          {circles.map((c) => (
            <div
              key={c.t}
              className="absolute grid aspect-square w-[58%] place-items-center rounded-full border border-[var(--o-line)] p-[9%] text-center mix-blend-multiply"
              style={{ left: c.x, top: c.y, background: c.bg }}
            >
              <div>
                <p className={`${s.syne} text-[clamp(1rem,2.4vw,1.25rem)] font-bold`}>{c.t}</p>
                <p className="mt-1 text-[13px] leading-snug text-[var(--o-ink-2)]">{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-7">
        <div className="rounded-[40px] border border-[var(--o-line)] bg-[var(--o-card)] p-5 shadow-[0_30px_80px_-50px_rgb(25_23_20/0.5)] md:p-9">
          <AuthPanel />
        </div>
      </div>
    </div>
  );
}

/* ---------------- orders ---------------- */
function OrderCard({ o, now }: { o: Order; now: number }) {
  const t = trackingFor(o, now);
  const [mode, setMode] = useState<"" | "cancel" | "return">("");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const rid = useId();
  const status = o.status === "cancelled" ? "Cancelled" : o.status === "return-requested" ? "Return requested" : STAGES[t.current].label;
  const act = (e?: FormEvent) => {
    e?.preventDefault();
    const m = mode === "cancel" ? cancelOrder(o.id, Date.now()) : requestReturn(o.id, reason, Date.now());
    setErr(m);
    if (!m) setMode("");
  };
  return (
    <li className="rounded-[32px] border border-[var(--o-line)] bg-[var(--o-card)] p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <OrderSeal order={o} now={now} />
        <div className="min-w-0 flex-1">
          <p className={`${s.syne} text-[18px] font-bold tabular-nums`}>{o.id}</p>
          <p className="text-[14px] text-[var(--o-muted)]">
            {formatDate(o.placedAt, true)}, <span className={`font-semibold ${o.status ? "text-[var(--m-accent)]" : "text-[var(--o-ink)]"}`}>{status}</span>
          </p>
        </div>
        <div className="flex">
          {o.lines.slice(0, 4).map((l, i) => (
            <span key={l.slug + i} className={`relative size-11 overflow-hidden rounded-full border-2 border-[var(--o-card)] bg-[var(--o-floor)] ${i ? "-ml-4" : ""}`}>
              <Photo p={{ id: l.photoId, alt: l.name }} sizes="44px" />
            </span>
          ))}
        </div>
        <div className="text-right">
          <p className={`${s.syne} text-[20px] font-bold tabular-nums`}>{formatINR(o.total)}</p>
          {o.coupon && (
            <p className="text-[12px] tabular-nums text-[var(--m-accent)]">
              {o.coupon}, saved {formatINR(o.discount ?? 0)}
            </p>
          )}
        </div>
      </div>
      <p className="mt-3 text-[14px] text-[var(--o-ink-2)]">
        {o.lines.map((l) => `${splitName(l.name)[0]}${l.qty > 1 ? ` × ${l.qty}` : ""}`).join(", ")}
        {!o.status && !t.delivered && <span className="text-[var(--o-muted)]">. Arrives {formatDate(t.estimate.from)} to {formatDate(t.estimate.to)}.</span>}
        {o.returnReason && <span className="text-[var(--o-muted)]">. Reason given: {o.returnReason}</span>}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={trackHref(o.id)} className="group inline-flex h-11 items-center gap-2 rounded-full bg-[var(--o-ink)] pl-5 pr-1.5 text-[14px] font-semibold text-white transition-colors hover:bg-black">
          Track
          <span className="grid size-8 place-items-center rounded-full bg-[var(--m-accent)] transition-transform group-hover:rotate-[-45deg]">
            <ArrowIcon className="size-3.5" />
          </span>
        </Link>
        {canCancel(o, now) && mode === "" && (
          <button type="button" onClick={() => setMode("cancel")} className="h-11 rounded-full border border-[var(--o-line)] px-5 text-[14px] font-semibold transition-colors hover:border-[var(--o-ink)]">
            Cancel order
          </button>
        )}
        {canReturn(o, now) && mode === "" && (
          <button type="button" onClick={() => setMode("return")} className="h-11 rounded-full border border-[var(--o-line)] px-5 text-[14px] font-semibold transition-colors hover:border-[var(--o-ink)]">
            Request a return
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {mode && (
          <motion.form
            key={mode}
            onSubmit={act}
            noValidate
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-[24px] bg-[var(--o-stone)] p-4">
              {mode === "cancel" ? (
                <p className="text-[15px]">Cancel {o.id}? It has not shipped yet, so nothing leaves the workshop.</p>
              ) : (
                <Field label="Why are you returning it?" error={err}>
                  {(a) => <textarea id={a.id} aria-describedby={a.describedBy} aria-invalid={a.invalid} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className={s.field} />}
                </Field>
              )}
              {mode === "cancel" && err && (
                <p id={rid} role="alert" className="mt-2 text-[13px] font-medium text-[#a3241b]">
                  {err}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button type="submit" className="h-11 rounded-full bg-[var(--o-ink)] px-5 text-[14px] font-semibold text-white hover:bg-black">
                  {mode === "cancel" ? "Yes, cancel it" : "Send the request"}
                </button>
                <button type="button" onClick={() => setMode("")} className="h-11 rounded-full px-4 text-[14px] font-semibold text-[var(--o-muted)] hover:text-[var(--o-ink)]">
                  {mode === "cancel" ? "Keep the order" : "Never mind"}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </li>
  );
}

function Empty({ title, line }: { title: string; line: string }) {
  return (
    <div className="flex flex-col items-center gap-8 py-6 sm:flex-row">
      <div className="grid size-[220px] shrink-0 place-items-center rounded-full border-2 border-dashed border-[var(--o-line)] p-8 text-center">
        <p className={`${s.display} text-[30px]`}>{title}</p>
      </div>
      <div>
        <p className="max-w-[360px] text-[16px] leading-relaxed text-[var(--o-ink-2)]">{line}</p>
        <PillLink href={SHOP} className="mt-5">
          Go to the shop
        </PillLink>
      </div>
    </div>
  );
}

function Orders({ now }: { now: number }) {
  const orders = useOrders();
  if (!orders.length) return <Empty title="No orders yet" line="When you place an order it appears here, with its stage on the dial and a link to follow it to your door." />;
  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <OrderCard key={o.id} o={o} now={now} />
      ))}
    </ul>
  );
}

function Wishlist() {
  const list = useWishlist()
    .map((slug) => getProduct(slug))
    .filter((p): p is Product => !!p);
  if (!list.length) return <Empty title="Nothing saved" line="Tap the heart on any piece in the shop to keep it here, in either wood." />;
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
      {list.map((p) => (
        <li key={p.slug} className="text-center">
          <Link href={productHref(p.slug)} className="relative mx-auto block aspect-square w-[86%] overflow-hidden rounded-full bg-[var(--o-floor)] transition-transform duration-500 hover:scale-[1.03]">
            <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="(min-width: 768px) 22vw, 40vw" />
          </Link>
          <p className={`${s.syne} mt-3 text-[16px] font-bold leading-tight`}>{splitName(p.name)[0]}</p>
          <p className="text-[13px] text-[var(--o-muted)]">
            {WOOD_LABEL[p.wood]}, {priceLabel(p)}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                bag.add(p.slug);
                bagUI.bump();
                toggleWishlist(p.slug);
              }}
              className="h-10 rounded-full bg-[var(--o-ink)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-black active:scale-95"
            >
              Move to bag
            </button>
            <button type="button" onClick={() => toggleWishlist(p.slug)} className="h-10 rounded-full border border-[var(--o-line)] px-4 text-[13px] font-semibold transition-colors hover:border-[var(--o-ink)]">
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Addresses({ user }: { user: User }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const save = (a: Omit<Address, "id" | "isDefault">, makeDefault: boolean, id?: string) => {
    saveAddress({ ...a, ...(id ? { id } : {}), isDefault: makeDefault || user.addresses.length === 0 });
    setEditing(null);
  };
  return (
    <div>
      <ul className="grid gap-4 md:grid-cols-2">
        {user.addresses.map((a) =>
          editing === a.id ? (
            <li key={a.id} className="rounded-[32px] border border-[var(--o-ink)] bg-[var(--o-card)] p-5 md:col-span-2 md:p-7">
              <AddressForm initial={a} defaultOption submitLabel="Save address" onCancel={() => setEditing(null)} onSubmit={(d, o) => save(d, o.makeDefault, a.id)} />
            </li>
          ) : (
            <li key={a.id} className="relative rounded-[32px] border border-[var(--o-line)] bg-[var(--o-card)] p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <p className={`${s.syne} text-[18px] font-bold`}>{a.label}</p>
                {a.isDefault && <span className="rounded-full bg-[var(--m-accent)] px-3 py-1 text-[12px] font-bold text-white">Default</span>}
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--o-ink-2)]">
                {a.name}, +91 {a.phone}
                <br />
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.city}, {a.state} {a.pin}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setEditing(a.id)} className="h-10 rounded-full border border-[var(--o-line)] px-4 text-[13px] font-semibold hover:border-[var(--o-ink)]">
                  Edit
                </button>
                {!a.isDefault && (
                  <button type="button" onClick={() => saveAddress({ ...a, isDefault: true })} className="h-10 rounded-full border border-[var(--o-line)] px-4 text-[13px] font-semibold hover:border-[var(--o-ink)]">
                    Set as default
                  </button>
                )}
                <button type="button" onClick={() => removeAddress(a.id)} className="h-10 rounded-full px-4 text-[13px] font-semibold text-[var(--o-muted)] hover:text-[#a3241b]">
                  Remove
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
      {editing === "new" ? (
        <div className="mt-4 rounded-[32px] border border-[var(--o-ink)] bg-[var(--o-card)] p-5 md:p-7">
          <AddressForm initial={{ name: user.name, phone: user.phone }} defaultOption submitLabel="Save address" onCancel={() => setEditing(null)} onSubmit={(d, o) => save(d, o.makeDefault)} />
        </div>
      ) : (
        <button type="button" onClick={() => setEditing("new")} className="group mt-4 flex items-center gap-4 rounded-full border-2 border-dashed border-[var(--o-line)] p-2 pr-6 transition-colors hover:border-[var(--o-ink)]">
          <span className="grid size-12 place-items-center rounded-full bg-[var(--o-ink)] text-[22px] leading-none text-white transition-transform group-hover:rotate-90">+</span>
          <span className={`${s.syne} text-[16px] font-bold`}>Add an address</span>
        </button>
      )}
    </div>
  );
}

/** The profile: three stations (name, email, mobile) beside the member's own turning badge. */
function Profile({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [news, setNews] = useState(user.newsletter);
  const [err, setErr] = useState<{ name?: string | null; phone?: string | null }>({});
  const [saved, setSaved] = useState(false);
  const since = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(user.createdAt);
  const shown = name.trim() || user.name;
  const initials = shown
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = { name: validate.name(name), phone: validate.phone(phone) };
    setErr(next);
    if (next.name || next.phone) return;
    updateProfile({ name: name.trim(), phone: phone.replace(/\s/g, ""), newsletter: news });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };
  return (
    <div className="grid items-start gap-12 md:grid-cols-[minmax(0,1fr)_260px] lg:gap-20">
      <form onSubmit={submit} noValidate className="max-w-[620px] space-y-3">
        <Station label="Full name" glyph={initials || "Aa"} done={!validate.name(name)} error={err.name}>
          {(a) => <input id={a.id} autoComplete="name" aria-describedby={a.describedBy} aria-invalid={a.invalid} value={name} onChange={(e) => setName(e.target.value)} className={s.stIn} />}
        </Station>
        <Station label="Email, your sign-in" glyph="@" locked hint="Your email is your sign-in and cannot be changed here.">
          {(a) => <input id={a.id} type="email" autoComplete="email" aria-describedby={a.describedBy} value={user.email} disabled className={s.stIn} />}
        </Station>
        <Station label="Mobile number" glyph="+91" done={!validate.phone(phone)} error={err.phone}>
          {(a) => (
            <input
              id={a.id}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              aria-describedby={a.describedBy}
              aria-invalid={a.invalid}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className={`${s.stIn} tabular-nums`}
            />
          )}
        </Station>
        <div className="rounded-full border border-[var(--o-line)] bg-[var(--o-card)] py-3 pl-[18px] pr-5">
          <Toggle checked={news} onChange={setNews}>
            Letters from the Santalum Circle
          </Toggle>
        </div>
        <div className="flex items-center gap-4 pt-4">
          <button type="submit" className="group flex h-14 items-center gap-5 rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.98]">
            Save changes
            <span className="grid size-10 place-items-center rounded-full bg-[var(--m-accent)] transition-transform duration-300 group-hover:rotate-90">
              <ArrowIcon />
            </span>
          </button>
          <p aria-live="polite" className="text-[14px] font-semibold text-[var(--m-accent)]">
            {saved ? "Saved" : ""}
          </p>
        </div>
      </form>

      {/* the member's badge: their name runs round a turned disc, and follows what is typed */}
      <figure aria-hidden className="relative mx-auto hidden size-[240px] md:block">
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <svg viewBox="0 0 240 240" className={`absolute inset-0 size-full ${s.spinSlow}`}>
            <defs>
              <path id={`o2-member-${user.id}`} d="M120,120 m-100,0 a100,100 0 1,1 200,0 a100,100 0 1,1 -200,0" />
            </defs>
            <text className={s.syne} fontSize="13" fontWeight="700" fill="var(--o-ink)">
              <textPath href={`#o2-member-${user.id}`} textLength="622" lengthAdjust="spacing">
                {shown} <tspan fill="var(--m-accent)">●</tspan> Santalum Circle <tspan fill="var(--m-accent)">●</tspan> since {since} <tspan fill="var(--m-accent)">●</tspan>
              </textPath>
            </text>
          </svg>
        </div>
        <span className={`absolute inset-[46px] rounded-full ${s.seal}`} />
        <span className={`${s.syne} absolute inset-[80px] grid place-items-center rounded-full bg-[var(--o-card)] text-[26px] font-bold shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45)]`}>{initials}</span>
        <figcaption className="absolute inset-x-0 -bottom-12 text-center text-[13px] text-[var(--o-muted)]">{news ? "Letters: on" : "Letters: off"}</figcaption>
      </figure>
    </div>
  );
}

type Tab = "orders" | "wishlist" | "addresses" | "profile";

/** Signed in: a monogram seal, four round tabs like planets, and the panel for the one chosen. */
function Dashboard({ user, now }: { user: User; now: number }) {
  const reduced = !!useReducedMotion();
  const orders = useOrders();
  const wish = useWishlist();
  const [tab, setTab] = useState<Tab>("orders");
  const id = useId();
  const live = orders.filter((o) => !o.status && !trackingFor(o, now).delivered).length;
  const tabs: { k: Tab; label: string; n: string }[] = [
    { k: "orders", label: "Orders", n: String(orders.length) },
    { k: "wishlist", label: "Wishlist", n: String(wish.length) },
    { k: "addresses", label: "Addresses", n: String(user.addresses.length) },
    { k: "profile", label: "Profile", n: user.name[0]?.toUpperCase() ?? "" },
  ];
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <span className={`relative grid size-[104px] shrink-0 place-items-center rounded-full ${s.seal}`}>
            <span className={`${s.syne} grid size-[62%] place-items-center rounded-full bg-[var(--o-card)] text-[26px] font-bold`}>{initials}</span>
          </span>
          <div className="min-w-0">
            <h1 className={`${s.display} text-[clamp(2.4rem,6vw,4.6rem)]`}>{user.name.split(" ")[0]}</h1>
            <p className="mt-2 truncate text-[15px] text-[var(--o-muted)]">
              {user.email}, with us since {new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(user.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {live > 0 && <p className="text-[14px] text-[var(--o-ink-2)]">{live} on the way</p>}
          <button type="button" onClick={() => signOut()} className="h-12 rounded-full border border-[var(--o-ink)] px-6 text-[15px] font-semibold transition-colors hover:bg-[var(--o-ink)] hover:text-white">
            Sign out
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Your account" className={`-mx-5 mt-12 flex gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:gap-8 md:px-0 ${s.noBar}`}>
        {tabs.map((t) => {
          const on = tab === t.k;
          return (
            <button
              key={t.k}
              type="button"
              role="tab"
              id={`${id}-${t.k}`}
              aria-selected={on}
              aria-controls={`${id}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setTab(t.k)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const i = tabs.findIndex((x) => x.k === t.k);
                const nk = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length].k;
                setTab(nk);
                document.getElementById(`${id}-${nk}`)?.focus();
              }}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <span
                className={`${s.syne} grid size-[72px] place-items-center rounded-full border text-[22px] font-bold tabular-nums transition-[background-color,color,transform,border-color] duration-500 group-hover:-translate-y-1 md:size-[88px] md:text-[26px] ${
                  on ? "border-[var(--o-ink)] bg-[var(--o-ink)] text-white" : "border-[var(--o-line)] bg-[var(--o-card)] text-[var(--o-ink)]"
                }`}
              >
                {t.n}
              </span>
              <span className={`text-[14px] font-semibold ${on ? "text-[var(--o-ink)]" : "text-[var(--o-muted)]"}`}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`} className="mt-10 border-t border-[var(--o-line)] pt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
            {tab === "orders" && <Orders now={now} />}
            {tab === "wishlist" && <Wishlist />}
            {tab === "addresses" && <Addresses user={user} />}
            {tab === "profile" && <Profile key={user.id} user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Account() {
  const hydrated = useHydrated();
  const user = useUser();
  const now = useNow();
  if (!hydrated) return <Loader label="Opening your account" />;
  if (!user) return <SignedOut />;
  return <Dashboard user={user} now={now ?? user.createdAt} />;
}
