import type { Metadata } from "next";
import { Suspense } from "react";
import { Track, TrackRoute } from "../_components/Track";

export const metadata: Metadata = { title: "Track your order" };

/** `?o=` names an order; it is read on the client inside Suspense. The fallback is the plain lookup. */
export default function KineticTrackPage() {
  return (
    <Suspense fallback={<Track o={null} />}>
      <TrackRoute />
    </Suspense>
  );
}
