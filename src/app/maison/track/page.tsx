import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackFallback, TrackView } from "@/components/maison/track/TrackView";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Follow a Santalum Maison order from the workshop to your door.",
};

/** ?o= is read on the client, so the tracker sits behind Suspense. */
export default function TrackPage() {
  return (
    <Suspense fallback={<TrackFallback />}>
      <TrackView />
    </Suspense>
  );
}
