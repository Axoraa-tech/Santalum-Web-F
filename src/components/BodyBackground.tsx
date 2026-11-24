"use client";

import { useEffect } from "react";

/**
 * Sets the page (body) background while a design is mounted, so overscroll and short pages
 * show the design's own colour instead of the coming-soon pages' dark default.
 */
export function BodyBackground({ color }: { color: string }) {
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = color;
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, [color]);
  return null;
}
