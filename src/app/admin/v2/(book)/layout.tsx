import { Suspense, type ReactNode } from "react";
import { IndexTabs, RunningHead, StaticTabs } from "../_c/Book";
import { Blank } from "../_c/kit";

/** The open book: a ruled page with a red margin, and index tabs down the right edge. */
export default function BookLayout({ children }: { children: ReactNode }) {
  return (
    <div className="a2-book">
      <div className="a2-page">
        <RunningHead />
        <main id="main" className="a2-main">
          <Suspense fallback={<Blank />}>{children}</Suspense>
        </main>
      </div>
      <Suspense fallback={<StaticTabs />}>
        <IndexTabs />
      </Suspense>
    </div>
  );
}
