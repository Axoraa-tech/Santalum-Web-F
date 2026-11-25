"use client";

import { BodyBackground } from "@/components/BodyBackground";
import { useWood } from "@/lib/wood";

/** Overscroll and short pages show the current wood's page colour (rose linen or ivory gold). */
export const PAGE_BG = { red: "#f8f0ec", white: "#faf6ee" } as const;

export function BodyTint() {
  const wood = useWood();
  return <BodyBackground color={PAGE_BG[wood]} />;
}
