"use client";

import { useLayoutEffect } from "react";
import { syncWoodFromStorage } from "@/lib/wood";

/** Arriving by client-side navigation (e.g. from the coming-soon page), the inline boot script has not run. */
export function WoodSync() {
  useLayoutEffect(() => {
    syncWoodFromStorage();
  }, []);
  return null;
}
