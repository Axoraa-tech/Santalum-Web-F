import type { Metadata } from "next";
import { Suspense } from "react";
import { Login } from "../_views/Login";

export const metadata: Metadata = { title: "Sign in" };

/** ?next= is read on the client, so the form sits behind Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<div className="a6-login" />}>
      <Login />
    </Suspense>
  );
}
