"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { useHydrated } from "@/lib/shop/store";
import { formatINR, fmtLong } from "../../_data/format";
import { adminSignIn, adminSignOut, resetAdminData, saveSettings, useNow, useSession, useSettings } from "../../_data/store";
import type { Settings, Staff, StaffRole } from "../../_data/types";
import { initials } from "../../_components/ui";
import { I, type A5IconName } from "./icons";
import { BASE, Card, Chip, Field, Head, Seg, Toggle, say } from "./kit";
import { BackToMore } from "./inventory";
import { Split, useCounts } from "./shell";

/* ---------- More ---------- */
export function More() {
  const c = useCounts();
  const session = useSession();
  const router = useRouter();
  const items: { href: string; icon: A5IconName; label: string; sub: string; n?: number }[] = [
    { href: `${BASE}/inventory`, icon: "stock", label: "Stock", sub: "Counts, reorder levels", n: c.stock },
    { href: `${BASE}/reviews`, icon: "star", label: "Reviews and questions", sub: "Moderate, reply, answer", n: c.reviews + c.questions },
    { href: `${BASE}/coupons`, icon: "coupon", label: "Coupons", sub: "Codes and limits" },
    { href: `${BASE}/content`, icon: "content", label: "Storefront", sub: "Hero, edition, featured pieces" },
    { href: `${BASE}/settings`, icon: "settings", label: "Settings", sub: "Store, shipping, payments, staff" },
  ];
  const list = (
    <>
      <Head title="More" />
      <div className="a5-person a5-card">
        <span className="a5-avatar" data-size="l">
          {initials(session?.name ?? "")}
        </span>
        <div>
          <strong>{session?.name}</strong>
          <p className="a5-muted">{session?.email}</p>
        </div>
      </div>
      <div className="a5-mgrid">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="a5-mtile">
            <span className="a5-row-ic">
              <I n={it.icon} size={22} />
            </span>
            <strong>{it.label}</strong>
            <small>{it.sub}</small>
            {!!it.n && <span className="a5-badge">{it.n}</span>}
          </Link>
        ))}
      </div>
      <div className="a5-list">
        <a href="/maison" target="_blank" rel="noreferrer" className="a5-row">
          <span className="a5-row-ic">
            <I n="external" size={20} />
          </span>
          <span className="a5-row-main">Open the shop</span>
        </a>
        <button
          type="button"
          className="a5-row"
          onClick={() => {
            adminSignOut();
            router.replace(`${BASE}/login`);
          }}
        >
          <span className="a5-row-ic">
            <I n="out" size={20} />
          </span>
          <span className="a5-row-main">Sign out</span>
        </button>
      </div>
      <p className="a5-hint">Preview build. Everything you change is kept in this browser until the backend is connected.</p>
    </>
  );
  return (
    <Split
      list={list}
      open={false}
      idle={
        <div className="a5-detail">
          <div className="a5-eyebrow">Signed in</div>
          <h2 className="a5-detail-title">{session?.name}</h2>
          <p className="a5-muted">Stock, reviews, coupons, the storefront and settings live here. On a phone, they are one tap from the tab bar.</p>
        </div>
      }
    />
  );
}

/* ---------- Settings ---------- */
type G = keyof Settings;
const GROUPS: { id: G; label: string; icon: A5IconName; sub: (s: Settings) => string }[] = [
  { id: "store", label: "Store and invoices", icon: "content", sub: (s) => `${s.store.legalName} · ${s.store.gstin}` },
  { id: "shipping", label: "Shipping", icon: "truck", sub: (s) => `Express ${formatINR(s.shipping.expressPrice)} · COD up to ${formatINR(s.shipping.codLimit)}` },
  { id: "payments", label: "Payments", icon: "coupon", sub: (s) => `Razorpay, ${s.payments.mode} mode` },
  { id: "staff", label: "Staff", icon: "customers", sub: (s) => `${s.staff.length} people` },
  { id: "notifications", label: "Notifications", icon: "mail", sub: (s) => s.notifications.recipients },
];

