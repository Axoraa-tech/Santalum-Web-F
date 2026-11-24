import type { ReactNode } from "react";
import { EnterToggle } from "@/components/EnterToggle";

/** Coming-soon pages, unchanged, with one switch to enter the Maison website. */
export default function SoonLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <EnterToggle />
    </>
  );
}
