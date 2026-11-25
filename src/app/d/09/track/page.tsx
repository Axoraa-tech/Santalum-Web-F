import type { Metadata } from "next";
import { Suspense } from "react";
import { WT } from "@/components/maison/W";
import s from "../styles";
import { TrackFromUrl, TrackView } from "../_components/Track";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Follow an order across its six stages, from the morning it is placed to the evening it arrives.",
  robots: { index: false },
};

/** Track your order: the sun moves across six stages, and the page's sky moves with it. */
export default function TrackPage() {
  return (
    <div className="relative mx-auto max-w-[1500px] px-5 pb-10 pt-28 sm:px-8 lg:px-10 lg:pt-36">
      <header className={`${s.swap} mb-14 grid gap-6 lg:mb-16 lg:grid-cols-12 lg:items-end lg:gap-8`}>
        <div className="lg:col-span-7">
          <h1 className={`${s.display} text-[clamp(3rem,10vw,7rem)] leading-[0.92]`}>Track your order</h1>
        </div>
        <p className="max-w-[32rem] text-[17px] leading-[1.7] text-[var(--muted)] lg:col-span-4 lg:col-start-9 lg:pb-3">
          <WT
            red="From the workshop to your door in six stages. Every red sandalwood piece is checked against its batch record before it is packed."
            white="From the workshop to your door in six stages. Every bottle and box is checked against its lot and test report before it is packed."
          />
        </p>
      </header>
      <Suspense fallback={<TrackView />}>
        <TrackFromUrl />
      </Suspense>
    </div>
  );
}