export function SettingsView() {
  const s = useSettings();
  const [sel, setSel] = useState<G | null>(null);
  const list = (
    <>
      <Head title="Settings" back={<BackToMore />} />
      <div className="a5-list">
        {GROUPS.map((g) => (
          <button key={g.id} type="button" className="a5-row" data-sel={sel === g.id ? "" : undefined} onClick={() => setSel(g.id)}>
            <span className="a5-row-ic">
              <I n={g.icon} size={20} />
            </span>
            <span className="a5-row-main">
              {g.label}
              <small>{g.sub(s)}</small>
            </span>
            <I n="chevron" size={18} className="a5-dim" />
          </button>
        ))}
      </div>
      <div className="a5-list">
        <button
          type="button"
          className="a5-row"
          onClick={() => {
            if (window.confirm("Clear every change made in this browser's admin preview?")) resetAdminData();
          }}
        >
          <span className="a5-row-main a5-red">Reset preview data</span>
        </button>
      </div>
    </>
  );
  const form = sel && <GroupForm key={sel} g={sel} s={s} />;
  return (
    <Split
      list={list}
      open={!!sel}
      onClose={() => setSel(null)}
      detail={form}
      idle={
        <div className="a5-detail">
          <div className="a5-eyebrow">Settings</div>
          <h2 className="a5-detail-title">Pick a group to change it</h2>
        </div>
      }
    />
  );
}

function GroupForm({ g, s }: { g: G; s: Settings }) {
  const [d, setD] = useState<Settings>(s);
  const save = () => {
    saveSettings(g, d[g]);
    say("Settings saved");
  };
  const label = GROUPS.find((x) => x.id === g)!.label;
  let body: ReactNode = null;
  if (g === "store") {
    const st = d.store;
    const f = (k: keyof Settings["store"], l: string) => (
      <Field key={k} label={l}>
        {(id) => <input id={id} value={String(st[k])} onChange={(e) => setD({ ...d, store: { ...st, [k]: e.target.value } })} />}
      </Field>
    );
    body = (
      <>
        <Card title="Business">
          {f("name", "Store name")}
          {f("legalName", "Legal name")}
          <div className="a5-two">
            {f("gstin", "GSTIN")}
            {f("pan", "PAN")}
          </div>
          {f("email", "Email")}
          {f("phone", "Phone")}
        </Card>
        <Card title="Address">
          {f("address", "Street")}
          <div className="a5-two">
            {f("city", "City")}
            {f("pin", "PIN")}
          </div>
          {f("state", "State")}
        </Card>
        <Card title="Invoices">
          {f("invoicePrefix", "Invoice prefix")}
          <div className="a5-two">
            {f("hsnRed", "HSN, red")}
            {f("hsnWhite", "HSN, white")}
          </div>
          <Toggle on={st.pricesIncludeGst} set={(v) => setD({ ...d, store: { ...st, pricesIncludeGst: v } })} label="Prices include GST" />
        </Card>
      </>
    );
  } else if (g === "shipping") {
    const sh = d.shipping;
    const n = (k: "standardPrice" | "expressPrice" | "codLimit" | "codFee" | "processingDays", l: string) => (
      <Field label={l}>{(id) => <input id={id} inputMode="numeric" value={sh[k]} onChange={(e) => setD({ ...d, shipping: { ...sh, [k]: Number(e.target.value.replace(/\D/g, "")) } })} />}</Field>
    );
    body = (
      <Card>
        <Toggle on={sh.standardFree} set={(v) => setD({ ...d, shipping: { ...sh, standardFree: v } })} label="Free standard shipping" />
        {!sh.standardFree && n("standardPrice", "Standard price (₹)")}
        {n("expressPrice", "Express price (₹)")}
        <div className="a5-two">
          {n("codLimit", "COD up to (₹)")}
          {n("codFee", "COD fee (₹)")}
        </div>
        {n("processingDays", "Days to dispatch")}
        <Toggle on={sh.insured} set={(v) => setD({ ...d, shipping: { ...sh, insured: v } })} label="Insure every parcel" />
      </Card>
    );
  } else if (g === "payments") {
    const p = d.payments;
    body = (
      <Card>
        <div className="a5-field">
          <span className="a5-label">Razorpay mode</span>
          <Seg
            label="Mode"
            value={p.mode}
            onChange={(m) => setD({ ...d, payments: { ...p, mode: m } })}
            items={[
              { id: "test", label: "Test" },
              { id: "live", label: "Live" },
            ]}
          />
        </div>
        <Field label="Key id" hint="The secret stays on the server, never here.">
          {(id) => <input id={id} value={p.keyId} onChange={(e) => setD({ ...d, payments: { ...p, keyId: e.target.value.trim() } })} placeholder="rzp_test_…" />}
        </Field>
        {(["upi", "card", "netbanking", "cod"] as const).map((k) => (
          <Toggle key={k} on={p[k]} set={(v) => setD({ ...d, payments: { ...p, [k]: v } })} label={{ upi: "UPI", card: "Cards", netbanking: "Net banking", cod: "Pay on delivery" }[k]} />
        ))}
      </Card>
    );
  } else if (g === "staff") {
    body = <StaffForm staff={d.staff} set={(staff) => setD({ ...d, staff })} />;
  } else {
    const nt = d.notifications;
    const t = (k: "newOrder" | "lowStock" | "review" | "returnRequest" | "dailySummary", l: string) => <Toggle on={nt[k]} set={(v) => setD({ ...d, notifications: { ...nt, [k]: v } })} label={l} />;
    body = (
      <Card>
        {t("newOrder", "Every new order")}
        {t("lowStock", "Stock runs low")}
        {t("review", "A review needs reading")}
        {t("returnRequest", "A return is asked for")}
        {t("dailySummary", "Summary at 8 every evening")}
        <Field label="Send to">{(id) => <input id={id} value={nt.recipients} onChange={(e) => setD({ ...d, notifications: { ...nt, recipients: e.target.value } })} />}</Field>
      </Card>
    );
  }
  return (
    <div className="a5-detail" data-form="">
      <h2 className="a5-detail-title">{label}</h2>
      {body}
      <div className="a5-savebar">
        <span />
        <button type="button" className="a5-btn" data-v="primary" disabled={JSON.stringify(d[g]) === JSON.stringify(s[g])} onClick={save}>
          Save
        </button>
      </div>
    </div>
  );
}

