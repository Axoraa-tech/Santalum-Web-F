"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WoodScene = dynamic(() => import("./WoodScene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Loads the 3D scene only when it can run well: WebGL present, motion allowed,
 * and after the page is idle so it never blocks first paint. Otherwise the
 * static warm glow (rendered by the page underneath) is all that shows.
 */
export function SceneGate() {
  const [mode, setMode] = useState<"off" | "desktop" | "mobile">("off");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !hasWebGL()) return;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const start = () => setMode(mobile ? "mobile" : "desktop");
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 300);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (mode === "off") return;
    const id = setTimeout(() => setShown(true), 120);
    return () => clearTimeout(id);
  }, [mode]);

  if (mode === "off") return null;
  return (
    <div
      aria-hidden
      className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${shown ? "opacity-100" : "opacity-0"}`}
    >
      <WoodScene mobile={mode === "mobile"} />
    </div>
  );
}
