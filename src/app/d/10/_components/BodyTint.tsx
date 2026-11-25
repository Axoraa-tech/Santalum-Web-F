"use client";

import { BodyBackground } from "@/components/BodyBackground";
import { useWood } from "@/lib/wood";

/** Overscroll shows the current wood's paper: rose linen for red, ivory gold for white. */
export function BodyTint() {
  const wood = useWood();
  return <BodyBackground color={wood === "white" ? "#f5efe1" : "#f3e8e3"} />;
}
