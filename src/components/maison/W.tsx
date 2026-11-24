import type { ReactNode } from "react";

/**
 * Render something in both woods; CSS (html[data-wood]) shows only the current one.
 * Keeps server rendering flash-free and lets the wood switch animate as one snapshot.
 */
export function W({ red, white }: { red: ReactNode; white: ReactNode }) {
  return (
    <>
      <div className="w-red">{red}</div>
      <div className="w-white">{white}</div>
    </>
  );
}

/** Inline version for text inside headings and paragraphs. */
export function WT({ red, white }: { red: ReactNode; white: ReactNode }) {
  return (
    <>
      <span className="w-red">{red}</span>
      <span className="w-white">{white}</span>
    </>
  );
}
