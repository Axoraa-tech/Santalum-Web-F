"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { adminSignIn } from "../../_data/store";
import { BASE } from "./kit";

/** The flyleaf: the book's title page, where the keeper signs in. Any email opens it (preview). */
export function Flyleaf() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const dest = next && next.startsWith(BASE) && !next.startsWith(`${BASE}/login`) ? next : BASE;
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="a2-fly">
      <form
        className="a2-fly-leaf"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Write an email address, e.g. lakshmi@santalum.in");
          if (!pass) return setErr("Write any password. This preview does not check it.");
          adminSignIn(email);
          router.replace(dest);
        }}
      >
        <p className="a2-kicker">Santalum Maison · Mysuru</p>
        <h1 className="a2-fly-title">Day Book</h1>
        <p className="a2-fly-vol">Volume for the year 2026–27</p>
        <hr className="a2-dblrule" />
        <label className="a2-f">
          <span className="a2-f-l">Keeper&apos;s email</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </label>
        <label className="a2-f">
          <span className="a2-f-l">Password</span>
          <input type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </label>
        {err ? <p className="a2-err">{err}</p> : null}
        <button type="submit" className="a2-btn" data-kind="ink">
          Open the book
        </button>
        <p className="a2-fly-foot">Preview: any email and password open the book. Changes stay in this browser.</p>
      </form>
    </div>
  );
}
