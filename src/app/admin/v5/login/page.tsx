import type { Metadata } from "next";
import { Suspense } from "react";
import { Login } from "../_ui/settings";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <Suspense fallback={<div className="a5-login" />}>
      <Login />
    </Suspense>
  );
}
