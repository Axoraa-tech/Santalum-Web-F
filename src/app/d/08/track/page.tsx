import type { Metadata } from "next";
import { Track } from "../_components/Track";
import { s } from "../_components/styles";

export const metadata: Metadata = { title: "Track your order" };

export default function AtlasTrackPage() {
  return (
    <main className={`${s.paper} min-h-svh pt-24 md:pt-28`}>
      <Track />
    </main>
  );
}
