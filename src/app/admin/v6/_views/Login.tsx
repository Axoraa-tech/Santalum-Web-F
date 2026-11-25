"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useHydrated } from "@/lib/shop/store";
import { adminSignIn, useSession } from "../../_data/store";
import { BASE } from "../_ui/kit";

export function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const raw = params.get("next") ?? "";
  const next = raw.startsWith(BASE) ? raw : BASE;

  useEffect(() => {
    if (hydrated && session) router.replace(next);
  }, [hydrated, session, next, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter an email address, for example lakshmi@santalum.in.");
    if (!password) return setError("Enter your password.");
    adminSignIn(email);
    router.replace(next);
  }

  return (
    <div className="a6-login">
      <div className="a6-login-grid a6-grid">
        <div className="a6-login-mark">
          <span className="a6-login-no">00</span>
          <p>
            Santalum Maison
            <br />
            Administration report
          </p>
        </div>
        <h1 className="a6-login-title">
          Sign
          <br />
          in
        </h1>
        <form className="a6-login-form" onSubmit={submit} noValidate>
          <p className="a6-lede">Orders, stock, customers and the shop&rsquo;s words, kept in one report. Preview: any email signs in.</p>
          <label className="a6-field">
            <span className="a6-field-label">
              <span className="a6-field-no">01</span>Email
            </span>
            <input className="a6-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="a6-field">
            <span className="a6-field-label">
              <span className="a6-field-no">02</span>Password
            </span>
            <input className="a6-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && (
            <p className="a6-field-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="a6-btn" data-primary>
            Open the report →
          </button>
        </form>
      </div>
    </div>
  );
}
