import type { Metadata } from "next";
import { Suspense } from "react";
import { Flyleaf } from "../_c/Login";

export const metadata: Metadata = { title: "Open the book" };

/** ?next= is read on the client, so the form sits behind Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<div className="a2-fly" />}>
      <Flyleaf />
    </Suspense>
  );
}
