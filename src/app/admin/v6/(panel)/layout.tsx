import { Suspense, type ReactNode } from "react";
import { Notes } from "../_ui/kit";
import { Masthead, Skeleton, StaticMasthead } from "../_ui/Shell";

/** The report frame: masthead and numbered sections on top, the page on a 12-column grid below. */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<StaticMasthead />}>
        <Masthead />
      </Suspense>
      <main id="main" className="a6-page">
        <Suspense fallback={<Skeleton />}>{children}</Suspense>
      </main>
      <Notes />
    </>
  );
}
