"use client";

import { useEffect } from "react";
import { useWood } from "@/lib/wood";

const PAPER = { red: "#faf3ef", white: "#fbf7ee" } as const;

/** The page behind the design (overscroll, short pages) takes the current wood's paper colour, and eases with it. */
export function WoodBody() {
  const wood = useWood();
  useEffect(() => {
    const body = document.body.style;
    const prev = { bg: body.backgroundColor, tr: body.transition };
    body.transition = "background-color 0.9s cubic-bezier(0.22, 1, 0.36, 1)";
    body.backgroundColor = PAPER[wood];
    return () => {
      body.backgroundColor = prev.bg;
      body.transition = prev.tr;
    };
  }, [wood]);
  return null;
}
