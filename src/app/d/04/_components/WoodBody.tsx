"use client";

import { useEffect } from "react";
import { useWood } from "@/lib/wood";

/** The body behind the design (overscroll, short pages) takes the wall colour of the lit room. */
export function WoodBody() {
  const wood = useWood();
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = wood === "white" ? "#fbf7ee" : "#f8f1ee";
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, [wood]);
  return null;
}
