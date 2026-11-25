import { Suspense, type ReactNode } from "react";
import { LiveFrame, Loading, StaticBar } from "../_ui/Shell";

/** The console frame: command bar, body, shortcut footer, palette. Reads the pathname, so it sits behind Suspense. */
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <>
          <StaticBar />
          <div className="a3-body">
            <Loading />
          </div>
        </>
      }
    >
      <LiveFrame>
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </LiveFrame>
    </Suspense>
  );
}
