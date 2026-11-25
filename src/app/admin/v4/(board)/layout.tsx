import { Suspense, type ReactNode } from "react";
import { Pending } from "../_ui/kit";
import { Rail, StaticRail } from "../_ui/Rail";

/** The pinboard frame: the drawer rail on the left, the board itself to the right. */
export default function BoardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="a4-frame">
      <Suspense fallback={<StaticRail />}>
        <Rail />
      </Suspense>
      <main id="main" className="a4-main">
        <Suspense fallback={<Pending />}>{children}</Suspense>
      </main>
    </div>
  );
}
