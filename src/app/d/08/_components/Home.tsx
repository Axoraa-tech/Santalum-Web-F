"use client";

import { useMode } from "../_lib/view";
import { Canvas } from "./Canvas";
import { ListView } from "./ListView";

/**
 * Canvas or list. Until the visitor chooses, CSS decides: the canvas on wide screens, the list on phones.
 */
export function Home() {
  const mode = useMode();
  return (
    <>
      {mode !== "list" && (
        <div className={mode === "auto" ? "hidden md:block" : ""}>
          <Canvas />
        </div>
      )}
      {mode !== "canvas" && (
        <div className={mode === "auto" ? "md:hidden" : ""}>
          <ListView />
        </div>
      )}
    </>
  );
}
