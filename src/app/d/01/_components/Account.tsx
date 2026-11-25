"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { removeAddress, saveAddress, signOut, toggleWishlist, updateProfile, useUser, useWishlist, validate, type Address, type User } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import { canCancel, canReturn, cancelOrder, formatDate, requestReturn, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR, getProduct, priceLabel, type Product } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { s } from "./cx";
import { linePhoto, shotsOf } from "./data";
import { AddressForm, AddressLines, Field, ForgotNote, SignInForm, SignUpForm, Tick } from "./forms";
import { MiniRail, statusStamp } from "./JobCard";
import { openPiece } from "./SheetChange";
import { sheet } from "./store";

/** The account as a work-order file: open an existing file or start a new one; inside, orders, saved parts, addresses, profile. */
export function Account() {
  const hydrated = useHydrated();
  const user = useUser();
  return (
    <div className="px-4 pb-10 pt-[84px] md:px-8 md:pt-[104px]">
      <div className="mx-auto max-w-[1400px]">{!hydrated ? <div className="min-h-[70svh]" aria-busy="true" /> : user ? <Dossier user={user} /> : <OpenFile />}</div>
    </div>
  );
}

/* ---------------- signed out: two folders ---------------- */

function Folder({ tab, title, note, children }: { tab: string; title: string; note: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="relative pt-9">
      <span className={`${s.mono} absolute left-0 top-0 h-9 rounded-t-[8px] border border-b-0 border-(--ink) bg-(--sheet) px-4 pt-2.5 text-[11.5px]`}>{tab}</span>
      <div className={`${s.sheet} border border-(--ink) px-5 py-6 md:px-8 md:py-8`}>
        <h2 className={`${s.x125} text-[clamp(1.7rem,2.8vw,2.4rem)] font-[600] leading-none tracking-[-0.02em]`}>{title}</h2>
        <p className="mt-2 text-[15px] text-(--ink-2)">{note}</p>
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

function OpenFile() {
  return (
    <>
      <header className="grid border border-(--ink) bg-(--sheet) md:grid-cols-[1fr_auto]">
        <div className="px-5 py-5 md:px-7 md:py-6">
          <h1 className={`${s.x125} text-[clamp(2.4rem,5.6vw,5rem)] font-[600] leading-[0.9] tracking-[-0.03em]`}>Work-order file</h1>
          <p className="mt-3 max-w-[40rem] text-[16px] leading-[1.55] text-(--ink-2)">
            Your file holds every order and its job card, the parts you saved, your delivery addresses and your letters from the Circle.
          </p>
        </div>
        <dl className={`${s.mono} grid grid-cols-[auto_1fr] content-center gap-x-4 gap-y-1 border-t border-(--hair-2) px-5 py-3 text-[11.5px] md:border-l md:border-t-0 md:px-7`}>
          <dt className="text-(--steel)">Holds</dt>
          <dd>Orders, saved parts, addresses</dd>
          <dt className="text-(--steel)">Needed for</dt>
          <dd>Checkout and tracking</dd>
        </dl>
      </header>
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-8">
        <Folder tab="File, existing" title="Open your file" note="Sign in with the email you ordered with.">
          <SignInForm submitLabel="Open the file" />
          <ForgotNote />
        </Folder>
        <Folder tab="File, new" title="Start a new file" note="Four lines, and the workshop knows where to send your pieces.">
          <SignUpForm submitLabel="Start the file" />
        </Folder>
      </div>
    </>
  );
}

/* ---------------- signed in: the dossier ---------------- */

const SECTIONS = [
  ["orders", "Orders"],
  ["saved", "Saved parts"],
  ["addresses", "Addresses"],
  ["profile", "Profile"],
] as const;

function fileNo(u: User) {
  let h = 11;
  for (const ch of u.id) h = (h * 31 + ch.charCodeAt(0)) % 99991;
  return `F-${String(h).padStart(5, "0")}`;
}

function Dossier({ user }: { user: User }) {
  const orders = useOrders();
  return (
    <>
      <header className="grid border border-(--ink) bg-(--sheet) md:grid-cols-[1fr_auto_auto_auto]">
        <div className="px-5 py-5 md:px-7 md:py-6">
          <p className={`${s.mono} text-[11px] text-(--steel)`}>Work-order file</p>
          <h1 className={`${s.x125} mt-1 text-[clamp(2.2rem,5vw,4.4rem)] font-[600] leading-[0.92] tracking-[-0.03em]`}>{user.name}</h1>
          <p className={`${s.mono} mt-2 text-[12px] text-(--ink-2) [overflow-wrap:anywhere]`}>{user.email}</p>
        </div>
        <Cell k="File no." v={fileNo(user)} />
        <Cell k="Opened" v={formatDate(user.createdAt)} />
        <div className="flex items-center border-t border-(--hair-2) px-5 py-3 md:border-l md:border-t-0 md:px-6">
          <button type="button" onClick={() => signOut()} className={s.btnLine}>
            Sign out
          </button>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <nav aria-label="In this file" className="min-w-0 lg:sticky lg:top-[76px] lg:self-start">
          <ol className="grid grid-cols-4 border-l border-t border-(--hair-2) lg:block lg:border-l-0 lg:border-(--ink)">
            {SECTIONS.map(([id, label], i) => (
              <li key={id} className="min-w-0 border-b border-r border-(--hair-2) lg:border-r-0 lg:border-(--hair)">
                <a
                  href={`#${id}`}
                  className={`${s.mono} flex flex-col items-center gap-0.5 px-1 py-2 text-center text-[11.5px] leading-tight transition-colors active:bg-(--wash-2) lg:hidden`}
                >
                  <span className="text-[10px] text-(--steel)">{String.fromCharCode(65 + i)}</span>
                  {label}
                </a>
                <a href={`#${id}`} className="group hidden items-center gap-3 py-3 text-[15px] text-(--ink-2) transition-colors hover:text-(--ink) lg:flex">
                  <span className={`${s.mono} w-6 text-[10.5px] text-(--steel)`}>{String.fromCharCode(65 + i)}</span>
                  {label}
                  {id === "orders" && <span className={`${s.mono} ml-auto text-[11px] tabular-nums text-(--steel)`}>{orders.length}</span>}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="grid min-w-0 gap-16">
          <Orders orders={orders} />
          <Saved />
          <Addresses user={user} />
          <Profile user={user} />
        </div>
      </div>
    </>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div className={`${s.mono} flex items-center justify-between gap-4 border-t border-(--hair-2) px-5 py-3 text-[12px] md:block md:border-l md:border-t-0 md:px-6 md:py-6`}>
      <span className="block text-[10.5px] text-(--steel)">{k}</span>
      <span className="block tabular-nums md:mt-2 md:text-[15px]">{v}</span>
    </div>
  );
}

function Part({ id, letter, title, aside, children }: { id: string; letter: string; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-(--ink) pb-3">
        <h2 id={`${id}-h`} className={`${s.x110} text-[clamp(1.6rem,2.6vw,2.3rem)] font-[600] leading-none tracking-[-0.015em]`}>
          <span className={`${s.mono} mr-3 align-middle text-[12px] font-normal text-(--steel)`}>{letter}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/* ---- orders, with cancel before shipping and return after delivery ---- */

function Orders({ orders }: { orders: Order[] }) {
  return (
    <Part id="orders" letter="A" title="Orders" aside={<span className={`${s.mono} text-[11.5px] text-(--steel)`}>Job cards, newest first</span>}>
      {orders.length === 0 ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-5 border border-dashed border-(--hair-2) bg-(--sheet) px-5 py-7">
          <p className="text-[16px] text-(--ink-2)">No work orders in this file yet.</p>
          <Link href="/d/01/shop" className={s.btn}>
            Open the catalogue
          </Link>
        </div>
      ) : (
        <ul>
          {orders.map((o) => (
            <OrderTicket key={o.id} o={o} />
          ))}
        </ul>
      )}
    </Part>
  );
}

function OrderTicket({ o }: { o: Order }) {
  const nowLive = useNow();
  const now = nowLive ?? o.placedAt;
  const [mode, setMode] = useState<"idle" | "cancel" | "return">("idle");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const stamp = statusStamp(o);
  const count = o.lines.reduce((n, l) => n + l.qty, 0);

  return (
    <li className="relative grid gap-5 border-b border-(--hair-2) py-6 md:grid-cols-[1fr_auto] md:items-start">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <span className={`${s.x110} text-[22px] font-[620] tabular-nums leading-none`}>{o.id}</span>
          <span className={`${s.mono} text-[11.5px] text-(--steel)`}>
            {formatDate(o.placedAt, true)}, {count} {count === 1 ? "piece" : "pieces"}
          </span>
          {stamp && <span className={`${s.stamp} ${s.mono} rotate-[-4deg] rounded-[3px] px-2 py-0.5 text-[12px] font-medium`}>{stamp}</span>}
        </div>
        <div className="mt-3">
          <MiniRail o={o} now={now} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          {o.lines.slice(0, 5).map((l) => (
            <span key={`${l.slug}-${l.option ?? ""}`} className="relative size-11 overflow-hidden rounded-full bg-(--paper-2) shadow-[0_0_0_2px_var(--paper)]" title={l.name}>
              <Photo p={linePhoto(l)} sizes="44px" />
            </span>
          ))}
          <span className="ml-2 min-w-0 truncate text-[14.5px] text-(--ink-2)">{o.lines.map((l) => l.name).join(", ")}</span>
        </div>
        {o.status === "return-requested" && o.returnReason && <p className="mt-3 text-[14px] text-(--ink-2)">Return reason: {o.returnReason}. The workshop will write to arrange collection.</p>}

        {mode === "cancel" && (
          <div className="mt-4 flex flex-wrap items-center gap-4 border-l-2 border-(--bad) pl-4">
            <p className="text-[15px]">Cancel this order? Nothing has shipped yet.</p>
            <button
              type="button"
              className={s.btn}
              onClick={() => {
                const e = cancelOrder(o.id, Date.now());
                setErr(e);
                if (!e) setMode("idle");
              }}
            >
              Yes, cancel it
            </button>
            <button type="button" className={s.link} onClick={() => setMode("idle")}>
              Keep the order
            </button>
          </div>
        )}
        {mode === "return" && (
          <form
            className="mt-4 grid max-w-[34rem] gap-4 border-l-2 border-(--accent) pl-4"
            onSubmit={(e) => {
              e.preventDefault();
              const er = requestReturn(o.id, reason, Date.now());
              setErr(er);
              if (!er) setMode("idle");
            }}
          >
            <label className={s.field}>
              <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder=" " />
              <span>Why is it coming back?</span>
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className={s.btn}>
                Request the return
              </button>
              <button type="button" className={s.link} onClick={() => setMode("idle")}>
                Never mind
              </button>
            </div>
          </form>
        )}
        {err && (
          <p role="alert" className={`${s.err} mt-3`}>
            {err}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end">
        <p className={`${s.mono} text-right text-[12px]`}>
          {o.discount ? (
            <span className="block text-(--accent)">
              {o.coupon} −{formatINR(o.discount)}
            </span>
          ) : null}
          <span className={`${s.x110} block font-[family-name:var(--f01-archivo)] text-[22px] font-[600] tabular-nums`}>{formatINR(o.total)}</span>
        </p>
        <Link href={`/d/01/track?o=${o.id}`} className={s.btnLine}>
          Open the job card
        </Link>
        {mode === "idle" && canCancel(o, now) && (
          <button type="button" className={s.link} onClick={() => setMode("cancel")}>
            Cancel order
          </button>
        )}
        {mode === "idle" && canReturn(o, now) && (
          <button type="button" className={s.link} onClick={() => setMode("return")}>
            Request a return
          </button>
        )}
      </div>
    </li>
  );
}

/* ---- saved parts (wishlist) ---- */

function Saved() {
  const list = useWishlist()
    .map((x) => getProduct(x))
    .filter((p): p is Product => !!p);
  return (
    <Part id="saved" letter="B" title="Saved parts" aside={<span className={`${s.mono} text-[11.5px] text-(--steel)`}>{list.length} saved</span>}>
      {list.length === 0 ? (
        <p className="mt-5 text-[16px] text-(--ink-2)">
          Nothing saved. Use the tag on any piece in the{" "}
          <Link href="/d/01/shop" className={`${s.link} text-(--ink)`}>
            catalogue
          </Link>{" "}
          to keep it here.
        </p>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <li key={p.slug} className={`${s.corners} flex items-center gap-4 border border-(--hair-2) bg-(--sheet) p-4`}>
              <Link href={`/d/01/p/${p.slug}`} onClick={(e) => openPiece(e, p.slug)} className="relative size-16 shrink-0 overflow-hidden rounded-full bg-(--paper-2)">
                <Photo p={shotsOf(p)[0].photo} tone={shotsOf(p)[0].tone} sizes="64px" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/d/01/p/${p.slug}`} onClick={(e) => openPiece(e, p.slug)} className="block truncate text-[15.5px] font-[560] transition-colors hover:text-(--accent)">
                  {p.name}
                </Link>
                <p className={`${s.mono} text-[12px] tabular-nums text-(--ink-2)`}>{priceLabel(p)}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <button
                    type="button"
                    className={`${s.link} text-(--ink)`}
                    onClick={() => {
                      bag.add(p.slug);
                      toggleWishlist(p.slug);
                      sheet.open();
                    }}
                  >
                    Move to bag
                  </button>
                  <button type="button" className={s.link} onClick={() => toggleWishlist(p.slug)}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Part>
  );
}

/* ---- addresses ---- */

function Addresses({ user }: { user: User }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const done = (a: Omit<Address, "id">, id?: string) => {
    saveAddress({ ...a, ...(id ? { id } : {}) });
    setEditing(null);
  };
  return (
    <Part
      id="addresses"
      letter="C"
      title="Addresses"
      aside={
        editing !== "new" && (
          <button type="button" className={s.btnLine} onClick={() => setEditing("new")}>
            Add an address
          </button>
        )
      }
    >
      {editing === "new" && (
        <div className={`${s.sheet} mt-5 border border-(--ink) p-5 md:p-6`}>
          <AddressForm initial={{ name: user.name, phone: user.phone }} submitLabel="Save address" defaultOption onCancel={() => setEditing(null)} onSubmit={(a) => done(a)} />
        </div>
      )}
      {user.addresses.length === 0 && editing !== "new" ? (
        <p className="mt-5 text-[16px] text-(--ink-2)">No addresses yet. Add one here or at checkout.</p>
      ) : (
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {user.addresses.map((a) =>
            editing === a.id ? (
              <li key={a.id} className={`${s.sheet} border border-(--ink) p-5 md:col-span-2 md:p-6`}>
                <AddressForm initial={a} submitLabel="Save changes" defaultOption onCancel={() => setEditing(null)} onSubmit={(x) => done(x, a.id)} />
              </li>
            ) : (
              <li key={a.id} className={`relative border bg-(--sheet) p-5 ${a.isDefault ? "border-(--ink)" : "border-(--hair-2)"}`}>
                <p className={`${s.mono} mb-2 flex items-center justify-between text-[11px] text-(--steel)`}>
                  {a.label}
                  {a.isDefault && <span className={`${s.stamp} rotate-[-3deg] rounded-[3px] px-1.5 py-0.5 font-medium`}>Default</span>}
                </p>
                <AddressLines a={a} />
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  <button type="button" className={`${s.link} text-(--ink)`} onClick={() => setEditing(a.id)}>
                    Edit
                  </button>
                  {!a.isDefault && (
                    <button type="button" className={s.link} onClick={() => saveAddress({ ...a, isDefault: true })}>
                      Set as default
                    </button>
                  )}
                  <button type="button" className={s.link} onClick={() => removeAddress(a.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </Part>
  );
}

/* ---- profile ---- */

function Profile({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [news, setNews] = useState(user.newsletter);
  const [err, setErr] = useState<{ name?: string | null; phone?: string | null }>({});
  const [saved, setSaved] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = { name: validate.name(name), phone: validate.phone(phone) };
    setErr(next);
    if (next.name || next.phone) return;
    updateProfile({ name: name.trim(), phone: phone.replace(/\s/g, ""), newsletter: news });
    setSaved(true);
  };
  return (
    <Part id="profile" letter="D" title="Profile">
      <form onSubmit={submit} noValidate className="mt-6 max-w-[40rem]">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="name" autoComplete="name" value={name} onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }} error={err.name} />
          <Field label="Mobile" name="tel" type="tel" autoComplete="tel" value={phone} onChange={(e) => {
              setPhone(e.target.value);
              setSaved(false);
            }} error={err.phone} />
        </div>
        <p className={`${s.mono} mt-4 text-[12px] text-(--steel) [overflow-wrap:anywhere]`}>Email {user.email}, kept as the file&rsquo;s key</p>
        <div className="mt-5">
          <Tick checked={news} onChange={(v) => {
              setNews(v);
              setSaved(false);
            }}>
            Letters from the Santalum Circle
          </Tick>
        </div>
        <div className="mt-7 flex items-center gap-4">
          <button type="submit" className={s.btn}>
            Save profile
          </button>
          {saved && (
            <span role="status" className={`${s.mono} text-[12px] text-(--accent)`}>
              Filed
            </span>
          )}
        </div>
      </form>
    </Part>
  );
}
