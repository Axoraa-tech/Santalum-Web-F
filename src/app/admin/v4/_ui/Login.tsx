"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { adminSignIn } from "../../_data/store";
import { BASE, Pinned } from "./kit";

export function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const raw = params.get("next") ?? "";
  const next = raw.startsWith(BASE) ? raw : BASE;

  return (
    <div className="a4-login">
      <div className="a4-login-pins" aria-hidden="true">
        <Pinned photoId="photo-1691744749343-edab1346765a" tone="red" size="lg" />
        <Pinned photoId="photo-1702001145743-094b0b7ead51" tone="pale" size="lg" />
      </div>
      <form
        className="a4-paper a4-login-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Enter the email you use at the atelier.");
            return;
          }
          adminSignIn(email);
          router.replace(next);
        }}
        noValidate
      >
        <p className="a4-kicker">Santalum Maison, Mysuru</p>
        <h1 className="a4-h1">The atelier board</h1>
        <p className="a4-sub">Orders, pieces and stock for the workshop. Sign in with your atelier email.</p>
        <div className="a4-field">
          <label htmlFor="a4-email">Email</label>
          <input
            id="a4-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="lakshmi@santalum.in"
            aria-invalid={!!error || undefined}
            aria-describedby={error ? "a4-email-err" : undefined}
          />
          {error && (
            <small id="a4-email-err" className="a4-err">
              {error}
            </small>
          )}
        </div>
        <button type="submit" className="a4-btn a4-btn-ink">
          Open the board
        </button>
        <p className="a4-fine">Preview: any email signs in. Changes stay in this browser.</p>
      </form>
    </div>
  );
}
