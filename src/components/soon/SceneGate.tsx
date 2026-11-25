"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MalaScene = dynamic(() => import("./MalaScene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Loads the 3D film only when it can run well: WebGL present, motion allowed,
 * and after the page is idle so it never blocks first paint. Otherwise the
 * page shows its quiet static backdrop.
 */
export function SceneGate() {
  const [mode, setMode] = useState<"off" | "desktop" | "mobile">("off");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !hasWebGL()) return;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const start = () => setMode(mobile ? "mobile" : "desktop");
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 250);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (mode === "off") return;
    const id = setTimeout(() => setShown(true), 200);
    return () => clearTimeout(id);
  }, [mode]);

  if (mode === "off") return null;
  return (
    <div
      aria-hidden
      className={`absolute inset-0 transition-opacity duration-[2400ms] ease-out ${shown ? "opacity-100" : "opacity-0"}`}
    >
      <MalaScene mobile={mode === "mobile"} />
    </div>
  );
}
