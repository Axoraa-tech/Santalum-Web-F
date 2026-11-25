"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { removeAddress, saveAddress, signOut, toggleWishlist, updateProfile, useUser, useWishlist, validate, type Address, type User } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import { canCancel, canReturn, cancelOrder, formatDate, requestReturn, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR, getProduct } from "@/lib/shop/products";
import { AddressForm, AddressLines } from "./AddressForm";
import { AuthChoice } from "./AuthForms";
import { Field, SHOP, useHydrated } from "./bits";
import { Medallion } from "./Medallion";
import { StageBeads } from "./StageThread";
import { ui } from "./store";

const SECTIONS = [
  ["orders", "Orders"],
  ["saved", "Saved pieces"],
  ["addresses", "Addresses"],
  ["profile", "Profile"],
] as const;

/** The account: signed out, two forms on a thread; signed in, four knots down the page. */
export function Account() {
  const hydrated = useHydrated();
  const user = useUser();
  if (!hydrated) return <div className="min-h-[80svh]" aria-hidden />;
  if (!user) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 pb-28 pt-28 md:px-10 md:pt-36">
        <h1 className="s3-serif text-[clamp(3rem,7vw,6.4rem)] leading-[0.9]">Your account</h1>
        <p className="mb-12 mt-4 max-w-[34rem] text-[17px] leading-[1.6] text-(--ink)/75">
          Orders and their tracking, the pieces you saved, your addresses. One account for both woods.
        </p>
        <AuthChoice panes />
      </div>
    );
  }
  return <Dashboard user={user} />;
}

