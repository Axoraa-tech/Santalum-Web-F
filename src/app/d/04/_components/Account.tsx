"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { WT } from "@/components/maison/W";
import {
  removeAddress,
  saveAddress,
  signOut,
  toggleWishlist,
  updateProfile,
  useUser,
  useWishlist,
  validate,
  type Address,
  type User,
} from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { canCancel, canReturn, cancelOrder, formatDate, requestReturn, STAGES, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR, getProduct, priceLabel, type Product } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { m, r } from "./cls";
import { Pic, picOf } from "./plates";
import { AddressForm, AddressLines, Check, Field, SignInForm, SignUpForm } from "./forms";
import { openLedger } from "./store";
import { cx } from "./ui";

const since = (ms: number) => new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(ms);
const memberNo = (u: User) => `M-${u.id.slice(1, 7).toUpperCase()}`;

/** The account as the museum's membership desk. */
export function Desk() {
  const hydrated = useHydrated();
  const user = useUser();
  return (
    <div className={m.desk}>
      <header className={m.head}>
        <h1 className={m.title}>
          Membership <i>desk</i>
        </h1>
        <p className={m.lede}>
          {user
            ? `Welcome back, ${user.name.split(" ")[0]}. Your orders, the pieces you kept, your addresses and your letters, in one place.`
            : "Members place orders, follow them to the door, keep pieces for later and keep their addresses on file. Joining costs nothing."}
        </p>
      </header>
      {!hydrated ? <div className="min-h-[60svh]" aria-hidden="true" /> : user ? <Dashboard user={user} /> : <SignedOut />}
    </div>
  );
}

function SignedOut() {
  const kept = useWishlist();
  return (
    <>
      <div className={m.panes}>
        <section className={m.pane} aria-labelledby="c4m-in">
          <h2 id="c4m-in" className={m.paneTitle}>
            Sign in
          </h2>
          <p className={m.paneLede}>With the email and password you joined with.</p>
          <SignInForm />
        </section>
        <section className={cx(m.pane, m.paneJoin)} aria-labelledby="c4m-up">
          <span className={m.cardHole} aria-hidden="true" />
          <h2 id="c4m-up" className={m.paneTitle}>
            Become a member
          </h2>
          <p className={m.paneLede}>One account for both rooms, red and white. Your bag stays as it is.</p>
          <SignUpForm />
        </section>
      </div>
      {kept.length > 0 && (
        <p className={m.keptNote}>
          {kept.length === 1 ? "One piece is" : `${kept.length} pieces are`} kept on this visit. They join your account when you sign in or
          become a member.
        </p>
      )}
    </>
  );
}

function Dashboard({ user }: { user: User }) {
  const orders = useOrders();
  const kept = useWishlist();
  return (
    <div className={m.dash}>
      <aside className={m.side}>
        <div className={m.card}>
          <span className={m.cardHole} aria-hidden="true" />
          <p className={m.cardHouse}>
            Santalum <i>Maison</i>
          </p>
          <p className={m.cardName}>{user.name}</p>
          <dl className={m.cardRows}>
            <div>
              <dt>Member</dt>
              <dd>{memberNo(user)}</dd>
            </div>
            <div>
              <dt>Since</dt>
              <dd>{since(user.createdAt)}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>
        </div>
        <nav className={m.index} aria-label="Your account">
          <a href="#orders">
            Orders <span>{orders.length}</span>
          </a>
          <a href="#kept">
            Kept pieces <span>{kept.length}</span>
          </a>
          <a href="#addresses">
            Addresses <span>{user.addresses.length}</span>
          </a>
          <a href="#profile">Profile and letters</a>
        </nav>
        <button type="button" className={m.signOut} onClick={signOut}>
          Sign out
        </button>
      </aside>

      <div className={m.sections}>
        <Orders />
        <Kept slugs={kept} />
        <Addresses user={user} />
        <Profile user={user} />
      </div>
    </div>
  );
}

function Orders() {
  const orders = useOrders();
  const now = useNow();
  return (
    <section id="orders" className={m.section} aria-labelledby="c4m-orders">
      <h2 id="c4m-orders" className={m.h2}>
        Orders
      </h2>
      {orders.length === 0 ? (
        <div className={m.emptyRow}>
          <p>No orders yet. When you place one, it is entered here with its tracking.</p>
          <Link href="/d/04/shop" className="c4-link">
            Visit the shop
          </Link>
        </div>
      ) : (
        <ol className={m.orders}>
          {orders.map((o) => (
            <OrderRow key={o.id} o={o} now={now ?? o.placedAt} />
          ))}
        </ol>
      )}
    </section>
  );
}

const STATUS: Record<NonNullable<Order["status"]>, string> = {
  cancelled: "Cancelled",
  "return-requested": "Return requested",
};

