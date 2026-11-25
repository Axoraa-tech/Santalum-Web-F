"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useHydrated } from "@/lib/shop/store";
import { adminSignIn, useNow, useSession } from "../_data/store";
import { fmtLong } from "../_data/format";
import { Icon } from "./icons";

/** Sign-in is the day-book lying open: the red cloth inside cover on the left, the first ruled page on the right. */
export function LoginView() {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const session = useSession();
  const now = useNow();
  const next = params.get("next");
  const dest = next && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Enter the email you use for the Maison.");
    if (!password) return setError("Enter a password. In the preview, any password works.");
    setError(null);
    setBusy(true);
    adminSignIn(email);
    router.replace(dest);
  }

  return (
    <div className="adm-login">
      <div className="adm-book">
        <div className="adm-book-cover">
          <div>
            <span className="adm-book-seal" aria-hidden>
              <span className="ring-red" />
              <span className="ring-white" />
            </span>
            <div className="adm-book-title">Santalum Maison</div>
            <div className="adm-book-sub">The day-book · both woods</div>
          </div>
          <div>
            <blockquote>Orders, stock and batch records for red and white sandalwood, kept in one book.</blockquote>
            <small>For the Maison team. Customers sign in on the shop.</small>
          </div>
        </div>

        <form className="adm-book-page" onSubmit={submit} noValidate>
          <span className="adm-book-folio" aria-hidden>
            {now ? fmtLong(now) : "Folio i"}
          </span>
          <div>
            <h1 className="adm-h1">Sign in</h1>
            <p className="adm-sub">to open the Santalum admin</p>
          </div>

          {hydrated && session && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px dashed var(--a-line-2)" }}>
              <span style={{ fontSize: 13.5, flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
                Signed in as <strong>{session.email}</strong>
              </span>
              <Link href={dest} className="adm-btn" data-size="sm">
                Continue
              </Link>
            </div>
          )}

          <div className="adm-field">
            <label className="adm-label" htmlFor="adm-email">
              Work email
            </label>
            <input id="adm-email" className="adm-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@santalum.in" aria-invalid={!!error && !email} />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="adm-pass">
              Password
            </label>
            <input id="adm-pass" className="adm-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error && !!email && !password} />
          </div>

          {error && (
            <p className="adm-error" role="alert" style={{ margin: 0 }}>
              {error}
            </p>
          )}

          <button type="submit" className="adm-btn" data-variant="primary" style={{ height: 42, marginTop: 4 }} disabled={busy}>
            {busy ? "Opening the book…" : "Sign in"}
            {!busy && <Icon name="arrowRight" />}
          </button>

          <p className="adm-book-note">
            <Icon name="alert" width={16} height={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Preview: any password works. Real sign-in, staff roles and two-step codes arrive with the backend.</span>
          </p>
          <Link href="/maison" className="adm-hint" style={{ justifySelf: "start" }}>
            ← Back to the shop
          </Link>
        </form>
      </div>
    </div>
  );
}