function StaffForm({ staff, set }: { staff: Staff[]; set: (s: Staff[]) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Fulfilment");
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  return (
    <Card>
      <div className="a5-list a5-list-flat">
        {staff.map((m) => (
          <div key={m.id} className="a5-row">
            <span className="a5-avatar" data-size="m">
              {initials(m.name)}
            </span>
            <span className="a5-row-main">
              {m.name}
              <small>
                {m.email} · {m.lastActive}
              </small>
            </span>
            {m.role === "Owner" ? (
              <Chip>Owner</Chip>
            ) : (
              <select aria-label={`Role for ${m.name}`} value={m.role} onChange={(e) => set(staff.map((x) => (x.id === m.id ? { ...x, role: e.target.value as StaffRole } : x)))}>
                {(["Manager", "Fulfilment", "Support"] as const).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            )}
            {m.role !== "Owner" && (
              <button type="button" className="a5-round" aria-label={`Remove ${m.name}`} onClick={() => set(staff.filter((x) => x.id !== m.id))}>
                <I n="close" size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      <form
        className="a5-inline"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ok) return;
          const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          set([...staff, { id: `s${staff.length + 1}-${email.length}`, name, email: email.trim().toLowerCase(), role, lastActive: "Invited", invited: true }]);
          setEmail("");
        }}
      >
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Invite by email" aria-label="Email to invite" type="email" />
        <select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
          {(["Manager", "Fulfilment", "Support"] as const).map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <button type="submit" className="a5-btn" data-v="soft" disabled={!ok}>
          Invite
        </button>
      </form>
    </Card>
  );
}

/* ---------- Login ---------- */
export function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const session = useSession();
  const now = useNow();
  const next = params.get("next");
  const dest = next && next.startsWith(BASE) && !next.startsWith(`${BASE}/login`) ? next : BASE;
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setErr("Enter the email you use for the Maison.");
    if (!pw) return setErr("Enter a password. In the preview, any password works.");
    adminSignIn(email);
    router.replace(dest);
  }
  return (
    <div className="a5-login">
      <div className="a5-login-card">
        <span className="a5-mark" aria-hidden>
          <span />
          <span />
        </span>
        <div className="a5-eyebrow">{hydrated && now ? fmtLong(now) : "Santalum Maison"}</div>
        <h1>The Maison, in your pocket</h1>
        {hydrated && session ? (
          <>
            <p className="a5-muted">Signed in as {session.email}.</p>
            <button type="button" className="a5-btn" data-v="primary" onClick={() => router.replace(dest)}>
              Continue
              <I n="arrow" size={18} />
            </button>
            <button type="button" className="a5-textbtn" onClick={() => adminSignOut()}>
              Use another account
            </button>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            <Field label="Email">{(id) => <input id={id} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@santalum.in" />}</Field>
            <Field label="Password" error={err}>
              {(id) => <input id={id} type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />}
            </Field>
            <button type="submit" className="a5-btn" data-v="primary">
              Sign in
            </button>
            <p className="a5-hint">Preview: any email and password open the admin.</p>
          </form>
        )}
      </div>
    </div>
  );
}