function OrderRow({ o, now }: { o: Order; now: number }) {
  const tr = trackingFor(o, now);
  const first = o.lines[0];
  const [mode, setMode] = useState<"" | "cancel" | "return">("");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const reasonId = useId();
  const stage = o.status ? STATUS[o.status] : tr.stages[tr.current].label;
  const act = (fn: () => string | null) => {
    const res = fn();
    if (res) setErr(res);
    else {
      setErr("");
      setMode("");
    }
  };
  return (
    <li className={m.order} data-status={o.status}>
      <div className={m.orderHead}>
        <p className={m.orderNo}>{o.id}</p>
        <p className={m.orderDate}>{formatDate(o.placedAt, true)}</p>
      </div>
      <p className={m.orderItems}>
        {first.name}
        {first.optionLabel ? `, ${first.optionLabel}` : ""}
        {o.lines.length > 1 ? ` and ${o.lines.length - 1} more` : ""}
      </p>
      <div className={m.progress} aria-label={`${stage}, step ${tr.current + 1} of ${STAGES.length}`} role="img">
        {STAGES.map((st, i) => (
          <span key={st.key} data-done={i <= tr.current ? "" : undefined} data-current={i === tr.current ? "" : undefined} />
        ))}
      </div>
      <div className={m.orderFoot}>
        <p className={m.stage}>
          <span className={m.dot} aria-hidden="true" />
          {stage}
          {o.status === "cancelled" ? (
            <small>Nothing will ship. No money was taken.</small>
          ) : o.status === "return-requested" ? (
            <small>The courier will collect. {o.returnReason ? `Reason: ${o.returnReason}` : ""}</small>
          ) : (
            !tr.delivered && (
              <small>
                Expected {formatDate(tr.estimate.from)} to {formatDate(tr.estimate.to)}
              </small>
            )
          )}
        </p>
        <p className={m.orderTotal}>
          {formatINR(o.total)}
          {o.discount ? (
            <small>
              Code {o.coupon}, less {formatINR(o.discount)}
            </small>
          ) : null}
        </p>
      </div>
      <div className={m.orderActs}>
        <Link href={`/d/04/track?o=${o.id}`} className={m.trackLink}>
          Track
        </Link>
        {!o.status && canCancel(o, now) && mode === "" && (
          <button type="button" className={r.link} onClick={() => setMode("cancel")}>
            Cancel the order
          </button>
        )}
        {!o.status && canReturn(o, now) && mode === "" && (
          <button type="button" className={r.link} onClick={() => setMode("return")}>
            Ask for a return
          </button>
        )}
        {!o.status && !canCancel(o, now) && !canReturn(o, now) && (
          <span className={m.actNote}>Shipped: a return can be asked for once it arrives.</span>
        )}
      </div>
      {mode === "cancel" && (
        <div className={m.slip} role="group" aria-label="Cancel this order">
          <p>
            Cancel {o.id}? The workshop stops packing it. This cannot be undone.
          </p>
          <div className={m.slipActs}>
            <button type="button" className={m.btnSm} onClick={() => act(() => cancelOrder(o.id, Date.now()))}>
              Yes, cancel it
            </button>
            <button type="button" className={r.link} onClick={() => setMode("")}>
              Keep the order
            </button>
          </div>
        </div>
      )}
      {mode === "return" && (
        <form
          className={m.slip}
          onSubmit={(e) => {
            e.preventDefault();
            act(() => requestReturn(o.id, reason, Date.now()));
          }}
        >
          <label htmlFor={reasonId}>Why are you returning it? Unused pieces, within 14 days.</label>
          <textarea id={reasonId} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="A sentence is enough" />
          <div className={m.slipActs}>
            <button type="submit" className={m.btnSm}>
              Ask for the return
            </button>
            <button type="button" className={r.link} onClick={() => setMode("")}>
              Not now
            </button>
          </div>
        </form>
      )}
      {err && (
        <p className={r.err} role="alert">
          {err}
        </p>
      )}
    </li>
  );
}

