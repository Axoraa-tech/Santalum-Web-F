import type { Metadata } from "next";
import { s } from "../_components/cls";
import { TrackBento } from "../_components/TrackBento";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackPage() {
  return (
    <div className={s.page}>
      <TrackBento />
    </div>
  );
}
