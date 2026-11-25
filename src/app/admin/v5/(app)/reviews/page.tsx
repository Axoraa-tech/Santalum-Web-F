import type { Metadata } from "next";
import { Suspense } from "react";
import { Reviews } from "../../_ui/reviews";
import { Loading } from "../../_ui/shell";

export const metadata: Metadata = { title: "Reviews" };

/** ?tab= is read on the client, so the screen sits behind Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Reviews />
    </Suspense>
  );
}