function Kept({ slugs }: { slugs: string[] }) {
  const list = slugs.map((sl) => getProduct(sl)).filter((p): p is Product => !!p);
  return (
    <section id="kept" className={m.section} aria-labelledby="c4m-kept">
      <h2 id="c4m-kept" className={m.h2}>
        Kept pieces
      </h2>
      {list.length === 0 ? (
        <div className={m.emptyRow}>
          <p>Nothing kept yet. In the shop, the small tag on each piece keeps it here for later.</p>
          <Link href="/d/04/shop" className="c4-link">
            Visit the shop
          </Link>
        </div>
      ) : (
        <ul className={m.kept}>
          {list.map((p) => (
            <li key={p.slug} className={m.keptCard}>
              <Link href={`/d/04/p/${p.slug}`} className={m.keptFrame} tabIndex={-1} aria-hidden="true">
                <Pic {...picOf(p)} sizes="(min-width: 900px) 160px, 40vw" />
              </Link>
              <div className={m.keptText}>
                <p className={m.keptWood}>{CONTENT[p.wood].name}</p>
                <h3 className={m.keptName}>
                  <Link href={`/d/04/p/${p.slug}`}>{p.name}</Link>
                </h3>
                <p className={m.keptPrice}>{priceLabel(p)}</p>
                <div className={m.keptActions}>
                  <button
                    type="button"
                    className={m.btnSm}
                    onClick={() => {
                      bag.add(p.slug);
                      toggleWishlist(p.slug);
                      openLedger();
                    }}
                  >
                    Move to acquisitions
                  </button>
                  <button type="button" className={r.link} onClick={() => toggleWishlist(p.slug)}>
                    Remove
                  </button>
                </div>
                {p.options && (
                  <p className={m.keptNoteSm}>
                    Moves with the first {p.options.name.toLowerCase()}, {p.options.values[0].label}; change it on the piece&apos;s page.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Addresses({ user }: { user: User }) {
  const [editing, setEditing] = useState<string | null>(null);
  const strip = (a: Address) => ({ label: a.label, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pin: a.pin });
  return (
    <section id="addresses" className={m.section} aria-labelledby="c4m-addr">
      <h2 id="c4m-addr" className={m.h2}>
        Addresses
      </h2>
      {user.addresses.length === 0 && editing !== "new" && (
        <div className={m.emptyRow}>
          <p>No addresses yet. Add one here, or at the register when you place an order.</p>
        </div>
      )}
      <ul className={m.addrs}>
        {user.addresses.map((a) =>
          editing === a.id ? (
            <li key={a.id} className={m.addrEdit}>
              <AddressForm
                initial={{ ...strip(a), isDefault: a.isDefault }}
                submitLabel="Save the address"
                offerDefault={!a.isDefault}
                onCancel={() => setEditing(null)}
                onSubmit={(v, o) => {
                  saveAddress({ ...v, id: a.id, isDefault: a.isDefault || o.isDefault });
                  setEditing(null);
                }}
              />
            </li>
          ) : (
            <li key={a.id} className={m.addr} data-default={a.isDefault ? "" : undefined}>
              <p className={m.addrLabel}>
                {a.label}
                {a.isDefault && <span>Default</span>}
              </p>
              <AddressLines a={strip(a)} />
              <div className={m.addrActions}>
                <button type="button" className={r.link} onClick={() => setEditing(a.id)}>
                  Edit
                </button>
                {!a.isDefault && (
                  <button type="button" className={r.link} onClick={() => saveAddress({ ...a, isDefault: true })}>
                    Make default
                  </button>
                )}
                <button type="button" className={r.link} onClick={() => removeAddress(a.id)}>
                  Remove
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
      {editing === "new" ? (
        <div className={m.addrEdit}>
          <AddressForm
            initial={{ name: user.name, phone: user.phone }}
            submitLabel="Add the address"
            offerDefault={user.addresses.length > 0}
            onCancel={() => setEditing(null)}
            onSubmit={(v, o) => {
              saveAddress({ ...v, isDefault: o.isDefault });
              setEditing(null);
            }}
          />
        </div>
      ) : (
        <button type="button" className={cx(m.btnSm, "mt-4")} onClick={() => setEditing("new")}>
          Add an address
        </button>
      )}
    </section>
  );
}

function Profile({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [news, setNews] = useState(user.newsletter);
  const [errs, setErrs] = useState<{ name?: string; phone?: string }>({});
  const [saved, setSaved] = useState(false);
  const statusId = useId();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = { name: validate.name(name) ?? undefined, phone: validate.phone(phone) ?? undefined };
    setErrs(next);
    if (next.name || next.phone) {
      setSaved(false);
      return;
    }
    updateProfile({ name: name.trim(), phone: phone.replace(/\s/g, ""), newsletter: news });
    setSaved(true);
  };
  return (
    <section id="profile" className={m.section} aria-labelledby="c4m-prof">
      <h2 id="c4m-prof" className={m.h2}>
        Profile and letters
      </h2>
      <form className={cx(r.form, m.profile)} onSubmit={submit} noValidate aria-describedby={saved ? statusId : undefined}>
        <Field label="Full name" name="name" autoComplete="name" value={name} onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }} error={errs.name} />
        <Field
          label="Mobile"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setSaved(false);
          }}
          error={errs.phone}
        />
        <Field label="Email" name="email" type="email" value={user.email} readOnly hint="The email you joined with. It is also how orders are found." />
        <Check
          label="Letters from the Santalum Circle"
          note={<WT red={CONTENT.red.circle.text} white={CONTENT.white.circle.text} />}
          checked={news}
          onChange={(v) => {
            setNews(v);
            setSaved(false);
          }}
        />
        <div className={r.formActions}>
          <button type="submit" className={r.submitSm}>
            Save the profile
          </button>
          {saved && (
            <p id={statusId} className={m.saved} role="status">
              Saved.
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
