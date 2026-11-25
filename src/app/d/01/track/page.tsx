import type { Metadata } from "next";
import { Track } from "../_components/Track";

export const metadata: Metadata = { title: "Job card, track your order" };

export default function LatheTrackPage() {
  return <Track />;
}