function Dashboard({ user }: { user: User }) {
  const first = user.name.split(" ")[0];
  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-28 pt-28 md:px-10 md:pt-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[15px] text-(--muted)">{user.email}</p>
          <h1 className="s3-serif mt-2 text-[clamp(3rem,7vw,6.4rem)] leading-[0.9]">{first}&apos;s strand</h1>
        </div>
        <button type="button" className="s3-btn s3-btn-line" onClick={signOut}>
          Sign out
        </button>
      </div>
      <div className="mt-14 grid gap-12 md:grid-cols-12 md:gap-10">
        <nav aria-label="Account sections" className="md:col-span-3">
          <ul className="relative border-l border-(--thread) pl-6 md:sticky md:top-28">
            {SECTIONS.map(([id, label]) => (
              <li key={id} className="relative">
                <span className="s3-knot absolute -left-[29px] top-1/2 -translate-y-1/2" aria-hidden />
                <a href={`#${id}`} className="s3-serif block py-2 text-[22px] transition-colors hover:text-(--m-accent)">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-24 md:col-span-9">
          <Orders />
          <Saved />
          <Addresses user={user} />
          <Profile user={user} />
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, aside, children }: { id: string; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--thread) pb-4">
        <h2 id={`${id}-h`} className="s3-serif text-[clamp(2rem,3.6vw,3rem)] leading-none">
          {title}
        </h2>
        {aside}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Orders() {
  const orders = useOrders();
  const now = useNow();
  return (
    <Section id="orders" title="Orders" aside={<span className="text-[15px] text-(--muted)">{orders.length ? `${orders.length} placed` : null}</span>}>
      {orders.length === 0 ? (
        <div className="rounded-[28px] bg-(--warm) p-6 md:p-8">
          <p className="s3-serif text-[26px]">Nothing ordered yet</p>
          <p className="mt-2 text-[16px] text-(--ink)/75">When you place an order, it hangs here with its six tracking beads.</p>
          <Link href={SHOP} className="s3-btn s3-btn-dark mt-5">
            <span className="s3-bead s3-btn-bead" aria-hidden />
            Go to the shop
          </Link>
        </div>
      ) : (
        <ol className="space-y-6">
          {orders.map((o) => (
            <OrderRow key={o.id} o={o} now={now} />
          ))}
        </ol>
      )}
    </Section>
  );
}

function OrderRow({ o, now }: { o: Order; now: number | null }) {
  const t = trackingFor(o, now ?? o.placedAt);
  const [mode, setMode] = useState<"none" | "cancel" | "return">("none");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const cancellable = now !== null && canCancel(o, now);
  const returnable = now !== null && canReturn(o, now);

  const doCancel = () => {
    const m = cancelOrder(o.id, Date.now());
    setErr(m);
    if (!m) setMode("none");
  };
  const doReturn = (e: FormEvent) => {
    e.preventDefault();
    const m = requestReturn(o.id, reason, Date.now());
    setErr(m);
    if (!m) setMode("none");
  };

  return (
    <li className="rounded-[28px] border border-(--line) bg-(--warm) p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="s3-serif text-[24px] leading-none tabular-nums">{o.id}</p>
          <p className="mt-1.5 text-[14px] text-(--muted)">Placed {formatDate(o.placedAt, true)}</p>
        </div>
        <p className="text-right">
          <span className="s3-serif block text-[24px] leading-none">{formatINR(o.total)}</span>
          {o.coupon && o.discount ? (
            <span className="mt-1 block text-[14px] text-(--m-accent)">
              {o.coupon}, −{formatINR(o.discount)}
            </span>
          ) : null}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <StageBeads t={t} status={o.status} />
        <span className="flex -space-x-3" aria-hidden>
          {o.lines.slice(0, 4).map((l) => (
            <span key={`${l.slug}-${l.option ?? ""}`} className="relative block h-11 w-11 overflow-hidden rounded-full border-[3px] border-(--warm)">
              <Photo p={{ id: l.photoId, alt: l.name }} sizes="44px" />
            </span>
          ))}
        </span>
      </div>
      <p className="mt-3 text-[15px] text-(--ink)/75">
        {o.lines.map((l) => `${l.name}${l.qty > 1 ? ` (${l.qty})` : ""}`).join(", ")}
        {o.status === "return-requested" && o.returnReason ? `. Return reason: ${o.returnReason}` : ""}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-(--line) pt-5">
        <Link href={`/d/03/track?o=${o.id}`} className="s3-btn s3-btn-dark s3-btn-sm">
          <span className="s3-bead s3-btn-bead" aria-hidden />
          Follow the thread
        </Link>
        {cancellable && mode === "none" && (
          <button type="button" className="s3-btn s3-btn-line s3-btn-sm" onClick={() => setMode("cancel")}>
            Cancel the order
          </button>
        )}
        {returnable && mode === "none" && (
          <button type="button" className="s3-btn s3-btn-line s3-btn-sm" onClick={() => setMode("return")}>
            Ask for a return
          </button>
        )}
        {!o.status && !cancellable && !returnable && now !== null && <span className="text-[14px] text-(--muted)">Shipped: returns open once it is delivered.</span>}
      </div>

      {mode === "cancel" && (
        <div className="mt-4 rounded-[20px] bg-(--linen) p-4" role="group" aria-label="Cancel the order">
          <p className="text-[16px]">Cancel {o.id}? It hasn&apos;t shipped, so nothing will be sent or charged.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="s3-btn s3-btn-dark s3-btn-sm" onClick={doCancel}>
              Yes, cancel it
            </button>
            <button type="button" className="s3-btn s3-btn-line s3-btn-sm" onClick={() => setMode("none")}>
              Keep the order
            </button>
          </div>
        </div>
      )}
      {mode === "return" && (
        <form onSubmit={doReturn} className="mt-4 rounded-[20px] bg-(--linen) p-4" noValidate>
          <Field label="What isn't right? (within 14 days of delivery)" error={err}>
            {(a) => <textarea {...a} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className="s3-input" />}
          </Field>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="submit" className="s3-btn s3-btn-dark s3-btn-sm">
              Request the return
            </button>
            <button type="button" className="s3-btn s3-btn-line s3-btn-sm" onClick={() => setMode("none")}>
              Not now
            </button>
          </div>
        </form>
      )}
      {err && mode !== "return" && (
        <p role="alert" className="s3-err">
          {err}
        </p>
      )}
    </li>
  );
}

function Saved() {
  const slugs = useWishlist();
  const pieces = slugs.map((s) => getProduct(s)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <Section id="saved" title="Saved pieces" aside={<span className="text-[15px] text-(--muted)">{pieces.length ? `${pieces.length} on the thread` : null}</span>}>
      {pieces.length === 0 ? (
        <p className="text-[16px] text-(--ink)/75">
          Nothing saved yet. Press <span className="whitespace-nowrap">Save</span> on any piece in the{" "}
          <Link href={SHOP} className="s3-link">
            shop
          </Link>{" "}
          and it hangs here.
        </p>
      ) : (
        <ul className="s3-meds">
          {pieces.map((p) => (
            <Medallion
              key={p.slug}
              p={p}
              actions={
                <>
                  <button
                    type="button"
                    className="s3-btn s3-btn-dark s3-btn-sm"
                    onClick={() => {
                      bag.add(p.slug, { option: p.options?.values[0].id });
                      toggleWishlist(p.slug);
                      ui.added();
                    }}
                  >
                    <span className="s3-bead s3-btn-bead" aria-hidden />
                    Move to bag
                  </button>
                  <button type="button" className="s3-wish" onClick={() => toggleWishlist(p.slug)}>
                    Remove
                  </button>
                </>
              }
            />
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
          <button type="button" className="s3-link text-[15px]" onClick={() => setEditing("new")}>
            Add an address
          </button>
        )
      }
    >
      {editing !== null ? (
        <AddressForm
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? { name: user.name, phone: user.phone } : editing}
          initialDefault={editing !== "new" && Boolean(editing.isDefault)}
          defaultOption
          submitLabel={editing === "new" ? "Save the address" : "Save the changes"}
          onCancel={() => setEditing(null)}
          onSubmit={(a, o) => {
            saveAddress({ ...a, ...(editing !== "new" ? { id: editing.id } : {}), isDefault: o.isDefault });
            setEditing(null);
          }}
        />
      ) : user.addresses.length === 0 ? (
        <p className="text-[16px] text-(--ink)/75">No addresses yet. Add one here, or at checkout.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {user.addresses.map((a) => (
            <li key={a.id} className="rounded-[24px] border border-(--line) bg-(--warm) p-5">
              <p className="flex items-center gap-2">
                <span className="s3-serif text-[22px] leading-none">{a.label}</span>
                {a.isDefault && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-(--muted)">
                    <span className="s3-bead h-2.5 w-2.5" aria-hidden />
                    Default
                  </span>
                )}
              </p>
              <div className="mt-3">
                <AddressLines a={a} />
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[15px]">
                <button type="button" className="s3-link" onClick={() => setEditing(a)}>
                  Edit
                </button>
                {!a.isDefault && (
                  <button type="button" className="s3-link" onClick={() => saveAddress({ ...a, isDefault: true })}>
                    Set as default
                  </button>
                )}
                <button type="button" className="s3-link" onClick={() => removeAddress(a.id)}>
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
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [news, setNews] = useState(user.newsletter);
  const [err, setErr] = useState<{ name?: string | null; phone?: string | null }>({});
  const [saved, setSaved] = useState(false);
  const save = (e: FormEvent) => {
    e.preventDefault();
    const next = { name: validate.name(name), phone: validate.phone(phone) };
    setErr(next);
    if (next.name || next.phone) return;
    updateProfile({ name: name.trim(), phone: phone.replace(/\s/g, ""), newsletter: news });
    setSaved(true);
  };
  return (
    <Section id="profile" title="Profile">
      <form onSubmit={save} noValidate className="grid max-w-[40rem] gap-4 sm:grid-cols-2">
        <Field label="Full name" error={err.name}>
          {(a) => <input {...a} name="name" autoComplete="name" value={name} onChange={(e) => (setName(e.target.value), setSaved(false))} className="s3-input" />}
        </Field>
        <Field label="Mobile number" error={err.phone}>
          {(a) => <input {...a} name="tel" type="tel" autoComplete="tel" value={phone} onChange={(e) => (setPhone(e.target.value), setSaved(false))} className="s3-input" />}
        </Field>
        <p className="text-[15px] text-(--muted) sm:col-span-2">Email: {user.email}</p>
        <label className="s3-check sm:col-span-2">
          <input type="checkbox" checked={news} onChange={(e) => (setNews(e.target.checked), setSaved(false))} />
          <span>
            Letters from the Santalum Circle
            <span className="block text-[14px] text-(--muted)">A few a year. No discounts, no daily emails.</span>
          </span>
        </label>
        <div className="flex items-center gap-4 sm:col-span-2">
          <button type="submit" className="s3-btn s3-btn-dark">
            <span className="s3-bead s3-btn-bead" aria-hidden />
            Save the profile
          </button>
          {saved && (
            <span role="status" className="text-[15px] text-(--muted)">
              Saved
            </span>
          )}
        </div>
      </form>
    </Section>
  );
}
