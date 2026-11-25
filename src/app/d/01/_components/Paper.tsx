"use client";

import { BodyBackground } from "@/components/BodyBackground";
import { useWood } from "@/lib/wood";

/** Overscroll shows the sheet colour of the wood in use. */
export function Paper() {
  const wood = useWood();
  return <BodyBackground color={wood === "white" ? "#f6f2e8" : "#f5f0ee"} />;
}
