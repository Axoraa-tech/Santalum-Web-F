"use client";

import { BodyBackground } from "@/components/BodyBackground";
import { useWood } from "@/lib/wood";

/** Overscroll shows the current wood's page colour (rose linen for red, ivory for white). */
export function MaisonBody() {
  const wood = useWood();
  return <BodyBackground color={wood === "white" ? "#faf6ec" : "#f7efeb"} />;
}
