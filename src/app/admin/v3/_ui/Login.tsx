"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { adminSignIn } from "../../_data/store";
import { BASE, Kbd } from "./kit";

export function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const next = params.get("next");
  const dest = next && next.startsWith(BASE) ? next : BASE;

  return (
    <main className="a3-login">
      <form
        className="a3-login-box"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setErr("enter an email address");
            return;
          }
          adminSignIn(email);
          router.replace(dest);
        }}
      >
        <div className="a3-login-top">
          <span className="a3-brand">
            santalum<b>/ops</b>
          </span>
          <span className="a3-dim">console · v3</span>
        </div>
        <pre className="a3-login-pre" aria-hidden>
          {"$ ssh ops@santalum.in\n  mysuru studio · orders, stock, reviews\n  preview build: any email signs in"}
        </pre>
        <label className="a3-f">
          <span className="a3-f-l">email</span>
          <input
            type="email"
            autoFocus
            autoComplete="username"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErr("");
            }}
            placeholder="you@santalum.in"
          />
        </label>
        {err && (
          <p className="a3-err" role="alert">
            {err}
          </p>
        )}
        <button type="submit" className="a3-btn" data-kind="primary">
          sign in <Kbd>↵</Kbd>
        </button>
        <p className="a3-dim a3-small">Staff sign-in. Password and two-step come with the live backend.</p>
      </form>
    </main>
  );
}
