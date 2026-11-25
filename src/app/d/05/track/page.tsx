import type { Metadata } from "next";
import { Suspense } from "react";
import type { IndexItem } from "../_components/content";
import { SideIndex } from "../_components/SideIndex";
import { TrackLog } from "../_components/Track";

export const metadata: Metadata = { title: "Dispatch log — Index — Santalum Maison" };

const SECTIONS: IndexItem[] = [
  { id: "lookup", label: "Look up an order" },
  { id: "log", label: "The dispatch log" },
  { id: "items", label: "Parcel and address" },
];

/** Track an order. ?o= is read inside Suspense. */
export default function TrackPage() {
  return (
    <div className="x5-page">
      <SideIndex items={SECTIONS} heading="Dispatch log" back={{ href: "/d/05/account", label: "Your orders" }} />
      <main className="x5-main">
        <Suspense fallback={<div className="x5t-wrap" style={{ minHeight: "60svh" }} />}>
          <TrackLog />
        </Suspense>
      </main>
    </div>
  );
}
