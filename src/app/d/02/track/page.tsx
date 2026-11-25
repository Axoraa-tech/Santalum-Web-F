import type { Metadata } from "next";
import { Suspense } from "react";
import { Track } from "../_components/Track";
import { Loader } from "../_components/ui";

export const metadata: Metadata = { title: "Track your order" };

/** The tracker reads ?o= from the URL, so it renders inside Suspense. */
export default function OrbitTrackPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <Suspense fallback={<Loader label="Opening the tracker" />}>
        <Track />
      </Suspense>
    </div>
  );
}
