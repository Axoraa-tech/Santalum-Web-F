import type { Metadata } from "next";
import { Suspense } from "react";
import { Track } from "../_components/Track";

export const metadata: Metadata = { title: "Track your order" };

/** Track an order: six beads on a thread. It reads ?o=, so it sits behind Suspense. */
export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-[80svh]" aria-hidden />}>
      <Track />
    </Suspense>
  );
}
