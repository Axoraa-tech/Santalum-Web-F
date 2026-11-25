"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { removeAddress, saveAddress, signOut, toggleWishlist, updateProfile, useUser, useWishlist, validate, type Address, type User } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { canCancel, canReturn, cancelOrder, formatDate, requestReturn, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { categoryOf, formatINR, getProduct, priceLabel } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { catNo, type IndexItem } from "./content";
import { AddressForm, AddressLines, Check, Field, ReaderSlip, SignInForm, SignUpForm } from "./Forms";
import { SideIndex } from "./SideIndex";
import { slipFlag } from "./store";

const OUT: IndexItem[] = [
  { id: "file", label: "Reader's file" },
  { id: "signin", label: "Sign in" },
  { id: "create", label: "Create an account" },
];
const IN: IndexItem[] = [
  { id: "file", label: "Reader's file" },
  { id: "orders", label: "Orders" },
  { id: "marked", label: "Marked entries" },
  { id: "addresses", label: "Addresses" },
  { id: "profile", label: "Particulars" },
];

function Section({ id, n, title, aside, children }: { id: string; n: number; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="x5f-block" aria-labelledby={`${id}-h`}>
      <div className="x5f-side">
        <span className="x5f-n">{n}</span>
        <h2 id={`${id}-h`} className="x5a-blockTitle">
          {title}
        </h2>
        {aside && <div className="x5f-sideNote">{aside}</div>}
      </div>
      <div className="x5f-body">{children}</div>
    </section>
  );
}

/** The account as a reader's file: signed out, two forms; signed in, orders, marked entries, addresses and particulars. */
export function AccountFile() {
  const hydrated = useHydrated();
  const user = useUser();

  if (!hydrated)
    return (
      <>
        <SideIndex items={OUT.slice(0, 1)} heading="The file" />
        <main className="x5-main">
          <header id="file" className="x5f-head">
            <p className="x5c-kicker">
              <span>Reader&apos;s file</span>
              <span />
            </p>
            <h1 className="x5c-title">Your file</h1>
            <p className="x5f-lead">Opening the file.</p>
          </header>
        </main>
      </>
    );

  if (!user)
    return (
      <>
        <SideIndex items={OUT} heading="The file" />
        <main className="x5-main">
          <header id="file" className="x5f-head">
            <p className="x5c-kicker">
              <span>Reader&apos;s file</span>
              <span>Signed out</span>
            </p>
            <h1 className="x5c-title">Your file</h1>
            <p className="x5f-lead">
              One file per reader: the orders you have placed and where they are, the entries you have marked, your addresses and your particulars. Sign in to
              open yours, or start one.
            </p>
          </header>
          <div className="x5f-panes">
            <section id="signin" className="x5f-pane" aria-labelledby="signin-h">
              <h2 id="signin-h" className="x5c-legend">
                <span className="x5c-legendN">A</span>Sign in
              </h2>
              <ReaderSlip form="Form A" title="Reader's slip, returning reader">
                <SignInForm idBase="acc-in" />
              </ReaderSlip>
            </section>
            <section id="create" className="x5f-pane" aria-labelledby="create-h">
              <h2 id="create-h" className="x5c-legend">
                <span className="x5c-legendN">B</span>Create an account
              </h2>
              <ReaderSlip form="Form B" title="Reader's slip, new reader">
                <SignUpForm idBase="acc-up" />
              </ReaderSlip>
            </section>
          </div>
        </main>
      </>
    );

  return <SignedIn user={user} />;
}

function SignedIn({ user }: { user: User }) {
  const orders = useOrders();
  const wishlist = useWishlist();
  return (
    <>
      <SideIndex items={IN} heading="The file" />
      <main className="x5-main">
        <header id="file" className="x5f-head">
          <p className="x5c-kicker">
            <span>Reader&apos;s file</span>
            <span>Opened {formatDate(user.createdAt)}</span>
          </p>
          <h1 className="x5c-title x5f-name">{user.name}</h1>
          <div className="x5a-meta x5f-meta">
            <p>
              <span>Orders</span>
              <br />
              {orders.length || "None yet"}
            </p>
            <p>
              <span>Marked entries</span>
              <br />
              {wishlist.length || "None yet"}
            </p>
            <p>
              <span>Addresses</span>
              <br />
              {user.addresses.length || "None yet"}
            </p>
            <p>
              <span>Santalum Circle</span>
              <br />
              {user.newsletter ? "Receives the letter" : "No letters"}
            </p>
          </div>
        </header>

        <Orders orders={orders} />
        <Marked slugs={wishlist} />
        <Addresses addresses={user.addresses} />
        <Particulars key={user.id} user={user} />
      </main>
    </>
  );
}

