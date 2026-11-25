import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "../_components/Footer";
import { TrackFallback, TrackFromParams } from "../_components/Track";

export const metadata: Metadata = {
  title: "Shipping register — Santalum Maison",
  description: "Track a Santalum Maison order with its number and the email or mobile number on it.",
};

export default function TrackPage() {
  return (
    <>
      <Suspense fallback={<TrackFallback />}>
        <TrackFromParams />
      </Suspense>
      <Footer />
    </>
  );
}
