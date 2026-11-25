import type { Metadata } from "next";
import { PageFooter } from "../_components/PageFooter";
import { TrackStack } from "../_components/TrackStack";

export const metadata: Metadata = { title: "Track your order" };

export default function StackTrack() {
  return (
    <>
      <TrackStack />
      <PageFooter />
    </>
  );
}