function Orders({ orders }: { orders: Order[] }) {
  const now = useNow();
  return (
    <Section id="orders" n={1} title="Orders" aside={<p>Newest first. Each stage is read from the dispatch log as it moves. An order can be cancelled until it ships, and returned once it arrives.</p>}>
      {orders.length === 0 ? (
        <div className="x5f-empty">
          <p>No orders on file yet.</p>
          <Link href="/d/05/shop" className="x5c-emptyLink">
            Open the catalogue
          </Link>
          <Link href="/d/05/track" className="x5c-emptyLink">
            Try the example order in the dispatch log
          </Link>
        </div>
      ) : (
        <ol className="x5f-orders">
          {orders.map((o) => (
            <OrderRow key={o.id} o={o} now={now} />
          ))}
        </ol>
      )}
    </Section>
  );
}

/** One order on the file: its stage or status, its code, and what can still be done with it. */
function OrderRow({ o, now }: { o: Order; now: number | null }) {
  const [mode, setMode] = useState<null | "cancel" | "return">(null);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const t = now ? trackingFor(o, now) : null;
  const count = o.lines.reduce((n, l) => n + l.qty, 0);
  const cancellable = now !== null && canCancel(o, now);
  const returnable = now !== null && canReturn(o, now);
  const close = () => {
    setMode(null);
    setErr(null);
  };

  return (
    <li className="x5f-order" data-status={o.status}>
      <span className="x5f-orderId">{o.id}</span>
      <span className="x5f-orderWhat">
        {o.lines[0].name}
        {o.lines.length > 1 ? ` and ${o.lines.length - 1} more` : ""}
        <i>
          {count} {count === 1 ? "piece" : "pieces"}, placed {formatDate(o.placedAt)}
          {o.coupon && o.discount ? `; ${o.coupon}, less ${formatINR(o.discount)}` : ""}
        </i>
      </span>
      <span className="x5f-orderStage" data-done={t?.delivered || undefined}>
        {o.status === "cancelled" ? (
          <>
            <b>×</b> Cancelled
          </>
        ) : o.status === "return-requested" ? (
          <>
            <b>R</b> Return requested
          </>
        ) : t ? (
          <>
            <b>{t.current + 1}</b> {t.stages[t.current].label}
          </>
        ) : (
          "Reading the log"
        )}
      </span>
      <span className="x5f-orderTotal">{formatINR(o.total)}</span>
      <span className="x5f-orderAct">
        <Link href={`/d/05/track?o=${o.id}`} className="x5-textLink">
          Dispatch log
        </Link>
        {cancellable && mode === null && (
          <button type="button" className="x5-textBtn" onClick={() => setMode("cancel")}>
            Cancel the order
          </button>
        )}
        {returnable && mode === null && (
          <button type="button" className="x5-textBtn" onClick={() => setMode("return")}>
            Ask for a return
          </button>
        )}
      </span>
      {o.status === "return-requested" && o.returnReason && <p className="x5f-orderNote">Your note: “{o.returnReason}” The studio writes within a working day.</p>}
      {mode === "cancel" && (
        <div className="x5f-orderForm" role="group" aria-label={`Cancel ${o.id}`}>
          <p>Cancel {o.id} before it ships? Nothing has been charged in this preview, and the pieces go back on the shelf.</p>
          <div className="x5c-formActions">
            <button
              type="button"
              className="x5-addSmall"
              onClick={() => {
                const e = cancelOrder(o.id, Date.now());
                if (e) setErr(e);
                else close();
              }}
            >
              Yes, cancel it
            </button>
            <button type="button" className="x5-textBtn" onClick={close}>
              Keep the order
            </button>
          </div>
          {err && (
            <p className="x5c-formError" role="alert">
              {err}
            </p>
          )}
        </div>
      )}
      {mode === "return" && (
        <form
          className="x5f-orderForm"
          onSubmit={(e) => {
            e.preventDefault();
            const r = requestReturn(o.id, reason, Date.now());
            if (r) setErr(r);
            else close();
          }}
        >
          <label htmlFor={`ret-${o.id}`} className="x5c-label">
            Why is it coming back? A line is enough.
          </label>
          <textarea
            id={`ret-${o.id}`}
            className="x5c-input x5c-textarea"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-describedby={err ? `ret-${o.id}-err` : undefined}
          />
          <div className="x5c-formActions">
            <button type="submit" className="x5-addSmall">
              Send the request
            </button>
            <button type="button" className="x5-textBtn" onClick={close}>
              Not now
            </button>
          </div>
          {err && (
            <p id={`ret-${o.id}-err`} className="x5c-formError" role="alert">
              {err}
            </p>
          )}
        </form>
      )}
    </li>
  );
}

