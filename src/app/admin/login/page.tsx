import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginView } from "../_components/Login";

export const metadata: Metadata = { title: "Sign in" };

/** ?next= is read on the client, so the form sits behind Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<div className="adm-login" />}>
      <LoginView />
    </Suspense>
  );
}
