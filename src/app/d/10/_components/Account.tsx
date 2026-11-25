"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { removeAddress, saveAddress, signOut, toggleWishlist, updateProfile, useUser, useWishlist, validate, type Address, type User } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { cancelOrder, canCancel, canReturn, formatDate, requestReturn, STAGES, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR, getProduct, priceLabel, type Product } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import k from "../k";
import { Check, Field, Stretch, TabBar, Thumb } from "./bits";
import { AddressForm, AddressLines, AuthPanel, PREVIEW_ACCOUNTS, Submit } from "./forms";
import { announceAdded, splitName } from "./lib";

type Tab = "orders" | "wishlist" | "addresses" | "profile";

/** The account: sign in or create one in large type; signed in, a dashboard whose sections are words. */
export function Account() {
  const hydrated = useHydrated();
  const user = useUser();
  if (!hydrated) {
    return (
      <div className={`${k.gut} min-h-[80svh] pb-16 pt-24 md:pt-32`}>
        <Stretch text="Account" cap={0.3} />
      </div>
    );
  }
  return user ? <Dashboard user={user} key={user.id} /> : <SignedOut />;
}

function SignedOut() {
  return (
    <div className={`${k.gut} pb-20 pt-24 md:pt-32`}>
      <p className={`${k.mono} text-[var(--k10-grey)]`}>Your account at Santalum Maison</p>
      <Stretch text="Account" cap={0.3} className="mt-3" />
      <div className="mt-10 grid grid-cols-1 gap-14 border-t border-[var(--k10-ink)] pt-8 md:mt-14 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-7">
          <AuthPanel idBase="k10-acc-auth" />
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <p className={`${k.disp} whitespace-normal text-[length:clamp(28px,2.8vw,44px)] leading-[0.95] [font-variation-settings:'wdth'_78,'wght'_700]`}>
            An account is needed to place an order, so you can follow it to your door.
          </p>
          <ul className={`${k.monoL} mt-6 space-y-2`}>
            <li>Every order, with its tracking, from placed to delivered.</li>
            <li>Your addresses, ready at checkout.</li>
            <li>The wishlist, kept from both woods. Anything saved before signing in comes with you.</li>
            <li>Letters from the Santalum Circle, if you want them.</li>
          </ul>
          <p className={`${k.mono} mt-6 text-[var(--k10-grey)]`}>{PREVIEW_ACCOUNTS}</p>
          <Link href="/d/10/track" className={`${k.mini} mt-6`} data-ghost>
            Track an order without signing in
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Dashboard({ user }: { user: User }) {
  const orders = useOrders();
  const wish = useWishlist();
  const [tab, setTab] = useState<Tab>("orders");
  const first = user.name.trim().split(/\s+/)[0] || "Account";
  return (
    <div className={`${k.gut} pb-20 pt-24 md:pt-32`}>
      <div className={`${k.mono} flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-[var(--k10-grey)]`}>
        <span>Signed in as {user.email}</span>
        <button type="button" onClick={signOut} className={`${k.link} text-[var(--k10-ink)]`}>
          Sign out
        </button>
      </div>
      <Stretch text={first} cap={0.32} className="mt-3" />

      <div className="mt-10 border-t border-[var(--k10-ink)] pt-4 md:mt-14">
        <TabBar
          idBase="k10-acc"
          label="Your account"
          value={tab}
          onChange={setTab}
          size="text-[length:clamp(30px,4.8vw,80px)]"
          items={[
            { id: "orders", label: "Orders", note: String(orders.length) },
            { id: "wishlist", label: "Wishlist", note: String(wish.length) },
            { id: "addresses", label: "Addresses", note: String(user.addresses.length) },
            { id: "profile", label: "Profile" },
          ]}
        />
      </div>
      <div id="k10-acc-panel" role="tabpanel" aria-labelledby={`k10-acc-tab-${tab}`} className="mt-8">
        {tab === "orders" && <Orders orders={orders} />}
        {tab === "wishlist" && <Wishlist slugs={wish} />}
        {tab === "addresses" && <Addresses user={user} />}
        {tab === "profile" && <Profile user={user} />}
      </div>
    </div>
  );
}

function Orders({ orders }: { orders: Order[] }) {
  const now = useNow();
  if (!orders.length) {
    return (
      <Empty title="No orders yet" text="When you place an order it appears here, with its tracking from placed to delivered.">
        <Link href="/d/10/shop" className={k.btn}>
          <span className={k.btnLabel}>Go to the shop</span>
        </Link>
      </Empty>
    );
  }
  return (
    <ul className={`${k.rows} border-t border-[var(--k10-ink)]`}>
      {orders.map((o) => (
        <OrderRow key={o.id} o={o} now={now} />
      ))}
    </ul>
  );
}

/** One order: its number stretches on hover, its stage is set as a word, and the action that fits its stage sits beside it. */
function OrderRow({ o, now }: { o: Order; now: number | null }) {
  const [mode, setMode] = useState<"cancel" | "return" | null>(null);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const t = now ? trackingFor(o, now) : null;
  const stage = o.status === "cancelled" ? "Cancelled" : o.status === "return-requested" ? "Return requested" : t ? STAGES[t.current].label : "Order placed";
  const live = !o.status && t && !t.delivered;
  const count = o.lines.reduce((n, l) => n + l.qty, 0);
  const cancelOk = now !== null && canCancel(o, now);
  const returnOk = now !== null && canReturn(o, now);

  const doCancel = () => {
    if (now === null) return;
    const r = cancelOrder(o.id, now);
    setErr(r);
    if (!r) setMode(null);
  };
  const doReturn = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (now === null) return;
    const r = requestReturn(o.id, reason, now);
    setErr(r);
    if (!r) setMode(null);
  };

  return (
    <li className={`${k.row} border-b border-[var(--k10-line)] py-4`} style={{ ["--hw" as string]: 92 }}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-[minmax(0,1fr)_auto_9rem_auto] md:items-end">
        <div className="min-w-0">
          <Link
            href={`/d/10/track?o=${o.id}`}
            className={`${k.rowName} block text-[length:clamp(40px,5.4vw,88px)] tabular-nums ${o.status === "cancelled" ? "text-[var(--k10-grey)] line-through decoration-2" : ""}`}
          >
            {o.id}
          </Link>
          <p className={`${k.mono} mt-1 truncate text-[var(--k10-grey)]`}>
            {count} {count === 1 ? "piece" : "pieces"}: {o.lines.map((l) => splitName(l.name).head).join(", ")}
          </p>
        </div>
        <p className="flex items-center gap-2.5">
          {live && <span className={k.pulse} aria-hidden />}
          <span data-state={o.status ? "done" : "current"} className={`${k.stage} whitespace-normal md:whitespace-nowrap text-[length:clamp(26px,2.4vw,38px)] ${o.status ? "!text-[var(--k10-grey)]" : ""}`}>
            {stage}
          </span>
        </p>
        <p className={`${k.mono} text-[var(--k10-grey)]`}>
          {formatDate(o.placedAt)}
          <br />
          <span className={`${k.monoL} text-[var(--k10-ink)] tabular-nums`}>{formatINR(o.total)}</span>
          {o.discount ? (
            <>
              <br />
              <span className="text-[var(--k10-accent)]">
                {o.coupon}, −{formatINR(o.discount)}
              </span>
            </>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {cancelOk && (
            <button type="button" data-ghost onClick={() => setMode(mode === "cancel" ? null : "cancel")} aria-expanded={mode === "cancel"} className={k.mini}>
              Cancel
            </button>
          )}
          {returnOk && (
            <button type="button" data-ghost onClick={() => setMode(mode === "return" ? null : "return")} aria-expanded={mode === "return"} className={k.mini}>
              Return
            </button>
          )}
          <Link href={`/d/10/track?o=${o.id}`} className={k.mini}>
            Track
          </Link>
        </div>
      </div>
      {o.status === "return-requested" && o.returnReason && (
        <p className={`${k.mono} mt-2 text-[var(--k10-grey)]`}>Your reason: {o.returnReason}. The Maison will write with a pickup date.</p>
      )}
      {o.status === "cancelled" && <p className={`${k.mono} mt-2 text-[var(--k10-grey)]`}>Cancelled before it shipped. Nothing was charged in this preview.</p>}
      {mode === "cancel" && (
        <div role="group" aria-label={`Cancel ${o.id}`} className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--k10-line)] pt-4">
          <p className={`${k.disp} whitespace-normal text-[length:clamp(24px,2.4vw,36px)] leading-[0.95] [font-variation-settings:'wdth'_80,'wght'_720]`}>
            Cancel {o.id}? It has not shipped yet.
          </p>
          <button type="button" onClick={doCancel} className={k.mini}>
            Yes, cancel it
          </button>
          <button type="button" onClick={() => setMode(null)} className={`${k.mono} ${k.link}`}>
            Keep the order
          </button>
        </div>
      )}
      {mode === "return" && (
        <form onSubmit={doReturn} noValidate className="mt-4 grid gap-4 border-t border-[var(--k10-line)] pt-4 md:max-w-[760px]">
          <label htmlFor={`k10-ret-${o.id}`} className={`${k.mono} text-[var(--k10-grey)]`}>
            Why are you returning it? Unused pieces within 14 days; numbered editions are final.
          </label>
          <textarea
            id={`k10-ret-${o.id}`}
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-describedby={err ? `k10-ret-${o.id}-e` : undefined}
            className={`${k.field} resize-none !text-[length:clamp(20px,2vw,28px)]`}
          />
          <button type="submit" className={`${k.mini} justify-self-start`}>
            Ask for the return
          </button>
        </form>
      )}
      {err && (
        <p id={`k10-ret-${o.id}-e`} role="alert" className={`${k.err} mt-2`}>
          {err}
        </p>
      )}
    </li>
  );
}

function Wishlist({ slugs }: { slugs: string[] }) {
  const items = slugs.map((s) => getProduct(s)).filter((p): p is Product => !!p);
  if (!items.length) {
    return (
      <Empty title="Nothing saved" text="Save pieces from either wood with the ring beside each one in the shop. They wait here until you want them.">
        <Link href="/d/10/shop" className={k.btn}>
          <span className={k.btnLabel}>Go to the shop</span>
        </Link>
      </Empty>
    );
  }
  return (
    <ul className={`${k.rows} border-t border-[var(--k10-ink)]`}>
      {items.map((p) => (
        <li key={p.slug} className={`${k.srow} grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-[var(--k10-line)] py-3 md:grid-cols-[auto_minmax(0,1fr)_10rem_auto] md:gap-x-6`} style={{ ["--hw" as string]: 100 }}>
          <Thumb p={p} sizes="140px" className="h-[56px] w-[92px] md:h-[76px] md:w-[136px]" />
          <div className="min-w-0">
            <Link href={`/d/10/p/${p.slug}`} className={`${k.rowName} block truncate text-[length:clamp(34px,4.6vw,72px)]`}>
              {splitName(p.name).head}
            </Link>
            <p className={`${k.mono} mt-1 truncate text-[var(--k10-grey)]`}>
              {CONTENT[p.wood].name}, {p.short}
            </p>
          </div>
          <p className={`${k.monoL} col-span-2 tabular-nums md:col-span-1 md:text-right`}>{priceLabel(p)}</p>
          <div className="col-span-2 flex items-center justify-between gap-4 md:col-span-1 md:justify-end">
            <button type="button" onClick={() => toggleWishlist(p.slug)} className={`${k.mono} ${k.link} text-[var(--k10-grey)]`}>
              Remove
            </button>
            <button
              type="button"
              onClick={() => {
                bag.add(p.slug);
                toggleWishlist(p.slug);
                announceAdded(splitName(p.name).head, p.wood);
              }}
              className={k.mini}
            >
              Move to bag
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Addresses({ user }: { user: User }) {
  const [editing, setEditing] = useState<Address | "new" | null>(user.addresses.length ? null : "new");
  if (editing) {
    const a = editing === "new" ? undefined : editing;
    return (
      <div className="max-w-[900px]">
        <p className={`${k.disp} mb-8 text-[length:clamp(30px,3.6vw,56px)] leading-[0.9] [font-variation-settings:'wdth'_110,'wght'_800]`}>
          {a ? `Edit ${a.label || "address"}` : "A new address"}
        </p>
        <AddressForm
          initial={a ?? { label: user.addresses.length ? "Office" : "Home", name: user.name, phone: user.phone, line1: "", line2: "", city: "", state: "", pin: "" }}
          submitLabel={a ? "Save the changes" : "Save the address"}
          onCancel={user.addresses.length ? () => setEditing(null) : undefined}
          onSubmit={(d) => {
            saveAddress({ ...d, id: a?.id, isDefault: a?.isDefault });
            setEditing(null);
          }}
        />
      </div>
    );
  }
  return (
    <div>
      <ul className="border-t border-[var(--k10-ink)]">
        {user.addresses.map((a) => (
          <li key={a.id} className="grid grid-cols-1 gap-x-8 gap-y-3 border-b border-[var(--k10-line)] py-5 md:grid-cols-[16rem_minmax(0,1fr)_auto] md:items-start">
            <p
              className={`${k.disp} text-[length:clamp(30px,3.4vw,52px)] leading-[0.86] ${a.isDefault ? "[font-variation-settings:'wdth'_120,'wght'_820]" : "[font-variation-settings:'wdth'_60,'wght'_760]"}`}
            >
              {a.label || "Address"}
              {a.isDefault && <span className={`${k.mono} mt-1 block text-[var(--k10-accent)]`}>Default</span>}
            </p>
            <p className={k.monoL}>
              <AddressLines a={a} />
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 md:justify-end">
              {!a.isDefault && (
                <button type="button" onClick={() => saveAddress({ ...a, isDefault: true })} className={`${k.mono} ${k.link}`}>
                  Make default
                </button>
              )}
              <button type="button" onClick={() => setEditing(a)} className={`${k.mono} ${k.link}`}>
                Edit
              </button>
              <button type="button" onClick={() => removeAddress(a.id)} className={`${k.mono} ${k.link} text-[var(--k10-grey)]`}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setEditing("new")} className={`${k.btn} ${k.ghost} mt-8 w-full sm:w-auto sm:min-w-[340px]`}>
        <span className={k.btnLabel}>Add an address</span>
      </button>
    </div>
  );
}

function Profile({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [news, setNews] = useState(user.newsletter);
  const [errs, setErrs] = useState<{ name?: string; phone?: string }>({});
  const [saved, setSaved] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = { name: validate.name(name) ?? undefined, phone: validate.phone(phone) ?? undefined };
    setErrs(found);
    if (found.name || found.phone) return;
    updateProfile({ name: name.trim(), phone: phone.replace(/\s/g, ""), newsletter: news });
    setSaved(true);
  };
  return (
    <form onSubmit={submit} noValidate className="grid max-w-[900px] gap-8" onChange={() => setSaved(false)}>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Field label="Your name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errs.name} />
        <Field label="Mobile" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errs.phone} />
      </div>
      <div>
        <p className={`${k.mono} text-[var(--k10-grey)]`}>Email</p>
        <p className={`${k.disp} mt-1 break-all text-[length:clamp(26px,3.4vw,46px)] leading-[1.1] [font-variation-settings:'wdth'_70,'wght'_560]`}>{user.email}</p>
      </div>
      <Check checked={news} onChange={(e) => setNews(e.target.checked)} label="Letters from the Santalum Circle" note="When a new batch is turned or distilled, and first word on the Vault and the Reserve." />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="sm:flex-1">
          <Submit>Save the profile</Submit>
        </div>
        <p role="status" className={`${k.mono} min-w-[10ch]`}>
          {saved ? "Saved." : ""}
        </p>
      </div>
      <p className={`${k.mono} text-[var(--k10-grey)]`}>
        Member since {formatDate(user.createdAt)}. {PREVIEW_ACCOUNTS}
      </p>
    </form>
  );
}

function Empty({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="border-t border-[var(--k10-ink)] pt-8">
      <p className={`${k.disp} whitespace-normal text-[length:clamp(52px,9vw,150px)] leading-[0.82] text-[var(--k10-grey)] [font-variation-settings:'wdth'_50,'wght'_260]`}>{title}</p>
      <p className={`${k.monoL} mt-5 max-w-[56ch]`}>{text}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