function Marked({ slugs }: { slugs: string[] }) {
  const products = slugs.map((s) => getProduct(s)).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <Section id="marked" n={2} title="Marked entries" aside={<p>Your wishlist. Mark any entry in the catalogue and it is kept here, in either wood.</p>}>
      {products.length === 0 ? (
        <div className="x5f-empty">
          <p>Nothing marked yet. Every entry in the catalogue has a small square beside it; press it to keep the piece here.</p>
          <Link href="/d/05/shop" className="x5c-emptyLink">
            Open the catalogue
          </Link>
        </div>
      ) : (
        <ol className="x5f-marked">
          {products.map((p) => (
            <li key={p.slug} className="x5f-mark">
              <Link href={`/d/05/p/${p.slug}`} className="x5f-markThumb" tabIndex={-1} aria-hidden>
                <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="96px" />
              </Link>
              <span className="x5f-markText">
                <Link href={`/d/05/p/${p.slug}`} className="x5s-name">
                  {p.name}
                </Link>
                <i>
                  No. {catNo(p)}, {categoryOf(p).label}, {CONTENT[p.wood].name.toLowerCase()}
                </i>
              </span>
              <span className="x5f-markPrice">{priceLabel(p)}</span>
              <span className="x5f-markAct">
                <button
                  type="button"
                  className="x5-addSmall"
                  onClick={() => {
                    bag.add(p.slug, { option: p.options?.values[0].id });
                    toggleWishlist(p.slug);
                    slipFlag.set(true);
                  }}
                >
                  Move to bag{p.options ? `, ${p.options.values[0].label}` : ""}
                </button>
                <button type="button" className="x5-textBtn" onClick={() => toggleWishlist(p.slug)}>
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

function Addresses({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <Section id="addresses" n={3} title="Addresses" aside={<p>The default address is offered first at checkout.</p>}>
      {addresses.length > 0 && (
        <ol className="x5f-addrs">
          {addresses.map((a) => (
            <li key={a.id} className="x5f-addr" data-default={a.isDefault || undefined}>
              {editing === a.id ? (
                <AddressForm idBase={`acc-a-${a.id}`} initial={a} submitLabel="Save the address" onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />
              ) : (
                <>
                  <span className="x5f-addrHead">
                    {a.label}
                    {a.isDefault && <i>Default</i>}
                  </span>
                  <AddressLines a={a} />
                  <span className="x5f-addrAct">
                    <button type="button" className="x5-textBtn" onClick={() => setEditing(a.id)}>
                      Edit
                    </button>
                    {!a.isDefault && (
                      <button type="button" className="x5-textBtn" onClick={() => saveAddress({ ...a, isDefault: true })}>
                        Set as default
                      </button>
                    )}
                    <button type="button" className="x5-textBtn" onClick={() => removeAddress(a.id)}>
                      Remove
                    </button>
                  </span>
                </>
              )}
            </li>
          ))}
        </ol>
      )}
      {editing === "new" ? (
        <div className="x5f-addNew">
          <AddressForm idBase="acc-a-new" submitLabel="Add the address" onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />
        </div>
      ) : (
        <button type="button" className="x5f-addBtn" onClick={() => setEditing("new")}>
          <span>{addresses.length ? "Add another address" : "Add an address"}</span>
          <span>{addresses.length} on file</span>
        </button>
      )}
    </Section>
  );
}

function Particulars({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [newsletter, setNewsletter] = useState(user.newsletter);
  const [errors, setErrors] = useState<{ name?: string | null; phone?: string | null }>({});
  const [saved, setSaved] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = { name: validate.name(name), phone: validate.phone(phone) };
    setErrors(next);
    setSaved(false);
    if (next.name || next.phone) return;
    updateProfile({ name: name.trim(), phone: phone.replace(/\s/g, ""), newsletter });
    setSaved(true);
  };

  return (
    <Section id="profile" n={4} title="Particulars" aside={<p>Your email is how you sign in. To change it, write to us.</p>}>
      <form className="x5c-auth" onSubmit={submit} noValidate>
        <div className="x5c-fields">
          <Field id="acc-p-name" label="Full name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} wide />
          <Field id="acc-p-email" label="Email" type="email" name="email" autoComplete="email" value={user.email} readOnly />
          <Field
            id="acc-p-phone"
            label="Mobile"
            type="tel"
            name="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
          />
        </div>
        <Check checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)}>
          Send me the Santalum Circle letter, a few times a year.
        </Check>
        <div className="x5c-formActions">
          <button type="submit" className="x5c-place x5c-placeSmall">
            <span>Save the particulars</span>
            <span aria-live="polite">{saved ? "Saved" : ""}</span>
          </button>
          <button type="button" className="x5-textLink" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </form>
    </Section>
  );
}
